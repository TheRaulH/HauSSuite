import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Lista con scroll que solo dibuja las filas visibles (más unas pocas de margen).
 * Con miles de filas, el navegador sigue tan liviano como con veinte.
 */
export default function VirtualList({ items, rowHeight, overscan = 6, renderRow, resetKey, className = '' }) {
  const ref = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(400)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    setHeight(el.clientHeight)
    const observer = new ResizeObserver(() => setHeight(el.clientHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Al cambiar el filtro o la búsqueda se vuelve arriba
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0
    setScrollTop(0)
  }, [resetKey])

  const total = items.length * rowHeight
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const last = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan)

  return (
    <div ref={ref} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} className={`overflow-y-auto ${className}`}>
      <div style={{ height: total, position: 'relative' }}>
        <div style={{ position: 'absolute', top: first * rowHeight, left: 0, right: 0 }}>
          {items.slice(first, last).map((item) => (
            <div key={item.id} style={{ height: rowHeight }}>
              {renderRow(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
