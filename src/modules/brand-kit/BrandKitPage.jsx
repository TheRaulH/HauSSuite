import PageHeader from '../../suite/PageHeader'
import { useClipboard } from '../../suite/useClipboard'
import ColorsSection from './sections/ColorsSection'
import { ChecklistSection, HausitoSection } from './sections/GuidelinesSection'
import LogosSection from './sections/LogosSection'
import ModesSection from './sections/ModesSection'
import ShapesSection from './sections/ShapesSection'
import TypographySection from './sections/TypographySection'

const NAV = [
  { id: 'logos', label: 'Logos' },
  { id: 'colores', label: 'Colores' },
  { id: 'tipografia', label: 'Tipografía' },
  { id: 'formas', label: 'Formas' },
  { id: 'modos', label: 'Modos' },
  { id: 'hausito', label: 'Hausito' },
  { id: 'verificacion', label: 'Lista de verificación' },
]

export default function BrandKitPage() {
  const clipboard = useClipboard()

  // El router de la suite usa el hash de la URL, por eso los atajos desplazan la página
  // en vez de cambiar la dirección.
  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <PageHeader
        title="Línea gráfica"
        description="Todo lo oficial de la marca Hauscenter: logos, colores, tipografías y formas — copia o descarga"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-12">
        <nav aria-label="Secciones" className="flex flex-wrap gap-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => goTo(n.id)}
              className="px-4 py-1.5 text-sm rounded-full rounded-bl-none bg-white border border-haus-sky text-haus-blue hover:bg-haus-blue hover:text-white transition-colors"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <LogosSection clipboard={clipboard} />
        <ColorsSection clipboard={clipboard} />
        <TypographySection clipboard={clipboard} />
        <ShapesSection clipboard={clipboard} />
        <ModesSection />
        <HausitoSection />
        <ChecklistSection />
      </div>
    </>
  )
}
