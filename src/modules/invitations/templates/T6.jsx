import { fitBlock, fitSize } from '../textMetrics'
import { BrandPill, FONT, Photo, Txt, alpha, dateParts, geometry, hourParts, makePalette, mix } from './shared'

const iconProps = { width: 46, height: 46, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { flex: 'none' } }

function Pin({ color }) {
  return (
    <svg {...iconProps} stroke={color}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
function Clock({ color }) {
  return (
    <svg {...iconProps} stroke={color}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
function Calendar({ color }) {
  return (
    <svg {...iconProps} stroke={color}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  )
}

/** V6 · Completo (degradado, círculos, producto y tarjetas de información) */
export default function T6({ data, width, height, kind }) {
  const pal = makePalette(data.colores)
  const dp = dateParts(data)
  const hr = hourParts(data)
  const g = geometry(width, height, kind)
  const { W, H, sp, sb } = g

  const cardH = 128
  const cardGap = 18
  const k = g.story ? 1.1 : 1
  const accentGrad = `linear-gradient(135deg,${mix(pal.accent, '#ffffff', 0.2)},${mix(pal.accent, '#000000', 0.15)})`

  const circle = g.wide ? 560 : 320
  const circleRight = g.wide ? 140 : 56
  const circleTop = g.wide ? 80 : 96 + sp
  const circleLeft = W - circleRight - circle

  // el título nunca debe quedar debajo del círculo de la foto (el nombre grande puede rozarlo, como en el diseño original)
  const leftMax = circleLeft - 56 - (g.wide ? 24 : 6)
  const nameMax = g.wide ? leftMax : leftMax + 36
  const preSize = fitSize(data.pretitulo, 30, leftMax, { weight: 800, letterSpacing: 6, upper: true })
  const evSize = fitSize(data.evento, g.wide ? 96 : 78, leftMax, { upper: true })
  const nmSize = fitSize(data.nombre, g.wide ? 270 : 210, nameMax, { upper: true })
  const evTop = 200 + sp
  const nmTop = evTop + evSize * 1.0 - (g.wide ? 0 : 0) + 0
  const nmBottom = nmTop + nmSize * 1.05
  const msgTop = nmBottom + 12

  /* Tarjetas de información */
  const innerW = W - 112
  const rowW = g.wide ? innerW : innerW
  const lugarW = g.wide ? Math.round((innerW - cardGap * 2) * 0.4) : innerW
  const horaW = g.wide ? Math.round((innerW - cardGap * 2) * 0.27) : Math.round((innerW - cardGap) * 0.465)
  const fechaW = g.wide ? innerW - cardGap * 2 - lugarW - horaW : innerW - cardGap - horaW
  const textW = (w) => w - 60 - 46 - 22
  const lugarSize = fitSize(data.lugar, 40 * k, textW(lugarW), { weight: 900 })
  const dirSize = fitSize(data.direccion, 20 * k, textW(lugarW), { weight: 500 })
  const horaSize = fitSize(hr.range, 40 * k, textW(horaW), { weight: 900 })
  const fechaSize = fitSize(dp.long, 40 * k, textW(fechaW), { weight: 900 })

  const stackH = g.wide ? cardH : cardH * 2 + cardGap
  const cardsTop = H - 56 - sb - stackH
  const msgMax = g.wide ? 760 : 520
  const msgSize = fitBlock(data.mensaje, { size: g.wide ? 38 : 30, maxWidth: msgMax, maxHeight: 140, lineHeight: 1.3, weight: 600 })
  const msgLines = Math.max(1, Math.ceil((data.mensaje || '').length / 28))
  const msgBottom = msgTop + Math.min(140, msgLines * msgSize * 1.3)

  const bigProduct = !g.wide && cardsTop - 30 - (msgBottom + 30) >= 200
  const prodTop = msgBottom + 30
  const productStyle = g.wide
    ? { right: 56, top: 620, width: 420, height: 230 }
    : bigProduct
      ? { left: 56, right: 56, top: prodTop, height: cardsTop - 30 - prodTop }
      : { right: 30, top: 400 + sp, width: 260, height: 150 }

  const card = { display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.28)', borderRadius: 28, padding: '0 30px', height: cardH, boxSizing: 'border-box', color: '#fff' }

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: FONT, background: `linear-gradient(160deg,${pal.primaryBright} 0%,${pal.primary} 50%,${pal.bgDeep} 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.14) 2.5px,transparent 3px)', backgroundSize: '34px 34px' }} />
      <div style={{ position: 'absolute', right: g.wide ? -220 : -150, top: g.wide ? -220 : -150, width: g.wide ? 700 : 520, height: g.wide ? 700 : 520, borderRadius: '50%', background: accentGrad, opacity: 0.9 }} />
      <div style={{ position: 'absolute', left: -120, bottom: g.wide ? 260 : cardsTop - 20, width: 300, height: 300, borderRadius: '50%', border: `34px solid ${alpha(pal.accent, 0.35)}` }} />
      <div style={{ position: 'absolute', left: 0, top: nmTop + nmSize * 0.89, width: W, height: 8, background: `linear-gradient(90deg,${pal.accent},${alpha(pal.accent, 0)})` }} />

      <BrandPill data={data} pal={pal} invert style={{ left: 56, top: 52 + sp }} />

      <Txt style={{ left: 56, top: 150 + sp, color: pal.accentLight, fontWeight: 800, fontSize: preSize, letterSpacing: 6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.pretitulo}</Txt>
      <Txt style={{ left: 56, top: evTop, color: '#fff', fontWeight: 900, fontSize: evSize, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{data.evento}</Txt>
      <Txt
        style={{
          left: 50, top: nmTop, fontWeight: 900, fontSize: nmSize, lineHeight: 1.05, textTransform: 'uppercase', whiteSpace: 'nowrap',
          background: `linear-gradient(90deg,${mix(pal.accent, '#ffffff', 0.35)},${pal.accent})`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent',
          paddingRight: 8,
        }}
      >
        {data.nombre}
      </Txt>

      <Photo
        img={data.fotos?.foto1}
        label="FOTO"
        pal={pal}
        fontSize={22}
        style={{ right: circleRight, top: circleTop, width: circle, height: circle, borderRadius: '50%', border: `${g.wide ? 14 : 12}px solid #fff`, boxSizing: 'border-box' }}
      />

      <Txt style={{ left: 56, top: msgTop, width: msgMax, color: '#fff', fontWeight: 600, fontSize: msgSize, lineHeight: 1.3 }}>{data.mensaje}</Txt>

      <Photo
        img={data.fotos?.foto2}
        label="PRODUCTO"
        pal={pal}
        fit="contain"
        fontSize={bigProduct || g.wide ? 28 : 18}
        style={{ ...productStyle, borderRadius: bigProduct || g.wide ? 36 : 24, background: '#fff', boxShadow: '0 14px 30px rgba(0,0,0,.35)' }}
      />

      {/* Tarjetas: dónde / hora / fecha */}
      <div style={{ position: 'absolute', left: 56, width: rowW, top: cardsTop, display: 'flex', flexDirection: g.wide ? 'row' : 'column', gap: cardGap }}>
        <div style={{ ...card, width: g.wide ? lugarW : '100%', flex: 'none' }}>
          <Pin color={pal.accentSoft} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: lugarSize, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{data.lugar}</div>
            <div style={{ fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}>{data.direccion}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: cardGap, ...(g.wide ? { display: 'contents' } : {}) }}>
          <div style={{ ...card, width: horaW, flex: 'none' }}>
            <Clock color={pal.accentSoft} />
            <div style={{ fontWeight: 900, fontSize: horaSize, whiteSpace: 'nowrap' }}>{hr.range}</div>
          </div>
          <div style={{ ...card, width: fechaW, flex: 'none' }}>
            <Calendar color={pal.accentSoft} />
            <div style={{ fontWeight: 900, fontSize: fechaSize, whiteSpace: 'nowrap' }}>{dp.long}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

