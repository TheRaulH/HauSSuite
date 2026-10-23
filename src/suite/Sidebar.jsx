import { House } from 'lucide-react'
import Wordmark from './Wordmark'

export default function Sidebar({ tools, activePath }) {
  // Modo Experto: azul de base, arena para lo activo. Forma de marca en los ítems:
  // tres esquinas redondeadas al máximo y una recta.
  const linkClass = (active) =>
    `flex items-center gap-3 px-4 py-2 rounded-full rounded-bl-none text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-haus-sand ${
      active
        ? 'bg-haus-sand text-haus-blue font-semibold'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`

  const homeActive = activePath === '/' || !tools.some((t) => t.path === activePath)

  return (
    <aside className="bg-haus-blue text-white md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 flex md:flex-col">
      <a href="#/" className="px-5 py-4 md:py-7 block shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-haus-sand">
        <Wordmark onDark className="text-2xl" />
        <p className="hidden md:block text-xs text-haus-sky/80 mt-1">Herramientas de diseño para marketing</p>
      </a>

      <nav className="flex md:flex-col gap-1 px-2 pb-2 md:pb-0 md:px-3 overflow-x-auto items-center md:items-stretch">
        <a href="#/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined}>
          <House size={18} aria-hidden />
          Inicio
        </a>
        {tools.map((tool) => {
          const Icon = tool.icon
          const active = activePath === tool.path
          return (
            <a
              key={tool.id}
              href={`#${tool.path}`}
              className={linkClass(active)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden />
              {tool.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
