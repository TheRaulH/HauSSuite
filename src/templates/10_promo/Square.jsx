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

// ───────── Formateo de nombre para mostrar ─────────

// Marcas abreviadas -> nombre completo (agrega las que necesites)
const MARCAS = {
  WH: 'WESTINGHOUSE',
  // LG: 'LG', SAM: 'SAMSUNG', PHI: 'PHILIPS', ...
};

// Abreviaturas de categoría / palabras sueltas
const ABREVIATURAS = {
  JGO: 'JUEGO',
  ALUM: 'ALUMINIO',
  // CAF: 'CAFETERA', LAV: 'LAVADORA', TV: 'TELEVISOR', ...
};

// Frases que se corrigen después de expandir
const FRASES = [
  [/\bUTENSILIOS COCINA\b/g, 'UTENSILIOS DE COCINA'],
];

// Códigos de modelo tipo WCCS000906AMBB, WCFP-85030MBB, WCKG0084BK
const esCodigoModelo = (t) => /^[A-Z]{2,6}-?\d{2,}[A-Z0-9-]*\+?$/i.test(t);

// Especificaciones técnicas tipo O28*,C20*,S24/28 | L12/14 | S20*/24*
const esEspecificacion = (t) =>
  t.includes('*') || /^[A-Z]{1,2}\d{2}(\/\d{2})?[,]?$/i.test(t);

const expandirToken = (token) => {
  const key = token.toUpperCase();
  if (MARCAS[key]) return MARCAS[key];
  if (ABREVIATURAS[key]) return ABREVIATURAS[key];

  // C/TAPA -> CON TAPA | S/TAPA -> SIN TAPA | P/HORNO -> PARA HORNO
  const m = key.match(/^([CSP])\/(.+)$/);
  if (m) {
    const prep = { C: 'CON', S: 'SIN', P: 'PARA' }[m[1]];
    return `${prep} ${m[2]}`;
  }
  return token;
};

const formatearNombreProducto = (nombre) => {
  const base = (nombre ?? '').toString().trim();
  if (!base) return base;

  let tokens = base
    .split(/\s+/)
    .filter((t) => !esCodigoModelo(t) && !esEspecificacion(t))
    .map(expandirToken);

  // "JUEGO OLLAS" -> "JUEGO DE OLLAS" (si aún no trae "DE")
  const idx = tokens.findIndex((t) => t.toUpperCase() === 'JUEGO');
  if (idx !== -1 && tokens[idx + 1] && tokens[idx + 1].toUpperCase() !== 'DE') {
    tokens.splice(idx + 1, 0, 'DE');
  }

  let resultado = tokens.join(' ');
  FRASES.forEach(([regex, reemplazo]) => {
    resultado = resultado.replace(regex, reemplazo);
  });

  resultado = resultado
    .replace(/\+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return resultado || base; // si todo falla, devuelve el original
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

  // TELEVISORES
  if (nombreLimpio.startsWith('TELEVISOR')) {
    return 'Por la compra de tu televisor llévate tu soporte al 50%';
  }

  //SOPORTES
  if (nombreLimpio.startsWith('SOPORTE')) {
    return 'Descuento valido solo por la compra de tu televisor';
  }

  //PARLANTE 
  if (nombreLimpio.startsWith('PARLANTE')) {
    return 'Por la compra de tu parlante llévate un microfono al 50%';
  }

  //EQUIPO DE SONIDO
  if (nombreLimpio.startsWith('EQUIPO DE SONIDO') || nombreLimpio.startsWith('EQUIPOS DE SONIDO')) {
    return 'Por la compra de tu equipo llévate un microfono al 50%';
  }

  //MENAJE
  if (nombreLimpio.startsWith('WOK') || nombreLimpio.startsWith('SET DE 2 TAPA') || nombreLimpio.startsWith('SARTEN') || nombreLimpio.startsWith('PARRILLA') || nombreLimpio.startsWith('OLLA') || nombreLimpio.startsWith('JGO') || nombreLimpio.startsWith('CREPERA') || nombreLimpio.startsWith('CACEROLA') || nombreLimpio.startsWith('BANDEJA') || nombreLimpio.startsWith('AFILADOR')) {
    return 'Por tu compra llévate una bandeja al 50% de descuento';
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

export default function Square({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo);   // para lógica (regalos)
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo);        // para mostrar
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
          alt={nombreFormateado}
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
        {renderTextoSoloSiEsLargo(nombreFormateado)}
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
    </div>
  )
}
