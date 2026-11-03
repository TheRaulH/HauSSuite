import { formatMoney } from '../shared'

/**
 * ExpoHaus — Vertical 1080×1350.
 * Mismo criterio que Square.jsx: el fondo trae todo el arte fijo, solo
 * se superponen la imagen del producto y el precio. Coordenadas a ojo,
 * ajústalas contra el PNG real.
 */
export default function Portrait({ product, image }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <img
        src="/templates/expohaus/vertical.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 140,
            top: 170,
            width: 800,
            height: 400,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 655,
          width: 330,
          fontSize: 54,
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
