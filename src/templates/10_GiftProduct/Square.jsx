import { formatMoney } from '../shared'

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Quita el código del nombre (en cualquier posición) y limpia separadores sobrantes
const quitarCodigoDelNombre = (nombre, codigo) => {
  const nombreOriginal = (nombre ?? '').toString().trim();
  const codigoLimpio = (codigo ?? '').toString().trim();

  if (!nombreOriginal || !codigoLimpio) return nombreOriginal;

  // Espacios del código flexibles, resto escapado
  const patronCodigo = codigoLimpio
    .split(/\s+/)
    .map(escaparRegex)
    .join('\\s+');

  // Prefijo opcional tipo "Cod.", "Código:", "Ref.", "SKU" pegado al código
  const prefijo = '(?:(?:c[oó]d(?:igo)?|ref|sku)\\.?\\s*[:#-]?\\s*)?';

  const regex = new RegExp(
    `(^|[^\\p{L}\\d])${prefijo}${patronCodigo}(?![\\p{L}\\d])`,
    'giu'
  );

  const resultado = nombreOriginal
    .replace(regex, '$1')
    .replace(/\(\s*\)|\[\s*\]/g, '')               // paréntesis/corchetes vacíos
    .replace(/\s{2,}/g, ' ')                       // espacios dobles
    .replace(/^[\s\-–—|:,;/]+|[\s\-–—|:,;/]+$/g, '') // separadores en los extremos
    .replace(/\s+([,;:])/g, '$1')                  // espacio antes de signos
    .trim();

  return resultado || nombreOriginal;
};

