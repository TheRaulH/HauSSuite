import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { NETWORKS } from '../networks'
import { ChartBox, RetailTickY, RetailTooltip, isUs, makeEndLabel, scale } from './shared'

const net = NETWORKS.facebook

/** Facebook: barras tipo "progreso" sobre una pista gris, con el logo de cada retail. */
export default function FacebookChart({ rows, prevLabel, expanded = false }) {
  const { fs, logo } = scale(expanded)
  const yWidth = expanded ? 190 : 150
  return (
    <ChartBox expanded={expanded} height={rows.length * 52 + 24}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: expanded ? 150 : 120, left: 0, bottom: 4 }} barCategoryGap="24%">
          <CartesianGrid horizontal={false} vertical={false} />
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
          <Tooltip content={<RetailTooltip prevLabel={prevLabel} />} cursor={false} />
          <Bar dataKey="followers" radius={[0, 10, 10, 0]} maxBarSize={expanded ? 44 : 28} background={{ fill: '#EEF2F8', radius: 10 }}>
            {rows.map((r) => (
              <Cell key={r.retail} fill={isUs(r) ? net.color : net.tint} />
            ))}
            <LabelList dataKey="followers" content={makeEndLabel(rows, fs)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  )
}
