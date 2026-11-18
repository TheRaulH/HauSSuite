import { FORMAT_BY_ID } from '../formats'
import { TEMPLATES } from '../invitationConfig'
import ScaledPreview from './ScaledPreview'

/** Galería de plantillas: cada miniatura ya muestra TU información. */
export default function TemplatePicker({ data, templateId, onPick }) {
  const format = FORMAT_BY_ID.square
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {TEMPLATES.map((t) => {
        const active = t.id === templateId
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t.id)}
            aria-pressed={active}
            className={`text-left rounded-2xl rounded-bl-none border-2 p-2 bg-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-haus-blue ${
              active ? 'border-haus-blue' : 'border-haus-sky hover:border-haus-blue/50'
            }`}
          >
            <div className="rounded-xl overflow-hidden pointer-events-none">
              <ScaledPreview template={t} data={data} format={format} />
            </div>
            <p className={`mt-2 px-1 text-sm font-semibold ${active ? 'text-haus-blue' : 'text-gray-700'}`}>{t.name}</p>
            <p className="px-1 pb-1 text-xs text-gray-500">{t.description}</p>
          </button>
        )
      })}
    </div>
  )
}
