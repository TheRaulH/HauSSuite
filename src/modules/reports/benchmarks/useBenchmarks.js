import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'

function explainError(error) {
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'No se encontró la tabla retail_followers o la vista v_retail_consolidated en Supabase.'
  }
  if (error?.code === '42501') return 'Sin permisos para leer los datos de benchmarks en Supabase.'
  return error?.message || 'No se pudieron cargar los datos.'
}

/** Seguidores por retail, red social y corte (tabla) + total consolidado por retail (vista). */
export function useBenchmarks() {
  const [state, setState] = useState({ rows: [], consolidated: [], loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      supabase.from('retail_followers').select('analysis_date, retail_name, platform, followers'),
      supabase.from('v_retail_consolidated').select('*'),
    ]).then(([rowsRes, consRes]) => {
      if (cancelled) return
      const error = rowsRes.error ?? consRes.error
      if (error) {
        console.error('Benchmarks:', error)
        setState({ rows: [], consolidated: [], loading: false, error: explainError(error) })
        return
      }
      setState({
        rows: (rowsRes.data ?? []).map((r) => ({
          date: r.analysis_date, // "YYYY-MM-DD" (columna date, sin zona horaria)
          retail: r.retail_name,
          platform: r.platform,
          followers: Number(r.followers),
        })),
        consolidated: (consRes.data ?? []).map((r) => ({
          date: r.analysis_date,
          retail: r.retail_name,
          facebook: Number(r.facebook),
          instagram: Number(r.instagram),
          tiktok: Number(r.tiktok),
          total: Number(r.total_followers),
        })),
        loading: false,
        error: null,
      })
    })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    setReloadKey((k) => k + 1)
  }, [])

  return { ...state, reload }
}
