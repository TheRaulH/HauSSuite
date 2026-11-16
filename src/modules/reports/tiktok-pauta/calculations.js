import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatBs, formatInt } from '../format'

/**
 * Toda la matemática del reporte vive acá (funciones puras, sin React ni Supabase),
 * así es fácil de revisar y de probar.
 *
 * Definiciones:
 *  - Inversión  = (coste del anuncio + tarifa Apple) × tipo de cambio, en Bs.
 *  - Ganancia   = ganancia neta de las ventas vinculadas a la pauta
 *                 (precio × (margen − descuento)), en Bs.
 *  - Resultado  = Ganancia − Inversión.   ≥ 0 → rentable.
 */

/** Una venta se sugiere para un live si ocurrió durante él o hasta X horas después. */
export const VENTANA_POST_LIVE_HORAS = 3
const HORAS_LIVE_POR_DEFECTO = 2

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const sumBy = (list, fn) => list.reduce((acc, item) => acc + (fn(item) ?? 0), 0)
const safeDiv = (a, b) => (b > 0 ? a / b : null)

/** "1.7 h / 2 h" → 1.7 (horas realmente en vivo). Para videos ("3 días") → null. */
export function parseHoras(duracion) {
  const match = /(\d+(?:[.,]\d+)?)\s*h\b/i.exec(duracion ?? '')
  return match ? parseFloat(match[1].replace(',', '.')) : null
}

export function normalizePauta(row) {
  const inversionBs = num(row.inversion_bs) ?? 0
  const gananciaBs = num(row.ganancia_bs) ?? 0
  const facturadoBs = num(row.facturado_bs) ?? 0
  const espectadores = num(row.espectadores) ?? 0
  const nuevosSeguidores = num(row.nuevos_seguidores)
  const ventasLineas = num(row.ventas_lineas) ?? 0
  const resultadoBs = gananciaBs - inversionBs

  let estadoVenta = 'sin-ventas'
  if (ventasLineas > 0) estadoVenta = resultadoBs >= 0 ? 'rentable' : 'perdida'

  return {
    id: row.id,
    fecha: new Date(row.fecha_hora),
    tipo: row.tipo,
    titulo: row.titulo,
    estado: row.estado,
    objetivo: row.objetivo,
    sucursal: row.sucursal,
    duracion: row.duracion,
    horasEnVivo: row.tipo === 'LIVE' ? parseHoras(row.duracion) : null,
    inversionBs,
    inversionUsd: num(row.costo_total_usd) ?? 0,
    espectadores,
    impresiones: num(row.impresiones),
    tiempoPromedioSeg: num(row.tiempo_promedio_visualizacion_seg),
    meGusta: num(row.me_gusta),
    comentarios: num(row.comentarios),
    compartidos: num(row.compartidos),
    nuevosSeguidores,
    ventasLineas,
    ventasFacturas: num(row.ventas_facturas) ?? 0,
    ventasUnidades: num(row.ventas_unidades) ?? 0,
    facturadoBs,
    gananciaBs,
    ventasOtraSucursal: num(row.ventas_otra_sucursal) ?? 0,
    resultadoBs,
    roi: safeDiv(resultadoBs, inversionBs),
    costoPorEspectadorBs: safeDiv(inversionBs, espectadores),
    costoPorSeguidorBs: safeDiv(inversionBs, nuevosSeguidores ?? 0),
    estadoVenta,
  }
}

export function normalizeVentaSinPauta(row) {
  return {
    id: row.id,
    factura: row.numero_factura,
    producto: row.producto,
    sucursal: row.sucursal,
    cantidad: num(row.cantidad) ?? 1,
    totalBs: num(row.total_cobrado) ?? 0,
    gananciaBs: num(row.ganancia_neta_venta) ?? 0,
    fecha: new Date(row.fecha_venta),
  }
}

