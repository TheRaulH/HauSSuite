import Wordmark from './Wordmark'

export default function Sidebar({ tools, activePath }) {
  const linkClass = (active) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
      active ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`

  return (
    <aside className="bg-haus-blue text-white md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 flex md:flex-col">
      <a href="#/" className="px-5 py-4 md:py-6 block shrink-0">
        <Wordmark className="text-xl" />
        <p className="hidden md:block text-xs text-white/60 mt-1">Herramientas de diseño para marketing</p>
      </a>

      <nav className="flex md:flex-col gap-1 px-2 pb-2 md:pb-0 md:px-3 overflow-x-auto items-center md:items-stretch">
        <a href="#/" className={linkClass(activePath === '/' || !tools.some((t) => t.path === activePath))}>
          <span aria-hidden>🏠</span>
          Inicio
        </a>
        {tools.map((tool) => (
          <a key={tool.id} href={`#${tool.path}`} className={linkClass(activePath === tool.path)}>
            <span aria-hidden>{tool.icon}</span>
            {tool.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
