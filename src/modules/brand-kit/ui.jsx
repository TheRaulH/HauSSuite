/** Piezas visuales compartidas de la página Línea gráfica. */

export function Section({ id, title, description, action, children }) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-haus-blue">{title}</h2>
          {description && <p className="text-sm text-gray-500 max-w-2xl">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Tarjeta con la forma de marca: tres esquinas redondeadas y una recta. */
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-haus-sky rounded-3xl rounded-bl-none ${className}`}>{children}</div>
  )
}

const chipBase = 'px-3 py-1.5 text-xs rounded-full border transition-colors'

/** Botón que copia un texto y avisa "¡Copiado!". */
export function CopyChip({ id, text, label, clipboard, title }) {
  const done = clipboard.copiedKey === id
  return (
    <button
      type="button"
      title={title}
      onClick={() => clipboard.copyText(text, id)}
      className={`${chipBase} ${done ? 'bg-haus-blue border-haus-blue text-white' : 'border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue'}`}
    >
      {done ? '¡Copiado!' : label}
    </button>
  )
}

export function ActionChip({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${chipBase} border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue disabled:opacity-50`}
    >
      {children}
    </button>
  )
}
