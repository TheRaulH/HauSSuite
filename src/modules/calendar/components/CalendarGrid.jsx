import { useState } from 'react'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { WEEKDAYS, toDateKey } from '../dateHelpers'
import CalendarDay from './CalendarDay'
import { PublicationCardView } from './PublicationCard'

export default function CalendarGrid({ days, month, byDay, items, onMove, onCreate, onOpen, onTogglePublished }) {
  const [activeId, setActiveId] = useState(null)

  // distance/delay: un clic normal abre la tarjeta; solo arrastra si realmente se mueve (ratón)
  // o se mantiene presionada (táctil, para no pelear con el scroll).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  const activePublication = items.find((p) => p.id === activeId) ?? null

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return
    const publication = items.find((p) => p.id === active.id)
    if (publication && publication.scheduled_date !== over.id) onMove(publication.id, over.id)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-7 bg-haus-blue text-white text-xs font-medium">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center">
              {day}
            </div>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map((date) => (
              <CalendarDay
                key={toDateKey(date)}
                date={date}
                month={month}
                publications={byDay.get(toDateKey(date)) ?? []}
                onCreate={onCreate}
                onOpen={onOpen}
                onTogglePublished={onTogglePublished}
              />
            ))}
          </div>

          <DragOverlay>
            {activePublication ? <PublicationCardView publication={activePublication} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
