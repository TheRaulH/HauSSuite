/**
 * Modelo de un "diseño": un conjunto de 4 plantillas (una por formato),
 * pensadas para la misma campaña/estilo visual. Cada formato es un
 * componente React propio (ver templates/<diseño>/*.jsx) — no un
 * renderer genérico — porque cada diseño puede necesitar cosas muy
 * distintas (% de descuento, combos de 2 productos, condiciones, etc.)
 * que no entran en un formato de datos único.
 */

/** Los 4 formatos que TODO diseño debe tener. */
export const FORMATS = [
  { id: 'square', label: 'Cuadrado 1080×1080', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Vertical 1080×1350', width: 1080, height: 1350 },
  { id: 'landscape', label: 'Horizontal 1920×1080', width: 1920, height: 1080 },
  { id: 'story', label: 'Story 1080×1920', width: 1080, height: 1920 },
]

export const FORMAT_IDS = FORMATS.map((f) => f.id)

/**
 * Valida que un diseño tenga los 4 formatos obligatorios, cada uno con
 * su componente y con las dimensiones que le corresponden. Se corre al
 * cargar los diseños (ver hooks/useDesigns.js) — mejor detectar un
 * diseño incompleto en la consola mientras lo estás armando que dejar
 * que el usuario final se encuentre con un formato faltante.
 */
export function validateDesign(design) {
  const errors = []
  for (const format of FORMATS) {
    const tpl = design.formatos?.[format.id]
    if (!tpl) {
      errors.push(`falta el formato "${format.id}" (${format.label})`)
      continue
    }
    if (!tpl.Component) {
      errors.push(`el formato "${format.id}" no tiene un componente asignado`)
    }
    if (tpl.width !== format.width || tpl.height !== format.height) {
      errors.push(
        `el formato "${format.id}" debería medir ${format.width}×${format.height}, pero mide ${tpl.width}×${tpl.height}`
      )
    }
  }
  return errors
}
