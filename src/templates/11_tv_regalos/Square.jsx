import { formatMoney } from '../shared';
import PriceTag from '../../components/PriceTag';

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Quita el código del nombre (en cualquier posición) y limpia separadores sobrantes
const quitarCodigoDelNombre = (nombre, codigo) => {
  const nombreOriginal = (nombre ?? '').toString().trim();
  const codigoLimpio = (codigo ?? '').toString().trim();

  if (!nombreOriginal || !codigoLimpio) return nombreOriginal;

  // Espacios del código flexibles, resto escapado
  const patronCodigo = codigoLimpio.split(/\s+/).map(escaparRegex).join('\\s+');

  // Prefijo opcional tipo "Cod.", "Código:", "Ref.", "SKU" pegado al código
  const prefijo = '(?:(?:c[oó]d(?:igo)?|ref|sku)\\.?\\s*[:#-]?\\s*)?';

  const regex = new RegExp(
    `(^|[^\\p{L}\\d])${prefijo}${patronCodigo}(?![\\p{L}\\d])`,
    'giu'
  );

  const resultado = nombreOriginal
    .replace(regex, '$1')
    .replace(/\(\s*\)|\[\s*\]/g, '') // paréntesis/corchetes vacíos
    .replace(/\s{2,}/g, ' ') // espacios dobles
    .replace(/^[\s\-–—|:,;/]+|[\s\-–—|:,;/]+$/g, '') // separadores en los extremos
    .replace(/\s+([,;:])/g, '$1') // espacio antes de signos
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
  SG: 'SAMSUNG',
  EL: 'ELECTROLUX',
  AM: 'AIR MONSTER',
  SY: 'SONY',
  // LG: 'LG', SAM: 'SAMSUNG', PHI: 'PHILIPS', ...
};

// Abreviaturas de categoría / palabras sueltas
const ABREVIATURAS = {
  JGO: 'JUEGO',
  ALUM: 'ALUMINIO',
  // CAF: 'CAFETERA', LAV: 'LAVADORA', TV: 'TELEVISOR', ...
};

const expandirToken = (token) => {
  const key = token.toUpperCase();
  if (MARCAS[key]) return MARCAS[key];
  if (ABREVIATURAS[key]) return ABREVIATURAS[key];

  // C/NEGRO -> COLOR NEGRO
  if (key === 'C/NEGRO') return 'COLOR NEGRO';
  if (key === 'C/GREY') return 'COLOR GRIS';
  if (key === 'C/SILVER') return 'COLOR PLATA';
  if (key === 'C/AZUL') return 'COLOR AZUL';
  if (key === 'C/OCEAN') return 'COLOR OCEAN';
  if (key === 'C/STARRY') return 'COLOR STARRY';
  if (key === 'C/MIDNIGHT') return 'COLOR MIDNIGHT';
  if (key === 'C/ALPS') return 'COLOR ALPS';
  if (key === 'C/SHADOW') return 'COLOR SHADOW';
  if (key === 'C/CLOUDLINE') return 'COLOR CLOUDLINE';
  if (key === 'C/POLARIS') return 'COLOR POLARIS';
  if (key === 'C/VERDE') return 'COLOR VERDE';
  if (key === 'C/VIOLETA') return 'COLOR VIOLETA';
  if (key === 'C/QUIET') return 'COLOR QUIET';
  if (key === 'C/FOREST') return 'COLOR FOREST';
  if (key === 'C/SUNRISE') return 'COLOR SUNRISE';
  if (key === 'C/CELESTE') return 'COLOR CELESTE';
  if (key === 'C/SUNLIKE') return 'COLOR SUNLIKE';

  // C/TAPA -> CON TAPA | S/TAPA -> SIN TAPA | P/HORNO -> PARA HORNO
  const m = key.match(/^([CSP])\/(.+)$/);

  if (m) {
    const prep = { C: 'CON', S: 'SIN', P: 'PARA' }[m[1]];
    return `${prep} ${m[2]}`;
  }

  return token;
};

// Solo expande abreviaturas. NO elimina ningún token (los códigos ya se
// quitaron antes con quitarCodigoDelNombre usando codigoMostrar)
const formatearNombreTV = (nombre) => {
  const base = (nombre ?? '').toString().trim();
  if (!base) return base;

  const resultado = base
    .split(/\s+/)
    .map(expandirToken)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return resultado || base;
};

