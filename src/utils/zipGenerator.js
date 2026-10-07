import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * Junta las imágenes generadas (PNG en base64) en un solo ZIP descargable.
 * @param {{ fileName: string, dataUrl: string }[]} images
 */
export async function exportImagesAsZip(images, zipName = 'productos.zip') {
  const zip = new JSZip()
  for (const { fileName, dataUrl } of images) {
    const base64 = dataUrl.split(',')[1] // quita el prefijo "data:image/png;base64,"
    zip.file(fileName, base64, { base64: true })
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipName)
}
