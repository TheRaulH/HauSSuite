import { fitBlock, fitSize } from '../textMetrics'
import { BrandPill, FONT, Photo, Txt, dateParts, geometry, hourParts, makePalette } from './shared'

/** V3 · Hora gigante (fondo de acento) */
export default function T3({ data, width, height, kind }) {
  const pal = makePalette(data.colores)
  const dp = dateParts(data)
  const hr = hourParts(data)
  const g = geometry(width, height, kind)
  const { W, H, sp, sb } = g

  const circle = g.wide ? 600 : g.story ? 440 : kind === 'portrait' ? 380 : 330
  const titleMax = g.wide ? 1000 : W - 112 - circle - 30

  const evSize = fitSize(data.evento, 64, titleMax, { upper: true })
  const nmSize = fitSize(data.nombre, 64, titleMax, { upper: true })
  const titleTop = 190 + sp
  const titleBottom = titleTop + (evSize + nmSize) * 1

  const bigMax = g.wide ? 1100 : 1000
  const bigSize = fitSize(hr.big, 340, bigMax, { weight: 900, letterSpacing: -12 })
  const subText = [hr.big ? 'HRS' : '', dp.shortUpper].filter(Boolean).join(' · ')
  const subSize = fitSize(subText, 90, bigMax - 20, { weight: 900, upper: true })

  /* Tarjeta blanca inferior */
  const cardH = 170 + (g.story ? 30 : 0)
  const cardW = W - 112
  const cardTop = H - 56 - sb - cardH
  const msgW = g.wide ? 520 : 330
  const leftW = cardW - 80 - msgW - 30
  const lugarSize = fitSize(data.lugar, 48, leftW, { weight: 900 })
  const dirSize = fitSize(data.direccion, 22, leftW, { weight: 500 })
  const msgSize = fitBlock(data.mensaje, { size: g.wide ? 34 : 28, maxWidth: msgW, maxHeight: cardH - 40, lineHeight: 1.2, weight: 800 })

  /* Grupo de la hora gigante, centrado entre el título y la tarjeta */
  const groupH = bigSize * 1 + subSize * 1 + 10
  const groupTop = g.wide ? titleBottom + 30 : titleBottom + (cardTop - titleBottom - groupH) / 2

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: FONT, background: pal.accent }}>
      <BrandPill data={data} pal={pal} style={{ left: 56, top: 52 + sp }} />

      <Photo
        img={data.fotos?.foto1}
        label="FOTO"
        pal={pal}
        fontSize={22}
        style={{ right: g.wide ? 120 : 56, top: g.wide ? 70 : 40 + sp, width: circle, height: circle, borderRadius: '50%', border: '10px solid #fff', boxSizing: 'border-box' }}
      />

      <Txt style={{ left: 56, top: titleTop, color: pal.primary, fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: evSize }}>{data.evento}</div>
        <div style={{ fontSize: nmSize }}>{data.nombre}</div>
      </Txt>

      {hr.big && (
        <Txt style={{ left: 40, top: groupTop, color: '#fff', fontWeight: 900, fontSize: bigSize, lineHeight: 1, letterSpacing: -12, whiteSpace: 'nowrap' }}>
          {hr.big}
        </Txt>
      )}
      <Txt style={{ left: 60, top: groupTop + (hr.big ? bigSize : 0) + 10, color: pal.primary, fontWeight: 900, fontSize: subSize, lineHeight: 1, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
        {subText}
      </Txt>

      <div style={{ position: 'absolute', left: 56, width: cardW, top: cardTop, height: cardH, background: '#fff', borderRadius: 32, padding: '0 40px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div style={{ width: leftW, flex: 'none' }}>
          <div style={{ color: pal.accentDark, fontWeight: 800, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase' }}>{data.rotuloLugar}</div>
          <div style={{ color: pal.primary, fontWeight: 900, fontSize: lugarSize, whiteSpace: 'nowrap', lineHeight: 1.15 }}>{data.lugar}</div>
          <div style={{ color: pal.primary, fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}>{data.direccion}</div>
        </div>
        <div style={{ width: msgW, flex: 'none', color: pal.primary, fontWeight: 800, fontSize: msgSize, textAlign: 'right', lineHeight: 1.2 }}>{data.mensaje}</div>
      </div>
    </div>
  )
}
