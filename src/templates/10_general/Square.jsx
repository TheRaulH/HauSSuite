import { formatMoney } from '../shared'

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
        src="/templates/10_general/cuadrado normal final.png"
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
      <div
        style={{
          position: 'absolute',
          left: 91,
          top: 753,
          width: 250,
          fontSize: 29,
          fontWeight: 500,
          color: '#faf7f0',
           lineHeight: 1,
          
          // 1. Configuración del tachado
          textDecorationLine: 'line-through',
          textDecorationColor: '#ffffff00', // Color naranja para la línea (puedes ajustar el hex)
          textDecorationThickness: '2px', // Opcional: hace la línea de tachado un poco más gruesa para que resalte
          
          // 2. Control de desbordamiento (necesario para el ellipsis)
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Antes: Bs. {formatMoney(product?.precioAntes)}
      </div>

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 75,
          top: 696,
          width: 280,
          fontSize: 55,
          fontWeight: 800,
          color: '#ffffff',  
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
          left: 221,
          top: 856,
          width: 128,
          fontSize: 29,
          fontWeight: 800,
          color: '#ffffff',  
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
    </div>
  )
}