/** Totales y veredicto de un conjunto de pautas. */
export function summarize(pautas) {
  const inversionBs = sumBy(pautas, (p) => p.inversionBs)
  const facturadoBs = sumBy(pautas, (p) => p.facturadoBs)
  const gananciaBs = sumBy(pautas, (p) => p.gananciaBs)
  const resultadoBs = gananciaBs - inversionBs
  const ventasLineas = sumBy(pautas, (p) => p.ventasLineas)
  const espectadores = sumBy(pautas, (p) => p.espectadores)
  const seguidores = sumBy(pautas, (p) => p.nuevosSeguidores)
  const margen = safeDiv(gananciaBs, facturadoBs) // cuánto de cada Bs vendido queda de ganancia

  let veredicto = 'vacio'
  if (pautas.length > 0) {
    if (ventasLineas === 0) veredicto = 'sin-datos'
    else veredicto = resultadoBs >= 0 ? 'rentable' : 'perdida'
  }

  return {
    n: pautas.length,
    nRentables: pautas.filter((p) => p.estadoVenta === 'rentable').length,
    nPerdida: pautas.filter((p) => p.estadoVenta === 'perdida').length,
    nSinVentas: pautas.filter((p) => p.estadoVenta === 'sin-ventas').length,
    inversionBs,
    facturadoBs,
    gananciaBs,
    resultadoBs,
    roi: safeDiv(resultadoBs, inversionBs),
    gananciaPorBsInvertido: safeDiv(gananciaBs, inversionBs),
    margen,
    // Cuánto había que vender para pagar la pauta, según el margen real de estas ventas
    ventasParaEquilibrio: margen ? inversionBs / margen : null,
    ventasLineas,
    ventasFacturas: sumBy(pautas, (p) => p.ventasFacturas),
    espectadores,
    impresiones: sumBy(pautas, (p) => p.impresiones),
    seguidores,
    costoPorEspectadorBs: safeDiv(inversionBs, espectadores),
    costoPorSeguidorBs: safeDiv(inversionBs, seguidores),
    veredicto,
  }
}

const shortDate = (d) => format(d, "d 'de' MMM", { locale: es })

/** Filas para los gráficos, con etiqueta única por pauta ("8 oct 16h" si hay dos el mismo día). */
export function buildChartRows(pautas) {
  const sorted = [...pautas].sort((a, b) => a.fecha - b.fecha)
  const perDay = {}
  for (const p of sorted) {
    const key = format(p.fecha, 'yyyy-MM-dd')
    perDay[key] = (perDay[key] ?? 0) + 1
  }
  const used = new Set()
  let acumulado = 0

  return sorted.map((p) => {
    const day = format(p.fecha, 'd MMM', { locale: es })
    let label = perDay[format(p.fecha, 'yyyy-MM-dd')] > 1 ? `${day} ${format(p.fecha, 'HH')}h` : day
    while (used.has(label)) label += '·'
    used.add(label)
    acumulado += p.resultadoBs
    return {
      id: p.id,
      label,
      titulo: p.titulo,
      inversion: p.inversionBs,
      ganancia: p.gananciaBs,
      resultado: p.resultadoBs,
      acumulado: Math.round(acumulado * 100) / 100,
      espectadores: p.espectadores,
    }
  })
}

/** Agrupa por título de campaña ("Festival del Sueño", "LIVE de Hauscenter"…). */
export function groupByTitulo(pautas) {
  const groups = new Map()
  for (const p of pautas) {
    const g = groups.get(p.titulo) ?? { titulo: p.titulo, n: 0, inversion: 0, ganancia: 0, espectadores: 0 }
    g.n += 1
    g.inversion += p.inversionBs
    g.ganancia += p.gananciaBs
    g.espectadores += p.espectadores
    groups.set(p.titulo, g)
  }
  return [...groups.values()]
    .map((g) => ({ ...g, resultado: g.ganancia - g.inversion }))
    .sort((a, b) => b.resultado - a.resultado)
}

