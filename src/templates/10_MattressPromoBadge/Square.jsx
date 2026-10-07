import { formatMoney } from '../shared'

// Devuelve true solo si existe un "precio antes" válido (> 0)
const tienePrecioAntes = (valor) => {
  if (valor === null || valor === undefined || valor === '') return false;
  const numero = Number(String(valor).replace(/[^\d.]/g, ''));
  return Number.isFinite(numero) && numero > 0;
};

const getTextWidth = (text, fontSize, fontWeight = 700) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `${fontWeight} ${fontSize}px Outfit, sans-serif`;

  return ctx.measureText(text).width;
};

const buildLine = (words, maxWidth, fontSize) => {
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (getTextWidth(candidate, fontSize) <= maxWidth) {
      line = candidate;
    } else {
      break;
    }
  }

  return line;
};

const renderTextoSoloSiEsLargo = (texto) => {
  if (!texto) return null;

  const MAX_WIDTH = 444;

  // Primero comprobamos si TODO el texto cabe
  // con el tamaño normal de 70px.
  if (getTextWidth(texto, 70) <= MAX_WIDTH) {
    return (
      <span
        style={{
          fontSize: '70px',
          lineHeight: 1,
          display: 'block',
          whiteSpace: 'nowrap',
        }}
      >
        {texto}
      </span>
    );
  }

  let palabras = texto.trim().split(/\s+/);

  // Primera línea: máximo tamaño
  const linea1 = buildLine(palabras, MAX_WIDTH, 70);

  palabras = palabras.slice(linea1.split(' ').length);

  // Segunda línea: tamaño intermedio
  const linea2 = buildLine(palabras, MAX_WIDTH, 35);

  palabras = palabras.slice(linea2 ? linea2.split(' ').length : 0);

  // Tercera línea: tamaño pequeño
  const linea3 = palabras.join(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {linea1 && (
        <span
          style={{
            fontSize: '70px',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {linea1}
        </span>
      )}

      {linea2 && (
        <span
          style={{
            fontSize: '35px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          {linea2}
        </span>
      )}

      {linea3 && (
        <span
          style={{
            fontSize: '17.5px',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {linea3}
        </span>
      )}
    </div>
  );
};

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
        src="/templates/10_promo/cuadrado.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {image && (
        <img
          src={image}
          alt={product?.nombre ?? ''}
          style={{
            position: 'absolute',
            left: 500,
            top: 280,
            width: 550,
            height: 670, 
            objectFit: 'contain',
          }}
        />
      )}

      {/* Descripción del producto */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 350,
          width: 444,
          height: 220,
          fontSize: 70,
          fontWeight: 700, 
          color: '#123b64',
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {renderTextoSoloSiEsLargo(product?.nombre)}
      </div>

      {/* Codigo opcional del producto, si no hay codigo no mostrar el div */}
      {product?.codigoMostrar && (
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 582,
            maxWidth: 444, 
            height: 50,
            fontSize: 30,
            fontWeight: 400,
            border: '3px solid #123b64',
            borderRadius: 50,
            color: '#123b64',
            
            // Agrega espacio interno a los lados (ej. 20px izquierda y derecha)
            padding: '0 20px', 
            // Evita que el padding haga que el div mida más de 444px de ancho
            boxSizing: 'border-box', 
            
            // 1. Centrado vertical y horizontal perfecto
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            
            // 2. Forzar una sola línea
            whiteSpace: 'nowrap',
            
            // 3. Ocultar el texto que se sale del div
            overflow: 'hidden',
            textOverflow: 'ellipsis', /* Agrega "..." al final si se corta */
          }}
        >
          {product.codigoMostrar}
        </div>
      )}

      {/* Precio antes de la promoción */}
      {tienePrecioAntes(product?.precioAntes) && (
      <div
        style={{
          position: 'absolute',
          left: 73,
          top: 653,
          width: 250,
          fontSize: 27,
          fontWeight: 500,
          color: '#123b64',  
          lineHeight: 1, 
          textDecorationLine: 'line-through',
          textDecorationColor: '#e76100',
          textDecorationThickness: '2px', 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Antes: Bs. {formatMoney(product?.precioAntes)}
      </div>
      )}

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 65,
          top: 720,
          width: 280,
          fontSize: 60,
          fontWeight: 800,
          color: '#fff', 
          lineHeight: 1,

          // 1. Centrado vertical y horizontal perfecto
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
            
          // 2. Forzar una sola línea
          whiteSpace: 'nowrap',

          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Bs. {formatMoney(product?.precio)}
      </div>

      {/* cuota mensual */}
      <div
        style={{
          position: 'absolute',
          left: 270,
          top: 827,
          width: 86,
          fontSize: 21,
          fontWeight: 800,
          color: '#fff', 
          lineHeight: 1,

          // 1. Centrado vertical y horizontal perfecto
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
            
          // 2. Forzar una sola línea
          whiteSpace: 'nowrap',

          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Bs. {formatMoney(product?.cuotas)}
      </div>

      {/* tag descuento valido solo por la compra de un colchon */}

      <div>
        <span
          style={{
            position: 'absolute',
            left: 100,
            top: 1000,
            width: 800,
            height: 50,
            fontSize: 25,
            fontWeight: 700,
            color: '#123b64',
            lineHeight: 1,
          }}
        >
          Descuento válido solo por la compra de un colchón
        </span>
      </div>

        {/* tag pequeno */}
      <div
        style={{
          position: 'absolute',
          left: 100,
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
