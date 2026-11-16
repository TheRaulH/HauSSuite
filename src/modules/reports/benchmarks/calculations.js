import { format, parseISO, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCompact, formatInt, formatPct } from '../format'

export const OUR_RETAIL = 'HAUSCENTER'
export const PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
]
const DEFAULT_RETAILS = ['CAMSA', 'DISMAC', 'HAUSCENTER', 'MULTICENTER', 'ROHO', 'TIENDA AMIGA']

/** Lista de cortes disponibles ("2026-11-01"), del más reciente al más antiguo. */
export function listCortes(rows) {
  return [...new Set(rows.map((r) => r.date))].sort().reverse()
}

/** El corte del día 1 refleja el cierre del mes anterior: "Cierre de octubre 2026 (corte 1 nov)". */
export function cutLabel(dateKey) {
  const d = parseISO(dateKey)
  const corte = format(d, "d MMM yyyy", { locale: es })
  if (d.getDate() === 1) {
    return `Cierre de ${format(subMonths(d, 1), 'LLLL yyyy', { locale: es })} (corte ${corte})`
  }
  return `Corte del ${corte}`
}

export const shortCut = (dateKey) => format(parseISO(dateKey), "d 'de' MMM", { locale: es })

/** Corte inmediatamente anterior al elegido (para calcular cuánto creció cada uno). */
export function previousCut(cortes, selected) {
  return cortes.find((c) => c < selected) ?? null
}

function withDeltas(entries, prevMap) {
  return entries
    .sort((a, b) => b.followers - a.followers)
    .map((e, i) => {
      const prev = prevMap.get(e.retail)
      const hasPrev = prev !== undefined
      return {
        ...e,
        rank: i + 1,
        prev: hasPrev ? prev : null,
        delta: hasPrev ? e.followers - prev : null,
        deltaPct: hasPrev && prev > 0 ? (e.followers - prev) / prev : null,
      }
    })
}

/** Ranking de una red social en un corte, con la variación contra el corte anterior. */
export function buildPlatformRows(rows, date, prevDate, platform) {
  const pick = (d) => rows.filter((r) => r.date === d && r.platform === platform)
  const prevMap = new Map(prevDate ? pick(prevDate).map((r) => [r.retail, r.followers]) : [])
  return withDeltas(
    pick(date).map((r) => ({ retail: r.retail, followers: r.followers })),
    prevMap
  )
}

/** Ranking del acumulado (Facebook + Instagram + TikTok) usando la vista consolidada. */
export function buildTotalRows(consolidated, date, prevDate) {
  const pick = (d) => consolidated.filter((r) => r.date === d)
  const prevMap = new Map(prevDate ? pick(prevDate).map((r) => [r.retail, r.total]) : [])
  return withDeltas(
    pick(date).map((r) => ({
      retail: r.retail,
      followers: r.total,
      breakdown: { Facebook: r.facebook, Instagram: r.instagram, TikTok: r.tiktok },
    })),
    prevMap
  )
}

const signedPct = (ratio) => `${ratio >= 0 ? '+' : '−'}${formatPct(Math.abs(ratio), 1)}`

/** Conclusión en palabras para debajo de cada gráfico. */
export function describeRanking(rows, networkLabel) {
  if (rows.length === 0) return null
  const us = rows.find((r) => r.retail === OUR_RETAIL)
  const leader = rows[0]
  const parts = []

  if (us) {
    if (us.rank === 1) {
      parts.push(`${OUR_RETAIL} lidera ${networkLabel} con ${formatInt(us.followers)} seguidores.`)
    } else {
      const times = leader.followers / us.followers
      const comparison = times >= 2 ? `${times.toFixed(1).replace('.', ',')} veces más` : `${formatPct(times - 1)} más`
      parts.push(
        `${OUR_RETAIL} está en el puesto ${us.rank} de ${rows.length} en ${networkLabel}, con ${formatCompact(us.followers)} seguidores. ` +
          `El líder, ${leader.retail}, tiene ${comparison}.`
      )
    }
    if (us.delta != null) {
      parts.push(
        `Desde el corte anterior ${us.delta >= 0 ? 'ganó' : 'perdió'} ${formatInt(Math.abs(us.delta))} seguidores` +
          (us.deltaPct != null ? ` (${signedPct(us.deltaPct)}).` : '.')
      )
    }
  }

  const growing = rows.filter((r) => r.deltaPct != null)
  if (growing.length > 0) {
    const best = growing.reduce((a, b) => (b.deltaPct > a.deltaPct ? b : a))
    if (best.retail !== OUR_RETAIL) parts.push(`Quien más creció fue ${best.retail} (${signedPct(best.deltaPct)}).`)
  }

  return parts.join(' ')
}

/**
 * SQL de plantilla para cargar el próximo corte a mano: cada NULL hay que reemplazarlo
 * por los seguidores; si se olvida alguno, Supabase rechaza el insert (columna NOT NULL).
 */
export function buildNextCutSql(rows, today = new Date()) {
  const existing = new Set(rows.map((r) => r.date))
  const first = (d) => format(d, 'yyyy-MM-01')
  let date = first(today)
  if (existing.has(date)) date = first(new Date(today.getFullYear(), today.getMonth() + 1, 1))

  const retails = [...new Set(rows.map((r) => r.retail))].sort()
  const names = retails.length > 0 ? retails : DEFAULT_RETAILS

  const values = PLATFORMS.flatMap((p) => [
    `  -- ${p.label.toUpperCase()}`,
    ...names.map((retail) => `  ('${date}', '${retail.replace(/'/g, "''")}', '${p.id}', NULL),`),
  ])
  // La última fila no lleva coma
  const last = values.length - 1
  values[last] = values[last].replace(/,$/, '')

  return [
    `-- Corte del ${date}: reemplaza cada NULL por los seguidores actuales y ejecuta.`,
    'INSERT INTO public.retail_followers (analysis_date, retail_name, platform, followers)',
    'VALUES',
    ...values,
    'ON CONFLICT (analysis_date, retail_name, platform)',
    'DO UPDATE SET followers = EXCLUDED.followers;',
  ].join('\n')
}
