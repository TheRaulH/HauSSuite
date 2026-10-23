import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { monthName, yearLabel } from '../dateHelpers'

const navButton =
  'w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-haus-sky hover:text-haus-blue flex items-center justify-center'

export default function CalendarHeader({ month, onPrev, onNext, onToday, onCreate }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} aria-label="Mes anterior" className={navButton}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={onNext} aria-label="Mes siguiente" className={navButton}>
          <ChevronRight size={18} />
        </button>

        {/* KG The Fighter solo como acento: una palabra (el mes) */}
        <h2 className="text-haus-blue ml-2 flex items-baseline gap-2">
          <span className="font-kg text-3xl capitalize">{monthName(month)}</span>
          <span className="text-lg font-semibold text-gray-400">{yearLabel(month)}</span>
        </h2>

        <button
          type="button"
          onClick={onToday}
          className="ml-2 px-3 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue"
        >
          Hoy
        </button>
      </div>

      {/* Forma de marca: rectángulo con tres esquinas redondeadas y una recta */}
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 rounded-full rounded-bl-none"
      >
        <Plus size={16} />
        Nueva publicación
      </button>
    </div>
  )
}
