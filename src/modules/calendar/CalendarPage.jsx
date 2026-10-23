import { useMemo, useState } from 'react'
import { startOfMonth } from 'date-fns'
import PageHeader from '../../suite/PageHeader'
import { getMonthDays, shiftMonth, toDateKey } from './dateHelpers'
import { usePublications } from './usePublications'
import { PRIORITIES } from './calendarConfig'
import CalendarHeader from './components/CalendarHeader'
import CalendarGrid from './components/CalendarGrid'
import MonthSummary from './components/MonthSummary'
import PublicationPanel from './components/PublicationPanel'

const priorityOrder = Object.fromEntries(PRIORITIES.map((p, i) => [p.id, i]))

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  // { id } para editar, { date } para crear
  const [panel, setPanel] = useState(null)

  const days = useMemo(() => getMonthDays(month), [month])
  const from = toDateKey(days[0])
  const to = toDateKey(days[days.length - 1])

  const { items, loading, error, clearError, create, update, move, remove } = usePublications(from, to)

  // Publicaciones agrupadas por día, con las más urgentes primero
  const byDay = useMemo(() => {
    const map = new Map()
    for (const p of items) {
      if (!map.has(p.scheduled_date)) map.set(p.scheduled_date, [])
      map.get(p.scheduled_date).push(p)
    }
    for (const list of map.values()) {
      list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    }
    return map
  }, [items])

  const monthKeyPrefix = toDateKey(month).slice(0, 7)
  const monthItems = useMemo(
    () => items.filter((p) => p.scheduled_date.startsWith(monthKeyPrefix)),
    [items, monthKeyPrefix]
  )

  const editing = panel?.id ? items.find((p) => p.id === panel.id) ?? null : null

  function openCreate(dateKey) {
    setPanel({ date: dateKey ?? toDateKey(new Date()) })
  }

  async function handleSave(values) {
    const saved = editing ? await update(editing.id, values) : await create(values)
    if (saved) setPanel(null)
  }

  async function handleDelete(id) {
    const ok = await remove(id)
    if (ok) setPanel(null)
  }

  return (
    <>
      <PageHeader
        title="Calendario de contenidos"
        description="Arrastra una publicación a otro día para reprogramarla · clic para editarla"
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">
        {error && (
          <div className="flex items-start justify-between gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="text-red-500 hover:underline shrink-0">
              Cerrar
            </button>
          </div>
        )}

        <CalendarHeader
          month={month}
          onPrev={() => setMonth((m) => shiftMonth(m, -1))}
          onNext={() => setMonth((m) => shiftMonth(m, 1))}
          onToday={() => setMonth(startOfMonth(new Date()))}
          onCreate={() => openCreate()}
        />

        <MonthSummary items={monthItems} />

        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <CalendarGrid
            days={days}
            month={month}
            byDay={byDay}
            items={items}
            onMove={move}
            onCreate={openCreate}
            onOpen={(p) => setPanel({ id: p.id })}
            onTogglePublished={(p) => update(p.id, { is_published: !p.is_published })}
          />
        </div>
      </div>

      {panel && (
        <PublicationPanel
          key={panel.id ?? `new-${panel.date}`}
          publication={editing}
          defaultDate={panel.date}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  )
}
