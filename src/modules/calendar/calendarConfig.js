/**
 * Catálogos del calendario. Los textos y colores salen de acá: para agregar un
 * propósito o cambiar un color, solo se edita este archivo.
 *
 * Colores según la línea gráfica de Hauscenter: azul de base, naranja solo para
 * lo comercial/urgente, verde oliva para lo emocional (entretenimiento).
 */

export const POST_TYPES = [
  { id: 'photo', label: 'Foto' },
  { id: 'video', label: 'Video' },
]

export const POST_SUBTYPES = [
  { id: 'single', label: 'Individual' },
  { id: 'carousel', label: 'Carrusel' },
]

export const PRIORITIES = [
  {
    id: 'A',
    label: 'Alta',
    hint: 'Lanzamientos y promociones con fecha límite: tiene que salir.',
    border: 'border-l-haus-orange',
    badge: 'bg-haus-orange text-white',
  },
  {
    id: 'B',
    label: 'Media',
    hint: 'Contenido regular planificado para el día.',
    border: 'border-l-haus-blue',
    badge: 'bg-haus-blue text-white',
  },
  {
    id: 'C',
    label: 'Baja',
    hint: 'Atemporal: se puede mover sin perder valor.',
    border: 'border-l-slate-300',
    badge: 'bg-haus-sky text-haus-blue',
  },
]

export const PURPOSES = [
  { id: 'comercial', label: 'Comercial', dot: 'bg-haus-orange', bar: '#E76100' },
  { id: 'autoridad', label: 'Autoridad', dot: 'bg-haus-blue', bar: '#123B64' },
  { id: 'entretenimiento', label: 'Entretenimiento', dot: 'bg-haus-olive', bar: '#7C8861' },
]

export const STATUSES = [
  { id: 'draft', label: 'Borrador', chip: 'bg-gray-100 text-gray-600' },
  { id: 'review', label: 'En revisión', chip: 'bg-haus-sand text-haus-blue' },
  { id: 'ready', label: 'Lista', chip: 'bg-haus-blue text-white' },
]

export const PRIORITY_BY_ID = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]))
export const PURPOSE_BY_ID = Object.fromEntries(PURPOSES.map((p) => [p.id, p]))
export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]))

export function emptyPublication(scheduledDate) {
  return {
    title: '',
    description: '',
    post_type: 'photo',
    post_subtype: 'single',
    priority: 'B',
    purpose: [],
    scheduled_date: scheduledDate,
    is_published: false,
    status: 'draft',
    extra_fields: {},
  }
}
