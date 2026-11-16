import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, X } from 'lucide-react'

/**
 * Tarjeta de gráfico: una pregunta en lenguaje simple arriba y la conclusión abajo,
 * para que se entienda sin saber leer gráficos.
 *
 * - `icon`: algo para mostrar a la izquierda del título (p. ej. la insignia de una red).
 * - `expandable`: agrega el botón de pantalla completa. En ese caso `children` puede ser
 *   una función `(expanded) => nodo` para dibujar el gráfico más grande al ampliarlo.
 */
export default function ChartCard({ title, question, takeaway, icon, expandable = false, children }) {
  const [open, setOpen] = useState(false)
  const draw = (expanded) => (typeof children === 'function' ? children(expanded) : children)

  return (
    <>
      <section className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {icon}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-haus-blue">{title}</h3>
            {question && <p className="text-sm text-gray-500">{question}</p>}
          </div>
          {expandable && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Ver en pantalla completa: ${title}`}
              title="Pantalla completa"
              className="shrink-0 w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-haus-sky hover:text-haus-blue outline-none focus-visible:ring-2 focus-visible:ring-haus-blue"
            >
              <Maximize2 size={16} aria-hidden />
            </button>
          )}
        </div>
        {draw(false)}
        {takeaway && <p className="text-sm text-haus-blue bg-haus-cream rounded-xl px-3 py-2">{takeaway}</p>}
      </section>

      {open && (
        <FullscreenView title={title} question={question} takeaway={takeaway} icon={icon} onClose={() => setOpen(false)}>
          {draw(true)}
        </FullscreenView>
      )}
    </>
  )
}

/**
 * Capa que ocupa toda la ventana. Además pide al navegador la pantalla completa real
 * (donde se pueda); si no la da —por ejemplo en iPhone— queda igual cubriendo toda la ventana.
 * Se cierra con el botón, con Esc o saliendo de la pantalla completa del navegador.
 */
function FullscreenView({ title, question, takeaway, icon, onClose, children }) {
  const rootRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const el = rootRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    let native = false
    el?.requestFullscreen?.()
      .then(() => {
        native = true
      })
      .catch(() => {})

    const onFullscreenChange = () => {
      if (native && !document.fullscreenElement) onCloseRef.current()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('keydown', onKey)
      if (document.fullscreenElement === el) document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  return createPortal(
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="flex items-start gap-4 px-5 md:px-8 py-4 border-b border-haus-sky">
        {icon}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold text-haus-blue">{title}</h2>
          {question && <p className="text-sm text-gray-500">{question}</p>}
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar pantalla completa"
          title="Cerrar (Esc)"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue outline-none focus-visible:ring-2 focus-visible:ring-haus-blue"
        >
          <X size={16} aria-hidden />
          Cerrar
        </button>
      </header>
      <div className="flex-1 min-h-0 flex flex-col px-5 md:px-8 py-5">{children}</div>
      {takeaway && (
        <footer className="px-5 md:px-8 pb-5">
          <p className="text-sm md:text-base text-haus-blue bg-haus-cream rounded-xl px-4 py-3">{takeaway}</p>
        </footer>
      )}
    </div>,
    document.body
  )
}
