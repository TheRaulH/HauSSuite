import T1 from './templates/T1'
import T2 from './templates/T2'
import T3 from './templates/T3'
import T4 from './templates/T4'
import T5 from './templates/T5'
import T6 from './templates/T6'

/**
 * CONFIGURACIÓN del Generador de invitaciones.
 *
 * Para agregar una plantilla nueva:
 *  1) Crea templates/T7.jsx: un componente que recibe { data, width, height, kind }
 *     y dibuja la invitación completa (mira T1.jsx como referencia; usa los helpers de
 *     templates/shared.jsx y textMetrics.js).
 *  2) Impórtala arriba y suma una entrada a TEMPLATES con los campos y fotos que usa.
 */

/** Todos los textos editables, con su valor inicial. */
export const BASE_DATA = {
  marca: 'HAUSCENTER',
  etiqueta: 'ACTIVACIÓN EN TIENDA',
  pretitulo: 'TE ESPERAMOS EN LA',
  evento: 'ACTIVACIÓN',
  nombre: 'DAKO',
  mensaje: 'Conoce las cocinas Dako disponibles en Hauscenter',
  lugar: 'Hauscenter Isabel',
  direccion: 'Calle Isabel La Católica esq. Parabano',
  fecha: '2026-11-14',
  fechaFin: '',
  horaInicio: '15',
  horaFin: '20',
  rotuloLugar: 'DÓNDE',
  rotuloHora: 'HORARIO',
  rotuloFecha: 'CUÁNDO',
}

export const TEXT_KEYS = Object.keys(BASE_DATA)

export const DEFAULT_COLORS = { primary: '#123B64', accent: '#E76100' }

/** Colores de la línea gráfica de Hauscenter para elegir con un clic. */
export const COLOR_SWATCHES = [
  { hex: '#123B64', name: 'Azul Hauscenter' },
  { hex: '#E76100', name: 'Naranja' },
  { hex: '#7C8861', name: 'Verde oliva' },
  { hex: '#0A1F40', name: 'Azul noche' },
  { hex: '#A14400', name: 'Naranja oscuro' },
]

/** Cómo se llama y se explica cada campo en el formulario. */
export const FIELDS = {
  marca: { label: 'Marca (texto del logo)', hint: 'Se reemplaza si subes un logo.' },
  etiqueta: { label: 'Etiqueta superior' },
  pretitulo: { label: 'Frase sobre el título' },
  evento: { label: 'Tipo de evento', hint: 'Ej. Activación, Lanzamiento, Feria.' },
  nombre: { label: 'Protagonista (marca o producto)', hint: 'La palabra grande: DAKO, SAMSUNG…' },
  mensaje: { label: 'Mensaje', multiline: true },
  lugar: { label: 'Lugar / sucursal' },
  direccion: { label: 'Dirección' },
  rotuloLugar: { label: 'Rótulo del lugar' },
  rotuloHora: { label: 'Rótulo del horario' },
  rotuloFecha: { label: 'Rótulo de la fecha' },
}

export const LABEL_KEYS = ['rotuloLugar', 'rotuloHora', 'rotuloFecha']

/**
 * Plantillas. `defaults` son los textos propios de cada diseño (solo cambian si no
 * los editaste al cambiar de plantilla). `photos` son los espacios de imagen.
 */
export const TEMPLATES = [
  {
    id: 'fecha',
    name: 'Fecha protagonista',
    description: 'Día enorme y foto en arco',
    Component: T1,
    fields: ['marca', 'etiqueta', 'pretitulo', 'nombre', 'lugar', 'direccion'],
    labels: ['rotuloLugar', 'rotuloHora'],
    defaults: { pretitulo: 'CONOCE LAS COCINAS' },
    photos: [{ key: 'foto1', label: 'Foto de la activación' }],
  },
  {
    id: 'pase',
    name: 'Pase oscuro',
    description: 'Fondo azul y tarjetas blancas',
    Component: T2,
    fields: ['marca', 'pretitulo', 'evento', 'nombre', 'lugar', 'direccion'],
    labels: ['rotuloLugar', 'rotuloFecha', 'rotuloHora'],
    defaults: { pretitulo: 'TE ESPERAMOS EN LA', rotuloLugar: 'SUCURSAL', rotuloFecha: 'FECHA', rotuloHora: 'HORA' },
    photos: [{ key: 'foto1', label: 'Foto de la activación' }],
  },
  {
    id: 'hora',
    name: 'Hora gigante',
    description: 'Fondo naranja y horario enorme',
    Component: T3,
    fields: ['marca', 'evento', 'nombre', 'mensaje', 'lugar', 'direccion'],
    labels: ['rotuloLugar'],
    defaults: { rotuloLugar: 'VEN A' },
    photos: [{ key: 'foto1', label: 'Foto circular' }],
  },
  {
    id: 'productos',
    name: 'Personas y productos',
    description: 'Foto de personas y 3 productos',
    Component: T4,
    fields: ['marca', 'evento', 'nombre', 'mensaje', 'lugar', 'direccion'],
    labels: ['rotuloLugar', 'rotuloFecha'],
    defaults: {},
    photos: [
      { key: 'foto1', label: 'Foto de personas' },
      { key: 'foto2', label: 'Producto 1', fit: 'contain' },
      { key: 'foto3', label: 'Producto 2', fit: 'contain' },
      { key: 'foto4', label: 'Producto 3', fit: 'contain' },
    ],
  },
  {
    id: 'contexto',
    name: 'Foto de contexto',
    description: 'Foto grande y sello de fecha',
    Component: T5,
    fields: ['marca', 'evento', 'nombre', 'lugar', 'direccion'],
    labels: ['rotuloLugar', 'rotuloHora'],
    defaults: {},
    photos: [{ key: 'foto1', label: 'Foto grande de contexto' }],
  },
  {
    id: 'completo',
    name: 'Completo',
    description: 'Degradado, círculo y producto',
    Component: T6,
    fields: ['marca', 'pretitulo', 'evento', 'nombre', 'mensaje', 'lugar', 'direccion'],
    labels: [],
    defaults: { pretitulo: '¡TE ESPERAMOS!' },
    photos: [
      { key: 'foto1', label: 'Foto circular' },
      { key: 'foto2', label: 'Producto', fit: 'contain' },
    ],
  },
]

export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]))

/** Valor inicial de un texto para una plantilla concreta. */
export const textDefault = (template, key) => template.defaults?.[key] ?? BASE_DATA[key]

export function initialData(template) {
  const data = { colores: { ...DEFAULT_COLORS }, fotos: {} }
  for (const key of TEXT_KEYS) data[key] = textDefault(template, key)
  return data
}
