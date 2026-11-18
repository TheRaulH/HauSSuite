import { COLOR_SWATCHES, FIELDS } from '../invitationConfig'
import ImageField from './ImageField'

const inputClass =
  'w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-haus-blue/30'

function Section({ title, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen} className="group bg-white border border-haus-sky rounded-2xl">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-haus-blue flex items-center justify-between">
        {title}
        <span className="text-gray-400 text-sm group-open:rotate-180 transition-transform" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="px-4 pb-4 flex flex-col gap-4">{children}</div>
    </details>
  )
}

function TextField({ fieldKey, value, onChange }) {
  const field = FIELDS[fieldKey]
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{field.label}</span>
      {field.multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(fieldKey, e.target.value)} className={inputClass} />
      ) : (
        <input value={value} onChange={(e) => onChange(fieldKey, e.target.value)} className={inputClass} />
      )}
      {field.hint && <span className="text-xs text-gray-400">{field.hint}</span>}
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {COLOR_SWATCHES.map((s) => (
          <button
            key={s.hex}
            type="button"
            title={s.name}
            aria-label={s.name}
            aria-pressed={value.toLowerCase() === s.hex.toLowerCase()}
            onClick={() => onChange(s.hex)}
            className={`w-7 h-7 rounded-full border-2 ${value.toLowerCase() === s.hex.toLowerCase() ? 'border-haus-orange ring-2 ring-haus-orange/30' : 'border-white ring-1 ring-gray-300'}`}
            style={{ backgroundColor: s.hex }}
          />
        ))}
        <label className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
          Otro
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-7 p-0 border border-gray-300 rounded cursor-pointer bg-white" />
        </label>
      </div>
    </div>
  )
}

export default function EditorForm({ template, data, onText, onColor, onPhoto }) {
  return (
    <div className="flex flex-col gap-3">
      <Section title="Imágenes">
        {template.photos.map((p) => (
          <ImageField
            key={p.key}
            label={p.label}
            value={data.fotos[p.key]}
            onChange={(v) => onPhoto(p.key, v)}
            hint={p.fit === 'contain' ? 'Mejor un PNG sin fondo · o arrástrala aquí' : undefined}
          />
        ))}
        <ImageField
          label="Logo (opcional)"
          value={data.fotos.logo}
          onChange={(v) => onPhoto('logo', v)}
          hint="Reemplaza el texto de la marca"
        />
      </Section>

      <Section title="Textos">
        {template.fields.map((key) => (
          <TextField key={key} fieldKey={key} value={data[key]} onChange={onText} />
        ))}
      </Section>

      <Section title="Fecha y horario">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Fecha</span>
            <input type="date" value={data.fecha} onChange={(e) => onText('fecha', e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Hasta (opcional)</span>
            <input type="date" value={data.fechaFin} min={data.fecha} onChange={(e) => onText('fechaFin', e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Desde las</span>
            <input value={data.horaInicio} onChange={(e) => onText('horaInicio', e.target.value)} placeholder="15 o 15:30" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Hasta las</span>
            <input value={data.horaFin} onChange={(e) => onText('horaFin', e.target.value)} placeholder="20" className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-gray-400">Déjalos vacíos si no quieres mostrar horario.</p>
      </Section>

      <Section title="Colores">
        <ColorField label="Color principal (fondos y textos)" value={data.colores.primary} onChange={(v) => onColor('primary', v)} />
        <ColorField label="Color de acento (destacados)" value={data.colores.accent} onChange={(v) => onColor('accent', v)} />
      </Section>

      {template.labels.length > 0 && (
        <Section title="Rótulos pequeños" defaultOpen={false}>
          {template.labels.map((key) => (
            <TextField key={key} fieldKey={key} value={data[key]} onChange={onText} />
          ))}
        </Section>
      )}
    </div>
  )
}
