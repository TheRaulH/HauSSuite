import PageHeader from '../../suite/PageHeader'
import { useHashRoute } from '../../suite/useHashRoute'
import { REPORTS } from './reports'

const BASE = '/reportes'

export default function ReportsPage() {
  const path = useHashRoute()
  const reportId = path.startsWith(`${BASE}/`) ? path.slice(BASE.length + 1) : null
  const report = REPORTS.find((r) => r.id === reportId)

  if (report) {
    const { Component } = report
    return <Component />
  }

  return (
    <>
      <PageHeader title="Reportes" description="Elige un reporte para ver cómo nos fue" />
      <div className="max-w-5xl mx-auto px-6 py-6 grid gap-4 sm:grid-cols-2">
        {reportId && (
          <p className="sm:col-span-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            No existe el reporte “{reportId}”. Elige uno de la lista.
          </p>
        )}
        {REPORTS.map((r) => {
          const Icon = r.icon
          return (
            <a
              key={r.id}
              href={`#${BASE}/${r.id}`}
              className="group bg-white border border-haus-sky rounded-3xl rounded-bl-none p-6 flex flex-col gap-3 transition-colors hover:bg-haus-blue hover:border-haus-blue outline-none focus-visible:ring-2 focus-visible:ring-haus-blue focus-visible:ring-offset-2"
            >
              <span className="w-11 h-11 rounded-full bg-haus-sky text-haus-blue flex items-center justify-center transition-colors group-hover:bg-white/15 group-hover:text-white">
                <Icon size={22} aria-hidden />
              </span>
              <h2 className="font-semibold text-lg text-haus-blue transition-colors group-hover:text-white">{r.title}</h2>
              <p className="text-sm text-gray-600 transition-colors group-hover:text-haus-sky">{r.description}</p>
            </a>
          )
        })}
      </div>
    </>
  )
}
