import { formatMoney } from '../shared'

/**
 * ExpoHaus — Cuadrado 1080×1080.
 *
 * El fondo (public/templates/expohaus/cuadrado.png) ya trae dibujado todo
 * el arte fijo del día: logo, el "10% OFF", la barra "CrediHaus | 11
 * cuotas" y el banner de condición de abajo. Lo ÚNICO que se superpone
 * dinámicamente por producto es:
 *   1) la imagen del producto (zona celeste vacía, debajo del logo)
 *   2) el precio, dentro del recuadro naranja vacío "Ahora"
 *
 * Las coordenadas de abajo son una primera aproximación a ojo comparando
 * con el PNG — ajústalas si no calzan exacto con tu diseño real.
 */
export default function Square({ product, image }) {
  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <img
        src="/templates/expohaus/cuadrado.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 510,
            top: 200,
            width: 550,
            height: 720,
            color: '#123b64', 
            objectFit: 'contain',
          }}
        />
      )}

      {/* Nombre del producto */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 240,
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

      {/* Codigo del producto */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 360,
          width: 430,
          fontSize: 35,
          fontWeight: 400,
          color: '#123b64', 
          lineHeight: 1,

          // 2. Forzar una sola línea
          whiteSpace: 'nowrap',
            
          // 3. Ocultar el texto que se sale del div
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {product?.codigo}
      </div>

      {/* Precio antes tachado del producto */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 440, // Ajustar relativo al nombre
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
          left: 90,
          top: 525,
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
          left: 357,
          top: 665,
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
          top: 1030,
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