// Devuelve true solo si existe un "precio antes" válido (> 0)
const tienePrecioAntes = (valor) => {
  if (valor === null || valor === undefined || valor === '') return false;
  const numero = Number(String(valor).replace(/[^\d.]/g, ''));
  return Number.isFinite(numero) && numero > 0;
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const getTextWidth = (text, fontSize, fontWeight = 700) => {
  ctx.font = `${fontWeight} ${fontSize}px Outfit, sans-serif`;
  return ctx.measureText(text).width;
};

// Reduce el tamaño hasta que el texto quepa
const fitFontSize = (text, startSize, maxWidth, minSize = 10) => {
  let size = startSize;
  while (size > minSize && getTextWidth(text, size) > maxWidth) {
    size -= 1;
  }
  return size;
};

// Devuelve la línea y cuántas palabras consumió (mínimo 1)
const buildLine = (words, maxWidth, fontSize) => {
  if (!words.length) return { line: '', count: 0 };

  let line = words[0];
  let count = 1;

  for (let i = 1; i < words.length; i++) {
    const candidate = `${line} ${words[i]}`;
    if (getTextWidth(candidate, fontSize) <= maxWidth) {
      line = candidate;
      count++;
    } else {
      break;
    }
  }

  return { line, count };
};

const renderTextoSoloSiEsLargo = (texto) => {
  if (!texto) return null;

  const MAX_WIDTH = 444;
  const limpio = texto.trim();

  if (getTextWidth(limpio, 70) <= MAX_WIDTH) {
    return (
      <span style={{ fontSize: '70px', lineHeight: 1, display: 'block', whiteSpace: 'nowrap' }}>
        {limpio}
      </span>
    );
  }

  let palabras = limpio.split(/\s+/);

  // Línea 1: si la primera palabra no cabe a 70px, se reduce la fuente
  const size1 = fitFontSize(palabras[0], 70, MAX_WIDTH);
  const l1 = buildLine(palabras, MAX_WIDTH, size1);
  palabras = palabras.slice(l1.count);

  // Línea 2
  const size2 = palabras.length ? fitFontSize(palabras[0], 35, MAX_WIDTH) : 35;
  const l2 = buildLine(palabras, MAX_WIDTH, size2);
  palabras = palabras.slice(l2.count);

  // Línea 3: lo que sobre
  const linea3 = palabras.join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
      {l1.line && (
        <span style={{ fontSize: `${size1}px`, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {l1.line}
        </span>
      )}
      {l2.line && (
        <span style={{ fontSize: `${size2}px`, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {l2.line}
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

const obtenerTextoRegalo = (codigo, nombre) => {
  const codigoLimpio = codigo?.trim().toUpperCase() || '';
  const nombreLimpio = nombre?.trim().toUpperCase() || '';

  // LAVADORAS
  if (nombreLimpio.startsWith('LAVADORA')) {
    return 'Por la compra de tu lavadora llévate un cesto de regalo';
  }

  // CAFETERAS CON TAZA + CAFÉ
  const codigosTazaMasCafe = [
    'WKCMA612',
    'EP-1224/00',
    'EP1224/00'
  ];

  const esTazaMasCafe = codigosTazaMasCafe.some((codigoCafe) =>
    codigoLimpio.includes(codigoCafe)
  );

  if (esTazaMasCafe) {
    return '¡Llévala hoy y recibe gratis 1 Taza + Café de regalo!';
  }

  // CAFETERAS CON TAZA
  const codigosCafeterasTaza = [
    'WKCMGO11WH',
    'HD7430/90',
    'WKCMFS273',
    'CM482DB2'
  ];

  const esCafeteraConTaza = codigosCafeterasTaza.some((codigoCafe) =>
    codigoLimpio.includes(codigoCafe)
  );

  if (esCafeteraConTaza) {
    return '¡Llévate una taza de regalo por la compra de tu cafetera!';
  }

  // OTROS PRODUCTOS
  return null;
};

// Destello de 4 puntas para dar efecto "regalo / brillo"
const Destello = ({ size, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ position: 'absolute', ...style }}
  >
    <path
      d="M12 0 C12.8 7 17 11.2 24 12 C17 12.8 12.8 17 12 24 C11.2 17 7 12.8 0 12 C7 11.2 11.2 7 12 0 Z"
      fill="#ffffff"
    />
  </svg>
);

export default function Square({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo);
  const textoRegalo = obtenerTextoRegalo(codigo, nombreSinCodigo);
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
                alt={nombreSinCodigo}
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
              {renderTextoSoloSiEsLargo(nombreSinCodigo)}
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
                color: '#123b64', // Texto azul 
                lineHeight: 1,
                
                // 1. Configuración del tachado
                textDecorationLine: 'line-through',
                textDecorationColor: '#e76100', // Color naranja para la línea (puedes ajustar el hex)
                textDecorationThickness: '2px', // Opcional: hace la línea de tachado un poco más gruesa para que resalte
                
                // 2. Control de desbordamiento (necesario para el ellipsis)
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
      
            {/* Tag de promoción dinamizado por codigoMostrar */}
            {obtenerTextoRegalo(
              product?.codigoMostrar,
              product?.nombre
            ) && (
              <div
                style={{
                  position: 'absolute',
                  left: 90,
                  top: 990,
                  width: 900,
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#123b64',
                  lineHeight: 1.2,
                }}
              >
                <span>
                  {obtenerTextoRegalo(
                    product?.codigoMostrar,
                    product?.nombre
                  )}
                </span>
              </div>
            )}
      
            {/* Tag pequeño fijo */}
            <div
              style={{
                position: 'absolute',
                left: 90,
                top: 1020,
                width: 500,
                fontSize: 18,
                fontWeight: 400,
                color: '#123b64',
                lineHeight: 1,
              }}
            >
              *Precio sujeto a variación
            </div>

      {/* ───────── REGALO: caja de regalo con lazo ───────── */}
      <div
        style={{
          position: 'absolute',
          left: 450,
          bottom: 100,
          width: 260,
          height: 280,
          zIndex: 10,
          transform: 'rotate(-4deg)',
          transformOrigin: 'center bottom',
        }}
      >
        {/* Cuerpo de la caja */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 34,
            bottom: 0,
            borderRadius: 36,
            background: 'linear-gradient(160deg, #ff8f1f 0%, #e76000 100%)',
            border: '5px solid #ffffff',
            boxSizing: 'border-box',
            boxShadow: '0 14px 30px rgba(18,59,100,0.35)',
            overflow: 'hidden',
          }}
        >
          {/* Cinta vertical (efecto papel de regalo) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 40,
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.28)',
            }}
          />
        </div>

        {/* Destellos */}
        <Destello size={34} style={{ left: -12, top: 70 }} />
        <Destello size={22} style={{ right: -6, top: 48 }} />
        <Destello size={26} style={{ right: -10, top: 170 }} />

        {/* Lazo superior */}
        <img
          src="/icons/ribbon-bow.png"
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 84,
            height: 70,
            transform: 'translateX(-50%)',
            objectFit: 'contain',
            zIndex: 3,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
          }}
        />

        {/* Medallón con el regalo */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 62,
            width: 158,
            height: 158,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            backgroundColor: '#faf7f0',
            border: '5px solid #ffffff',
            boxSizing: 'border-box',
            boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <img
            src="/icons/Tostador.png"
            alt="Regalo"
            style={{
              width: '82%',
              height: '82%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Etiqueta "De regalo" */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 14,
            transform: 'translateX(-50%)',
            padding: '4px 26px',
            borderRadius: 40,
            backgroundColor: '#123b64',
            color: '#ffffff',
            border: '3px solid #ffffff',
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            zIndex: 3,
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
          }}
        >
          De regalo
        </div>
      </div>

       
    </div>
  )
}