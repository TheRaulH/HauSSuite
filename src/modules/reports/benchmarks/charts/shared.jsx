import { formatCompact, formatInt, formatPct, formatSigned } from '../../format'
import { OUR_RETAIL } from '../calculations'
import { NETWORK_LIST } from '../networks'
import RetailLogo from '../RetailLogo'

export const UP = '#4b5636'
export const DOWN = '#a14400'
export const isUs = (row) => row?.retail === OUR_RETAIL

/** Tamaños según el gráfico esté en la tarjeta o en pantalla completa. */
export const scale = (expanded) => ({ fs: expanded ? 14 : 12, logo: expanded ? 34 : 26 })

/**
 * Da al gráfico un tamaño definido: alto fijo en la tarjeta, y todo el espacio disponible
 * en pantalla completa. El gráfico de recharts va adentro con 100% x 100%.
 */
export function ChartBox({ expanded, height, children }) {
  return expanded ? (
    <div className="flex-1 min-h-0">{children}</div>
  ) : (
    <div style={{ height }}>{children}</div>
  )
}

/** "▲ 1,2%" / "▼ 0,4%" respecto del corte anterior (vacío si no hay con qué comparar). */
export function deltaText(row) {
  if (row?.deltaPct == null) return ''
  return `${row.deltaPct >= 0 ? '▲' : '▼'} ${formatPct(Math.abs(row.deltaPct), 1)}`
}

/** Etiqueta al final de una barra horizontal: seguidores + variación. */
export const makeEndLabel =
  (rows, fs, offset = 8) =>
  ({ x, y, width, height, index }) => {
    const row = rows[index]
    if (!row) return null
    const d = deltaText(row)
    return (
      <text x={x + width + offset} y={y + height / 2} dominantBaseline="central" fontSize={fs} fill="#1f2937">
        <tspan fontWeight={isUs(row) ? 700 : 600}>{formatCompact(row.followers)}</tspan>
        {d && (
          <tspan dx={6} fontSize={fs - 1} fill={row.delta >= 0 ? UP : DOWN}>
            {d}
          </tspan>
        )}
      </text>
    )
  }

/** Eje vertical de retails: nombre + logo. */
export function RetailTickY({ x, y, payload, logo, fs, width }) {
  const us = payload.value === OUR_RETAIL
  return (
    <foreignObject x={x - width} y={y - logo / 2} width={width - 8} height={logo}>
      <div className="flex items-center justify-end gap-2 h-full">
        <span className={`truncate ${us ? 'font-bold text-haus-blue' : 'text-gray-700'}`} style={{ fontSize: fs }}>
          {payload.value}
        </span>
        <RetailLogo name={payload.value} size={logo} />
      </div>
    </foreignObject>
  )
}

/** Eje horizontal de retails: logo arriba, nombre abajo. */
export function RetailTickX({ x, y, payload, logo, fs, slot = 110 }) {
  const us = payload.value === OUR_RETAIL
  return (
    <foreignObject x={x - slot / 2} y={y + 6} width={slot} height={logo + 30}>
      <div className="flex flex-col items-center gap-1">
        <RetailLogo name={payload.value} size={logo} />
        <span className={`text-center leading-tight ${us ? 'font-bold text-haus-blue' : 'text-gray-600'}`} style={{ fontSize: fs - 1 }}>
          {payload.value}
        </span>
      </div>
    </foreignObject>
  )
}

/** Tooltip común: logo, puesto, seguidores, variación y (en el acumulado) el aporte de cada red. */
export function RetailTooltip({ active, payload, prevLabel }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-sm min-w-[190px]">
      <div className="flex items-center gap-2">
        <RetailLogo name={row.retail} size={24} />
        <p className="font-semibold text-haus-blue">
          {row.retail} <span className="font-normal text-gray-500">· puesto {row.rank}</span>
        </p>
      </div>
      <p className="mt-1.5 text-gray-800">{formatInt(row.followers)} seguidores</p>
      {row.delta != null && (
        <p style={{ color: row.delta >= 0 ? UP : DOWN }}>
          {formatSigned(row.delta)}
          {row.deltaPct != null ? ` (${row.deltaPct >= 0 ? '+' : '−'}${formatPct(Math.abs(row.deltaPct), 1)})` : ''} desde {prevLabel}
        </p>
      )}
      {row.breakdown && (
        <ul className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-600">
          {NETWORK_LIST.map((n) => {
            const value = row.breakdown[n.label]
            return (
              <li key={n.id} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: n.color }} />
                <span className="flex-1">{n.label}</span>
                <span className="tabular-nums">
                  {formatInt(value)}
                  {row.followers > 0 && <span className="text-gray-400"> · {formatPct(value / row.followers)}</span>}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
