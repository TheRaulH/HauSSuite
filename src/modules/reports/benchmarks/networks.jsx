import { Layers } from 'lucide-react'

/** Glifos simples de cada red (dibujados a mano, sin depender de la versión de lucide). */
function FacebookGlyph({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 21v-8.2h2.8l.45-3.4H14V7.3c0-1 .3-1.7 1.7-1.7h1.7V2.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.6H7.9v3.4h2.8V21H14z" />
    </svg>
  )
}

function InstagramGlyph({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokGlyph({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 3v11.2a3.7 3.7 0 1 1-3.7-3.7" />
      <path d="M14.5 3c.3 2.4 1.9 4.1 4.5 4.3" />
    </svg>
  )
}

/**
 * Identidad visual de cada red: `color` es el tono fuerte (Hauscenter y segmentos del acumulado),
 * `tint` el tono suave para el resto de retails.
 */
export const NETWORKS = {
  facebook: { id: 'facebook', label: 'Facebook', color: '#3B6FD4', tint: '#C7D6F2', background: '#3B6FD4', Glyph: FacebookGlyph },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    color: '#D6428B',
    tint: '#F0C9DC',
    background: 'linear-gradient(45deg, #F9A03F 0%, #E1306C 55%, #8F3FBF 100%)',
    Glyph: InstagramGlyph,
  },
  tiktok: { id: 'tiktok', label: 'TikTok', color: '#1E2A38', tint: '#BCC4CD', background: '#111827', Glyph: TikTokGlyph },
}

export const NETWORK_LIST = [NETWORKS.facebook, NETWORKS.instagram, NETWORKS.tiktok]

/** Icono de red dentro de un círculo de su color. */
export function NetworkIcon({ id, size = 16 }) {
  const { Glyph } = NETWORKS[id]
  return <Glyph size={size} />
}

/** Insignia redonda para el encabezado de cada tarjeta. `total` usa el azul de marca. */
export function NetworkBadge({ id, size = 36 }) {
  const net = NETWORKS[id]
  return (
    <span
      className="rounded-full flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size, background: net ? net.background : '#123B64' }}
      aria-hidden
    >
      {net ? <NetworkIcon id={id} size={size * 0.5} /> : <Layers size={size * 0.5} />}
    </span>
  )
}