const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`

/** Frases en lenguaje simple: "lo más importante en 30 segundos". */
export function buildInsights(pautas, resumen, { noun = 'live', nounPlural = 'lives' } = {}) {
  const insights = []
  if (pautas.length === 0) return insights

  const conVentas = pautas.filter((p) => p.ventasLineas > 0)
  if (conVentas.length > 0) {
    const mejor = conVentas.reduce((a, b) => (b.resultadoBs > a.resultadoBs ? b : a))
    insights.push(
      `El mejor ${noun} fue «${mejor.titulo}» del ${shortDate(mejor.fecha)}: ` +
        `invertimos ${formatBs(mejor.inversionBs)} y dejó ${formatBs(mejor.gananciaBs)} de ganancia.`
    )
  }

  const masVisto = pautas.reduce((a, b) => (b.espectadores > a.espectadores ? b : a))
  if (masVisto.espectadores > 0) {
    insights.push(
      `El que más gente alcanzó fue «${masVisto.titulo}» del ${shortDate(masVisto.fecha)}, ` +
        `con ${formatInt(masVisto.espectadores)} personas.`
    )
  }

  if (resumen.nSinVentas > 0) {
    insights.push(
      `${pluralize(resumen.nSinVentas, `${noun} no tiene`, `${nounPlural} no tienen`)} ventas registradas. ` +
        `Puede que no hayan vendido, o que falte cargar o vincular esas ventas.`
    )
  }

  if (resumen.seguidores > 0 && resumen.costoPorSeguidorBs != null) {
    insights.push(
      `Se sumaron ${formatInt(resumen.seguidores)} seguidores nuevos: ` +
        `cada uno costó unos ${formatBs(resumen.costoPorSeguidorBs, { decimals: 2 })}.`
    )
  }

  return insights
}

/**
 * Sugiere a qué live pertenece cada venta sin vincular, por horario:
 * la venta ocurrió durante el live o hasta VENTANA_POST_LIVE_HORAS después.
 * Es solo una pista para que una persona la confirme.
 * @returns {Map<number, object>} id de venta → pauta sugerida
 */
export function suggestLinks(ventas, pautas, ventanaHoras = VENTANA_POST_LIVE_HORAS) {
  const lives = pautas.filter((p) => p.tipo === 'LIVE')
  const result = new Map()

  for (const venta of ventas) {
    const candidatos = lives.filter((p) => {
      const inicio = p.fecha.getTime()
      const fin = inicio + ((p.horasEnVivo ?? HORAS_LIVE_POR_DEFECTO) + ventanaHoras) * 3_600_000
      const t = venta.fecha.getTime()
      return t >= inicio && t <= fin
    })
    if (candidatos.length > 0) {
      result.set(venta.id, candidatos.reduce((a, b) => (b.fecha > a.fecha ? b : a)))
    }
  }
  return result
}

/** SQL para vincular las ventas sugeridas (la persona lo revisa y lo ejecuta en Supabase). */
export function buildLinkSql(sugerencias) {
  const porPauta = new Map()
  for (const [ventaId, pauta] of sugerencias) {
    const entry = porPauta.get(pauta.id) ?? { pauta, ids: [] }
    entry.ids.push(ventaId)
    porPauta.set(pauta.id, entry)
  }

  const bloques = [...porPauta.values()].map(
    ({ pauta, ids }) =>
      `-- ${pauta.titulo} · ${shortDate(pauta.fecha)}\n` +
      `update public.ventas set pauta_id = ${pauta.id} where id in (${ids.join(', ')});`
  )

  return [
    '-- Revisa cada vínculo antes de ejecutar: son sugerencias por horario.',
    '-- Si falla por chk_pauta_un_solo_producto, mira la opción A al final de reportes_pauta_tiktok.sql.',
    '',
    ...bloques,
  ].join('\n')
}
