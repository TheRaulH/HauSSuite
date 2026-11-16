import { Radio, Trophy } from 'lucide-react'
import TikTokPautaReport from './tiktok-pauta/TikTokPautaReport'
import BenchmarksReport from './benchmarks/BenchmarksReport'

/**
 * REGISTRO DE REPORTES de HauSSuite.
 *
 * Para agregar un reporte nuevo:
 *  1) Crea su carpeta en src/modules/reports/<nombre>/ con un componente que
 *     se encargue de cargar sus datos y mostrarlos (usa <ReportShell> y los
 *     bloques de ./components para mantener el mismo estilo).
 *  2) Impórtalo arriba y suma una entrada acá.
 * El índice de reportes y la ruta (#/reportes/<id>) se generan solos.
 */
export const REPORTS = [
  {
    id: 'pauta-tiktok',
    title: 'Pauta de TikTok',
    description: 'Cómo nos fue con los lives pagos de TikTok y si la inversión fue rentable.',
    icon: Radio,
    Component: TikTokPautaReport,
  },
  {
    id: 'benchmarks',
    title: 'Benchmarks',
    description: 'Cómo está Hauscenter frente a los demás retails en seguidores de Facebook, Instagram y TikTok.',
    icon: Trophy,
    Component: BenchmarksReport,
  },
]
