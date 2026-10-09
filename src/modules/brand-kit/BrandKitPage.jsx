import { useState } from 'react'
import PageHeader from '../../suite/PageHeader'
import { useClipboard } from '../../suite/useClipboard'
import { COLORS, FONTS, LOGOS, GRAPHIC_ELEMENTS } from './brandData'
import { copyPngToClipboard, downloadPng, downloadSvg } from './svgTools'

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function isLight(hex) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 170
}

function CopyButton({ copyKey, copiedKey, onCopy, children, className = '' }) {
  const copied = copiedKey === copyKey
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
        copied
          ? 'bg-green-600 border-green-600 text-white'
          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
      } ${className}`}
    >
      {copied ? '¡Copiado!' : children}
    </button>
  )
}

function Section({ title, description, children, action }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-haus-blue">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ColorCard({ color, clipboard }) {
  const { r, g, b } = hexToRgb(color.hex)
  const rgb = `rgb(${r}, ${g}, ${b})`
  const { copiedKey, copyText } = clipboard

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => copyText(color.hex, `${color.id}-hex`)}
        title="Copiar HEX"
        className="h-24 w-full flex items-end justify-start p-3 text-xs font-mono border-b border-gray-100"
        style={{ backgroundColor: color.hex, color: isLight(color.hex) ? '#123b64' : '#ffffff' }}
      >
        {copiedKey === `${color.id}-hex` ? '¡Copiado!' : 'Clic para copiar'}
      </button>
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="font-medium text-gray-800 text-sm">{color.name}</p>
          <p className="text-xs text-gray-400">{color.use}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CopyButton copyKey={`${color.id}-hex`} copiedKey={copiedKey} onCopy={() => copyText(color.hex, `${color.id}-hex`)}>
            {color.hex}
          </CopyButton>
          <CopyButton copyKey={`${color.id}-rgb`} copiedKey={copiedKey} onCopy={() => copyText(rgb, `${color.id}-rgb`)}>
            RGB {r}, {g}, {b}
          </CopyButton>
        </div>
      </div>
    </div>
  )
}

function AssetCard({ asset, bg, clipboard }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const { copiedKey, copyText, flash } = clipboard

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

  const btn =
    'px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50'

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      <div className="h-40 flex items-center justify-center p-6" style={{ backgroundColor: bg }}>
        <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div>
          <p className="font-medium text-gray-800 text-sm">{asset.name}</p>
          <p className="text-xs text-gray-400">{asset.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={() => downloadSvg(asset.svg, asset.fileName)}>
            SVG
          </button>
          <button
            type="button"
            className={btn}
            disabled={busy === 'png'}
            onClick={() => run('png', () => downloadPng(asset.svg, asset.fileName))}
          >
            {busy === 'png' ? '…' : 'PNG'}
          </button>
          <button
            type="button"
            className={btn}
            disabled={busy === 'img'}
            onClick={() =>
              run('img', async () => {
                await copyPngToClipboard(asset.svg)
                flash(`${asset.id}-img`)
              })
            }
          >
            {copiedKey === `${asset.id}-img` ? '¡Copiada!' : 'Copiar imagen'}
          </button>
          <CopyButton copyKey={`${asset.id}-code`} copiedKey={copiedKey} onCopy={() => copyText(asset.svg, `${asset.id}-code`)}>
            Copiar código SVG
          </CopyButton>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}

export default function BrandKitPage() {
  const clipboard = useClipboard()
  const { copiedKey, copyText } = clipboard
  const [bg, setBg] = useState('#FFFFFF')

  const cssVariables = `:root {\n${COLORS.map((c) => `  --haus-${c.id}: ${c.hex};`).join('\n')}\n}`
  const allHex = COLORS.map((c) => `${c.name}: ${c.hex}`).join('\n')

  return (
    <>
      <PageHeader
        title="Línea gráfica"
        description="Colores, logos y tipografías de Hauscenter — copiá, pegá o descargá"
      />

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-10">
        {/* Colores */}
        <Section
          title="Colores"
          description="Clic en un color para copiar su HEX, o usá los botones para copiar HEX / RGB."
          action={
            <div className="flex gap-2">
              <CopyButton copyKey="all-hex" copiedKey={copiedKey} onCopy={() => copyText(allHex, 'all-hex')}>
                Copiar todos los HEX
              </CopyButton>
              <CopyButton copyKey="css-vars" copiedKey={copiedKey} onCopy={() => copyText(cssVariables, 'css-vars')}>
                Copiar como variables CSS
              </CopyButton>
            </div>
          }
        >
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {COLORS.map((color) => (
              <ColorCard key={color.id} color={color} clipboard={clipboard} />
            ))}
          </div>
        </Section>

        {/* Logos */}
        <Section
          title="Logos"
          description="Descargá en SVG (vectorial) o PNG transparente, o copiá la imagen para pegarla directo en Canva / PowerPoint."
          action={
            <div className="flex items-center gap-2 text-xs text-gray-500">
              Fondo de vista previa:
              {[
                { value: '#FFFFFF', label: 'Blanco' },
                { value: '#DCE3EB', label: 'Gris azulado' },
                { value: '#123B64', label: 'Azul' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.label}
                  onClick={() => setBg(opt.value)}
                  className={`w-6 h-6 rounded-full border-2 ${bg === opt.value ? 'border-haus-orange' : 'border-gray-300'}`}
                  style={{ backgroundColor: opt.value }}
                />
              ))}
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOGOS.map((logo) => (
              <AssetCard key={logo.id} asset={logo} bg={bg} clipboard={clipboard} />
            ))}
          </div>
        </Section>

        {/* Elementos gráficos */}
        <Section title="Elementos gráficos" description="Formas y recursos que se repiten en las piezas.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GRAPHIC_ELEMENTS.map((el) => (
              <AssetCard key={el.id} asset={el} bg={bg} clipboard={clipboard} />
            ))}
          </div>
        </Section>

        {/* Tipografía */}
        <Section title="Tipografía">
          <div className="flex flex-col gap-4">
            {FONTS.map((font) => (
              <div key={font.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{font.name}</p>
                    <p className="text-xs text-gray-400">
                      {font.role} · pesos {font.weights.join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <a
                      href={font.googleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Descargar en Google Fonts
                    </a>
                    <CopyButton copyKey={`${font.id}-import`} copiedKey={copiedKey} onCopy={() => copyText(font.cssImport, `${font.id}-import`)}>
                      Copiar @import CSS
                    </CopyButton>
                    <CopyButton copyKey={`${font.id}-family`} copiedKey={copiedKey} onCopy={() => copyText(font.cssFamily, `${font.id}-family`)}>
                      Copiar font-family
                    </CopyButton>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-haus-blue" style={{ fontFamily: `'${font.name}', sans-serif` }}>
                  {font.weights.map((w) => (
                    <p key={w} className="text-2xl truncate" style={{ fontWeight: w }}>
                      {font.sample}
                      <span className="text-xs text-gray-400 ml-3 font-normal">{w}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
