import { formatMoney } from '../shared'

/**
 * ExpoHaus — Horizontal 1920×1080.
 * Mismo criterio que Square.jsx. La imagen del producto va en el área
 * celeste libre (evitando el logo arriba-izq, el "10% OFF" a la derecha,
 * y el recuadro "Ahora" abajo-izq). Coordenadas a ojo, ajústalas contra
 * el PNG real.
 */
export default function Landscape({ product, image }) {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <img
        src="/templates/expohaus/horizontal.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 530,
            top: 150,
            width: 420,
            height: 300,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 145,
          top: 505,
          width: 330,
          fontSize: 50,
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        Bs. {formatMoney(product?.precio)}
      </div>
    </div>
  )
}
