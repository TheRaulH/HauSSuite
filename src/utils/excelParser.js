import * as XLSX from 'xlsx'
import { createProduct, ALL_FIELDS } from './productModel'

/**
 * Palabras clave para adivinar a qué campo estándar corresponde
 * cada encabezado de columna del Excel del usuario.
 */
const HEADER_HINTS = {
  nombre: ['nombre', 'producto', 'descripcion', 'descripción', 'articulo', 'artículo', 'detalle'],
  precio: ['precio', 'precio actual', 'precio contado', 'costo', 'pvp'],
  precioAntes: [
    'precio antes', 'precio anterior', 'antes', 'precio regular', 'precio original', 'tachado',
    'precio hauscenter', 'precio hauscenter (bs)', 'precio hauscenter bs',
  ],
  ahorra: ['ahorra', 'ahorro', 'ahorras'],
  descuento: ['descuento', 'descuento %', '% descuento', 'dscto'],
  cuotas: ['cuotas', 'cuota', 'meses', 'plazo'],
  codigo: ['codigo', 'código', 'code', 'sku', 'referencia'],
  codigoMostrar: ['codigo mostrar', 'código mostrar', 'codigo arte', 'codigo visible', 'codigo display'],
  nombre2: ['nombre 2', 'producto 2', 'segundo producto', 'nombre b'],
  codigo2: ['codigo 2', 'código 2', 'segundo codigo', 'segundo código', 'sku 2', 'codigo b'],
  codigoMostrar2: ['codigo mostrar 2', 'código mostrar 2', 'codigo arte 2'],
}

/**
 * Lee un archivo .xlsx / .xls / .csv y devuelve:
 *  - headers: los encabezados originales, en orden
 *  - rows: array de objetos { header: valor } tal cual vienen en el archivo
 */
export async function readSpreadsheet(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]

  // header:1 => filas como arrays, para poder tomar la primera fila como encabezados
  const rowsAsArrays = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (rowsAsArrays.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = rowsAsArrays[0].map((h) => String(h).trim())
  const rows = rowsAsArrays.slice(1)
    .filter((r) => r.some((cell) => String(cell).trim() !== '')) // ignora filas vacías
    .map((r) => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = r[i] ?? ''
      })
      return obj
    })

  return { headers, rows }
}

/**
 * Intenta adivinar, para cada campo estándar (nombre, precio, cuotas, codigo,
 * precioAntes), cuál encabezado del Excel le corresponde.
 *
 * Devuelve un mapeo { campoEstandar: encabezadoOriginal | null } que luego
 * el usuario puede revisar/corregir en la UI antes de confirmar.
 */
export function detectColumnMapping(headers, fields = ALL_FIELDS) {
  const mapping = {}
  const usedHeaders = new Set()

  // Pasada 1: coincidencia EXACTA (ignorando tildes/mayúsculas) primero,
  // para que columnas como "Precio" no se las gane "Precio antes".
  for (const field of fields) {
    const hints = HEADER_HINTS[field].map(normalizeHeader)
    const match = headers.find(
      (h) => !usedHeaders.has(h) && hints.includes(normalizeHeader(h))
    )
    if (match) {
      mapping[field] = match
      usedHeaders.add(match)
    }
  }

  // Pasada 2: para los campos que no encontraron coincidencia exacta,
  // se busca por substring entre las columnas que aún no fueron tomadas.
  for (const field of fields) {
    if (mapping[field]) continue
    const hints = HEADER_HINTS[field].map(normalizeHeader)
    const match = headers.find((h) => {
      if (usedHeaders.has(h)) return false
      const normalized = normalizeHeader(h)
      return hints.some((hint) => normalized.includes(hint))
    })
    mapping[field] = match ?? null
    if (match) usedHeaders.add(match)
  }

  return mapping
}

/**
 * Aplica un mapeo de columnas confirmado por el usuario sobre las filas
 * crudas y devuelve productos ya normalizados al modelo estándar.
 *
 * @param {object[]} rows - filas crudas de readSpreadsheet()
 * @param {object} mapping - { campoEstandar: encabezadoOriginal | null }
 */
export function buildProducts(rows, mapping, fields = ALL_FIELDS) {
  return rows.map((row) => {
    const raw = {}
    for (const field of fields) {
      const header = mapping[field]
      raw[field] = header ? row[header] : null
    }
    return createProduct(raw)
  })
}

/**
 * Modo "con regalo": la PRIMERA fila del Excel es el regalo (se usa su
 * nombre y código, se descarta su precio) y se aplica a todas las demás
 * filas. Devuelve solo los productos "reales" (sin el ítem 0), cada uno
 * con los campos regaloNombre/regaloCodigo ya completados.
 *
 * @param {object[]} products - productos ya normalizados por buildProducts()
 * @returns {{ regalo: {nombre: string, codigo: string|null} | null, productos: object[] }}
 */
export function aplicarRegaloDePrimeraFila(products) {
  if (products.length === 0) return { regalo: null, productos: [] }

  const [itemRegalo, ...resto] = products
  const regalo = { nombre: itemRegalo.nombre, codigo: itemRegalo.codigo }

  const productos = resto.map((p) => ({
    ...p,
    regaloCodigo: itemRegalo.codigo,
    regaloCodigoMostrar: itemRegalo.codigoMostrar,
    regaloNombre: itemRegalo.nombre,
  }))

  return { regalo, productos }
}

function normalizeHeader(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .trim()
}
