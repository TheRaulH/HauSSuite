import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'

const TABLE = 'publications'

function formatError(error) {
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'La tabla "publications" no existe todavía. Ejecuta supabase/calendar_publications.sql en Supabase.'
  }
  if (error?.code === '42501' || error?.code === 'PGRST301') {
    return 'Sin permisos en Supabase para esta tabla. Revisa las políticas (RLS).'
  }
  return error?.message || 'Ocurrió un error inesperado.'
}

/**
 * Publicaciones entre dos fechas (YYYY-MM-DD, inclusive): solo se descarga lo
 * que se ve en la grilla del mes, no toda la tabla.
 *
 * Todas las escrituras son optimistas: la pantalla cambia al instante y, si
 * Supabase rechaza el cambio, se vuelve al estado anterior y se muestra el error.
 */
export function usePublications(from, to) {
  const key = `${from}|${to}`
  const [data, setData] = useState({ key: null, items: [] })
  const [error, setError] = useState(null)

  const itemsRef = useRef([])
  useEffect(() => {
    itemsRef.current = data.items
  }, [data.items])

  useEffect(() => {
    let cancelled = false

    supabase
      .from(TABLE)
      .select('*')
      .gte('scheduled_date', from)
      .lte('scheduled_date', to)
      .order('created_at', { ascending: true })
      .then(({ data: rows, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          console.error('Error al cargar publicaciones:', fetchError)
          setError(formatError(fetchError))
          setData((prev) => ({ ...prev, key }))
          return
        }
        setError(null)
        setData({ key, items: rows ?? [] })
      })

    return () => {
      cancelled = true
    }
  }, [from, to, key])

  const loading = data.key !== key

  const replaceItem = useCallback((id, next) => {
    setData((prev) => ({ ...prev, items: prev.items.map((p) => (p.id === id ? next : p)) }))
  }, [])

  const create = useCallback(async (values) => {
    setError(null)
    const { data: row, error: insertError } = await supabase.from(TABLE).insert(values).select().single()
    if (insertError) {
      console.error(insertError)
      setError(formatError(insertError))
      return null
    }
    setData((prev) => ({ ...prev, items: [...prev.items, row] }))
    return row
  }, [])

  const update = useCallback(
    async (id, changes) => {
      const previous = itemsRef.current.find((p) => p.id === id)
      if (!previous) return null

      setError(null)
      const optimistic = { ...previous, ...changes }
      if ('is_published' in changes) {
        // La fecha real la pone un trigger en la base; acá solo se anticipa en pantalla.
        optimistic.published_at = changes.is_published
          ? (previous.published_at ?? new Date().toISOString())
          : null
      }
      replaceItem(id, optimistic)

      const { data: row, error: updateError } = await supabase
        .from(TABLE)
        .update(changes)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error(updateError)
        replaceItem(id, previous)
        setError(formatError(updateError))
        return null
      }
      replaceItem(id, row)
      return row
    },
    [replaceItem]
  )

  /** Reprogramar = cambiar scheduled_date (lo usa el arrastrar y soltar). */
  const move = useCallback((id, dateKey) => update(id, { scheduled_date: dateKey }), [update])

  const remove = useCallback(async (id) => {
    const previous = itemsRef.current.find((p) => p.id === id)
    if (!previous) return false

    setError(null)
    setData((prev) => ({ ...prev, items: prev.items.filter((p) => p.id !== id) }))

    const { error: deleteError } = await supabase.from(TABLE).delete().eq('id', id)
    if (deleteError) {
      console.error(deleteError)
      setData((prev) => ({ ...prev, items: [...prev.items, previous] }))
      setError(formatError(deleteError))
      return false
    }
    return true
  }, [])

  return {
    items: data.items,
    loading,
    error,
    clearError: () => setError(null),
    create,
    update,
    move,
    remove,
  }
}
