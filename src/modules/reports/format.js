const locale = 'es-BO'
const isNum = (n) => typeof n === 'number' && Number.isFinite(n)

export function formatBs(n, { decimals = 0 } = {}) {
  if (!isNum(n)) return '—'
  const abs = Math.abs(n).toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${n < 0 ? '−' : ''}Bs ${abs}`
}

export function formatInt(n) {
  return isNum(n) ? Math.round(n).toLocaleString(locale) : '—'
}

export function formatPct(ratio, decimals = 0) {
  if (!isNum(ratio)) return '—'
  return `${(ratio * 100).toLocaleString(locale, { maximumFractionDigits: decimals })}%`
}

/** Número con coma decimal (es-BO), sin símbolo de moneda. */
export function formatNumber(n, decimals = 2) {
  return isNum(n) ? n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—'
}

/** 936000 → "936 mil", 1200000 → "1,2 M" (para etiquetas de gráficos). */
export function formatCompact(n) {
  if (!isNum(n)) return '—'
  const short = (v) => v.toLocaleString(locale, { maximumFractionDigits: 1 })
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${short(n / 1_000_000)} M`
  if (abs >= 1_000) return `${short(n / 1_000)} mil`
  return String(Math.round(n))
}

/** +1.200 / −300 (con signo). */
export function formatSigned(n) {
  if (!isNum(n)) return '—'
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(Math.round(n)).toLocaleString(locale)}`
}
