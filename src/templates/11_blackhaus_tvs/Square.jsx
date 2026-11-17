import PriceTag from '../../components/PriceTagBH';

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const quitarCodigoDelNombre = (nombre, codigo) => {
  const nombreOriginal = (nombre ?? '').toString().trim();
  const codigoLimpio = (codigo ?? '').toString().trim();

  if (!nombreOriginal || !codigoLimpio) return nombreOriginal;

  const patronCodigo = codigoLimpio
    .split(/\s+/)
    .map(escaparRegex)
    .join('\\s+');

  const prefijo = '(?:(?:c[oó]d(?:igo)?|ref|sku)\\.?\\s*[:#-]?\\s*)?';
  const regex = new RegExp(
    `(^|[^\\p{L}\\d])${prefijo}${patronCodigo}(?![\\p{L}\\d])`,
    'giu'
  );

  const resultado = nombreOriginal
    .replace(regex, '$1')
    .replace(/\(\s*\)|\[\s*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—|:,;/]+|[\s\-–—|:,;/]+$/g, '')
    .replace(/\s+([,;:])/g, '$1')
    .trim();

  return resultado || nombreOriginal;
};

// ───────── Formateo de nombre ─────────

const MARCAS = {
  WH: 'WESTINGHOUSE',
  SG: 'SAMSUNG',
  EL: 'ELECTROLUX',
  AM: 'AIR MONSTER',
  SY: 'SONY',
};

const ABREVIATURAS = {
  JGO: 'JUEGO',
  ALUM: 'ALUMINIO',
};

const FRASES = [[/\bUTENSILIOS COCINA\b/g, 'UTENSILIOS DE COCINA']];

const esCodigoModelo = (t) => /^[A-Z]{2,6}-?\d{2,}[A-Z0-9-]*$/i.test(t);

const esEspecificacion = (t) =>
  t.includes('*') || /^[OCSL]{1,2}\d{2}(\/\d{2})?[,]?$/i.test(t);

