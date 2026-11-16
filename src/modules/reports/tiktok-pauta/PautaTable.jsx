import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatBs, formatInt } from '../format'

const ESTADO = {
  rentable: { label: 'Rentable', cls: 'bg-haus-olive/15 text-[#4b5636]' },
  perdida: { label: 'No alcanzó', cls: 'bg-haus-orange/15 text-[#a14400]' },
  'sin-ventas': { label: 'Sin ventas registradas', cls: 'bg-gray-100 text-gray-600' },
}

export function EstadoBadge({ estado }) {
  const e = ESTADO[estado]
  return <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${e.cls}`}>{e.label}</span>
}

/** Detalle pauta por pauta. */
export default function PautaTable({ pautas, unidad = 'Espectadores' }) {
  const rows = [...pautas].sort((a, b) => b.fecha - a.fecha)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[860px]">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
            <th className="py-2 pr-3 font-medium">Fecha</th>
            <th className="py-2 pr-3 font-medium">Pauta</th>
            <th className="py-2 pr-3 font-medium text-right">Inversión</th>
            <th className="py-2 pr-3 font-medium text-right">{unidad}</th>
            <th className="py-2 pr-3 font-medium text-right">Costo por persona</th>
            <th className="py-2 pr-3 font-medium text-right">Ventas</th>
            <th className="py-2 pr-3 font-medium text-right">Ganancia</th>
            <th className="py-2 pr-3 font-medium text-right">Resultado</th>
            <th className="py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                {format(p.fecha, "d MMM · HH:mm", { locale: es })}
              </td>
              <td className="py-2 pr-3 max-w-[16rem]">
                <p className="truncate text-gray-800" title={p.titulo}>
                  {p.titulo}
                </p>
                <p className="text-xs text-gray-400">
                  {p.tipo}
                  {p.duracion ? ` · ${p.duracion}` : ''}
                </p>
              </td>
              <td className="py-2 pr-3 text-right whitespace-nowrap">{formatBs(p.inversionBs, { decimals: 2 })}</td>
              <td className="py-2 pr-3 text-right">{formatInt(p.espectadores)}</td>
              <td className="py-2 pr-3 text-right whitespace-nowrap">
                {p.costoPorEspectadorBs == null ? '—' : formatBs(p.costoPorEspectadorBs, { decimals: 2 })}
              </td>
              <td className="py-2 pr-3 text-right">{p.ventasFacturas > 0 ? `${p.ventasFacturas} fact.` : '—'}</td>
              <td className="py-2 pr-3 text-right whitespace-nowrap">
                {p.ventasLineas > 0 ? formatBs(p.gananciaBs, { decimals: 2 }) : '—'}
              </td>
              <td
                className={`py-2 pr-3 text-right whitespace-nowrap font-medium ${
                  p.ventasLineas === 0 ? 'text-gray-400' : p.resultadoBs >= 0 ? 'text-[#4b5636]' : 'text-[#a14400]'
                }`}
              >
                {p.ventasLineas > 0 ? formatBs(p.resultadoBs, { decimals: 2 }) : '—'}
              </td>
              <td className="py-2">
                <EstadoBadge estado={p.estadoVenta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
