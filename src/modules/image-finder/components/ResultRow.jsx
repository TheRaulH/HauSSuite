import { memo } from 'react'
import { CircleCheck, CircleHelp, ImageOff } from 'lucide-react'
import { useThumbnail } from '../useThumbnail'

export const ROW_HEIGHT = 68

export const STATUS = {
  ok: { label: 'Encontrada', Icon: CircleCheck, badge: 'bg-haus-olive/15 text-[#4b5636]', bar: 'bg-haus-olive', box: 'bg-haus-olive/10 text-haus-olive' },
  'sin-imagen': { label: 'Sin imagen', Icon: ImageOff, badge: 'bg-haus-orange/15 text-[#a14400]', bar: 'bg-haus-orange', box: 'bg-haus-orange/10 text-haus-orange' },
  'sin-catalogo': { label: 'No está en el catálogo', Icon: CircleHelp, badge: 'bg-haus-sky text-haus-blue', bar: 'bg-haus-blue/40', box: 'bg-haus-sky text-haus-blue' },
}

function Thumb({ row }) {
  const url = useThumbnail(row.file)
  const { Icon, box } = STATUS[row.status]
  if (row.file && url) {
    return <img src={url} alt="" className="w-[52px] h-[52px] rounded-xl object-contain bg-white border border-haus-sky" />
  }
  return (
    <span className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center ${row.file ? 'bg-haus-sky animate-pulse' : box}`}>
      {!row.file && <Icon size={22} aria-hidden />}
    </span>
  )
}

/** Una fila del resultado: miniatura, qué se pidió, qué se encontró y su estado. */
function ResultRow({ row }) {
  const s = STATUS[row.status]
  return (
    <div className="h-full flex items-center gap-3 pr-3 border-b border-gray-100 hover:bg-haus-cream/60">
      <span className={`self-stretch w-1 ${s.bar}`} aria-hidden />
      <Thumb row={row} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800" title={row.line}>
          {row.line}
        </p>
        <p className="truncate text-xs text-gray-500">
          {row.code ? (
            <>
              <span className="font-mono">{row.code}</span>
              {row.file ? ` → ${row.file.name}` : ''}
              {row.candidates > 1 ? ` · ${row.candidates} versiones, la más reciente` : ''}
            </>
          ) : (
            'Agrégala al catálogo para poder buscarla'
          )}
        </p>
      </div>
      <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${s.badge}`}>
        <s.Icon size={13} aria-hidden />
        {s.label}
      </span>
    </div>
  )
}

export default memo(ResultRow)
