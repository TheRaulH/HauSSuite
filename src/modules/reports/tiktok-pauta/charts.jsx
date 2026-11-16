import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBs, formatInt } from '../format'

// Colores de la línea gráfica: azul base, verde oliva (lo que suma), naranja (alerta/límite)
const BLUE = '#123B64'
const OLIVE = '#7C8861'
const SKY = '#DCE3EB'
const ORANGE = '#E76100'

const axisProps = { tick: { fontSize: 12, fill: '#6b7280' }, tickLine: false, axisLine: false }
const moneyTip = (value, name) => [formatBs(value, { decimals: 2 }), name]

/** ¿Lo que invertimos se recuperó en cada live? Barras lado a lado. */
export function InversionVsGananciaChart({ rows }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={48} tickFormatter={(v) => `${v}`} />
        <Tooltip formatter={moneyTip} />
        <Legend />
        <Bar dataKey="inversion" name="Inversión en pauta" fill={BLUE} radius={[4, 4, 0, 0]} />
        <Bar dataKey="ganancia" name="Ganancia de las ventas" fill={OLIVE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** ¿Vamos ganando o perdiendo en total? Resultado acumulado live tras live. */
export function ResultadoAcumuladoChart({ rows }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={48} />
        <Tooltip formatter={(v) => [formatBs(v, { decimals: 2 }), 'Resultado acumulado']} />
        <ReferenceLine y={0} stroke={ORANGE} strokeDasharray="4 4" label={{ value: 'Punto de equilibrio', fill: ORANGE, fontSize: 12, position: 'insideTopRight' }} />
        <Area type="monotone" dataKey="acumulado" stroke={BLUE} strokeWidth={2} fill={SKY} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** ¿Cuánta gente entró a cada live? */
export function EspectadoresChart({ rows, promedio, unidad = 'Espectadores' }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={48} />
        <Tooltip formatter={(v) => [formatInt(v), unidad]} />
        {promedio > 0 && (
          <ReferenceLine y={promedio} stroke={OLIVE} strokeDasharray="4 4" label={{ value: 'Promedio', fill: OLIVE, fontSize: 12, position: 'insideTopRight' }} />
        )}
        <Bar dataKey="espectadores" name={unidad} fill={BLUE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const trim = (text, max = 26) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** ¿Qué tipo de live funciona mejor? Resultado por título de campaña. */
export function PorCampanaChart({ rows }) {
  const height = Math.max(160, rows.length * 52 + 40)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" {...axisProps} />
        <YAxis type="category" dataKey="titulo" width={150} {...axisProps} tickFormatter={(t) => trim(t)} />
        <Tooltip formatter={(v) => [formatBs(v, { decimals: 2 }), 'Resultado']} labelFormatter={(t) => t} />
        <ReferenceLine x={0} stroke="#9ca3af" />
        <Bar dataKey="resultado" name="Resultado" radius={4}>
          {rows.map((r) => (
            <Cell key={r.titulo} fill={r.resultado >= 0 ? OLIVE : ORANGE} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
