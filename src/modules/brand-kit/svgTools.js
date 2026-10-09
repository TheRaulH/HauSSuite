import { saveAs } from 'file-saver'

/** Lee el tamaño natural del SVG (viewBox o width/height). */
function readSvgSize(svgText) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = doc.documentElement
  const vb = root.getAttribute('viewBox')?.split(/[\s,]+/).map(Number)
  if (vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) return { root, doc, width: vb[2], height: vb[3] }
  const w = parseFloat(root.getAttribute('width'))
  const h = parseFloat(root.getAttribute('height'))
  return { root, doc, width: w || 512, height: h || 512 }
}

/**
 * Convierte un SVG en un PNG transparente del ancho pedido (px).
 * Se le fija width/height explícitos al SVG porque, sin ellos, algunos
 * navegadores lo dibujan en el canvas con un tamaño equivocado.
 */
export async function svgToPngBlob(svgText, targetWidth = 2000) {
  const { root, doc, width, height } = readSvgSize(svgText)
  const outW = Math.round(targetWidth)
  const outH = Math.round((targetWidth * height) / width)
  root.setAttribute('width', String(outW))
  root.setAttribute('height', String(outH))

  const svgString = new XMLSerializer().serializeToString(doc)
  const svgUrl = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('No se pudo leer el SVG'))
      img.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    canvas.getContext('2d').drawImage(img, 0, 0, outW, outH)

    return await new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo crear el PNG'))), 'image/png')
    )
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

export function downloadSvg(svgText, fileName) {
  saveAs(new Blob([svgText], { type: 'image/svg+xml' }), `${fileName}.svg`)
}

export async function downloadPng(svgText, fileName, width = 2000) {
  saveAs(await svgToPngBlob(svgText, width), `${fileName}.png`)
}

/** Copia la imagen (PNG) al portapapeles para pegarla directo en Canva, PowerPoint, etc. */
export async function copyPngToClipboard(svgText, width = 1200) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Este navegador no permite copiar imágenes')
  }
  // Se pasa la promesa para mantener el "gesto del usuario" (Safari lo exige)
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': svgToPngBlob(svgText, width) })])
}
