import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Clave de día "YYYY-MM-DD" en hora LOCAL. Se usa siempre esto (y no
 * toISOString) porque en Bolivia (UTC-4) toISOString corre el día a la noche.
 */
export const toDateKey = (date) => format(date, 'yyyy-MM-dd')

/** Todos los días que se ven en la grilla del mes, de lunes a domingo (4 a 6 semanas). */
export function getMonthDays(month) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })
}

export const shiftMonth = (month, amount) => startOfMonth(addMonths(month, amount))

export const monthName = (month) => format(month, 'LLLL', { locale: es })
export const yearLabel = (month) => format(month, 'yyyy')

/** "2026-10-22" -> "22 oct" */
export function shortDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return format(new Date(y, m - 1, d), "d 'de' MMM", { locale: es })
}
