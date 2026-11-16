import { CircleHelp, TrendingDown, TrendingUp } from 'lucide-react'
import { formatBs, formatNumber } from '../format'

/** Respuesta a la pregunta principal: ¿fue rentable? */
export default function Verdict({ resumen, plural = 'lives' }) {
  const { veredicto, inversionBs, gananciaBs, resultadoBs, gananciaPorBsInvertido, nSinVentas, n } = resumen

  const variants = {
    rentable: {
      box: 'bg-haus-blue text-white',
      icon: TrendingUp,
      iconBox: 'bg-white/15 text-white',
      pre: 'Sí fue',
      word: 'rentable',
      text: `Invertimos ${formatBs(inversionBs)} en pauta y las ventas dejaron ${formatBs(gananciaBs)} de ganancia. Después de pagar la pauta nos quedaron ${formatBs(resultadoBs)}. Por cada Bs 1 invertido recuperamos Bs ${formatNumber(gananciaPorBsInvertido)} de ganancia.`,
    },
    perdida: {
      box: 'bg-haus-sand text-haus-blue',
      icon: TrendingDown,
      iconBox: 'bg-haus-orange/15 text-haus-orange',
      pre: 'Todavía no fue',
      word: 'rentable',
      text: `Invertimos ${formatBs(inversionBs)} en pauta y las ventas dejaron ${formatBs(gananciaBs)} de ganancia: faltaron ${formatBs(-resultadoBs)} para cubrir la inversión.${nSinVentas > 0 ? ` Ojo: ${nSinVentas} de ${n} ${plural} no tienen ventas registradas; si vendieron, cargarlas cambiaría el resultado.` : ''}`,
    },
    'sin-datos': {
      box: 'bg-haus-sky text-haus-blue',
      icon: CircleHelp,
      iconBox: 'bg-white text-haus-blue',
      pre: 'Todavía no se puede saber si fue',
      word: 'rentable',
      text: `Se invirtieron ${formatBs(inversionBs)} en ${n} ${plural}, pero ninguna venta está vinculada a ellos. Vincula las ventas de los lives (sección “Ventas sin vincular”, más abajo) para ver el resultado.`,
    },
  }

  const v = variants[veredicto]
  if (!v) return null
  const Icon = v.icon

  return (
    <section className={`rounded-3xl rounded-bl-none p-6 md:p-8 flex gap-5 items-start ${v.box}`}>
      <span className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${v.iconBox}`}>
        <Icon size={28} aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-bold leading-tight">
          {v.pre} <span className="font-kg font-normal text-3xl md:text-4xl">{v.word}</span>
        </h2>
        <p className="text-base max-w-3xl opacity-95">{v.text}</p>
      </div>
    </section>
  )
}
