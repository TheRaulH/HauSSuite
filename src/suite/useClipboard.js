import { useCallback, useRef, useState } from 'react'

/**
 * Copiar texto al portapapeles con aviso temporal.
 * `copiedKey` es la clave de lo último copiado (para mostrar "¡Copiado!" en ese botón).
 */
export function useClipboard(resetMs = 1500) {
  const [copiedKey, setCopiedKey] = useState(null)
  const timer = useRef(null)

  const flash = useCallback(
    (key) => {
      setCopiedKey(key)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiedKey(null), resetMs)
    },
    [resetMs]
  )

  const copyText = useCallback(
    async (text, key = text) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // Fallback para contextos sin Clipboard API (http, navegadores viejos)
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      flash(key)
    },
    [flash]
  )

  return { copiedKey, copyText, flash }
}
