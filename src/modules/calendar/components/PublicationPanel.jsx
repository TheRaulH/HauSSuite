import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import {
  POST_SUBTYPES,
  POST_TYPES,
  PRIORITIES,
  PURPOSES,
  STATUSES,
  emptyPublication,
} from '../calendarConfig'

const inputClass =
  'w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-haus-blue/30'

function normalizeUrl(value) {
  const v = value.trim()
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

function isValidUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
  } catch {
    return false
  }
}

function buildForm(publication, defaultDate) {
  const base = publication ?? emptyPublication(defaultDate)
  const extra = base.extra_fields ?? {}
  return {
    title: base.title,
    description: base.description ?? '',
    post_type: base.post_type,
    post_subtype: base.post_subtype,
    priority: base.priority,
    purpose: base.purpose ?? [],
    scheduled_date: base.scheduled_date,
    is_published: base.is_published,
    status: base.status,
    referencia: extra.referencia ?? '',
    idea: extra.idea ?? '',
    guion: extra.guion ?? '',
    enlace: extra.enlace ?? '',
  }
}

function Field({ label, error, hint, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-gray-400">{hint}</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-gray-300 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-4 py-1.5 text-sm ${
            value === opt.id ? 'bg-haus-blue text-white' : 'bg-white text-gray-600 hover:bg-haus-sky'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Panel lateral para crear/editar una publicación.
 * `publication` = null → crear (con `defaultDate`).
 * Se monta con una `key` distinta por publicación, así el formulario siempre arranca limpio.
 */
export default function PublicationPanel({ publication, defaultDate, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(() => buildForm(publication, defaultDate))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEditing = Boolean(publication)
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function togglePurpose(id) {
    set('purpose', form.purpose.includes(id) ? form.purpose.filter((p) => p !== id) : [...form.purpose, id])
  }

  function setPostType(type) {
    setForm((prev) => ({
      ...prev,
      post_type: type,
      // Un video no es carrusel
      post_subtype: type === 'video' ? 'single' : prev.post_subtype,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const referencia = normalizeUrl(form.referencia)
    const enlace = normalizeUrl(form.enlace)
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Escribe un título.'
    if (!form.scheduled_date) nextErrors.scheduled_date = 'Elige una fecha.'
    if (!isValidUrl(referencia)) nextErrors.referencia = 'No parece un enlace válido.'
    if (!isValidUrl(enlace)) nextErrors.enlace = 'No parece un enlace válido.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const extra_fields = Object.fromEntries(
      Object.entries({ referencia, idea: form.idea.trim(), guion: form.guion.trim(), enlace }).filter(
        ([, v]) => v
      )
    )

    setSaving(true)
    await onSave({
      title: form.title.trim(),
      description: form.description.trim() || null,
      post_type: form.post_type,
      post_subtype: form.post_subtype,
      priority: form.priority,
      purpose: form.purpose,
      scheduled_date: form.scheduled_date,
      is_published: form.is_published,
      status: form.status,
      extra_fields,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-haus-blue/40" onClick={onClose} aria-hidden />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-4xl h-full flex flex-col shadow-2xl"
        role="dialog"
        aria-label={isEditing ? 'Editar publicación' : 'Nueva publicación'}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-haus-cream">
          <h2 className="text-lg font-semibold text-haus-blue">
            {isEditing ? 'Editar publicación' : 'Nueva publicación'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-haus-sky"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-8 md:grid-cols-2 content-start">
          {/* Estructura y estrategia */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Estructura y estrategia</h3>

            <Field label="Título" error={errors.title}>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputClass}
                placeholder="Ej. Cómo elegir un buen colchón"
              />
            </Field>

            <Field label="Descripción / copy" hint="El texto que irá en la publicación.">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Tipo</span>
                <Segmented options={POST_TYPES} value={form.post_type} onChange={setPostType} />
              </div>
              {form.post_type === 'photo' && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Formato</span>
                  <Segmented
                    options={POST_SUBTYPES}
                    value={form.post_subtype}
                    onChange={(v) => set('post_subtype', v)}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Prioridad</span>
              <div className="flex flex-col gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set('priority', p.id)}
                    className={`flex items-center gap-3 text-left rounded-lg border px-3 py-2 ${
                      form.priority === p.id ? 'border-haus-blue bg-haus-sky/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 shrink-0 rounded-full text-xs font-bold flex items-center justify-center ${p.badge}`}
                    >
                      {p.id}
                    </span>
                    <span className="text-sm">
                      <span className="font-medium text-gray-800">{p.label}</span>
                      <span className="text-gray-500"> · {p.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Propósito</span>
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((p) => {
                  const active = form.purpose.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePurpose(p.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        active ? 'border-haus-blue bg-haus-sky/50 text-haus-blue' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Estado de producción">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fecha programada" error={errors.scheduled_date}>
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => set('scheduled_date', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set('is_published', e.target.checked)}
              />
              Ya está publicada
              {publication?.published_at && form.is_published && (
                <span className="text-xs text-gray-400">
                  · {new Date(publication.published_at).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
            </label>
          </div>

          {/* Producción y campos extra */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Producción</h3>

            <Field label="Referencia" error={errors.referencia} hint="Inspiración o publicación de referencia.">
              <input
                value={form.referencia}
                onChange={(e) => set('referencia', e.target.value)}
                className={inputClass}
                placeholder="https://instagram.com/p/…"
              />
            </Field>

            <Field label="Idea" hint="Dirección visual para quien diseña: composición, estilo, slides.">
              <textarea rows={4} value={form.idea} onChange={(e) => set('idea', e.target.value)} className={inputClass} />
            </Field>

            <Field label="Guion" hint="Locución, tomas y pauta de edición (videos).">
              <textarea rows={7} value={form.guion} onChange={(e) => set('guion', e.target.value)} className={inputClass} />
            </Field>

            <Field label="Enlace" error={errors.enlace} hint="Landing, link de pago o URL de la publicación.">
              <input
                value={form.enlace}
                onChange={(e) => set('enlace', e.target.value)}
                className={inputClass}
                placeholder="https://hauscenter.com.bo/…"
              />
            </Field>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          <div>
            {isEditing &&
              (confirmDelete ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">¿Eliminar definitivamente?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(publication.id)}
                    className="px-3 py-1.5 rounded-full bg-red-600 text-white text-sm hover:bg-red-700"
                  >
                    Sí, eliminar
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-gray-500 hover:underline">
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
                >
                  <Trash2 size={15} />
                  Eliminar
                </button>
              ))}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:underline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 disabled:opacity-50 rounded-full rounded-bl-none"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
