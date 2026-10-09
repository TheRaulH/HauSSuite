import { createContext, useContext } from 'react'
import { useCatalog } from '../hooks/useCatalog'

const CatalogContext = createContext(null)

/**
 * El catálogo de productos (Supabase) lo usan varias herramientas: el generador
 * de carruseles y el buscador de imágenes. Se carga una sola vez acá, arriba de
 * todo, y las herramientas lo consumen con useCatalogContext().
 */
export function CatalogProvider({ children }) {
  const catalog = useCatalog()
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalogContext() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalogContext debe usarse dentro de <CatalogProvider>')
  return ctx
}
