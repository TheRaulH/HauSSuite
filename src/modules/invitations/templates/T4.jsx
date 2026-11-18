import { fitBlock, fitSize } from '../textMetrics'
import { BrandPill, FONT, Photo, Txt, clamp, dateParts, geometry, hourParts, makePalette } from './shared'

/** V4 · Personas y productos */
export default function T4({ data, width, height, kind }) {
  const pal = makePalette(data.colores)
  const dp = dateParts(data)
  const hr = hourParts(data)
  const g = geometry(width, height, kind)
  const { W, H, sp, sb } = g

  const k = g.story ? 1.15 : kind === 'portrait' ? 1.05 : 1
  const barH = (g.story ? 250 : 200) + sb
  const barTop = H - barH

  /* ── Zona superior ── */
  const photoW = g.wide ? 500 : 440
  const photoLeft = W - 56 - photoW
  const leftMax = photoLeft - 56 - 24
  const evSize = fitSize(data.evento, 64, leftMax, { upper: true })
  const nmSize = fitSize(data.nombre, g.wide ? 230 : 190, leftMax, { upper: true })
  const evTop = 150 + sp
  const nmTop = evTop + evSize * 1.0 + 0
  const msgTop = nmTop + nmSize * 1.05 + 14

  // productos: fila inferior (en horizontal, a lo ancho de la columna izquierda)
  const tileH = g.wide ? 270 : clamp(240 + (H - 1080) * 0.25, 240, 380)
  const productsTop = barTop - 40 - tileH
  const photoTop = 56 + sp
  const photoH = g.wide ? productsTop + tileH - photoTop : productsTop - 40 - photoTop

  const msgMax = g.wide ? 760 : 440
  const msgSize = fitBlock(data.mensaje, { size: g.wide ? 38 : 30, maxWidth: msgMax, maxHeight: Math.max(60, productsTop - 20 - msgTop), lineHeight: 1.3, weight: 600 })

  /* ── Barra inferior ── */
  const gap = 40
  const innerW = W - 112
  const rightW = Math.round(innerW * 0.42)
  const leftW = innerW - rightW - gap
  const lugarSize = fitSize(data.lugar, 42 * k, leftW, { weight: 900 })
  const dirSize = fitSize(data.direccion, 20 * k, leftW, { weight: 500 })
  const fechaSize = fitSize(dp.long, 42 * k, rightW, { weight: 900 })
  const horaSize = fitSize(hr.range, 30 * k, rightW, { weight: 700 })
  const rot = { color: pal.accentLight, fontWeight: 700, fontSize: 20 * k, letterSpacing: 3, textTransform: 'uppercase' }

  const productSlots = ['foto2', 'foto3', 'foto4']
  const tilesLeft = 56
  const tilesWidth = g.wide ? photoLeft - 56 - 40 : W - 112
  const tileGap = 20
  const tileW = (tilesWidth - tileGap * 2) / 3

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: FONT, background: pal.bgSoft }}>
      <BrandPill data={data} pal={pal} style={{ left: 56, top: 52 + sp }} />

      <Photo
        img={data.fotos?.foto1}
        label={'FOTO DE\nPERSONAS'}
        pal={pal}
        style={{ left: photoLeft, top: photoTop, width: photoW, height: photoH, borderRadius: 36 }}
      />

      <Txt style={{ left: 56, top: evTop, color: pal.primary, fontWeight: 900, fontSize: evSize, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {data.evento}
      </Txt>
      <Txt style={{ left: 50, top: nmTop, color: pal.accent, fontWeight: 900, fontSize: nmSize, lineHeight: 1.05, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {data.nombre}
      </Txt>
      <Txt style={{ left: 56, top: msgTop, width: msgMax, color: pal.primary, fontWeight: 600, fontSize: msgSize, lineHeight: 1.3 }}>
        {data.mensaje}
      </Txt>

      {productSlots.map((slot, i) => (
        <Photo
          key={slot}
          img={data.fotos?.[slot]}
          label={`FOTO PRODUCTO ${i + 1}`}
          pal={pal}
          fit="contain"
          fontSize={20}
          style={{ left: tilesLeft + i * (tileW + tileGap), top: productsTop, width: tileW, height: tileH, borderRadius: 28, background: '#fff' }}
        />
      ))}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: barH, background: pal.primary, color: '#fff', display: 'flex', alignItems: 'center', gap, padding: `0 56px ${sb}px`, boxSizing: 'border-box' }}>
        <div style={{ width: leftW, flex: 'none' }}>
          <div style={rot}>{data.rotuloLugar}</div>
          <div style={{ fontWeight: 900, fontSize: lugarSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{data.lugar}</div>
          <div style={{ fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}>{data.direccion}</div>
        </div>
        <div style={{ width: rightW, flex: 'none' }}>
          <div style={rot}>{data.rotuloFecha}</div>
          <div style={{ fontWeight: 900, fontSize: fechaSize, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{dp.long}</div>
          <div style={{ fontWeight: 700, fontSize: horaSize, color: pal.accentSoft, whiteSpace: 'nowrap' }}>{hr.range}</div>
        </div>
      </div>
    </div>
  )
}
