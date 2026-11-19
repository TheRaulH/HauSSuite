import { useCallback, useEffect, useRef, useState } from 'react'

/** Devuelve `value` solo cuando dejó de cambiar durante `ms` (evita recalcular en cada tecla). */
export function useDebouncedValue(value, ms) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

/**
 * Estado que sobrevive a recargar la página (localStorage). Guarda con un pequeño retraso
 * para no escribir en cada tecla. `saveState`: 'idle' | 'saved' | 'error' (p. ej. sin espacio).
 */
export function usePersistentState(key, initialValue, delay = 500) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...initialValue, ...JSON.parse(raw) } : initialValue
    } catch {
      return initialValue
    }
  })
  const [saveState, setSaveState] = useState('idle')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return undefined
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [key, value, delay])

  const update = useCallback((patch) => setValue((prev) => ({ ...prev, ...patch })), [])
  return [value, update, saveState]
}
