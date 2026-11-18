import { fitSize } from '../textMetrics'
import { BrandPill, FONT, Photo, Txt, dateParts, geometry, hourParts, makePalette } from './shared'

/** V5 · Foto grande de contexto */
export default function T5({ data, width, height, kind }) {
  const pal = makePalette(data.colores)
  const dp = dateParts(data)
  const hr = hourParts(data)
  const g = geometry(width, height, kind)
  const { W, H, sp, sb } = g

  const badge = 210
  const root = { width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: FONT, background: pal.primary }

  const dayBadge = (left, top) => (
    <div
      style={{
        position: 'absolute', left, top, width: badge, height: badge, borderRadius: '50%', background: pal.accent,
        border: `8px solid ${pal.primary}`, boxSizing: 'border-box', color: '#fff', fontWeight: 900, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase',
      }}
    >
      <div style={{ fontSize: fitSize(dp.dayBig, 88, 150, { weight: 900 }), lineHeight: 0.9 }}>{dp.dayBig}</div>
      <div style={{ fontSize: fitSize(dp.monthShort, 30, 150, { weight: 900, letterSpacing: 2 }), letterSpacing: 2 }}>{dp.monthShort}</div>
    </div>
  )

  /* ───────── Horizontal: foto a la izquierda, panel azul a la derecha ───────── */
  if (g.wide) {
    const panelLeft = 1000
    const panelW = W - panelLeft
    const innerL = panelLeft + 90
    const innerW = W - innerL - 70
    const evSize = fitSize(data.evento, 64, innerW, { upper: true })
    const nmSize = fitSize(data.nombre, 220, innerW, { upper: true })
    const lugarSize = fitSize(data.lugar, 44, innerW, { weight: 900 })
    const dirSize = fitSize(data.direccion, 22, innerW, { weight: 500 })
    const hourSize = fitSize(hr.range, 44, innerW - 40, { weight: 900 })
    const fechaSize = fitSize(dp.long, 24, innerW - 40, { weight: 500 })
    const rot = { color: pal.accentLight, fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }
    return (
      <div style={root}>
        <Photo img={data.fotos?.foto1} label={'FOTO GRANDE DE CONTEXTO\n(tienda / activación)'} pal={pal} fontSize={30} style={{ left: 0, top: 0, width: panelLeft + 80, height: H }} />
        <div style={{ position: 'absolute', left: panelLeft, top: 0, width: panelW, height: H, background: pal.primary, borderRadius: '70px 0 0 70px' }} />
        <BrandPill data={data} pal={pal} style={{ left: 56, top: 52 }} />
        {dayBadge(panelLeft - badge / 2, 90)}
        <Txt style={{ left: innerL, top: 330, color: '#fff', fontWeight: 900, fontSize: evSize, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.evento}</Txt>
        <Txt style={{ left: innerL - 6, top: 330 + evSize + 6, color: pal.accentBright, fontWeight: 900, fontSize: nmSize, lineHeight: 1.05, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.nombre}</Txt>
        <div style={{ position: 'absolute', left: innerL, top: 330 + evSize + nmSize * 1.05 + 70, width: innerW, color: '#fff' }}>
          <div style={rot}>{data.rotuloLugar}</div>
          <div style={{ fontWeight: 900, fontSize: lugarSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{data.lugar}</div>
          <div style={{ fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}>{data.direccion}</div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 26, marginTop: 28 }}>
            <div style={{ width: 4, background: pal.accent, flex: 'none' }} />
            <div>
              <div style={rot}>{data.rotuloHora}</div>
              <div style={{ fontWeight: 900, fontSize: hourSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{hr.range}</div>
              <div style={{ fontWeight: 500, fontSize: fechaSize, whiteSpace: 'nowrap' }}>{dp.long}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ───────── Vertical (cuadrado / 4:5 / story) ───────── */
  const extra = H - 1080
  const photoH = 600 + extra * 0.55 + sp * 0.4
  const panelTop = photoH - 80
  const innerW = W - 112
  const evSize = fitSize(data.evento, 60, innerW, { upper: true })
  const nmSize = fitSize(data.nombre, clamp0(200 + extra * 0.12, 200, 300), innerW + 6, { upper: true })
  const k = g.story ? 1.15 : 1
  const gap = 30
  const leftW = Math.round(innerW * 0.58)
  const rightW = innerW - leftW - gap * 2 - 4
  const lugarSize = fitSize(data.lugar, 40 * k, leftW, { weight: 900 })
  const dirSize = fitSize(data.direccion, 20 * k, leftW, { weight: 500 })
  const hourSize = fitSize(hr.range, 40 * k, rightW, { weight: 900 })
  const fechaSize = fitSize(dp.long, 20 * k, rightW, { weight: 500 })
  const rot = { color: pal.accentLight, fontWeight: 700, fontSize: 20 * k, letterSpacing: 3, textTransform: 'uppercase' }

  const evTop = panelTop + 80
  const nmTop = evTop + evSize + (g.story ? 10 : 0)
  const rowBottom = 50 + sb

  return (
    <div style={root}>
      <Photo img={data.fotos?.foto1} label={'FOTO GRANDE DE CONTEXTO\n(tienda / activación)'} pal={pal} fontSize={30} style={{ left: 0, right: 0, top: 0, height: photoH }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: panelTop, bottom: 0, background: pal.primary, borderRadius: '70px 70px 0 0' }} />
      <BrandPill data={data} pal={pal} style={{ left: 56, top: 52 + sp }} />
      {dayBadge(W - 70 - badge, panelTop - 90)}

      <Txt style={{ left: 56, top: evTop, color: '#fff', fontWeight: 900, fontSize: evSize, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.evento}</Txt>
      <Txt style={{ left: 50, top: nmTop, color: pal.accentBright, fontWeight: 900, fontSize: nmSize, lineHeight: 1.05, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.nombre}</Txt>

      <div style={{ position: 'absolute', left: 56, right: 56, bottom: rowBottom, display: 'flex', color: '#fff', gap }}>
        <div style={{ width: leftW, flex: 'none', paddingRight: gap, borderRight: `4px solid ${pal.accent}`, boxSizing: 'content-box' }}>
          <div style={rot}>{data.rotuloLugar}</div>
          <div style={{ fontWeight: 900, fontSize: lugarSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{data.lugar}</div>
          <div style={{ fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}>{data.direccion}</div>
        </div>
        <div style={{ width: rightW, flex: 'none' }}>
          <div style={rot}>{data.rotuloHora}</div>
          <div style={{ fontWeight: 900, fontSize: hourSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{hr.range}</div>
          <div style={{ fontWeight: 500, fontSize: fechaSize, whiteSpace: 'nowrap' }}>{dp.long}</div>
        </div>
      </div>
    </div>
  )
}

function clamp0(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
