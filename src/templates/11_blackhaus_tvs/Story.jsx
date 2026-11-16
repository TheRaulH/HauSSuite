import { formatMoney } from '../shared'

/**
 * ExpoHaus — Story 1080×1920.
 *
 * OJO: a diferencia de los otros 3 formatos, /public/templates/expohaus/story.png
 * TODAVÍA es el fondo de placeholder genérico (no el diseño real de
 * ExpoHaus) — parece que falta agregar ese PNG. Mientras tanto, esta
 * plantilla dibuja el precio con un recuadro propio en vez de superponerlo
 * sobre un "Ahora" ya dibujado (porque ese fondo no lo tiene). En cuanto
 * subas el PNG real, lo más probable es que tengas que:
 *   1) reemplazar /public/templates/expohaus/story.png
 *   2) quitar el recuadro de precio dibujado acá abajo y superponer el
 *      texto sobre el que ya venga en el fondo, igual que en Square.jsx
 */
export default function Story({ product, image }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <img
        src="/templates/expohaus/story.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 290,
            top: 400,
            width: 500,
            height: 750,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Recuadro de precio dibujado en código (fondo temporal sin "Ahora" propio) */}
      <div
        style={{
          position: 'absolute',
          left: 290,
          top: 1200,
          width: 500,
          height: 140,
          borderRadius: 24,
          backgroundColor: '#F26522',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 54,
          fontWeight: 900,
          color: '#ffffff',
        }}
      >
        Bs. {formatMoney(product?.precio)}
      </div>
    </div>
  )
}
