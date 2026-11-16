import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompact } from '../../format'
import { NETWORKS } from '../networks'
import { ChartBox, DOWN, RetailTickX, RetailTooltip, UP, deltaText, isUs, scale } from './shared'

const net = NETWORKS.tiktok

/** Rectángulo con las esquinas de arriba redondeadas. */
function topRounded(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h))
  return `M${x},${y + h}L${x},${y + rr}Q${x},${y} ${x + rr},${y}L${x + w - rr},${y}Q${x + w},${y} ${x + w},${y + rr}L${x + w},${y + h}Z`
}

/** Hauscenter lleva el "glitch" de TikTok (cian y rosa a los lados); el resto va en gris suave. */
function Column({ x, y, width, height, payload }) {
  const col = (dx, fill) => <path d={topRounded(x + dx, y, width, height, 10)} fill={fill} />
  if (!isUs(payload)) return <g>{col(0, net.tint)}</g>
  return (
    <g>
      {col(-4, '#25F4EE')}
      {col(4, '#FE2C55')}
      {col(0, '#111827')}
    </g>
  )
}

/** TikTok: columnas verticales con el logo de cada retail debajo. */
export default function TikTokChart({ rows, prevLabel, expanded = false }) {
  const { fs, logo } = scale(expanded)
  const topLabel = ({ x, y, width, index }) => {
    const row = rows[index]
    if (!row) return null
    const d = deltaText(row)
    const cx = x + width / 2
    return (
      <g>
        <text x={cx} y={y - (d ? 22 : 9)} textAnchor="middle" fontSize={fs + 1} fontWeight={isUs(row) ? 700 : 600} fill="#1f2937">
          {formatCompact(row.followers)}
        </text>
        {d && (
          <text x={cx} y={y - 8} textAnchor="middle" fontSize={fs - 1} fill={row.delta >= 0 ? UP : DOWN}>
            {d}
          </text>
        )}
      </g>
    )
  }

  return (
    <ChartBox expanded={expanded} height={340}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 48, right: 16, left: 16, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="retail" interval={0} axisLine={false} tickLine={false} height={logo + 40} tick={<RetailTickX logo={logo} fs={fs} />} />
          <YAxis hide domain={[0, 'dataMax']} />
          <Tooltip content={<RetailTooltip prevLabel={prevLabel} />} cursor={{ fill: '#F3F4F6' }} />
          <Bar dataKey="followers" maxBarSize={expanded ? 110 : 72} shape={Column}>
            <LabelList dataKey="followers" content={topLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  )
}
