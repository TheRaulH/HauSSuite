import { readSpreadsheet } from './excelParser'

/**
 * Catálogo de referencia: DESCRIPCION (nombre completo del producto,
 * como viene en el Excel diario) -> CODIGOBUSCAR (para emparejar la
 * imagen) / CODIGOMOSTRAR (el que va impreso en el arte).
 *
 * Se usa como diccionario: al importar el Excel del día (que ya no trae
 * código), se busca cada nombre de producto acá para completar el
 * código automáticamente.
 */

/** Normaliza un texto para comparar sin importar mayúsculas/tildes/espacios extra. */
export function normalizeDescripcion(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createCatalogEntry({ descripcion, codigoBuscar, codigoMostrar }) {
  return {
    descripcionNormalizada: normalizeDescripcion(descripcion),
    descripcion: String(descripcion ?? '').trim(),
    codigoBuscar: codigoBuscar ? String(codigoBuscar).trim() : null,
    codigoMostrar: codigoMostrar ? String(codigoMostrar).trim() : null,
  }
}

/**
 * Lee un Excel/CSV con columnas DESCRIPCION, CODIGOBUSCAR y (opcional)
 * CODIGOMOSTRAR, y devuelve las entradas del catálogo ya normalizadas.
 * Detecta las columnas por nombre — no hace falta mapeo manual, ya que
 * el formato de este archivo es siempre el mismo.
 */
export async function parseCatalogFile(file) {
  const { headers, rows } = await readSpreadsheet(file)

  // LOG 1: Ver qué columnas está detectando readSpreadsheet exactamente
  console.log('📌 DEBUG - Headers crudos extraídos del Excel:', headers)

  // LOG 2: Ver cómo queda cada columna después de normalizarla (para ver si hay caracteres raros invisibles)
  console.log('📌 DEBUG - Headers normalizados:')
  headers.forEach(h => {
    console.log(`   Original: [${h}] -> Normalizado: [${normalizeDescripcion(h)}]`)
  })

  const findHeader = (candidates) =>
    headers.find((h) => candidates.includes(normalizeDescripcion(h)))

  const hDescripcion = findHeader(['descripcion', 'descripción'])
  const hCodigoBuscar = findHeader(['codigobuscar', 'codigo buscar', 'código buscar'])
  const hCodigoMostrar = findHeader(['codigomostrar', 'codigo mostrar', 'código mostrar'])

  // LOG 3: Ver qué asignó a cada variable después de la búsqueda
  console.log('📌 DEBUG - Resultados de la asignación de columnas:')
  console.log('   -> Columna DESCRIPCION encontrada como:', hDescripcion)
  console.log('   -> Columna CODIGOBUSCAR encontrada como:', hCodigoBuscar)
  console.log('   -> Columna CODIGOMOSTRAR encontrada como:', hCodigoMostrar)

  if (!hDescripcion || !hCodigoBuscar) {
    // LOG 4: Confirmar el error justo antes de lanzarlo
    console.error('❌ ERROR - Faltan columnas obligatorias. Abortando.')
    throw new Error(
      'El archivo debe tener columnas DESCRIPCION y CODIGOBUSCAR (CODIGOMOSTRAR es opcional).'
    )
  }

  return rows
    .map((row) =>
      createCatalogEntry({
        descripcion: row[hDescripcion],
        codigoBuscar: row[hCodigoBuscar],
        codigoMostrar: hCodigoMostrar ? row[hCodigoMostrar] : null,
      })
    )
    .filter((entry) => entry.descripcion) // descarta filas vacías
}

/**
 * Completa codigo/codigoMostrar (y codigo2/codigoMostrar2 si es combo)
 * de una lista de productos ya importados, buscando su nombre en el
 * catálogo. Nunca pisa un código que ya venga explícito (ej. mapeado a
 * mano desde una columna del propio Excel diario).
 *
 * @param {object[]} productos
 * @param {(nombre: string) => {codigoBuscar, codigoMostrar}|null} lookup
 * @returns {{ productos: object[], matched: number, total: number }}
 */
export function aplicarCatalogoAProductos(productos, lookup) {
  let matched = 0
  let total = 0

  function resolver(nombre) {
    if (!nombre) return null
    total++
    const entry = lookup(nombre)
    if (entry) matched++
    return entry
  }

  const resultado = productos.map((p) => {
    let next = p

    if (!next.codigo) {
      const entry = resolver(next.nombre)
      if (entry) {
        next = { ...next, codigo: entry.codigoBuscar, codigoMostrar: entry.codigoMostrar ?? next.codigoMostrar }
      }
    }

    if (next.nombre2 && !next.codigo2) {
      const entry2 = resolver(next.nombre2)
      if (entry2) {
        next = { ...next, codigo2: entry2.codigoBuscar, codigoMostrar2: entry2.codigoMostrar ?? next.codigoMostrar2 }
      }
    }

    return next
  })

  return { productos: resultado, matched, total }
}