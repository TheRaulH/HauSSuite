import { useEffect, useState } from 'react'

function readPath() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash || '/'
}

/**
 * Router mínimo basado en el hash de la URL (#/carruseles, #/linea-grafica…).
 * No necesita configuración del servidor y funciona igual en cualquier hosting
 * estático o abriendo el build directamente.
 */
export function useHashRoute() {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}
