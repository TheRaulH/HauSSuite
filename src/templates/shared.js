/** Utilidades compartidas por los componentes de plantilla (uno por formato/diseño). */

/** Formatea un número como precio boliviano: 2499 -> "2.499". */
export function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return Math.round(value).toLocaleString('es-BO')
}
