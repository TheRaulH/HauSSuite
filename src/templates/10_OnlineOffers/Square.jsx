import { formatMoney } from '../shared';
import logoHauscenter from '../../assets/LogoHauscenter.svg';
import PreciadorDescuento from '../../assets/PreciadorDesc.svg';
import CrediHausLogo from '../../assets/CrediHaus.svg';

/* ════════════════════════════════════════════════════════════
   OFERTAS WEB — 1080 x 1080
   Plantilla 100% en JSX/SVG: no usa ninguna imagen de fondo.
   Fondo, formas azules, titular, preciador, CrediHaus y logo
   están dibujados aquí mismo.
   ════════════════════════════════════════════════════════════ */

// ───────── Tokens de diseño (cambia aquí y se actualiza todo) ─────────
const COLORES = {
  azulFondo: '#00346a', // formas grandes
  azulTexto: '#123b64', // textos y contornos
  crema: '#f4e3cd', // fondo
  naranja: '#e76100', // preciador y titular
  blanco: '#ffffff',
};

// Tipografía script del titular "¡Nos renovamos,". Cámbiala por la que uses en la plantilla original.
const FUENTE_SCRIPT = "'KGFont', cursive";
const FUENTE_BASE = "'Outfit', sans-serif";

// Carga de fuentes (si ya las cargas globalmente, puedes quitar este bloque)
const FUENTES_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=Sacramento&display=swap');
`;

// ───────── Utilidades de nombre / código ─────────
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Quita el código del nombre (en cualquier posición) y limpia separadores sobrantes
const quitarCodigoDelNombre = (nombre, codigo) => {
  const nombreOriginal = (nombre ?? '').toString().trim();
  const codigoLimpio = (codigo ?? '').toString().trim();

  if (!nombreOriginal || !codigoLimpio) return nombreOriginal;

  const patronCodigo = codigoLimpio.split(/\s+/).map(escaparRegex).join('\\s+');

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

// Devuelve true solo si existe un "precio antes" válido (> 0)
const tienePrecioAntes = (valor) => {
  if (valor === null || valor === undefined || valor === '') return false;
  const numero = Number(String(valor).replace(/[^\d.]/g, ''));
  return Number.isFinite(numero) && numero > 0;
};

// ───────── Formateo de nombre para mostrar ─────────
const MARCAS = {
  WH: 'WESTINGHOUSE',
  PH: 'PHILIPS',
};

const ABREVIATURAS = {
  JGO: 'JUEGO',
  ALUM: 'ALUMINIO',
};

const FRASES = [[/\bUTENSILIOS COCINA\b/g, 'UTENSILIOS DE COCINA']];

const esCodigoModelo = (t) => /^[A-Z]{2,6}-?\d{2,}[A-Z0-9-]*\+?$/i.test(t);

const esEspecificacion = (t) =>
  t.includes('*') || /^[A-Z]{1,2}\d{2}(\/\d{2})?[,]?$/i.test(t);

const expandirToken = (token) => {
  const key = token.toUpperCase();
  if (MARCAS[key]) return MARCAS[key];
  if (ABREVIATURAS[key]) return ABREVIATURAS[key];

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

  resultado = resultado
    .replace(/\+/g, '')
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

// ───────── Regalos / promos por tipo de producto ─────────
const obtenerTextoRegalo = (codigo, nombre) => {
  const codigoLimpio = codigo?.trim().toUpperCase() || '';
  const nombreLimpio = nombre?.trim().toUpperCase() || '';

  if (nombreLimpio.startsWith('LAVADORA')) {
    return 'Por la compra de tu lavadora llévate un cesto de regalo';
  }

  const codigosTazaMasCafe = ['WKCMA612', 'EP-1224/00', 'EP1224/00'];
  const esTazaMasCafe = codigosTazaMasCafe.some((c) =>
    codigoLimpio.includes(c)
  );
  if (esTazaMasCafe) {
    return '¡Llévala hoy y recibe gratis 1 Taza + Café de regalo!';
  }

  const codigosCafeterasTaza = [
    'WKCMGO11WH',
    'HD7430/90',
    'WKCMFS273',
    'CM482DB2',
  ];
  const esCafeteraConTaza = codigosCafeterasTaza.some((c) =>
    codigoLimpio.includes(c)
  );
  if (esCafeteraConTaza) {
    return '¡Llévate una taza de regalo por la compra de tu cafetera!';
  }

  return null;
};

// ════════════════════════════════════════════════════════════
// Piezas gráficas que antes venían dentro del PNG de fondo
// ════════════════════════════════════════════════════════════

// Fondo crema + formas azules (esquina superior derecha y esquina inferior izquierda)
const FondoGrafico = () => (
  <svg
    width="1080"
    height="1080"
    viewBox="0 0 1080 1080"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0 }}
    aria-hidden="true"
  >
    {' '}
    <rect width="1080" height="1080" fill={COLORES.crema} />{' '}
    {/* Forma azul creada en Figma: 719 × 909 */}{' '}
    <g transform="translate(361 0)">
      {' '}
      <path
        d=" M718.332 908.5 V0 H20.3324 C-30.6676 136.5 26.3323 218 59.8325 255.5 L718.332 908.5 Z "
        fill={COLORES.azulFondo}
      />{' '}
    </g>{' '}
    {/* Esquina inferior izquierda */}{' '}
    <path
      d=" M0 930 C62 968 92 1020 108 1080 L0 1080 Z "
      fill={COLORES.azulFondo}
    />{' '}
  </svg>
);

// Titular "¡Nos renovamos, ES TU TURNO!"
const Titular = () => (
  <div
    style={{
      position: 'absolute',
      left: 418,
      top: 80,
      width: 640,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        fontFamily: FUENTE_SCRIPT,
        fontSize: 65,
        lineHeight: 1,
        color: COLORES.blanco,
        whiteSpace: 'nowrap',
      }}
    >
      ¡Nos renovamos,
    </div>
    <div
      style={{
        marginTop: 6,
        fontFamily: FUENTE_BASE,
        fontSize: 80,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: -2,
        color: COLORES.naranja,
        whiteSpace: 'nowrap',
      }}
    >
      ES TU TURNO!
    </div>
  </div>
);

// Recuadro naranja "Ahora" (el precio se dibuja encima, aparte)
const PreciadorFondo = () => (
  <>
    {/* Pestaña "Ahora" */}
    <div
      style={{
        position: 'absolute',
        left: 50,
        top: 690,
        width: 120,
        height: 34,
        background: COLORES.naranja,
        borderRadius: '10px 16px 0 0',
        color: COLORES.blanco,
        fontFamily: FUENTE_BASE,
        fontSize: 24,
        fontWeight: 700,
        lineHeight: '30px',
        paddingLeft: 24,
        boxSizing: 'border-box',
      }}
    >
      Ahora
    </div>

    {/* Cuerpo del preciador */}
    <div
      style={{
        position: 'absolute',
        left: 50,
        top: 697,
        width: 310,
        height: 99,
        background: COLORES.naranja,
        borderRadius: '0 22px 46px 28px',
        zIndex: 0,
      }}
    />
  </>
);

// ════════════════════════════════════════════════════════════
// Componente principal
// ════════════════════════════════════════════════════════════
export default function OfertasWeb({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo); // para lógica (regalos)
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo); // para mostrar
  const textoRegalo = obtenerTextoRegalo(codigo, nombreSinCodigo);
  const numeroCuotas = product?.numeroCuotas ?? 11;

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FUENTE_BASE,
        background: COLORES.crema,
      }}
    >
      <style>{FUENTES_CSS}</style>

      {/* Fondo + formas (reemplaza al PNG) */}
      <FondoGrafico />

      {/* Titular */}
      <Titular />

      {/* Imagen del producto */}
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
          color: COLORES.azulTexto,
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {renderTextoSoloSiEsLargo(nombreFormateado)}
      </div>

      {/* Código opcional del producto */}
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
            border: `3px solid ${COLORES.azulTexto}`,
            borderRadius: 50,
            color: COLORES.azulTexto,
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

      {/* Preciador naranja "Ahora" (fondo) */}
      <img
        src={PreciadorDescuento}
        alt="Ahora"
        style={{ position: 'absolute', left: 20, top: 655, width: 350 }}
      />

      {/* Descuento */}
      {tienePrecioAntes(product?.descuento) && (
        <div
          style={{
            position: 'absolute',
            left: 27,
            top: 669,
            width: 250,
            fontSize: 24,
            fontWeight: 700,
            color: COLORES.blanco,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {-Math.round(product?.descuento * 100)}%
        </div>
      )}

      {/* Precio, dentro del recuadro naranja */}
      <div
        style={{
          position: 'absolute',
          left: 65,
          top: 720,
          width: 280,
          fontSize: 60,
          fontWeight: 800,
          color: COLORES.blanco,
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

      {/* Precio antes de la promoción */}
      {tienePrecioAntes(product?.precioAntes) && (
        <div
          style={{
            position: 'absolute',
            left: 73,
            top: 790,
            width: 270,
            fontSize: 25,
            fontWeight: 400,
            color: '#fff', // Texto azul
            lineHeight: 1,
            //alinear el texto al centro del recuadro
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

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

      {/* Barra CrediHaus + cuota mensual*/}
      <img
        src={CrediHausLogo}
        alt="CrediHaus"
        style={{ position: 'absolute', left: 50, top: 850, width: 320 }}
      />

      {/* cuota mensual */}
      <div
        style={{
          position: 'absolute',
          left: 215,
          top: 900,
          width: 140,
          fontSize: 31,
          fontWeight: 700,
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

      {/* Tag de promoción dinámico (regalo / descuento) */}
      {textoRegalo && (
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 940,
            width: 570,
            height: 72,
            display: 'flex',
            alignItems: 'flex-end',
            fontSize: 24,
            fontWeight: 700,
            color: COLORES.azulTexto,
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
          color: COLORES.azulTexto,
          lineHeight: 1,
        }}
      >
        *Precio sujeto a variación
      </div>

      {/* Logo Hauscenter */}
      <img
        src={logoHauscenter}
        alt="Hauscenter"
        style={{ position: 'absolute', left: 720, top: 980, width: 315 }}
      />
    </div>
  );
}
