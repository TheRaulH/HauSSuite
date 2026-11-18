import { KG, OUTFIT } from '../brandData'
import { Card, CopyChip, Section } from '../ui'

export default function TypographySection({ clipboard }) {
  return (
    <Section
      id="tipografia"
      title="Tipografía"
      description="Outfit para todo el texto; KG The Fighter solo como acento. Si KG The Fighter no está disponible (apps, HTML, mockups), usa una manuscrita similar solo para el acento."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-lg font-semibold text-haus-blue">{OUTFIT.name}</p>
              <p className="text-xs text-gray-400">
                {OUTFIT.role} · pesos {OUTFIT.weights.join(', ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">{OUTFIT.use}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <a
                href={OUTFIT.googleUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue"
              >
                Descargar en Google Fonts
              </a>
              <CopyChip id="outfit-import" text={OUTFIT.cssImport} label="Copiar @import CSS" clipboard={clipboard} />
              <CopyChip id="outfit-family" text={OUTFIT.cssFamily} label="Copiar font-family" clipboard={clipboard} />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-haus-blue" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {OUTFIT.weights.map((w) => (
              <p key={w} className="text-2xl truncate" style={{ fontWeight: w }}>
                Ofertas que se sienten en casa
                <span className="text-xs text-gray-400 ml-3 font-normal">{w}</span>
              </p>
            ))}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4 bg-haus-cream">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-lg font-semibold text-haus-blue">{KG.name}</p>
              <p className="text-xs text-gray-400">{KG.role}</p>
              <p className="text-sm text-gray-600 mt-1">{KG.use}</p>
            </div>
            <CopyChip id="kg-family" text={KG.cssFamily} label="Copiar font-family" clipboard={clipboard} />
          </div>

          <div className="bg-white rounded-2xl rounded-bl-none border border-haus-sky p-5 text-haus-blue">
            <p className="text-3xl font-semibold leading-tight">
              Tu hogar <span className="font-kg text-5xl font-normal">avanza</span> contigo
            </p>
            <p className="text-xs text-gray-400 mt-3">Ejemplo: una sola palabra clave en KG The Fighter, el resto en Outfit.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Nunca en:</p>
            <ul className="flex flex-wrap gap-2">
              {KG.never.map((n) => (
                <li key={n} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </Section>
  )
}
