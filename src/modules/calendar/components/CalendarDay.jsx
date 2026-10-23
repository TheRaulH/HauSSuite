import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { isSameMonth, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import { toDateKey } from '../dateHelpers'
import PublicationCard from './PublicationCard'

const MAX_VISIBLE = 3

export default function CalendarDay({ date, month, publications, onCreate, onOpen, onTogglePublished }) {
  const dateKey = toDateKey(date)
  const { setNodeRef, isOver } = useDroppable({ id: dateKey })
  const [expanded, setExpanded] = useState(false)

  const inMonth = isSameMonth(date, month)
  const today = isToday(date)
  const visible = expanded ? publications : publications.slice(0, MAX_VISIBLE)
  const hidden = publications.length - visible.length

  return (
    <div
      ref={setNodeRef}
      className={`group min-h-[8.5rem] p-1.5 flex flex-col gap-1 transition-colors ${
        isOver ? 'bg-haus-sky' : inMonth ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
            today
              ? 'bg-haus-blue text-white font-semibold'
              : inMonth
                ? 'text-gray-700 font-medium'
                : 'text-gray-400'
          }`}
        >
          {date.getDate()}
        </span>
        <button
          type="button"
          onClick={() => onCreate(dateKey)}
          aria-label={`Nueva publicación el ${dateKey}`}
          title="Nueva publicación"
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-haus-sky hover:text-haus-blue md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {visible.map((p) => (
          <PublicationCard key={p.id} publication={p} onOpen={onOpen} onTogglePublished={onTogglePublished} />
        ))}
      </div>

      {(hidden > 0 || expanded) && publications.length > MAX_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-haus-blue hover:underline text-left px-1"
        >
          {expanded ? 'Ver menos' : `+${hidden} más`}
        </button>
      )}
    </div>
  )
}
