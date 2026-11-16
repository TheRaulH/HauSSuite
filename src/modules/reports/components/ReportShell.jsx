import { ArrowLeft, RefreshCw } from 'lucide-react'
import PageHeader from '../../../suite/PageHeader'

/** Marco común de todos los reportes: título, volver al índice, actualizar y filtros. */
export default function ReportShell({ title, description, onReload, loading, filters, children }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href="#/reportes" className="inline-flex items-center gap-1.5 text-sm text-haus-blue hover:underline">
            <ArrowLeft size={16} aria-hidden />
            Todos los reportes
          </a>
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden />
              Actualizar datos
            </button>
          )}
        </div>
        {filters}
        {children}
      </div>
    </>
  )
}
