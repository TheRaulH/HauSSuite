import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact } from '../../format'
import { NETWORK_LIST, NetworkIcon } from '../networks'
import { ChartBox, RetailTickY, RetailTooltip, isUs, makeEndLabel, scale } from './shared'

/** Etiqueta dentro de cada tramo; solo si el tramo es lo bastante ancho para leerse. */
const makeSegmentLabel =
  (key, fs) =>
  ({ x, y, width, height, index, value }) => {
    if (!(value > 0) || width < 46) return null
    return (
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={fs - 1} fontWeight={600} fill="#fff">
        {formatCompact(value)}
      </text>
    )
  }

/** Leyenda de redes (con su icono) para entender qué color es cada tramo. */
function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {NETWORK_LIST.map((n) => (
        <li key={n.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-white rounded-full pl-1.5 pr-2.5 py-1" style={{ background: n.color }}>
          <NetworkIcon id={n.id} size={13} />
          {n.label}
        </li>
      ))}
    </ul>
  )
}

/** Acumulado: una barra por retail dividida en tramos de Facebook, Instagram y TikTok. */
export default function ConsolidatedChart({ rows, prevLabel, expanded = false }) {
  const { fs, logo } = scale(expanded)
  const yWidth = expanded ? 190 : 150
  return (
    <div className={expanded ? 'h-full flex flex-col gap-3' : 'flex flex-col gap-3'}>
      <Legend />
      <ChartBox expanded={expanded} height={rows.length * 54 + 24}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: expanded ? 160 : 130, left: 0, bottom: 4 }} barCategoryGap="22%">
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="retail"
              width={yWidth}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={<RetailTickY logo={logo} fs={fs} width={yWidth} />}
            />
            <Tooltip content={<RetailTooltip prevLabel={prevLabel} />} cursor={{ fill: '#F3F4F6' }} />
            {NETWORK_LIST.map((n, i) => {
              const last = i === NETWORK_LIST.length - 1
              return (
                <Bar
                  key={n.id}
                  dataKey={n.id}
                  name={n.label}
                  stackId="total"
                  fill={n.color}
                  maxBarSize={expanded ? 52 : 34}
                  radius={last ? [0, 8, 8, 0] : 0}
                >
                  {/* Hauscenter a color pleno; el resto más suave para que destaque */}
                  {rows.map((r) => (
                    <Cell key={r.retail} fill={n.color} fillOpacity={isUs(r) ? 1 : 0.55} />
                  ))}
                  <LabelList dataKey={n.id} content={makeSegmentLabel(n.id, fs)} />
                  {last && <LabelList dataKey="followers" content={makeEndLabel(rows, fs)} />}
                </Bar>
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  )
}
