import { useMemo } from 'react'
import { Info } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import KpiCard from '../components/KpiCard'
import { formatBs, formatInt, formatNumber, formatPct } from '../format'
import { buildChartRows, buildInsights, groupByTitulo, summarize } from './calculations'
import { EspectadoresChart, InversionVsGananciaChart, PorCampanaChart, ResultadoAcumuladoChart } from './charts'
import PautaTable from './PautaTable'
import UnlinkedSales from './UnlinkedSales'
import Verdict from './Verdict'

const NOUNS = {
  LIVE: { noun: 'live', plural: 'lives', viewers: 'Espectadores', viewersHint: 'personas que entraron a los lives' },
  Video: { noun: 'video', plural: 'videos', viewers: 'Visualizaciones', viewersHint: 'veces que se vieron los videos' },
  all: { noun: 'pauta', plural: 'pautas', viewers: 'Personas alcanzadas', viewersHint: 'espectadores de lives y visualizaciones de videos' },
}

/** Parte visual del reporte (recibe los datos ya filtrados). */
export default function TikTokPautaView({ pautas, todasLasPautas, ventasSinPauta, tipo }) {
  const words = NOUNS[tipo] ?? NOUNS.all
  const resumen = useMemo(() => summarize(pautas), [pautas])
  const rows = useMemo(() => buildChartRows(pautas), [pautas])
  const campanas = useMemo(() => groupByTitulo(pautas), [pautas])
  const insights = useMemo(() => buildInsights(pautas, resumen, words), [pautas, resumen, words])

  if (pautas.length === 0) {
    return (
      <>
        <p className="text-sm text-gray-500 bg-white border border-haus-sky rounded-2xl px-5 py-8 text-center">
          No hay {words.plural} con estos filtros.
        </p>
        <UnlinkedSales ventas={ventasSinPauta} todasLasPautas={todasLasPautas} />
      </>
    )
  }

  const hayVentas = resumen.ventasLineas > 0
  const promedioEspectadores = resumen.espectadores / resumen.n
  const mejorCampana = campanas.find((c) => c.ganancia > 0)

  return (
    <>
      <Verdict resumen={resumen} plural={words.plural} />

      {/* Números clave */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Invertido en pauta" value={formatBs(resumen.inversionBs)} hint={`${resumen.n} ${resumen.n === 1 ? words.noun : words.plural} · anuncio + tarifa Apple`} />
        <KpiCard
          label="Ganancia de las ventas"
          value={hayVentas ? formatBs(resumen.gananciaBs) : '—'}
          hint={hayVentas ? `${formatBs(resumen.facturadoBs)} vendidos en ${resumen.ventasFacturas} facturas` : 'Sin ventas vinculadas'}
        />
        <KpiCard
          label="Resultado"
          value={hayVentas ? formatBs(resumen.resultadoBs) : '—'}
          hint={hayVentas ? 'Ganancia menos inversión' : 'Se calcula al vincular ventas'}
          tone={!hayVentas ? 'default' : resumen.resultadoBs >= 0 ? 'good' : 'bad'}
        />
        <KpiCard
          label="Por cada Bs 1 invertido"
          value={hayVentas ? `Bs ${formatNumber(resumen.gananciaPorBsInvertido)}` : '—'}
          hint={hayVentas ? 'de ganancia recuperada' : 'Se calcula al vincular ventas'}
        />
        <KpiCard label={words.viewers} value={formatInt(resumen.espectadores)} hint={words.viewersHint} />
        <KpiCard
          label="Costo por persona"
          value={resumen.costoPorEspectadorBs == null ? '—' : formatBs(resumen.costoPorEspectadorBs, { decimals: 2 })}
          hint="Lo que costó que cada persona entrara"
        />
        <KpiCard label="Seguidores nuevos" value={formatInt(resumen.seguidores)} hint={resumen.costoPorSeguidorBs == null ? undefined : `${formatBs(resumen.costoPorSeguidorBs, { decimals: 2 })} por seguidor`} />
        <KpiCard
          label="De cada Bs 100 vendidos"
          value={resumen.margen == null ? '—' : `Bs ${formatNumber(resumen.margen * 100, 0)}`}
          hint={resumen.margen == null ? 'Sin ventas vinculadas' : 'quedan de ganancia (margen real)'}
        />
      </div>

      {/* Lo más importante en palabras */}
      {insights.length > 0 && (
        <section className="bg-haus-cream border border-haus-sand rounded-3xl rounded-bl-none p-5">
          <h3 className="font-semibold text-haus-blue mb-2">Lo más importante, en pocas palabras</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-gray-700 list-disc pl-5">
            {insights.map((text) => (
              <li key={text}>{text}</li>
            ))}
            {hayVentas && resumen.ventasParaEquilibrio != null && (
              <li>
                Para recuperar la inversión había que vender unos {formatBs(resumen.ventasParaEquilibrio)} (con el margen
                real de estas ventas, {formatPct(resumen.margen)}).
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={`¿Se recuperó lo invertido en cada ${words.noun}?`}
          question="Barra azul = lo que gastamos en pauta. Barra verde = lo que ganamos con las ventas."
          takeaway={
            hayVentas
              ? `${resumen.nRentables} de ${resumen.n} ${resumen.n === 1 ? words.noun : words.plural} recuperaron la inversión${resumen.nSinVentas > 0 ? `; ${resumen.nSinVentas} no tienen ventas registradas` : ''}.`
              : 'Aún no hay ventas vinculadas, por eso no aparecen barras verdes.'
          }
        >
          <InversionVsGananciaChart rows={rows} />
        </ChartCard>

        <ChartCard
          title="¿Vamos ganando o perdiendo en total?"
          question={`Suma ${words.noun} tras ${words.noun}. Por encima de la línea naranja ganamos; por debajo, aún no recuperamos la inversión.`}
          takeaway={
            hayVentas
              ? `Hasta ahora el resultado acumulado es ${formatBs(resumen.resultadoBs)}.`
              : 'Mientras no haya ventas vinculadas, la línea solo muestra la inversión acumulada.'
          }
        >
          <ResultadoAcumuladoChart rows={rows} />
        </ChartCard>

        <ChartCard
          title={`¿Cuánta gente alcanzó cada ${words.noun}?`}
          question={`${words.viewers} por ${words.noun}. La línea punteada es el promedio.`}
          takeaway={`En promedio, cada ${words.noun} alcanzó a ${formatInt(promedioEspectadores)} personas.`}
        >
          <EspectadoresChart rows={rows} promedio={promedioEspectadores} unidad={words.viewers} />
        </ChartCard>

        {campanas.length > 1 && (
          <ChartCard
            title="¿Qué tipo de pauta funciona mejor?"
            question="Resultado total (ganancia menos inversión) agrupado por título. Verde = gana, naranja = pierde."
            takeaway={
              mejorCampana
                ? `«${mejorCampana.titulo}» es la que más ganancia dejó (${formatBs(mejorCampana.ganancia)} con ${mejorCampana.n} ${mejorCampana.n === 1 ? words.noun : words.plural}).`
                : 'Todavía ningún tipo de pauta tiene ganancia registrada.'
            }
          >
            <PorCampanaChart rows={campanas} />
          </ChartCard>
        )}
      </div>

      {/* Detalle */}
      <section className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 flex flex-col gap-3">
        <h3 className="font-semibold text-haus-blue">Detalle de cada {words.noun}</h3>
        <PautaTable pautas={pautas} unidad={words.viewers} />
      </section>

      <UnlinkedSales ventas={ventasSinPauta} todasLasPautas={todasLasPautas} />

      <details className="text-sm text-gray-600 bg-white border border-haus-sky rounded-2xl px-5 py-4">
        <summary className="cursor-pointer font-medium text-haus-blue inline-flex items-center gap-2">
          <Info size={16} aria-hidden />
          ¿Cómo se calcula?
        </summary>
        <ul className="list-disc pl-5 mt-3 flex flex-col gap-1.5">
          <li>
            <strong>Inversión:</strong> costo del anuncio más la tarifa de Apple, convertido a bolivianos con el tipo de cambio
            de cada pauta.
          </li>
          <li>
            <strong>Ganancia:</strong> la ganancia de las ventas vinculadas a la pauta: precio × (margen del producto − descuento
            aplicado). Si el cliente compró en otra sucursal, igual se cuenta.
          </li>
          <li>
            <strong>Resultado:</strong> ganancia menos inversión. Si es cero o positivo, fue rentable.
          </li>
          <li>
            <strong>Costo por persona:</strong> inversión dividida entre los espectadores (calculado con los números exactos,
            no con los redondeados de TikTok).
          </li>
          <li>
            Solo cuentan las ventas vinculadas a una pauta; no incluye sueldos, equipos ni otros costos del live.
          </li>
        </ul>
      </details>
    </>
  )
}
