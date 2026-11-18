import { COLOR_BY_ID, MODES, MODES_GUIDE } from '../brandData'
import { Card, Section } from '../ui'

function ProportionBar({ proportions }) {
  return (
    <div>
      <div className="flex h-8 rounded-full overflow-hidden border border-haus-sky" role="img" aria-label={proportions.map((p) => `${p.pct}% ${COLOR_BY_ID[p.color].name}`).join(', ')}>
        {proportions.map((p) => (
          <div key={p.color} style={{ width: `${p.pct}%`, backgroundColor: COLOR_BY_ID[p.color].hex }} className="flex items-center justify-center text-[11px] font-semibold" >
            <span style={{ color: ['arena', 'azul-apoyo', 'blanco-calido'].includes(p.color) ? '#123B64' : '#fff' }}>{p.pct}%</span>
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
        {proportions.map((p) => (
          <li key={p.color} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: COLOR_BY_ID[p.color].hex }} />
            {COLOR_BY_ID[p.color].name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ModesSection() {
  return (
    <Section
      id="modos"
      title="Modos de comunicación"
      description="Los tres modos mantienen el azul Hauscenter como base y deben verse como una sola marca, nunca como marcas distintas. Respeta la proporción de color de cada modo."
    >
      <Card className="p-5">
        <h3 className="font-semibold text-haus-blue mb-3">¿Qué modo uso?</h3>
        <ul className="grid gap-2 sm:grid-cols-3 text-sm">
          {MODES_GUIDE.map((g) => (
            <li key={g.mode} className="bg-haus-cream rounded-xl px-4 py-3 text-gray-700">
              {g.goal} <span aria-hidden>→</span> <strong className="text-haus-blue">Modo {g.mode}</strong>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {MODES.map((m) => (
          <Card key={m.id} className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-lg font-semibold text-haus-blue">Modo {m.name}</p>
              <p className="text-sm font-medium text-gray-500">{m.tagline}</p>
              <p className="text-sm text-gray-600 mt-2">{m.summary}</p>
            </div>
            <ProportionBar proportions={m.proportions} />
            <ul className="flex flex-col gap-1.5 text-sm text-gray-600 list-disc pl-5">
              {m.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
