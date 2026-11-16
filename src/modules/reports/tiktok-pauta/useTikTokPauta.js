import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabaseClient'
import { normalizePauta, normalizeVentaSinPauta } from './calculations'

function explainError(error) {
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'Faltan las vistas del reporte en Supabase. Ejecuta supabase/reportes_pauta_tiktok.sql en el SQL Editor.'
  }
  if (error?.code === '42501') return 'Sin permisos para leer los datos del reporte en Supabase.'
  return error?.message || 'No se pudieron cargar los datos.'
}

/** Carga las pautas (con su inversión y ventas) y las ventas que aún no están vinculadas. */
export function useTikTokPauta() {
  const [state, setState] = useState({ pautas: [], ventasSinPauta: [], loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      supabase.from('v_reporte_pauta').select('*').order('fecha_hora', { ascending: true }),
      supabase.from('v_reporte_ventas_sin_pauta').select('*').order('fecha_venta', { ascending: true }),
    ]).then(([pautaRes, ventasRes]) => {
      if (cancelled) return
      const error = pautaRes.error ?? ventasRes.error
      if (error) {
        console.error('Reporte de pauta:', error)
        setState({ pautas: [], ventasSinPauta: [], loading: false, error: explainError(error) })
        return
      }
      setState({
        pautas: (pautaRes.data ?? []).map(normalizePauta),
        ventasSinPauta: (ventasRes.data ?? []).map(normalizeVentaSinPauta),
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
