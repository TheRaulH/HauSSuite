import { useMemo } from 'react'
import ChartCard from '../components/ChartCard'
import ConsolidatedChart from './charts/ConsolidatedChart'
import FacebookChart from './charts/FacebookChart'
import InstagramChart from './charts/InstagramChart'
import TikTokChart from './charts/TikTokChart'
import { NetworkBadge } from './networks'
import { buildPlatformRows, buildTotalRows, cutLabel, describeRanking, previousCut, shortCut } from './calculations'

const PLATFORM_CHARTS = { facebook: FacebookChart, instagram: InstagramChart, tiktok: TikTokChart }

/** Los 4 gráficos del corte elegido: el acumulado arriba y luego Facebook, Instagram y TikTok. */
export default function BenchmarksView({ rows, consolidated, cortes, selected }) {
  const prevDate = useMemo(() => previousCut(cortes, selected), [cortes, selected])
  const prevLabel = prevDate ? `el corte del ${shortCut(prevDate)}` : ''

  const charts = useMemo(
    () => [
      {
        id: 'total',
        Chart: ConsolidatedChart,
        title: 'Acumulado: las tres redes juntas',
        question: 'Cada barra suma Facebook, Instagram y TikTok. Pasa el cursor para ver cuánto aporta cada red.',
        networkLabel: 'el acumulado',
        rows: buildTotalRows(consolidated, selected, prevDate),
        wide: true,
      },
      {
        id: 'facebook',
        Chart: PLATFORM_CHARTS.facebook,
        title: 'Facebook: ¿cuántos seguidores tiene cada retail?',
        networkLabel: 'Facebook',
        rows: buildPlatformRows(rows, selected, prevDate, 'facebook'),
      },
      {
        id: 'instagram',
        Chart: PLATFORM_CHARTS.instagram,
        title: 'Instagram: ¿cuántos seguidores tiene cada retail?',
        networkLabel: 'Instagram',
        rows: buildPlatformRows(rows, selected, prevDate, 'instagram'),
      },
      {
        id: 'tiktok',
        Chart: PLATFORM_CHARTS.tiktok,
        title: 'TikTok: ¿cuántos seguidores tiene cada retail?',
        networkLabel: 'TikTok',
        rows: buildPlatformRows(rows, selected, prevDate, 'tiktok'),
        wide: true,
      },
    ],
    [rows, consolidated, selected, prevDate]
  )

  return (
    <>
      <p className="text-sm text-gray-500">
        {cutLabel(selected)}. Hauscenter va resaltada en cada gráfico.
        {prevDate ? ` La variación se compara con el corte del ${shortCut(prevDate)}.` : ' Es el primer corte registrado, así que aún no hay con qué comparar.'}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map(({ id, Chart, title, question, networkLabel, rows: chartRows, wide }) => (
          <div key={id} className={`flex flex-col ${wide ? 'lg:col-span-2' : ''}`}>
            <ChartCard
              expandable
              icon={<NetworkBadge id={id} />}
              title={title}
              question={question ?? 'Ordenados de mayor a menor.'}
              takeaway={describeRanking(chartRows, networkLabel)}
            >
              {(expanded) =>
                chartRows.length > 0 ? (
                  <Chart rows={chartRows} prevLabel={prevLabel} expanded={expanded} />
                ) : (
                  <p className="text-sm text-gray-400 py-6 text-center">No hay datos de este corte.</p>
                )
              }
            </ChartCard>
          </div>
        ))}
      </div>
    </>
  )
}
