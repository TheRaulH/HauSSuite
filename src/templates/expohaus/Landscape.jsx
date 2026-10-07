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

      {/* Imagen del producto */}
      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 600,
            top: 120,
            width: 700,
            height: 800,   
            objectFit: 'contain',
          }}
        />
      )}

      {/* Nombre del producto */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 350, 
          width: 450,
          height: 115,
          fontSize: 55,
          fontWeight: 700, 
          color: '#123b64',
          lineHeight: 1, 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {product?.nombre}
      </div>

      {/* Código del producto */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 490, // Ajustar relativo al nombre
          width: 450,
          fontSize: 35,
          fontWeight: 400,
          color: '#123b64',
          lineHeight: 1,
        }}
      >
        {product?.codigo}
      </div>

      {/* Precio antes tachado del producto */}
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 580, // Ajustar relativo al nombre
          width: 450,
          fontSize: 40,
          fontWeight: 400,
          color: '#123b64',
          lineHeight: 1, 
          textDecoration: 'line-through',
        }}
      >
        Antes: Bs. {formatMoney(product.precioAntes)}
      </div>

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 180,
          top: 680,
          width: 450,
          fontSize: 85,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        Bs. {formatMoney(product?.precio)}
      </div>

      {/* Precio cuotas */}
      <div
        style={{
          position: 'absolute',
          left: 460, // Aproximación para que quede a un lado o debajo del recuadro "Ahora"
          top: 820, 
          width: 450,
          fontSize: 25,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        Bs. {formatMoney(product?.cuotas)}
      </div>
      {/* tag pequeno */}
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 885,
          width: 500,
          fontSize: 20,
          fontWeight: 400,
          color: '#123b64',
          lineHeight: 1,
        }}
      >
        *Precion sujeto a variación
      </div>
    </div>
  )
}
