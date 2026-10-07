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

  const linea1 = buildLine(palabras, MAX_WIDTH, 70);
  palabras = palabras.slice(linea1.split(' ').length);

  const linea2 = buildLine(palabras, MAX_WIDTH, 35);
  palabras = palabras.slice(linea2 ? linea2.split(' ').length : 0);

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
        <span style={{ fontSize: '70px', lineHeight: 1, whiteSpace: 'nowrap' }}>
          {linea1}
        </span>
      )}
      {linea2 && (
        <span style={{ fontSize: '35px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {linea2}
        </span>
      )}
      {linea3 && (
        <span style={{
          fontSize: '17.5px',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {linea3}
        </span>
      )}
    </div>
  );
};

export default function SquareColchonFunda({ product, image }) {
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

      {/* Sticker "Producto Nuevo" — cuadrado, esquina superior izquierda.
          No invade ni el título de campaña (arriba a la derecha) ni el
          logo Hauscenter (abajo a la derecha). */}
      <img
        src="/icons/IconNewProduct2.png"
        alt="Producto nuevo"
        style={{
          position: 'absolute',
          left: 40,
          top: 40,
          width: 280,
          height: 280,
          objectFit: 'contain',
        }}
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
            zIndex: 1, // Mantenemos el producto detrás de posibles superposiciones
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

      {/* Codigo opcional del producto */}
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
            padding: '0 20px', 
            boxSizing: 'border-box', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
          textDecorationLine: 'line-through',
          textDecorationColor: '#ffffff00', 
          textDecorationThickness: '2px', 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Antes: Bs. {formatMoney(product?.precioAntes)}
      </div>

      {/* Precio Ahora */}
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Bs. {formatMoney(product?.precio)}
      </div>

      {/* Cuota mensual */}
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Bs. {formatMoney(product?.cuotas)}
      </div>

       
      <div
        style={{
          position: 'absolute',
          left: 450, // Ubicado justo en la esquina inferior izquierda del colchón (que empieza en left: 500)
          bottom: 100, 
          width: 260,
          height: 280,
          backgroundColor: '#e7600000', // Fondo naranja solicitado
          borderRadius: 35, // Cuadrado curveado
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '15px',
          boxSizing: 'border-box',
          zIndex: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', // Sombra ligera para darle profundidad y separarlo de la imagen
        }}
      >
        {/* Moñito de regalo superior */}
        <img
          src="/icons/ribbon-bow.png" // Agrega la ruta de un icono de moño/lazo que tengas en tu proyecto
          alt="Moño de regalo"
          style={{
            width: 55,
            height: 55,
            objectFit: 'contain',
            marginBottom: 0,
          }}
        />

        {/* Imagen del protector */}
        <div 
          style={{
            width: 200,
            height: 200,
            border: '3px solid #ffffff', // Borde blanco
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/templates/10_newsmatterss/protector.png"
            alt="Protector de colchón de regalo"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        
        {/* Texto inferior "De regalo" */}
        <span
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            marginTop: 10,
            textAlign: 'center'
          }}
        >
          De regalo
        </span>
      </div>

    </div>
  )
}