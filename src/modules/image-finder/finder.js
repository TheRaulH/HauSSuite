import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

export function isImageName(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function stripExtension(name) {
  return name.replace(/\.[^/.]+$/, '')
}

/** Una descripción por línea. Si se pega desde Excel con varias columnas, se toma la primera. */
export function parseList(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.split('\t')[0].trim())
    .filter(Boolean)
}

/** Prepara los archivos una sola vez para buscar rápido. */
export function indexFiles(files) {
  return files.map((file) => ({ file, stem: normalize(stripExtension(file.name)) }))
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Busca el archivo de un código. Primero coincidencia exacta con el nombre del
 * archivo; si no hay, el código puede estar en cualquier parte del nombre
 * siempre que quede "suelto" (ABC123 sirve para ABC123_frente.png, pero NO
 * para ABC1234.png, que es otro producto).
 * Si el mismo código está en varias subcarpetas, gana el archivo más reciente.
 */
export function findBestFile(index, code) {
  const target = normalize(code)
  if (!target) return { file: null, candidates: 0 }

  const exact = index.filter((item) => item.stem === target)
  let pool = exact
  if (pool.length === 0) {
    const standalone = new RegExp(`(^|[^a-z0-9])${escapeRegExp(target)}($|[^a-z0-9])`)
    pool = index.filter((item) => standalone.test(item.stem))
  }
  pool = [...pool].sort((a, b) => (b.file.lastModified ?? 0) - (a.file.lastModified ?? 0))

  return { file: pool[0]?.file ?? null, candidates: pool.length }
}

// Si una línea no está en el catálogo pero parece un código (HR-2260-90), se busca tal cual.
const LOOKS_LIKE_CODE = /^[A-Za-z0-9][A-Za-z0-9\-_./]{1,29}$/

/**
 * Para cada línea de la lista: catálogo → código de búsqueda → archivo.
 * status: 'ok' | 'sin-catalogo' | 'sin-imagen'
 */
export function resolveList(lines, lookup, index) {
  return lines.map((line, i) => {
    const entry = lookup(line)
    let code = entry?.codigoBuscar ?? null
    let source = entry ? 'catalogo' : null

    if (!code && LOOKS_LIKE_CODE.test(line)) {
      code = line
      source = 'codigo'
    }

    if (!code) {
      return { id: i, line, code: null, source: null, file: null, candidates: 0, status: 'sin-catalogo' }
    }

    const { file, candidates } = findBestFile(index, code)
    return { id: i, line, code, source, file, candidates, status: file ? 'ok' : 'sin-imagen' }
  })
}

function uniqueName(name, used) {
  if (!used.has(name)) {
    used.add(name)
    return name
  }
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let n = 2
  while (used.has(`${base}_${n}${ext}`)) n++
  const unique = `${base}_${n}${ext}`
  used.add(unique)
  return unique
}

/**
 * Arma el ZIP con los archivos ORIGINALES (los mismos bytes, sin recomprimir
 * ni reconvertir). Si dos líneas apuntan al mismo archivo, entra una sola vez.
 * @returns {Promise<number>} cantidad de archivos incluidos
 */
export async function downloadImagesZip(rows, { numbered = false } = {}) {
  const zip = new JSZip()
  const usedNames = new Set()
  const addedFiles = new Set()

  rows.forEach((row, i) => {
    if (!row.file || addedFiles.has(row.file)) return
    addedFiles.add(row.file)
    const prefix = numbered ? `${String(i + 1).padStart(3, '0')}_` : ''
    zip.file(uniqueName(`${prefix}${row.file.name}`, usedNames), row.file)
  })

  if (addedFiles.size === 0) return 0

  // Las imágenes ya vienen comprimidas: STORE evita recomprimir y es mucho más rápido.
  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  saveAs(blob, `imagenes-${new Date().toISOString().slice(0, 10)}.zip`)
  return addedFiles.size
}

const STATUS_LABEL = {
  ok: 'Encontrada',
  'sin-catalogo': 'No está en el catálogo',
  'sin-imagen': 'Sin imagen en la carpeta',
}

/** Reporte CSV (abre bien en Excel) con el resultado de cada línea. */
export function downloadReportCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    ['Descripción', 'Código buscado', 'Archivo', 'Estado'].map(esc).join(','),
    ...rows.map((r) => [r.line, r.code, r.file?.name, STATUS_LABEL[r.status]].map(esc).join(',')),
  ]
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `reporte-imagenes-${new Date().toISOString().slice(0, 10)}.csv`)
}

export { STATUS_LABEL }
