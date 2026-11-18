import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { LOGOS, LOGO_ALLOWED_BACKGROUNDS, LOGO_MISUSES, LOGO_VARIANTS } from '../brandData'
import { colorizeSvg, copyPngToClipboard, downloadPng, downloadSvg, svgDataUrl } from '../svgTools'
import { ActionChip, Card, CopyChip, Section } from '../ui'

function LogoCard({ logo, variant, clipboard }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function run(kind, fn) {
    setBusy(kind)
    setError('')
    try {
      await fn()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo completar la acción')
    } finally {
      setBusy(null)
    }
  }

  const colored = colorizeSvg(logo.svg, variant.color)

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="h-48 flex items-center justify-center p-8 transition-colors" style={{ backgroundColor: variant.bg }}>
        <img src={svgDataUrl(colored)} alt={`${logo.name} Hauscenter`} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-haus-blue">
            {logo.name} <span className="text-xs font-medium text-gray-400">· {logo.role}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{logo.use}</p>
          {logo.warning && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              <TriangleAlert size={14} className="mt-px shrink-0" aria-hidden />
              {logo.warning}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ActionChip onClick={() => downloadSvg(logo.svg, `${logo.fileName}-${variant.id}`, variant.color)}>SVG</ActionChip>
          <ActionChip disabled={busy === 'png'} onClick={() => run('png', () => downloadPng(logo.svg, `${logo.fileName}-${variant.id}`, variant.color))}>
            {busy === 'png' ? '…' : 'PNG'}
          </ActionChip>
          <ActionChip
            disabled={busy === 'img'}
            onClick={() =>
              run('img', async () => {
                await copyPngToClipboard(logo.svg, variant.color)
                clipboard.flash(`${logo.id}-img`)
              })
            }
          >
            {clipboard.copiedKey === `${logo.id}-img` ? '¡Copiada!' : 'Copiar imagen'}
          </ActionChip>
          <CopyChip id={`${logo.id}-code`} text={colored} label="Copiar código SVG" clipboard={clipboard} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Card>
  )
}

export default function LogosSection({ clipboard }) {
  const [variantId, setVariantId] = useState(LOGO_VARIANTS[0].id)
  const variant = LOGO_VARIANTS.find((v) => v.id === variantId)

  return (
    <Section
      id="logos"
      title="Logos"
      description="Siempre se usan los archivos oficiales: nunca se redibuja el logo. Elige la versión de color según el fondo y descarga en SVG (vectorial) o PNG transparente, o copia la imagen para pegarla en Canva o PowerPoint."
    >
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Versión de color">
        <span className="text-sm text-gray-500 mr-1">Versión de color:</span>
        {LOGO_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={v.id === variantId}
            onClick={() => setVariantId(v.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              v.id === variantId ? 'border-haus-blue bg-haus-sky/60 text-haus-blue font-medium' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: v.bg }}>
              <span className="block w-full h-full rounded-full scale-50" style={{ backgroundColor: v.color }} />
            </span>
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOGOS.map((logo) => (
          <LogoCard key={logo.id} logo={logo} variant={variant} clipboard={clipboard} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-haus-blue mb-2">Dónde puede ir el logo</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-gray-600">
            {LOGO_ALLOWED_BACKGROUNDS.map((b) => (
              <li key={b.title}>
                <strong className="text-gray-800">{b.title}:</strong> {b.text}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-haus-blue mb-2">Usos incorrectos</h3>
          <p className="text-sm text-gray-600 mb-2">Nunca se debe:</p>
          <ul className="flex flex-wrap gap-2">
            {LOGO_MISUSES.map((m) => (
              <li key={m} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                {m}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Solo existen las cuatro versiones de color de arriba: no se crean versiones intermedias, degradadas ni con colores no autorizados.
          </p>
        </Card>
      </div>
    </Section>
  )
}
