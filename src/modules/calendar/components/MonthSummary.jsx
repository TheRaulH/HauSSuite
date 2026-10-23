import { PURPOSES } from '../calendarConfig'

/** Resumen del mes: avance de publicación y balance comunicacional por propósito. */
export default function MonthSummary({ items }) {
  const total = items.length
  const published = items.filter((p) => p.is_published).length
  const percent = total ? Math.round((published / total) * 100) : 0

  const counts = PURPOSES.map((purpose) => ({
    ...purpose,
    count: items.filter((p) => p.purpose.includes(purpose.id)).length,
  }))
  const withoutPurpose = items.filter((p) => p.purpose.length === 0).length
  const tagTotal = counts.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-gray-700">Publicadas este mes</h3>
          <p className="text-sm text-gray-500">
            <span className="text-lg font-semibold text-haus-blue">{published}</span> de {total}
          </p>
        </div>
        <div className="h-2 rounded-full bg-haus-sky overflow-hidden">
          <div className="h-full bg-haus-blue transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-700">Balance de contenido</h3>
        {tagTotal > 0 ? (
          <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
            {counts
              .filter((c) => c.count > 0)
              .map((c) => (
                <div key={c.id} style={{ width: `${(c.count / tagTotal) * 100}%`, backgroundColor: c.bar }} />
              ))}
          </div>
        ) : (
          <div className="h-2 rounded-full bg-gray-100" />
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {counts.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              {c.label} {c.count}
            </span>
          ))}
          {withoutPurpose > 0 && <span className="text-gray-400">Sin propósito {withoutPurpose}</span>}
        </div>
      </div>
    </div>
  )
}
