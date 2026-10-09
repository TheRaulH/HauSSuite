import { useEffect, useState } from 'react'
import { CatalogProvider } from './suite/CatalogContext'
import { useHashRoute } from './suite/useHashRoute'
import { TOOLS } from './suite/tools'
import Sidebar from './suite/Sidebar'
import HomePage from './suite/HomePage'

/**
 * Carcasa de HauSSuite: menú lateral + la herramienta activa.
 * Las herramientas ya visitadas se mantienen montadas (ocultas) para no
 * perder su estado al cambiar de una a otra.
 */
function App() {
  const path = useHashRoute()
  const active = TOOLS.find((t) => t.path === path) ?? null

  const [visited, setVisited] = useState(() => new Set(active ? [active.id] : []))
  if (active && !visited.has(active.id)) {
    setVisited(new Set(visited).add(active.id))
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  return (
    <CatalogProvider>
      <div className="min-h-screen bg-gray-50 md:flex">
        <Sidebar tools={TOOLS} activePath={path} />

        <main className="flex-1 min-w-0">
          {!active && <HomePage tools={TOOLS} />}

          {TOOLS.filter((t) => visited.has(t.id)).map(({ id, Component }) => (
            <div key={id} hidden={active?.id !== id}>
              <Component />
            </div>
          ))}
        </main>
      </div>
    </CatalogProvider>
  )
}

export default App
