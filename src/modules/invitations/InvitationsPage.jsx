import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import PageHeader from '../../suite/PageHeader'
import EditorForm from './components/EditorForm'
import PreviewPanel from './components/PreviewPanel'
import TemplatePicker from './components/TemplatePicker'
import { DEFAULT_COLORS, TEMPLATES, TEMPLATE_BY_ID, TEXT_KEYS, initialData, textDefault } from './invitationConfig'

const STORAGE_KEY = 'hausuite:invitaciones'

/** Recupera la última invitación (textos y colores; las fotos no se guardan). */
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || !TEMPLATE_BY_ID[saved.templateId]) return null
    const template = TEMPLATE_BY_ID[saved.templateId]
    const data = initialData(template)
    for (const key of TEXT_KEYS) if (typeof saved.data?.[key] === 'string') data[key] = saved.data[key]
    if (saved.data?.colores) data.colores = { ...DEFAULT_COLORS, ...saved.data.colores }
    return { templateId: saved.templateId, data }
  } catch {
    return null
  }
}

export default function InvitationsPage() {
  const [state, setState] = useState(() => {
    const saved = loadSaved()
    return saved ?? { templateId: TEMPLATES[0].id, data: initialData(TEMPLATES[0]) }
  })
  const [formatId, setFormatId] = useState('square')

  const { templateId, data } = state
  const template = TEMPLATE_BY_ID[templateId]

  useEffect(() => {
    try {
      const persistable = { ...data, fotos: undefined } // las fotos no se guardan: pesan mucho
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ templateId, data: persistable }))
    } catch {
      /* sin almacenamiento disponible: no pasa nada */
    }
    return undefined
  }, [templateId, data])

  const pickTemplate = useCallback((nextId) => {
    setState((prev) => {
      const from = TEMPLATE_BY_ID[prev.templateId]
      const to = TEMPLATE_BY_ID[nextId]
      const next = { ...prev.data }
      // Cada plantilla trae sus textos propios; solo se cambian los que NO editaste.
      for (const key of TEXT_KEYS) {
        if (prev.data[key] === textDefault(from, key)) next[key] = textDefault(to, key)
      }
      return { templateId: nextId, data: next }
    })
  }, [])

  const setText = useCallback((key, value) => setState((prev) => ({ ...prev, data: { ...prev.data, [key]: value } })), [])
  const setColor = useCallback(
    (key, value) => setState((prev) => ({ ...prev, data: { ...prev.data, colores: { ...prev.data.colores, [key]: value } } })),
    []
  )
  const setPhoto = useCallback(
    (key, value) => setState((prev) => ({ ...prev, data: { ...prev.data, fotos: { ...prev.data.fotos, [key]: value } } })),
    []
  )

  function resetTexts() {
    setState((prev) => {
      const fresh = initialData(TEMPLATE_BY_ID[prev.templateId])
      return { ...prev, data: { ...fresh, fotos: prev.data.fotos } }
    })
  }

  return (
    <>
      <PageHeader title="Generador de invitaciones" description="Elige una plantilla, cambia textos, fecha y fotos, y descarga todos los formatos" />

      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        <section aria-label="Plantillas" className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-haus-blue">1. Elige una plantilla</h2>
          <TemplatePicker data={data} templateId={templateId} onPick={pickTemplate} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
          <section aria-label="Edición" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-haus-blue">2. Edita la información</h2>
              <button type="button" onClick={resetTexts} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-haus-blue">
                <RotateCcw size={13} aria-hidden /> Restablecer textos
              </button>
            </div>
            <EditorForm template={template} data={data} onText={setText} onColor={setColor} onPhoto={setPhoto} />
          </section>

          <section aria-label="Vista previa" className="flex flex-col gap-3 lg:sticky lg:top-4">
            <h2 className="text-sm font-semibold text-haus-blue">3. Revisa y descarga</h2>
            <PreviewPanel template={template} data={data} formatId={formatId} onFormat={setFormatId} />
          </section>
        </div>
      </div>
    </>
  )
}
