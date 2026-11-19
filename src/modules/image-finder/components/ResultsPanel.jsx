import { Archive, Copy, Download, FileDown, Search } from 'lucide-react'
import { formatInt } from '../../reports/format'
import { formatBytes } from '../finder'
import ResultRow, { ROW_HEIGHT, STATUS } from './ResultRow'
import VirtualList from '../VirtualList'

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'ok', label: 'Encontradas' },
  { id: 'sin-imagen', label: 'Sin imagen' },
  { id: 'sin-catalogo', label: 'Sin catálogo' },
]

const FILTER_STYLE = {
  all: 'border-haus-blue text-haus-blue',
  ok: 'border-haus-olive text-[#4b5636]',
  'sin-imagen': 'border-haus-orange text-[#a14400]',
  'sin-catalogo': 'border-haus-blue/50 text-haus-blue',
}

function Hint({ children }) {
  return <div className="flex-1 flex items-center justify-center text-center text-sm text-gray-500 px-6 py-10">{children}</div>
}

/** Resultado: resumen y filtros arriba (siempre visibles), lista con su propio scroll abajo. */
export default function ResultsPanel({
  hint, rows, visible, counts, filter, onFilter, query, onQuery, analysis, zip, onZip, onCsv, onCopyMissing, copiedKey, message,
}) {
  const hasRows = rows.length > 0
  const missing = counts['sin-imagen'] + counts['sin-catalogo']
  const percent = analysis.total > 0 ? Math.round((analysis.done / analysis.total) * 100) : 0

  return (
    <section className="bg-white border border-haus-sky rounded-3xl rounded-bl-none flex flex-col min-h-0 h-full overflow-hidden" aria-label="Resultado">
      {/* Resumen + filtros */}
      <div className="p-4 flex flex-col gap-3 border-b border-haus-sky">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-haus-blue flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-haus-blue text-white text-xs flex items-center justify-center">3</span>
            Resultado
          </h3>
          <button
            type="button"
            onClick={onZip}
            disabled={counts.ok === 0 || zip.busy}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 disabled:opacity-40 rounded-full rounded-bl-none"
          >
            <Archive size={16} aria-hidden />
            {zip.busy
              ? `Armando ZIP ${zip.parts > 1 ? `${zip.part}/${zip.parts} · ` : ''}${zip.percent}%`
              : `Descargar ZIP (${formatInt(zip.count)})`}
          </button>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar resultados">
          {FILTERS.map((f) => {
            const active = filter === f.id
            const count = f.id === 'all' ? rows.length : counts[f.id]
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(f.id)}
                disabled={!hasRows}
                className={`px-3.5 py-1.5 rounded-full text-sm border-2 transition-colors disabled:opacity-40 ${
                  active ? `${FILTER_STYLE[f.id]} bg-white font-semibold` : 'border-transparent bg-haus-cream text-gray-600 hover:bg-haus-sky'
                }`}
              >
                {f.label} <span className="tabular-nums">{formatInt(count)}</span>
              </button>
            )
          })}
        </div>

        {hasRows && (
          <div className="flex h-2 rounded-full overflow-hidden bg-haus-sky" role="img" aria-label={`${counts.ok} de ${rows.length} encontradas`}>
            <div className="bg-haus-olive" style={{ width: `${(counts.ok / rows.length) * 100}%` }} />
            <div className="bg-haus-orange" style={{ width: `${(counts['sin-imagen'] / rows.length) * 100}%` }} />
            <div className="bg-haus-blue/40" style={{ width: `${(counts['sin-catalogo'] / rows.length) * 100}%` }} />
          </div>
        )}

        {analysis.running && (
          <div className="flex items-center gap-3 text-xs text-haus-blue">
            <div className="flex-1 h-1.5 rounded-full bg-haus-sky overflow-hidden">
              <div className="h-full bg-haus-blue transition-all" style={{ width: `${percent}%` }} />
            </div>
            Analizando {formatInt(analysis.done)} de {formatInt(analysis.total)}…
          </div>
        )}

        {/* Búsqueda y herramientas */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar en los resultados…"
              className="w-full text-sm border border-gray-300 rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-haus-blue/30"
            />
          </label>
          <button
            type="button"
            onClick={onCopyMissing}
            disabled={missing === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue disabled:opacity-40"
            title="Copia las descripciones que no tienen imagen o no están en el catálogo"
          >
            <Copy size={13} aria-hidden /> {copiedKey === 'missing' ? '¡Copiado!' : `Copiar faltantes (${formatInt(missing)})`}
          </button>
          <button
            type="button"
            onClick={onCsv}
            disabled={!hasRows}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue disabled:opacity-40"
          >
            <FileDown size={13} aria-hidden /> Reporte (.csv)
          </button>
        </div>

        {hasRows && counts.ok > 0 && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Download size={12} aria-hidden />
            {formatInt(zip.count)} imágenes · {formatBytes(zip.bytes)}
            {zip.expectedParts > 1 && <span className="text-amber-700">· pesa mucho: se descargará en {zip.expectedParts} ZIP (de unos 500 MB cada uno)</span>}
          </p>
        )}
        {message && <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-[#4b5636]'}`}>{message.text}</p>}
      </div>

      {/* Lista con scroll propio */}
      {hint ? (
        <Hint>{hint}</Hint>
      ) : visible.length === 0 ? (
        <Hint>{hasRows ? 'Ningún producto coincide con este filtro o búsqueda.' : 'Todavía no hay resultados.'}</Hint>
      ) : (
        <VirtualList
          items={visible}
          rowHeight={ROW_HEIGHT}
          resetKey={`${filter}|${query}`}
          className="flex-1 min-h-[240px]"
          renderRow={(row) => <ResultRow row={row} />}
        />
      )}
    </section>
  )
}

export { STATUS }
