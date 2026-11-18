import { format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const FONT = "'Montserrat', Arial, sans-serif"

/* ───────────── Colores ───────────── */

export function mix(hex, other, t) {
  const parse = (h) => {
    const n = parseInt(h.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const a = parse(hex)
  const b = parse(other)
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}

/** Todos los tonos de la plantilla salen de DOS colores: principal y acento. */
export function makePalette({ primary = '#123B64', accent = '#E76100' } = {}) {
  return {
    primary,
    accent,
    accentLight: mix(accent, '#ffffff', 0.45),
    accentSoft: mix(accent, '#ffffff', 0.25),
    accentBright: mix(accent, '#ffffff', 0.12),
    accentDark: mix(accent, '#000000', 0.2),
    bgSoft: mix(primary, '#ffffff', 0.9),
    bgDeep: mix(primary, '#000000', 0.55),
    primaryBright: mix(primary, '#ffffff', 0.2),
    stripeA: '#c9d3e4',
    stripeB: '#d6deec',
  }
}

/** "#E76100" + 0.35 → "rgba(231,97,0,0.35)". */
export function alpha(hex, a) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/* ───────────── Fecha y hora ───────────── */

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * A partir de la fecha elegida (y la fecha final opcional) arma todas las formas
 * en que las plantillas muestran la fecha: "14", "NOVIEMBRE", "14 NOV", "14 de noviembre"…
 */
export function dateParts({ fecha, fechaFin }) {
  const start = parseISO(fecha || '')
  if (!isValid(start)) return { dayBig: '', monthLong: '', monthShort: '', long: '', shortUpper: '' }

  const end = fechaFin ? parseISO(fechaFin) : null
  const hasRange = end && isValid(end) && end > start

  const day = (d) => format(d, 'd')
  const monthLongOf = (d) => format(d, 'LLLL', { locale: es })
  const monthShortOf = (d) => format(d, 'LLL', { locale: es }).replace('.', '').toUpperCase()

  if (!hasRange) {
    return {
      dayBig: day(start),
      monthLong: monthLongOf(start).toUpperCase(),
      monthShort: monthShortOf(start),
      long: `${day(start)} de ${monthLongOf(start)}`,
      shortUpper: `${day(start)} ${monthShortOf(start)}`,
    }
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    return {
      dayBig: `${day(start)}–${day(end)}`,
      monthLong: monthLongOf(start).toUpperCase(),
      monthShort: monthShortOf(start),
      long: `${day(start)} al ${day(end)} de ${monthLongOf(start)}`,
      shortUpper: `${day(start)}–${day(end)} ${monthShortOf(start)}`,
    }
  }
  return {
    dayBig: `${day(start)}–${day(end)}`,
    monthLong: `${monthShortOf(start)}–${monthShortOf(end)}`,
    monthShort: `${monthShortOf(start)}–${monthShortOf(end)}`,
    long: `${day(start)} de ${monthLongOf(start)} al ${day(end)} de ${monthLongOf(end)}`,
    shortUpper: `${day(start)} ${monthShortOf(start)}–${day(end)} ${monthShortOf(end)}`,
  }
}

/** "15" + "20" → "15 a 20 hrs" y "15–20". */
export function hourParts({ horaInicio, horaFin }) {
  const a = (horaInicio ?? '').trim()
  const b = (horaFin ?? '').trim()
  if (!a && !b) return { range: '', big: '' }
  if (a && b) return { range: `${a} a ${b} hrs`, big: `${a}–${b}` }
  const one = a || b
  return { range: `${one} hrs`, big: one }
}

export { cap }

/* ───────────── Piezas visuales compartidas ───────────── */

/** Zona segura de Historias: arriba y abajo hay barras de la app que tapan contenido. */
export function geometry(width, height, kind) {
  const story = kind === 'story'
  return { W: width, H: height, story, sp: story ? 130 : 0, sb: story ? 110 : 0, wide: kind === 'landscape' }
}

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

/** Texto posicionado de forma absoluta. */
export function Txt({ children, style }) {
  return <div style={{ position: 'absolute', whiteSpace: 'pre-wrap', ...style }}>{children}</div>
}

/** Marca de Hauscenter: texto en "pastilla" o, si se sube un logo, el logo. */
export function BrandPill({ data, pal, style, invert = false, size = 34 }) {
  const logo = data.fotos?.logo
  if (logo?.src) {
    return (
      <div style={{ position: 'absolute', ...style }}>
        <img
          src={logo.src}
          alt=""
          draggable={false}
          style={{ display: 'block', height: size * 2.6, maxWidth: size * 14, objectFit: 'contain', objectPosition: 'left center' }}
        />
      </div>
    )
  }
  return (
    <div
      style={{
        position: 'absolute',
        background: invert ? '#fff' : pal.primary,
        color: invert ? pal.primary : '#fff',
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 1,
        padding: `${size * 0.41}px ${size}px`,
        borderRadius: '16px 16px 16px 4px',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {data.marca}
    </div>
  )
}

/**
 * Foto editable. Si no hay imagen muestra el rayado de la plantilla original
 * (en la exportación conviene no dejarlo vacío).
 * `fit`: 'cover' (rellena el marco) o 'contain' (producto completo, sin recortar).
 */
export function Photo({ img, label, pal, style, fit = 'cover', fontSize = 24 }) {
  const has = Boolean(img?.src)
  const zoom = img?.zoom ?? 1
  const x = img?.x ?? 50
  const y = img?.y ?? 50

  return (
    <div style={{ position: 'absolute', overflow: 'hidden', ...style }}>
      {has ? (
        <img
          src={img.src}
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: fit,
            objectPosition: `${x}% ${y}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${x}% ${y}%`,
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `repeating-linear-gradient(135deg,${pal.stripeA} 0 18px,${pal.stripeB} 18px 36px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: pal.primary,
            fontWeight: 700,
            fontSize,
            letterSpacing: 2,
            textAlign: 'center',
            padding: 16,
            boxSizing: 'border-box',
            whiteSpace: 'pre-line',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
