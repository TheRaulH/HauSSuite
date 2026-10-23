import { useDraggable } from '@dnd-kit/core'
import { Check, GalleryHorizontal, Image, Video } from 'lucide-react'
import { PRIORITY_BY_ID, PURPOSE_BY_ID, STATUS_BY_ID } from '../calendarConfig'

/** Aspecto de la tarjeta (sin lógica de arrastre; se reutiliza en el DragOverlay). */
export function PublicationCardView({ publication: p, onTogglePublished, isOverlay = false }) {
  const priority = PRIORITY_BY_ID[p.priority]
  const status = STATUS_BY_ID[p.status]
  const TypeIcon = p.post_type === 'video' ? Video : Image

  return (
    <div
      className={`bg-white border border-gray-200 border-l-4 ${priority.border} rounded-md px-2 py-1.5 flex flex-col gap-1 text-left cursor-grab active:cursor-grabbing ${
        p.is_published ? 'opacity-60' : ''
      } ${isOverlay ? 'shadow-xl rotate-1' : 'shadow-sm'}`}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={p.is_published}
          aria-label={p.is_published ? 'Marcar como no publicada' : 'Marcar como publicada'}
          title={p.is_published ? 'Publicada' : 'Marcar como publicada'}
          // Evita que el arrastre empiece al tocar el check
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePublished?.(p)
          }}
          className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
            p.is_published ? 'bg-haus-blue border-haus-blue text-white' : 'bg-white border-gray-300 hover:border-haus-blue'
          }`}
        >
          {p.is_published && <Check size={12} strokeWidth={3} />}
        </button>
        <span className="truncate text-xs font-medium text-gray-800" title={p.title}>
          {p.title}
        </span>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <span
          className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${priority.badge}`}
          title={`Prioridad ${priority.id} · ${priority.label}`}
        >
          {priority.id}
        </span>
        <TypeIcon size={13} className="text-gray-500" aria-label={p.post_type === 'video' ? 'Video' : 'Foto'} />
        {p.post_subtype === 'carousel' && (
          <GalleryHorizontal size={13} className="text-gray-500" aria-label="Carrusel" />
        )}
        {p.purpose.map((id) => {
          const purpose = PURPOSE_BY_ID[id]
          if (!purpose) return null
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-px text-[10px] text-gray-700"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${purpose.dot}`} />
              {purpose.label}
            </span>
          )
        })}
        {p.status !== 'ready' && !p.is_published && (
          <span className={`ml-auto rounded px-1.5 py-px text-[10px] ${status.chip}`}>{status.label}</span>
        )}
      </div>
    </div>
  )
}

export default function PublicationCard({ publication, onOpen, onTogglePublished }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: publication.id,
    data: { publication },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(publication)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(publication)
      }}
      className={`touch-manipulation ${isDragging ? 'opacity-30' : ''}`}
    >
      <PublicationCardView publication={publication} onTogglePublished={onTogglePublished} />
    </div>
  )
}
