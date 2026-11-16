import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import ReportShell from '../components/ReportShell'
import TikTokPautaView from './TikTokPautaView'
import { useTikTokPauta } from './useTikTokPauta'

const TIPOS = [
  { id: 'LIVE', label: 'Lives' },
  { id: 'Video', label: 'Videos' },
  { id: 'all', label: 'Todo' },
]

const dateInput =
  'text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-haus-blue/30'

export default function TikTokPautaReport() {
  const { pautas, ventasSinPauta, loading, error, reload } = useTikTokPauta()
  const [tipo, setTipo] = useState('LIVE')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const filtradas = useMemo(
    () =>
      pautas.filter((p) => {
        if (tipo !== 'all' && p.tipo !== tipo) return false
        const dia = format(p.fecha, 'yyyy-MM-dd')
        if (desde && dia < desde) return false
        if (hasta && dia > hasta) return false
        return true
      }),
    [pautas, tipo, desde, hasta]
  )

  const filters = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-white border border-haus-sky rounded-2xl px-4 py-3">
      <div className="inline-flex rounded-full border border-gray-300 overflow-hidden" role="group" aria-label="Tipo de pauta">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            aria-pressed={tipo === t.id}
            className={`px-4 py-1.5 text-sm ${tipo === t.id ? 'bg-haus-blue text-white' : 'bg-white text-gray-600 hover:bg-haus-sky'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        Desde
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={dateInput} />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        Hasta
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={dateInput} />
      </label>
      {(desde || hasta) && (
        <button
          type="button"
          onClick={() => {
            setDesde('')
            setHasta('')
          }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Quitar fechas
        </button>
      )}
    </div>
  )

  return (
    <ReportShell
      title="Pauta de TikTok"
      description="Cómo nos fue con los lives pagos y si fueron rentables"
      onReload={reload}
      loading={loading}
      filters={filters}
    >
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {loading && pautas.length === 0 && !error && <p className="text-sm text-gray-500">Cargando datos…</p>}

      {!error && (!loading || pautas.length > 0) && (
        <TikTokPautaView pautas={filtradas} todasLasPautas={pautas} ventasSinPauta={ventasSinPauta} tipo={tipo} />
      )}
    </ReportShell>
  )
}
