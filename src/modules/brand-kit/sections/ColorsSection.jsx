import { COLORS, CSS_VARIABLES } from '../brandData'
import { Card, CopyChip, Section } from '../ui'

const GROUPS = ['Principales', 'Acentos (uno por modo)']

function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 170
}

function ColorCard({ color, clipboard }) {
  const done = clipboard.copiedKey === `${color.id}-hex`
  return (
    <Card className="overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => clipboard.copyText(color.hex, `${color.id}-hex`)}
        title="Copiar HEX"
        className="h-28 w-full flex items-end justify-start p-4 text-sm font-mono border-b border-haus-sky"
        style={{ backgroundColor: color.hex, color: isLight(color.hex) ? '#123B64' : '#FFFFFF' }}
      >
        {done ? '¡Copiado!' : color.hex}
      </button>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-haus-blue">{color.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{color.role}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CopyChip id={`${color.id}-hex`} text={color.hex} label={`HEX ${color.hex}`} clipboard={clipboard} />
          <CopyChip id={`${color.id}-rgb`} text={`rgb(${color.rgb})`} label={`RGB ${color.rgb}`} clipboard={clipboard} />
          <CopyChip id={`${color.id}-cmyk`} text={`CMYK ${color.cmyk}`} label={`CMYK ${color.cmyk}`} clipboard={clipboard} title="Para impresión" />
          {color.pantone !== '—' && <CopyChip id={`${color.id}-pantone`} text={`Pantone ${color.pantone}`} label={`Pantone ${color.pantone}`} clipboard={clipboard} title="Para impresión" />}
        </div>
      </div>
    </Card>
  )
}

export default function ColorsSection({ clipboard }) {
  const allHex = COLORS.map((c) => `${c.name}: ${c.hex}`).join('\n')

  return (
    <Section
      id="colores"
      title="Colores"
      description="Para pantalla usa HEX o RGB; para impresión, Pantone o CMYK. El azul Hauscenter es siempre la base y el acento (naranja u oliva) nunca lo desplaza."
      action={
        <div className="flex gap-2 flex-wrap">
          <CopyChip id="all-hex" text={allHex} label="Copiar todos los HEX" clipboard={clipboard} />
          <CopyChip id="css-vars" text={CSS_VARIABLES} label="Copiar variables CSS" clipboard={clipboard} />
        </div>
      }
    >
      {GROUPS.map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-500">{group}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLORS.filter((c) => c.group === group).map((c) => (
              <ColorCard key={c.id} color={c} clipboard={clipboard} />
            ))}
          </div>
        </div>
      ))}
    </Section>
  )
}
