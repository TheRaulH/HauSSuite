import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact, formatInt, formatPct, formatSigned } from '../format'
import { OUR_RETAIL } from './calculations'

// Hauscenter en azul de marca; el resto en un tono suave del mismo azul
const US = '#123B64'
const OTHERS = '#9DB0C5'

function RetailTooltip({ active, payload, prevLabel }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="font-semibold text-haus-blue">
        {row.retail} · puesto {row.rank}
      </p>
      <p className="text-gray-700">{formatInt(row.followers)} seguidores</p>
      {row.delta != null && (
        <p className={row.delta >= 0 ? 'text-[#4b5636]' : 'text-[#a14400]'}>
          {formatSigned(row.delta)}
          {row.deltaPct != null ? ` (${row.deltaPct >= 0 ? '+' : '−'}${formatPct(Math.abs(row.deltaPct), 1)})` : ''} desde {prevLabel}
        </p>
      )}
      {row.breakdown && (
        <ul className="mt-1 text-xs text-gray-500">
          {Object.entries(row.breakdown).map(([name, value]) => (
            <li key={name}>
              {name}: {formatInt(value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Barras horizontales ordenadas de mayor a menor; Hauscenter resaltado. */
export default function BarsChart({ rows, prevLabel }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 46 + 30)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="retail"
          width={112}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: '#374151' }}
        />
        <Tooltip content={<RetailTooltip prevLabel={prevLabel} />} cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey="followers" radius={4}>
          {rows.map((r) => (
            <Cell key={r.retail} fill={r.retail === OUR_RETAIL ? US : OTHERS} />
          ))}
          <LabelList dataKey="followers" position="right" formatter={formatCompact} style={{ fontSize: 12, fill: '#374151' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
