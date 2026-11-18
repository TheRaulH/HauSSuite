/**
 * Los 4 formatos de exportación (mismas medidas que usa el generador de carruseles).
 * `kind` le indica a cada plantilla cómo acomodar su diseño.
 */
export const FORMATS = [
  { id: 'square', kind: 'square', channel: 'Facebook', label: 'Cuadrado', width: 1080, height: 1080, hint: 'Feed de Facebook e Instagram' },
  { id: 'portrait', kind: 'portrait', channel: 'Instagram', label: 'Vertical', width: 1080, height: 1350, hint: 'Feed de Instagram (4:5)' },
  { id: 'story', kind: 'story', channel: 'Historias', label: 'Story', width: 1080, height: 1920, hint: 'Historias de Instagram y Facebook' },
  { id: 'landscape', kind: 'landscape', channel: 'Horizontal', label: 'Horizontal', width: 1920, height: 1080, hint: 'Pantallas, web y YouTube' },
]

export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f]))
