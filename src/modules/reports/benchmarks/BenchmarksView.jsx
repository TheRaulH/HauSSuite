import { useMemo } from 'react'
import ChartCard from '../components/ChartCard'
import BarsChart from './BarsChart'
import {
  PLATFORMS,
  buildPlatformRows,
  buildTotalRows,
  cutLabel,
  describeRanking,
  previousCut,
  shortCut,
} from './calculations'

/** Los 4 gráficos del corte elegido: Facebook, Instagram, TikTok y el acumulado. */
export default function BenchmarksView({ rows, consolidated, cortes, selected }) {
  const prevDate = useMemo(() => previousCut(cortes, selected), [cortes, selected])
  const prevLabel = prevDate ? `el corte del ${shortCut(prevDate)}` : ''

  const charts = useMemo(
    () => [
      ...PLATFORMS.map((p) => ({
        id: p.id,
        title: `${p.label}: ¿cuántos seguidores tiene cada retail?`,
        networkLabel: p.label,
        rows: buildPlatformRows(rows, selected, prevDate, p.id),
      })),
      {
        id: 'total',
        title: 'Acumulado: las tres redes juntas',
        question: 'Suma de seguidores de Facebook, Instagram y TikTok. Pasa el cursor para ver el detalle.',
        networkLabel: 'el acumulado',
        rows: buildTotalRows(consolidated, selected, prevDate),
      },
    ],
    [rows, consolidated, selected, prevDate]
  )

  return (
    <>
      <p className="text-sm text-gray-500">
        {cutLabel(selected)}. La barra oscura es Hauscenter.
        {prevDate ? ` La variación se compara con el corte del ${shortCut(prevDate)}.` : ' Es el primer corte registrado, así que aún no hay con qué comparar.'}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map((chart) => (
          <ChartCard
            key={chart.id}
            title={chart.title}
            question={chart.question ?? 'Ordenados de mayor a menor.'}
            takeaway={describeRanking(chart.rows, chart.networkLabel)}
          >
            {chart.rows.length > 0 ? (
              <BarsChart rows={chart.rows} prevLabel={prevLabel} />
            ) : (
              <p className="text-sm text-gray-400 py-6 text-center">No hay datos de este corte.</p>
            )}
          </ChartCard>
        ))}
      </div>
    </>
  )
}
