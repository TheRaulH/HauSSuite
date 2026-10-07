const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

/** true si el navegador soporta seleccionar una carpeta completa (Chrome/Edge). */
export function isDirectoryPickerSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

/**
 * Abre el selector nativo de carpetas y recorre TODAS las subcarpetas
 * (ej. PRODUCTOS/marca/categoría) juntando cada imagen que encuentra.
 * Lanza AbortError si el usuario cancela el diálogo.
 */
export async function pickImageFolder() {
  const dirHandle = await window.showDirectoryPicker()
  return collectImageFiles(dirHandle)
}

async function collectImageFiles(dirHandle, files = []) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && isImageFile(entry.name)) {
      files.push(await entry.getFile())
    } else if (entry.kind === 'directory') {
      await collectImageFiles(entry, files) // entra en marca/categoría recursivamente
    }
  }
  return files
}

/**
 * Empareja archivos de imagen con productos comparando el nombre del
 * archivo contra el código correspondiente. Cada producto puede tener
 * hasta 3 "ranuras" de imagen a buscar:
 *   - imagen   <- product.codigo    (producto principal)
 *   - imagen2  <- product.codigo2   (segundo producto, si es combo)
 *   - regaloImagen <- product.regaloCodigo (si trae regalo)
 *
 * La imagen del producto principal y la del combo son EXCLUSIVAS (un
 * mismo archivo no se reparte entre dos productos). La del regalo NO:
 * como el mismo regalo suele repetirse en muchas filas, su imagen se
 * resuelve una sola vez por código y se reutiliza para todos los
 * productos que comparten ese regalo.
 *
 * Como la misma imagen puede repetirse en distintas subcarpetas (registro
 * histórico por marca/categoría), cuando hay varias coincidencias para
 * el mismo código se usa el MÁS RECIENTE (por fecha de modificación).
 *
 * @param {object[]} products
 * @param {File[]} files
 * @returns {{
 *   matched: { productId: string, field: 'imagen'|'imagen2'|'regaloImagen', codigo: string, fileName: string, url: string }[],
 *   unmatchedSlots: { productId: string, field: string, codigo: string }[], // tenían código pero no se encontró imagen
 *   productsWithoutCode: object[], // no tienen NINGÚN código para emparejar (ni principal, ni combo, ni regalo)
 *   unmatchedFiles: File[],        // imágenes que no correspondieron a nada
 * }}
 */
export function matchImagesToProducts(products, files) {
  const normalizedFiles = files.map((file) => ({
    file,
    normalizedName: normalize(stripExtension(file.name)),
  }))

  const usedFiles = new Set() // archivos ya asignados de forma exclusiva (producto principal / combo)
  const usedForRegalo = new Set() // archivos usados como regalo (se comparten, no cuentan como "sobrante")
  const regaloCache = new Map() // código normalizado del regalo -> { file, url } | null

  const matched = []
  const unmatchedSlots = []
  const productsWithoutCode = []

  function findFile(codigo, { exclusive }) {
    const normCode = normalize(codigo)
    const candidates = normalizedFiles.filter(
      (item) => item.normalizedName.includes(normCode) && (!exclusive || !usedFiles.has(item.file))
    )
    return candidates.sort((a, b) => (b.file.lastModified ?? 0) - (a.file.lastModified ?? 0))[0]?.file ?? null
  }

  function resolveRegalo(codigo) {
    const key = normalize(codigo)
    if (!regaloCache.has(key)) {
      const file = findFile(codigo, { exclusive: false })
      if (file) {
        usedForRegalo.add(file)
        regaloCache.set(key, { file, url: URL.createObjectURL(file) })
      } else {
        regaloCache.set(key, null)
      }
    }
    return regaloCache.get(key)
  }

  for (const product of products) {
    const slotsExclusivos = []
    if (product.codigo) slotsExclusivos.push({ field: 'imagen', codigo: product.codigo })
    if (product.codigo2) slotsExclusivos.push({ field: 'imagen2', codigo: product.codigo2 })
    const tieneRegalo = Boolean(product.regaloCodigo)

    if (slotsExclusivos.length === 0 && !tieneRegalo) {
      productsWithoutCode.push(product)
      continue
    }

    for (const slot of slotsExclusivos) {
      const file = findFile(slot.codigo, { exclusive: true })
      if (file) {
        usedFiles.add(file)
        matched.push({
          productId: product.id,
          field: slot.field,
          codigo: slot.codigo,
          fileName: file.name,
          url: URL.createObjectURL(file),
        })
      } else {
        unmatchedSlots.push({ productId: product.id, field: slot.field, codigo: slot.codigo })
      }
    }

    if (tieneRegalo) {
      const resolved = resolveRegalo(product.regaloCodigo)
      if (resolved) {
        matched.push({
          productId: product.id,
          field: 'regaloImagen',
          codigo: product.regaloCodigo,
          fileName: resolved.file.name,
          url: resolved.url,
        })
      } else {
        unmatchedSlots.push({ productId: product.id, field: 'regaloImagen', codigo: product.regaloCodigo })
      }
    }
  }

  const unmatchedFiles = files.filter((f) => !usedFiles.has(f) && !usedForRegalo.has(f))

  return { matched, unmatchedSlots, productsWithoutCode, unmatchedFiles }
}

/** Libera un object URL de imagen (llamar al reemplazar o descartar una imagen). */
export function revokeImageUrl(url) {
  if (url) URL.revokeObjectURL(url)
}

function isImageFile(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function stripExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, '')
}

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
