import { formatMoney } from '../shared'

/**
 * ExpoHaus — Vertical 1080×1350.
 * Mismo criterio que Square.jsx: el fondo trae todo el arte fijo, solo
 * se superponen la imagen del producto, el nombre, código y precios. 
 * Coordenadas a ojo, ajústalas contra el PNG real.
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

      {/* Imagen del producto */}
      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 500,
            top: 250,
            width: 520,
            height: 880, 
            objectFit: 'contain',
          }}
        />
      )}

      {/* Nombre del producto */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 350, // Ajustar según dónde caiga el espacio en el diseño vertical
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
          left: 60,
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
          left: 100,
          top: 630, // Ajustar relativo al nombre
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
          left: 80,
          top: 725,
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
          left: 350, // Aproximación para que quede a un lado o debajo del recuadro "Ahora"
          top: 865, 
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
          left: 80,
          top: 1300,
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