// ───────── Medición y ajuste de texto ─────────

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
      <span
        style={{
          fontSize: '70px',
          lineHeight: 1,
          display: 'block',
          whiteSpace: 'nowrap',
        }}
      >
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {l1.line && (
        <span
          style={{
            fontSize: `${size1}px`,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {l1.line}
        </span>
      )}
      {l2.line && (
        <span
          style={{
            fontSize: `${size2}px`,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
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

// ───────── CONFIGURACIÓN DE REGALOS ─────────

const FONDO = '/templates/11_tv_regalos/square.png';

// Regalos con imagen. 'soporte' NO tiene imagen: solo aparece en la frase.
// Cuando tengas la imagen, agrega: soporte: '/templates/11_tv_regalos/soporte.png'
const IMG_REGALOS = {
  conservadora: '/templates/11_tv_regalos/conservadora.png',
  alexa: '/templates/11_tv_regalos/alexa-echo-show.png',
  pelota: '/templates/11_tv_regalos/pelota.png',
  golpack: '/templates/11_tv_regalos/golpack.png',
};

const NOMBRE_REGALOS = {
  conservadora: 'Conservadora',
  alexa: 'Alexa Echo Show',
  pelota: 'Pelota',
  golpack: 'Golpack',
  soporte: 'Soporte',
};

// ───────── DISEÑO DEL BLOQUE DE REGALOS ─────────
const MARGEN = 50; // margen a la esquina inferior derecha
const TAM_PRINCIPAL = 240; // conservadora (un poco más grande)
const TAM_SECUNDARIO = 205; // regalo extra, delante de la conservadora
const SOLAPE = 30; // cuánto se monta el secundario sobre el principal
const ALTO_ETIQUETA = 56;

const sombraRegalo = 'drop-shadow(0 10px 14px rgba(18,59,100,0.35))';

function BloqueRegalos({ regalos }) {
  // Solo los regalos que tienen imagen (el soporte no tiene)
  const conImagen = regalos.filter((r) => IMG_REGALOS[r]);
  if (!conImagen.length) return null;

  // La conservadora siempre es la protagonista
  const principal = conImagen.includes('conservadora')
    ? 'conservadora'
    : conImagen[0];
  const secundario = conImagen.find((r) => r !== principal);

  const ancho = secundario
    ? TAM_PRINCIPAL + TAM_SECUNDARIO - SOLAPE
    : TAM_PRINCIPAL;
  const alto = TAM_PRINCIPAL + ALTO_ETIQUETA / 2;

  return (
    <div
      style={{
        position: 'absolute',
        right: MARGEN,
        bottom: MARGEN,
        width: ancho,
        height: alto,
        zIndex: 10,
      }}
    >
      {/* Regalo principal (a la derecha, detrás) */}
      <img
        src={IMG_REGALOS[principal]}
        alt={NOMBRE_REGALOS[principal]}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: TAM_PRINCIPAL,
          height: TAM_PRINCIPAL,
          objectFit: 'contain',
          filter: sombraRegalo,
          zIndex: 1,
        }}
      />

      {/* Regalo secundario (a la izquierda, delante) */}
      {secundario && (
        <img
          src={IMG_REGALOS[secundario]}
          alt={NOMBRE_REGALOS[secundario]}
          style={{
            position: 'absolute',
            left: 0,
            bottom: ALTO_ETIQUETA / 2 + 6,
            width: TAM_SECUNDARIO,
            height: TAM_SECUNDARIO,
            objectFit: 'contain',
            filter: sombraRegalo,
            zIndex: 3,
          }}
        />
      )}

      {/* Etiqueta "De regalo" */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          height: ALTO_ETIQUETA,
          padding: '0 32px',
          borderRadius: 40,
          backgroundColor: '#123b64',
          color: '#ffffff',
          border: '4px solid #ffffff',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
          zIndex: 5,
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        }}
      >
        DE REGALO
      </div>
    </div>
  );
}

// ───────── REGALOS POR CÓDIGO ─────────
// 'CODIGO': ['regalo1', 'regalo2']  (el orden es el del mensaje)
// Con imagen: 'conservadora', 'alexa', 'pelota', 'golpack'
// Sin imagen (solo frase): 'soporte'
const REGALOS_POR_CODIGO = {
  // Samsung
  'QN50Q7FAAGXZS': ['conservadora', 'alexa'],
  'QN55Q7FAAGXZS': ['conservadora', 'alexa'],
  'UN65U8000F': ['conservadora', 'alexa'],

  // TCL 32" a 43": pelota + soporte
  '32S58K': ['pelota', 'soporte'],
  '32S5K': ['pelota', 'soporte'],
  '40S58K': ['pelota', 'soporte'],
  '40S5K': ['pelota', 'soporte'],
  '43S58K': ['pelota', 'soporte'],
  '43S5K': ['pelota', 'soporte'],

  // TCL 50": pelota + conservadora
  '50S58K': ['pelota', 'conservadora'],
  '50S5K': ['pelota', 'conservadora'],

  // TCL 55" en adelante: golpack + conservadora
  '55C6K': ['golpack', 'conservadora'],
  '55P6K': ['golpack', 'conservadora'],
  '55T6D': ['golpack', 'conservadora'],
  '65C6K': ['golpack', 'conservadora'],
  '65P6K': ['golpack', 'conservadora'],
  '65T6D': ['golpack', 'conservadora'],
  '75C6K': ['golpack', 'conservadora'],
  '75P6K': ['golpack', 'conservadora'],
  '75T6D': ['golpack', 'conservadora'],
  '85C6K': ['golpack', 'conservadora'],
};

const TEXTO_REGALO = {
  conservadora: 'conservadora',
  pelota: 'pelota',
  golpack: 'golpack',
  alexa: 'Alexa Echo Show',
  soporte: 'soporte',
};

const construirMensaje = (regalos) =>
  `¡Llévate tu ${regalos
    .map((r) => TEXTO_REGALO[r] ?? r)
    .join(' + ')} de regalo!`;

// ───────── LÓGICA DE REGALOS ─────────

// Saca las pulgadas del nombre: 50", 55”, 65 pulgadas
const obtenerPulgadas = (nombre) => {
  const texto = (nombre ?? '').toString();
  const m = texto.match(/(\d{2,3})\s*(?:"|”|“|''|pulg)/i);
  return m ? Number(m[1]) : null;
};

const esTelevisor = (nombre) =>
  /^\s*(TELEVISOR|SMART TV|TV)\b/i.test((nombre ?? '').toString());

const normalizar = (t) =>
  (t ?? '').toString().toUpperCase().replace(/[\s-]/g, '');

// Devuelve { regalos: [...], mensaje } o null si no hay regalos que mostrar
const obtenerRegalosTV = (codigo, nombre) => {
  if (!esTelevisor(nombre)) return null;

  // 1) Modelos confirmados: se buscan por código
  const huella = normalizar(`${codigo} ${nombre}`);
  const entrada = Object.entries(REGALOS_POR_CODIGO).find(([c]) =>
    huella.includes(normalizar(c))
  );

  if (entrada) {
    return { regalos: entrada[1], mensaje: construirMensaje(entrada[1]) };
  }

  // 2) Cualquier otro televisor: de 50" en adelante, conservadora
  const pulgadas = obtenerPulgadas(nombre);
  if (pulgadas && pulgadas >= 50) {
    return {
      regalos: ['conservadora'],
      mensaje: construirMensaje(['conservadora']),
    };
  }

  // 3) Menos de 50": sin regalo
  return null;
};

// Regalos de otros productos (soportes, cafeteras)
const obtenerTextoRegalo = (codigo, nombre) => {
  const codigoLimpio = codigo?.trim().toUpperCase() || '';
  const nombreLimpio = nombre?.trim().toUpperCase() || '';

  // SOPORTES
  if (nombreLimpio.startsWith('SOPORTE')) {
    return 'Descuento valido solo por la compra de tu televisor';
  }

  // CAFETERAS CON TAZA + CAFÉ
  const codigosTazaMasCafe = ['WKCMA612', 'EP-1224/00', 'EP1224/00'];
  if (codigosTazaMasCafe.some((c) => codigoLimpio.includes(c))) {
    return '¡Llévala hoy y recibe gratis 1 Taza + Café de regalo!';
  }

  // CAFETERAS CON TAZA
  const codigosCafeterasTaza = ['WKCMGO11WH', 'HD7430/90', 'WKCMFS273', 'CM482DB2'];
  if (codigosCafeterasTaza.some((c) => codigoLimpio.includes(c))) {
    return '¡Llévate una taza de regalo por la compra de tu cafetera!';
  }

  return null;
};

// ───────── COMPONENTE ─────────

export default function Square({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo);
  const nombreFormateado = formatearNombreTV(nombreSinCodigo); // para mostrar

  // Regalos de TV: se detectan con el nombre ORIGINAL (código, pulgadas y marca)
  const regalosTV = obtenerRegalosTV(codigo, product?.nombre);
  const textoRegalo =
    regalosTV?.mensaje || obtenerTextoRegalo(codigo, nombreSinCodigo);

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
        src={FONDO}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
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

      {regalosTV && <BloqueRegalos regalos={regalosTV.regalos} />}

      {/* Descripción del producto */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 380,
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
            top: 612,
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

      <PriceTag
        before={product?.precioAntes}
        price={product?.precio}
        installments={product?.cuotas}
        width={400}
        style={{
          position: 'absolute',
          left: 50,
          top: 690,
        }}
      />

      {/* Mensaje cortísimo del regalo */}
      {textoRegalo && (
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
          <span>{textoRegalo}</span>
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
  );
}