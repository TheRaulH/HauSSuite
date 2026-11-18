import { fitBlock, fitSize } from '../textMetrics'
import { BrandPill, FONT, Photo, Txt, clamp, dateParts, geometry, hourParts, makePalette } from './shared'

/** V2 · Pase oscuro (fondo azul con tarjetas blancas) */
export default function T2({ data, width, height, kind }) {
  const pal = makePalette(data.colores)
  const dp = dateParts(data)
  const hr = hourParts(data)
  const g = geometry(width, height, kind)
  const { W, H, sp, sb } = g

  const leftW = g.wide ? 968 : W - 112
  const preSize = fitSize(data.pretitulo, 34, leftW, { weight: 800, letterSpacing: 6, upper: true })
  const evSize = fitSize(data.evento, 150, leftW + 8, { upper: true })
  const nmSize = fitSize(data.nombre, 150, leftW + 8, { upper: true })

  /* Tres tarjetas inferiores con anchos exactos (proporciones 1.3 / 1 / .9) */
  const cardsH = 240 + (g.story ? 30 : 0)
  const gap = 20
  const total = leftW - gap * 2
  const wA = Math.round((total * 1.3) / 3.2)
  const wB = Math.round((total * 1) / 3.2)
  const wC = total - wA - wB
  const inner = (w) => w - 56
  const k = g.story ? 1.1 : 1

  // cada texto baja de tamaño hasta entrar completo en su tarjeta (aunque sea muy largo)
  const lugarSize = fitBlock(data.lugar, { size: 44 * k, maxWidth: inner(wA), maxHeight: 84, lineHeight: 1.05, weight: 900 })
  const dirSize = fitBlock(data.direccion, { size: 20 * k, maxWidth: inner(wA), maxHeight: 52, lineHeight: 1.25, weight: 500 })
  const fechaSize = fitBlock(dp.long, { size: 44 * k, maxWidth: inner(wB), maxHeight: 130, lineHeight: 1.05, weight: 900 })
  const horaSize = fitBlock(hr.range, { size: 56 * k, maxWidth: inner(wC), maxHeight: 130, lineHeight: 1, weight: 900 })

  const titleTop = 214 + sp
  const titleBottom = titleTop + (evSize + nmSize) * 0.95
  const cardsTop = H - 56 - sb - cardsH

  const label = (color) => ({ color, fontWeight: 800, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase' })

  const cards = (
    <div style={{ position: 'absolute', left: 56, width: leftW, bottom: 56 + sb, height: cardsH, display: 'flex', gap }}>
      <div style={{ width: wA, background: '#fff', borderRadius: 28, padding: 28, boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={label(pal.accentDark)}>{data.rotuloLugar}</div>
        <div style={{ color: pal.primary, fontWeight: 900, fontSize: lugarSize, lineHeight: 1.05, marginTop: 8 }}>{data.lugar}</div>
        <div style={{ color: pal.primary, fontWeight: 500, fontSize: dirSize, marginTop: 6, lineHeight: 1.25 }}>{data.direccion}</div>
      </div>
      <div style={{ width: wB, background: '#fff', borderRadius: 28, padding: 28, boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={label(pal.accentDark)}>{data.rotuloFecha}</div>
        <div style={{ color: pal.primary, fontWeight: 900, fontSize: fechaSize, lineHeight: 1.05, marginTop: 8 }}>{dp.long}</div>
      </div>
      <div style={{ width: wC, background: pal.accent, borderRadius: 28, padding: 28, boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={label(pal.primary)}>{data.rotuloHora}</div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: horaSize, lineHeight: 1, marginTop: 8 }}>{hr.range}</div>
      </div>
    </div>
  )

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: FONT, background: pal.primary }}>
      <BrandPill data={data} pal={pal} invert style={{ left: 56, top: 52 + sp }} />

      <Txt style={{ left: 56, top: 170 + sp, color: pal.accentSoft, fontWeight: 800, fontSize: preSize, letterSpacing: 6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {data.pretitulo}
      </Txt>
      <Txt style={{ left: 52, top: titleTop, fontWeight: 900, lineHeight: 0.95, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        <div style={{ color: '#fff', fontSize: evSize }}>{data.evento}</div>
        <div style={{ color: pal.accentBright, fontSize: nmSize }}>{data.nombre}</div>
      </Txt>

      {g.wide ? (
        <Photo
          img={data.fotos?.foto1}
          label={'FOTO DE LA\nACTIVACIÓN'}
          pal={pal}
          style={{ left: 1080, right: 56, top: 56, bottom: 56, borderRadius: 36 }}
        />
      ) : (
        <Photo
          img={data.fotos?.foto1}
          label="FOTO DE LA ACTIVACIÓN"
          pal={pal}
          style={{ left: 56, right: 56, top: titleBottom + 40, height: clamp(cardsTop - 40 - (titleBottom + 40), 180, 900), borderRadius: 36 }}
        />
      )}
      {cards}
    </div>
  )
}
