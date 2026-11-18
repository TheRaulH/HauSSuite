import { useState } from 'react'
import { Archive, Download, TriangleAlert } from 'lucide-react'
import { FORMATS } from '../formats'
import { downloadOne, downloadZip } from '../exportInvitation'
import ScaledPreview from './ScaledPreview'

export default function PreviewPanel({ template, data, formatId, onFormat }) {
  const [busy, setBusy] = useState(null) // 'one' | 'zip' | null
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const format = FORMATS.find((f) => f.id === formatId)
  const missing = template.photos.filter((p) => !data.fotos[p.key]?.src)
  const maxHeight = typeof window === 'undefined' ? 700 : Math.max(380, window.innerHeight - 330)

  async function run(kind) {
    setBusy(kind)
    setError('')
    setProgress('')
    try {
      if (kind === 'one') {
        await downloadOne(template, data, format)
      } else {
        await downloadZip(template, data, FORMATS, (done, total) => setProgress(`${done} de ${total}`))
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo generar la imagen. Si la foto es muy pesada, prueba con una más liviana.')
    } finally {
      setBusy(null)
      setProgress('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Formato">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={f.id === formatId}
            onClick={() => onFormat(f.id)}
            className={`px-4 py-2 rounded-full rounded-bl-none text-sm text-left transition-colors ${
              f.id === formatId ? 'bg-haus-blue text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-haus-sky'
            }`}
          >
            <span className="font-semibold">{f.channel}</span>
            <span className={`ml-2 text-xs ${f.id === formatId ? 'text-haus-sky' : 'text-gray-400'}`}>
              {f.width}×{f.height}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 -mt-2">{format.hint}</p>

      <div className="bg-haus-sky/40 border border-haus-sky rounded-2xl p-4">
        <ScaledPreview template={template} data={data} format={format} maxHeight={maxHeight} />
      </div>

      {missing.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Falta: {missing.map((m) => m.label.toLowerCase()).join(', ')}. Si descargas así, el espacio saldrá con el rayado de ejemplo.
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run('one')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-haus-blue hover:opacity-90 disabled:opacity-50 rounded-full rounded-bl-none"
        >
          <Download size={16} aria-hidden />
          {busy === 'one' ? 'Generando…' : `Descargar ${format.channel} (PNG)`}
        </button>
        <button
          type="button"
          onClick={() => run('zip')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-haus-blue border border-haus-blue hover:bg-haus-sky disabled:opacity-50 rounded-full rounded-bl-none"
        >
          <Archive size={16} aria-hidden />
          {busy === 'zip' ? `Generando ${progress}…` : 'Descargar los 4 formatos (ZIP)'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
