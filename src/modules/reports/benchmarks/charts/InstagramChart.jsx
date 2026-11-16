import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact } from '../../format'
import { ChartBox, RetailTickY, RetailTooltip, isUs, makeEndLabel, scale } from './shared'

const PINK = '#E1306C'

/** Un palito con degradé de Instagram que termina en un punto: Hauscenter es el punto grande y relleno. */
function Lollipop({ x, y, width, height, payload, k }) {
  const us = isUs(payload)
  const cy = y + height / 2
  const w = Math.max(width, 0)
  return (
    <g>
      <rect x={x} y={cy - 2 * k} width={w} height={4 * k} rx={2 * k} fill="url(#igStem)" opacity={us ? 1 : 0.4} />
      <circle
        cx={x + w}
        cy={cy}
        r={(us ? 11 : 8) * k}
        fill={us ? 'url(#igStem)' : '#fff'}
        stroke={us ? '#fff' : PINK}
        strokeOpacity={us ? 1 : 0.65}
        strokeWidth={us ? 3 : 2.5}
      />
    </g>
  )
}

/** Instagram: gráfico de puntos con escala, para leer cuánta distancia hay entre retails. */
export default function InstagramChart({ rows, prevLabel, expanded = false }) {
  const { fs, logo } = scale(expanded)
  const yWidth = expanded ? 190 : 150
  const k = expanded ? 1.3 : 1
  return (
    <ChartBox expanded={expanded} height={rows.length * 48 + 52}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: expanded ? 150 : 120, left: 0, bottom: 0 }} barCategoryGap="20%">
          <defs>
            <linearGradient id="igStem" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F9A03F" />
              <stop offset="55%" stopColor="#E1306C" />
              <stop offset="100%" stopColor="#8F3FBF" />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={false} strokeDasharray="2 6" stroke="#d6dbe3" />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={formatCompact}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: fs - 1, fill: '#9ca3af' }}
          />
          <YAxis
            type="category"
            dataKey="retail"
            width={yWidth}
            interval={0}
            tickLine={false}
            axisLine={false}
            tick={<RetailTickY logo={logo} fs={fs} width={yWidth} />}
          />
          <Tooltip content={<RetailTooltip prevLabel={prevLabel} />} cursor={{ fill: '#FBEFF5' }} />
          <Bar dataKey="followers" barSize={expanded ? 40 : 28} shape={(p) => <Lollipop {...p} k={k} />}>
            <LabelList dataKey="followers" content={makeEndLabel(rows, fs, 16 * k)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  )
}
