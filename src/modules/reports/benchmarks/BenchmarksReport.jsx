import { useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import ReportShell from '../components/ReportShell'
import { useClipboard } from '../../../suite/useClipboard'
import BenchmarksView from './BenchmarksView'
import { buildNextCutSql, cutLabel, listCortes } from './calculations'
import { useBenchmarks } from './useBenchmarks'

export default function BenchmarksReport() {
  const { rows, consolidated, loading, error, reload } = useBenchmarks()
  const { copiedKey, copyText } = useClipboard(2000)
  const [elegido, setElegido] = useState('')

  const cortes = useMemo(() => listCortes(rows), [rows])
  // Por defecto, el corte más reciente
  const selected = cortes.includes(elegido) ? elegido : cortes[0]

  const filters = (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-haus-sky rounded-2xl px-4 py-3">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        Mes a revisar
        <select
          value={selected ?? ''}
          onChange={(e) => setElegido(e.target.value)}
          disabled={cortes.length === 0}
          className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-haus-blue/30"
        >
          {cortes.map((c) => (
            <option key={c} value={c}>
              {cutLabel(c)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => copyText(buildNextCutSql(rows), 'sql')}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 disabled:opacity-50 rounded-full rounded-bl-none"
      >
        <Copy size={15} aria-hidden />
        {copiedKey === 'sql' ? '¡SQL copiado!' : 'Copiar plantilla SQL del próximo corte'}
      </button>
    </div>
  )

  return (
    <ReportShell
      title="Benchmarks"
      description="Seguidores de los retails en Facebook, Instagram y TikTok"
      onReload={reload}
      loading={loading}
      filters={filters}
    >
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      {loading && rows.length === 0 && !error && <p className="text-sm text-gray-500">Cargando datos…</p>}

      {!loading && !error && cortes.length === 0 && (
        <p className="text-sm text-gray-500 bg-white border border-haus-sky rounded-2xl px-5 py-8 text-center">
          Todavía no hay cortes cargados. Usa “Copiar plantilla SQL del próximo corte”, completa los seguidores y ejecútalo en Supabase.
        </p>
      )}

      {selected && <BenchmarksView rows={rows} consolidated={consolidated} cortes={cortes} selected={selected} />}
    </ReportShell>
  )
}
