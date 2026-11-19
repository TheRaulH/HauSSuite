import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

/** Cada ZIP se arma en memoria: por eso se parte en archivos de como máximo este tamaño. */
export const ZIP_PART_LIMIT_BYTES = 500 * 1024 * 1024

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

/** Prepara los archivos una sola vez: lista y mapa por nombre exacto (búsqueda instantánea). */
export function indexFiles(files) {
  const items = files.map((file) => ({ file, stem: normalize(stripExtension(file.name)) }))
  const exact = new Map()
  for (const item of items) {
    const list = exact.get(item.stem)
    if (list) list.push(item)
    else exact.set(item.stem, [item])
  }
  return { items, exact }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const newest = (pool) => [...pool].sort((a, b) => (b.file.lastModified ?? 0) - (a.file.lastModified ?? 0))

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

  let pool = index.exact.get(target) ?? []
  if (pool.length === 0) {
    const standalone = new RegExp(`(^|[^a-z0-9])${escapeRegExp(target)}($|[^a-z0-9])`)
    // includes() descarta casi todo rápido; la expresión regular solo corre en los pocos que pasan
    pool = index.items.filter((item) => item.stem.includes(target) && standalone.test(item.stem))
  }
  const sorted = newest(pool)
  return { file: sorted[0]?.file ?? null, candidates: sorted.length }
}

// Si una línea no está en el catálogo pero parece un código (HR-2260-90), se busca tal cual.
const LOOKS_LIKE_CODE = /^[A-Za-z0-9][A-Za-z0-9\-_./]{1,29}$/

/** status: 'ok' | 'sin-catalogo' | 'sin-imagen' */
function resolveLine(line, id, lookup, index, cache) {
  const entry = lookup(line)
  let code = entry?.codigoBuscar ?? null
  let source = entry ? 'catalogo' : null

  if (!code && LOOKS_LIKE_CODE.test(line)) {
    code = line
    source = 'codigo'
  }

  if (!code) return { id, line, code: null, source: null, file: null, candidates: 0, status: 'sin-catalogo' }

  const key = normalize(code)
  let found = cache.get(key)
  if (!found) {
    found = findBestFile(index, code)
    cache.set(key, found)
  }
  return { id, line, code, source, file: found.file, candidates: found.candidates, status: found.file ? 'ok' : 'sin-imagen' }
}

/**
 * Cruza la lista con el catálogo y la carpeta por tandas, cediendo el control al navegador
 * entre una tanda y otra: aunque la lista sea enorme, la página nunca se congela.
 * Devuelve null si se canceló (la lista cambió mientras se analizaba).
 */
export async function resolveListAsync(lines, lookup, index, { signal, onProgress, chunk = 120 } = {}) {
  const rows = new Array(lines.length)
  const cache = new Map()
  for (let start = 0; start < lines.length; start += chunk) {
    if (signal?.aborted) return null
    const end = Math.min(lines.length, start + chunk)
    for (let i = start; i < end; i += 1) rows[i] = resolveLine(lines[i], i, lookup, index, cache)
    onProgress?.(end, lines.length)
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  return rows
}

/* ───────────── ZIP ───────────── */

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

/** Archivos únicos a incluir (si dos líneas apuntan al mismo archivo, entra una sola vez). */
export function collectZipEntries(rows, { numbered = false } = {}) {
  const usedNames = new Set()
  const added = new Set()
  const entries = []
  rows.forEach((row, i) => {
    if (!row.file || added.has(row.file)) return
    added.add(row.file)
    const prefix = numbered ? `${String(i + 1).padStart(3, '0')}_` : ''
    entries.push({ file: row.file, name: uniqueName(`${prefix}${row.file.name}`, usedNames) })
  })
  return entries
}

export function splitIntoParts(entries, limit = ZIP_PART_LIMIT_BYTES) {
  const parts = []
  let current = []
  let size = 0
  for (const entry of entries) {
    if (current.length > 0 && size + entry.file.size > limit) {
      parts.push(current)
      current = []
      size = 0
    }
    current.push(entry)
    size += entry.file.size
  }
  if (current.length > 0) parts.push(current)
  return parts
}

/**
 * Arma el/los ZIP con los archivos ORIGINALES (los mismos bytes, sin recomprimir ni reconvertir).
 * Si pesan más de 500 MB se entregan varios ZIP ("parte 1 de 3"…) para no agotar la memoria.
 * @returns {Promise<{ count: number, parts: number }>}
 */
export async function downloadImagesZip(rows, { numbered = false, onProgress } = {}) {
  const entries = collectZipEntries(rows, { numbered })
  if (entries.length === 0) return { count: 0, parts: 0 }

  const parts = splitIntoParts(entries)
  const stamp = new Date().toISOString().slice(0, 10)

  for (let p = 0; p < parts.length; p += 1) {
    const zip = new JSZip()
    for (const { file, name } of parts[p]) zip.file(name, file)

    // Las imágenes ya vienen comprimidas: STORE evita recomprimir y es mucho más rápido.
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (meta) =>
      onProgress?.({ part: p + 1, parts: parts.length, percent: Math.round(meta.percent) })
    )
    const suffix = parts.length > 1 ? `-parte-${p + 1}-de-${parts.length}` : ''
    saveAs(blob, `imagenes-${stamp}${suffix}.zip`)
    if (p < parts.length - 1) await new Promise((resolve) => setTimeout(resolve, 600)) // deja iniciar la descarga
  }
  return { count: entries.length, parts: parts.length }
}

/* ───────────── Reportes ───────────── */

export const STATUS_LABEL = {
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

export function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1).replace('.', ',')} GB`
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
