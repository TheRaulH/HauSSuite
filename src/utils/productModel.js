/**
 * Modelo interno estándar de producto.
 *
 * Sin importar cómo vengan las columnas en el Excel/CSV original,
 * TODO en la app (tabla, plantillas, exportación) trabaja únicamente
 * con este formato. Así las plantillas nunca dependen de cómo vino
 * el archivo de origen.
 *
 * Un producto SIEMPRE tiene el precio/cuotas "de la fila completa"
 * (nunca por ítem individual — ni siquiera en un combo, donde el precio
 * es del par, no de uno de los dos). Sobre esa base, un producto puede
 * además traer:
 *  - un SEGUNDO producto en combo (codigo2/nombre2/imagen2), cuando la
 *    fila representa 2 productos vendidos juntos por un solo precio.
 *  - un REGALO (regaloCodigo/regaloNombre/regaloImagen), cuando la fila
 *    incluye un ítem gratis sin precio propio.
 * Ambos quedan en null cuando no aplican — un producto "simple" es
 * exactamente el mismo shape de siempre.
 */

/** Campos que el usuario DEBE mapear desde su Excel para poder generar el arte. */
export const REQUIRED_FIELDS = ['nombre', 'precio', 'cuotas']

/** Campos opcionales del producto principal: si no existen o no se mapean, quedan en null. */
export const OPTIONAL_FIELDS = ['codigo', 'codigoMostrar', 'precioAntes', 'ahorra', 'descuento']

/** Campos del segundo producto, solo se piden en modo de importación "Combo". */
export const COMBO_FIELDS = ['codigo2', 'codigoMostrar2', 'nombre2']

/** Todos los campos reconocidos, en el orden en que se piden al mapear columnas (modo simple/con regalo). */
export const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]

/** Campos reconocidos en modo combo: los de siempre + el segundo producto. */
export const ALL_FIELDS_COMBO = [...ALL_FIELDS, ...COMBO_FIELDS]

/** Etiquetas legibles para mostrar en el selector de mapeo de columnas. */
export const FIELD_LABELS = {
  nombre: 'Nombre del producto',
  precio: 'Precio actual',
  cuotas: 'Cuotas',
  codigo: 'Código (para buscar la imagen)',
  codigoMostrar: 'Código a mostrar en el arte (opcional)',
  precioAntes: 'Precio antes / Precio Hauscenter (opcional)',
  ahorra: 'Ahorro en Bs (opcional)',
  descuento: 'Descuento % (opcional)',
  codigo2: 'Código del 2º producto (combo)',
  codigoMostrar2: 'Código a mostrar del 2º producto (opcional)',
  nombre2: 'Nombre del 2º producto (combo)',
}

let nextId = 1

/**
 * Crea un producto en el formato estándar interno.
 * @param {object} raw - valores ya extraídos según el mapeo de columnas.
 * @returns {object} producto normalizado
 */
export function createProduct(raw = {}) {
  return {
    id: raw.id ?? String(nextId++),
    codigo: raw.codigo ? String(raw.codigo).trim() : null, // se usa para buscar/emparejar la imagen
    codigoMostrar: raw.codigoMostrar ? String(raw.codigoMostrar).trim() : null, // el que va impreso en el arte, si es distinto
    nombre: raw.nombre ? String(raw.nombre).trim() : '',
    precio: parseNumber(raw.precio),
    precioAntes: raw.precioAntes !== undefined && raw.precioAntes !== null && raw.precioAntes !== ''
      ? parseNumber(raw.precioAntes)
      : null,
    cuotas: raw.cuotas !== undefined && raw.cuotas !== null && raw.cuotas !== ''
      ? parseNumber(raw.cuotas)
      : null,
    ahorra: raw.ahorra !== undefined && raw.ahorra !== null && raw.ahorra !== ''
      ? parseNumber(raw.ahorra)
      : null,
    descuento: raw.descuento !== undefined && raw.descuento !== null && raw.descuento !== ''
      ? parseNumber(raw.descuento)
      : null,
    imagen: raw.imagen ?? null, // se llena después, al asociar imágenes por código

    // Segundo producto del combo (null si esta fila no es un combo)
    codigo2: raw.codigo2 ? String(raw.codigo2).trim() : null,
    codigoMostrar2: raw.codigoMostrar2 ? String(raw.codigoMostrar2).trim() : null,
    nombre2: raw.nombre2 ? String(raw.nombre2).trim() : null,
    imagen2: raw.imagen2 ?? null,

    // Regalo que acompaña a este producto (null si no aplica)
    regaloCodigo: raw.regaloCodigo ? String(raw.regaloCodigo).trim() : null,
    regaloCodigoMostrar: raw.regaloCodigoMostrar ? String(raw.regaloCodigoMostrar).trim() : null,
    regaloNombre: raw.regaloNombre ? String(raw.regaloNombre).trim() : null,
    regaloImagen: raw.regaloImagen ?? null,

    seleccionado: true, // usado por la tabla para "generar seleccionados"
  }
}

/**
 * Valida que un producto tenga los campos obligatorios completos.
 * @returns {{ valido: boolean, errores: string[] }}
 */
export function validateProduct(product) {
  const errores = []
  if (!product.nombre) errores.push('Falta nombre')
  if (product.precio === null || Number.isNaN(product.precio)) errores.push('Falta precio')
  if (product.cuotas === null || Number.isNaN(product.cuotas)) errores.push('Falta cuotas')
  return { valido: errores.length === 0, errores }
}

/** true si esta fila es un combo (trae un segundo producto). */
export function esCombo(product) {
  return Boolean(product?.nombre2)
}

/** true si esta fila trae un regalo. */
export function tieneRegalo(product) {
  return Boolean(product?.regaloNombre)
}

/**
 * El código que debe IMPRIMIRSE en el arte generado para el producto
 * principal: el explícito (`codigoMostrar`) si lo hay, si no cae al
 * `codigo` de búsqueda. Úsalo en los componentes de plantilla en vez de
 * leer `product.codigo` directamente, para que cuando ambos códigos
 * difieran (ej. el código con el que se busca la imagen trae guiones
 * que en el arte van con "/") se imprima el correcto.
 */
export function displayCode(product) {
  return product?.codigoMostrar || product?.codigo || ''
}

/** Lo mismo que displayCode(), pero para el segundo producto del combo. */
export function displayCode2(product) {
  return product?.codigoMostrar2 || product?.codigo2 || ''
}

/** Lo mismo que displayCode(), pero para el regalo. */
export function displayRegaloCode(product) {
  return product?.regaloCodigoMostrar || product?.regaloCodigo || ''
}

/** Convierte strings tipo "Bs 599", "599,00", "1.200" a número. */
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return value
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, '') // quita símbolos de moneda, letras, espacios
    .replace(/\.(?=\d{3}(?:\D|$))/g, '') // quita puntos de miles (1.200 -> 1200)
    .replace(',', '.') // coma decimal -> punto
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : num
}
