import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy } from 'lucide-react'
import { useClipboard } from '../../../suite/useClipboard'
import { formatBs } from '../format'
import { buildLinkSql, suggestLinks, VENTANA_POST_LIVE_HORAS } from './calculations'

/**
 * Ventas que no están vinculadas a ningún live: NO cuentan en el reporte hasta que se vinculen.
 * Se sugiere el live por horario y se puede copiar el SQL para vincularlas en Supabase.
 */
export default function UnlinkedSales({ ventas, todasLasPautas }) {
  const { copiedKey, copyText } = useClipboard(2000)
  const sugerencias = useMemo(() => suggestLinks(ventas, todasLasPautas), [ventas, todasLasPautas])

  if (ventas.length === 0) return null

  return (
    <details className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 group" open={sugerencias.size > 0}>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 flex-wrap">
        <span>
          <span className="font-semibold text-haus-blue">Ventas sin vincular a un live ({ventas.length})</span>
          <span className="block text-sm text-gray-500">
            Estas ventas no se cuentan en el reporte hasta que se vinculen a un live.
          </span>
        </span>
        <span className="text-sm text-haus-blue underline group-open:hidden">Ver</span>
      </summary>

      <div className="mt-4 flex flex-col gap-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="py-2 pr-3 font-medium">Fecha</th>
                <th className="py-2 pr-3 font-medium">Factura</th>
                <th className="py-2 pr-3 font-medium">Producto</th>
                <th className="py-2 pr-3 font-medium text-right">Cant.</th>
                <th className="py-2 pr-3 font-medium text-right">Ganancia</th>
                <th className="py-2 font-medium">Live sugerido (por horario)</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => {
                const pauta = sugerencias.get(v.id)
                return (
                  <tr key={v.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{format(v.fecha, 'd MMM · HH:mm', { locale: es })}</td>
                    <td className="py-2 pr-3">{v.factura}</td>
                    <td className="py-2 pr-3 max-w-[20rem] truncate" title={v.producto}>
                      {v.producto}
                    </td>
                    <td className="py-2 pr-3 text-right">{v.cantidad}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{formatBs(v.gananciaBs, { decimals: 2 })}</td>
                    <td className="py-2 text-gray-600">
                      {pauta ? `${pauta.titulo} · ${format(pauta.fecha, 'd MMM', { locale: es })}` : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          La sugerencia toma las ventas hechas durante el live o hasta {VENTANA_POST_LIVE_HORAS} horas después. Es solo
          una pista: confírmala antes de vincular.
        </p>

        {sugerencias.size > 0 && (
          <div>
            <button
              type="button"
              onClick={() => copyText(buildLinkSql(sugerencias), 'sql')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 rounded-full rounded-bl-none"
            >
              <Copy size={15} aria-hidden />
              {copiedKey === 'sql' ? '¡SQL copiado!' : `Copiar SQL para vincular ${sugerencias.size} ventas`}
            </button>
            <p className="text-xs text-gray-500 mt-2">Pégalo en Supabase → SQL Editor, ejecútalo y pulsa “Actualizar datos”.</p>
          </div>
        )}
      </div>
    </details>
  )
}
