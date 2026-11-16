import { useState } from 'react'
import { OUR_RETAIL } from './calculations'

/**
 * Los logos se leen de la carpeta pública `retails/` (ruta relativa a la página, así
 * funciona aunque la app se sirva desde una subcarpeta):
 *   public/retails/camsa.png, dismac.png, hauscenter.png, multicenter.png, roho.png, tienda-amiga.png
 * El nombre es el del retail en minúsculas, sin tildes y con guiones. Si falta el archivo,
 * se muestra un círculo con las iniciales.
 */
export const LOGOS_DIR = 'retails'
export const LOGO_EXT = 'png'

export const retailSlug = (name) =>
  String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function initials(name) {
  const words = String(name).trim().split(/\s+/)
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase()
}

// Logos que ya sabemos que no existen, para no repetir el pedido en cada gráfico
const missing = new Set()

export default function RetailLogo({ name, size = 26 }) {
  const [, force] = useState(0)
  const us = name === OUR_RETAIL
  const slug = retailSlug(name)

  if (!missing.has(slug)) {
    return (
      <img
        src={`${LOGOS_DIR}/${slug}.${LOGO_EXT}`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => {
          missing.add(slug)
          force((n) => n + 1)
        }}
        className="rounded-md bg-white object-contain ring-1 ring-gray-200 p-0.5 shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={`rounded-md flex items-center justify-center font-bold shrink-0 ${us ? 'bg-haus-blue text-white' : 'bg-haus-sky text-haus-blue'}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  )
}
