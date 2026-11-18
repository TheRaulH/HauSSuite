import { saveAs } from 'file-saver'
import { renderTemplateToPng } from '../../utils/imageGenerator'
import { exportImagesAsZip } from '../../utils/zipGenerator'

function slug(text) {
  return (
    String(text ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'invitacion'
  )
}

export function fileNameFor(data, format) {
  return `invitacion-${slug(data.nombre)}-${slug(format.channel)}-${format.width}x${format.height}.png`
}

async function render(template, data, format) {
  const dataUrl = await renderTemplateToPng(
    template.Component,
    { data, width: format.width, height: format.height, kind: format.kind },
    { width: format.width, height: format.height }
  )
  return { fileName: fileNameFor(data, format), dataUrl }
}

/** Un solo formato → un PNG. */
export async function downloadOne(template, data, format) {
  const { fileName, dataUrl } = await render(template, data, format)
  saveAs(dataUrl, fileName)
}

/** Varios formatos → un ZIP (de a uno, para no saturar la memoria). */
export async function downloadZip(template, data, formats, onProgress) {
  const images = []
  for (let i = 0; i < formats.length; i += 1) {
    images.push(await render(template, data, formats[i]))
    onProgress?.(i + 1, formats.length)
  }
  await exportImagesAsZip(images, `invitacion-${slug(data.nombre)}.zip`)
}