const expandirToken = (token) => {
  const key = token.toUpperCase();

  if (MARCAS[key]) return MARCAS[key];
  if (ABREVIATURAS[key]) return ABREVIATURAS[key];

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

  const idx = tokens.findIndex((t) => t.toUpperCase() === 'JUEGO');

  if (idx !== -1 && tokens[idx + 1] && tokens[idx + 1].toUpperCase() !== 'DE') {
    tokens.splice(idx + 1, 0, 'DE');
  }

  let resultado = tokens.join(' ');

  FRASES.forEach(([regex, reemplazo]) => {
    resultado = resultado.replace(regex, reemplazo);
  });

  resultado = resultado.replace(/\s{2,}/g, ' ').trim();

  return resultado || base;
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const getTextWidth = (text, fontSize, fontWeight = 700) => {
  ctx.font = `${fontWeight} ${fontSize}px Outfit, sans-serif`;
  return ctx.measureText(text).width;
};

const fitFontSize = (text, startSize, maxWidth, minSize = 10) => {
  let size = startSize;

  while (size > minSize && getTextWidth(text, size) > maxWidth) {
    size -= 1;
  }

  return size;
};

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

  const size1 = fitFontSize(palabras[0], 70, MAX_WIDTH);
  const l1 = buildLine(palabras, MAX_WIDTH, size1);
  palabras = palabras.slice(l1.count);

  const size2 = palabras.length ? fitFontSize(palabras[0], 35, MAX_WIDTH) : 35;
  const l2 = buildLine(palabras, MAX_WIDTH, size2);
  palabras = palabras.slice(l2.count);

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

// ───────── CONFIGURACIÓN DE REGALOS PARA TELEVISORES ─────────

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

const MARGEN = 50;
const TAM_PRINCIPAL = 240;
const TAM_SECUNDARIO = 205;
const SOLAPE = 30;
const ALTO_ETIQUETA = 56;
const sombraRegalo = 'drop-shadow(0 10px 14px rgba(18,59,100,0.35))';

function BloqueRegalos({ regalos }) {
  const conImagen = regalos.filter((regalo) => IMG_REGALOS[regalo]);

  if (!conImagen.length) return null;

  const principal = conImagen.includes('conservadora')
    ? 'conservadora'
    : conImagen[0];

  const secundario = conImagen.find((regalo) => regalo !== principal);

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

// Las 63 asignaciones del Excel "teles bandeos.xlsx".
// No se asignan regalos por pulgadas ni por marca.
const REGALOS_POR_CODIGO = {
  // Golpack + Conservadora
  '65P6K': ['golpack', 'conservadora'],
  '75P6K': ['golpack', 'conservadora'],
  '55T6D': ['golpack', 'conservadora'],

  // Pelota + Conservadora
  '50S5K': ['pelota', 'conservadora'],

  // Pelota + Soporte
  '43S5K': ['pelota', 'soporte'],
  '32S5K': ['pelota', 'soporte'],
  '40S5K': ['pelota', 'soporte'],
  '43S58K': ['pelota', 'soporte'],

  // Conservadora
  '50P735': ['conservadora'],
  '55P635I': ['conservadora'],
  'UN50AU7000': ['conservadora'],
  'UN50CU8000GXZS': ['conservadora'],
  'QN55Q60TAGXZS': ['conservadora'],
  '50P755': ['conservadora'],
  'UN50DU8000GXZS': ['conservadora'],
  'UN55DU8000GXZS': ['conservadora'],
  'UN65DU8000GXZS': ['conservadora'],
  '55P755': ['conservadora'],
  '55C655': ['conservadora'],
  '65C655': ['conservadora'],
  '50C645': ['conservadora'],
  '75P755': ['conservadora'],
  '75UR8750PSA': ['conservadora'],
  '50NANO77SRA': ['conservadora'],
  'UN75DU8000GXZS': ['conservadora'],
  '55C755': ['conservadora'],
  '55UT7300PSA': ['conservadora'],
  '50P7K': ['conservadora'],
  'UN65U8000F': ['conservadora'],
  '65P8K': ['conservadora'],
  '85P8K': ['conservadora'],
  '50UA7300PSB': ['conservadora'],
  '55UA7300PSB': ['conservadora'],
  '65UA7300PSB': ['conservadora'],
  'QN50Q7FAAGXZS': ['conservadora'],
  'UN50U8000FGXZS': ['conservadora'],
  'UN65CU8000GXZS': ['conservadora'],
  'QN55Q7FAAGXZS': ['conservadora'],
  'UN55U8000FGXZS': ['conservadora'],
  'UN50TU7100GXZ': ['conservadora'],
  'UN50AU8000GXZS': ['conservadora'],
  'UN50AU8200GXZS': ['conservadora'],
  '50NU800BPSC.AWHQ': ['conservadora'],
  'UN58AU7000': ['conservadora'],
  'KD-50X77': ['conservadora'],
  'KD-55X77L': ['conservadora'],
  'KD-55X80K': ['conservadora'],
  'KD-65X77L': ['conservadora'],
  'KD55X725F': ['conservadora'],
  '50UP7500PSF': ['conservadora'],

  // Soporte
  '40S5400': ['soporte'],
  '43S5400A': ['soporte'],
  'LT-32KB127': ['soporte'],
  '32T4300AG': ['soporte'],
  'UN43T5202AGXZ': ['soporte'],
  'QN43LS05BAGXZS': ['soporte'],
  '32S5400A': ['soporte'],
  '43UR8750PSA': ['soporte'],
  '43UT7300PSA': ['soporte'],
  '43UA7300PSB': ['soporte'],
  'LE-32H1': ['soporte'],
  'UN32H5000FGXZS': ['soporte'],
  'UN43AU7090GXZS': ['soporte'],
};

const TEXTO_REGALO = {
  conservadora: 'conservadora',
  pelota: 'pelota',
  golpack: 'golpack',
  alexa: 'Alexa Echo Show',
  soporte: 'soporte',
};

const construirMensaje = (regalos) =>
  `¡Llévate tu ${regalos.map((regalo) => TEXTO_REGALO[regalo] ?? regalo).join(' + ')} de regalo!`;

const normalizar = (texto) =>
  (texto ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');

const esTelevisor = (nombre) =>
  /^\s*(?:TELEVISOR(?:ES)?|SMART\s*TV|TV)\b/i.test((nombre ?? '').toString());

const obtenerRegalosTV = (codigo, nombreOriginal) => {
  if (!esTelevisor(nombreOriginal)) return null;

  const huella = normalizar(`${codigo} ${nombreOriginal}`);

  const entrada = Object.entries(REGALOS_POR_CODIGO).find(([modelo]) =>
    huella.includes(normalizar(modelo))
  );

  if (entrada) {
    return {
      regalos: entrada[1],
      mensaje: construirMensaje(entrada[1]),
    };
  }

  return null;
};

export default function SquareTelevisoresBlackHaus({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreOriginal = product?.nombre?.toString() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(nombreOriginal, codigo);
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo);
  const regalosTV = obtenerRegalosTV(codigo, nombreOriginal);
  const textoRegalo = regalosTV?.mensaje || null;



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
        src="/templates/11_blackhaus/cuadrado.png"
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

      {textoRegalo && (
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 940,
            width: 700,
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            zIndex: 11,
          }}
        >
          <span>{textoRegalo}</span>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 440,
          width: 444,
          height: 220,
          fontSize: 70,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {renderTextoSoloSiEsLargo(nombreFormateado)}
      </div>

      {product?.codigoMostrar && (
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 620,
            maxWidth: 444,
            height: 50,
            fontSize: 30,
            fontWeight: 400,
            border: '3px solid #fff',
            borderRadius: 50,
            color: '#fff',
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

      <div
        style={{
          position: 'absolute',
          left: 830,
          top: 1040,
          width: 500,
          fontSize: 18,
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        *Precio sujeto a variación
      </div>
    </div>
  );
}
