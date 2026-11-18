const MAX_SIDE = 2000

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('El archivo no es una imagen válida.'))
    img.src = src
  })
}

/**
 * Lee una imagen local y la devuelve como data URL (así el PNG exportado siempre
 * la incluye). Las fotos muy grandes se reducen a 2000 px para que la app no se
 * ponga lenta; los PNG conservan su transparencia (logos y productos).
 */
export async function loadImageFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Elige un archivo de imagen (JPG, PNG, WebP).')

  const original = await readAsDataUrl(file)
  if (file.type === 'image/svg+xml') return original

  const img = await loadImage(original)
  const longest = Math.max(img.naturalWidth, img.naturalHeight)
  if (longest <= MAX_SIDE) return original

  const scale = MAX_SIDE / longest
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif'
  return keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92)
}
