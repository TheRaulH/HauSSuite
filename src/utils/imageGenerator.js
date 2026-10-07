import React from 'react'
import { createRoot } from 'react-dom/client'
import { toPng } from 'html-to-image'

/**
 * Renderiza el componente de un formato de diseño (ver templates/<diseño>/*.jsx)
 * a un PNG (data URL), SIN montarlo en el árbol visible de la app.
 *
 * Crea un contenedor temporal fuera de pantalla, monta el componente ahí,
 * espera a que carguen las fuentes y la imagen del producto, captura el
 * PNG y limpia todo (unmount + remove). Se usa uno por producto/formato,
 * así que GenerationPanel puede llamarlo en lote sin acumular componentes
 * montados en memoria.
 */
 

export async function renderTemplateToPng(Template, props, { width, height }) {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-99999px' // fuera de pantalla, pero sigue siendo parte del DOM real
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    await new Promise((resolve) => {
      root.render(React.createElement(Template, props))
      // esperar dos frames para asegurar que React terminó de pintar el DOM
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    if (document.fonts?.ready) {
      await document.fonts.ready
    }
    await waitForImages(container)

    return await toPng(container.firstChild ?? container, {
      width,
      height,
      pixelRatio: 1,
      cacheBust: true,
    })
  } finally {
    root.unmount()
    container.remove()
  }
}



function waitForImages(container) {
  const images = Array.from(container.querySelectorAll('img'))
  return Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true })
        img.addEventListener('error', resolve, { once: true }) // no bloquear todo el lote por una imagen rota
      })
    })
  )
}
