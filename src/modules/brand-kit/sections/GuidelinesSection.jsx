import { useState } from 'react'
import { CHECKLIST, HAUSITO } from '../brandData'
import { Card, Section } from '../ui'

export function HausitoSection() {
  return (
    <Section id="hausito" title="Hausito, la mascota" description={HAUSITO.summary}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-haus-blue mb-2">Cómo es</h3>
          <ul className="flex flex-wrap gap-2">
            {HAUSITO.traits.map((t) => (
              <li key={t} className="text-xs px-2.5 py-1 rounded-full bg-haus-sky text-haus-blue">
                {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-haus-blue mb-2">Cómo se usa</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-gray-600 list-disc pl-5">
            {HAUSITO.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  )
}

/** Lista para repasar antes de entregar una pieza (las marcas son solo para tu revisión). */
export function ChecklistSection() {
  const [checked, setChecked] = useState(() => new Set())
  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <Section id="verificacion" title="Antes de entregar una pieza" description="Repasa esta lista con tu diseño terminado.">
      <Card className="p-5">
        <ul className="flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <li key={item}>
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} className="mt-0.5 accent-[#123B64]" />
                <span className={checked.has(i) ? 'line-through text-gray-400' : ''}>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          {checked.size} de {CHECKLIST.length} revisadas
        </p>
      </Card>
    </Section>
  )
}
