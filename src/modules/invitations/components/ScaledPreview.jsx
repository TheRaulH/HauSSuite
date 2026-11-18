import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Dibuja la plantilla a su tamaño real (1080×1080, etc.) y la reduce con CSS para
 * que quepa en pantalla. Es el MISMO componente que se exporta, así que lo que ves
 * es lo que se descarga.
 */
export default function ScaledPreview({ template, data, format, maxHeight, fixedWidth, className = '' }) {
  const boxRef = useRef(null)
  const [boxW, setBoxW] = useState(0)

  useLayoutEffect(() => {
    if (fixedWidth) return
    const el = boxRef.current
    if (!el) return
    setBoxW(el.clientWidth)
    const observer = new ResizeObserver(([entry]) => setBoxW(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [fixedWidth])

  const available = fixedWidth ?? boxW
  const byWidth = available / format.width
  const byHeight = maxHeight ? maxHeight / format.height : Infinity
  const scale = Math.max(0.02, Math.min(byWidth, byHeight))
  const { Component } = template

  return (
    <div ref={boxRef} className={`w-full flex justify-center ${className}`}>
      <div style={{ width: format.width * scale, height: format.height * scale, position: 'relative', flex: 'none' }}>
        <div style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>
          <Component data={data} width={format.width} height={format.height} kind={format.kind} />
        </div>
      </div>
    </div>
  )
}
