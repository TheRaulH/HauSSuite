import { formatMoney } from '../shared';

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

// ───────── Componente Principal ─────────
export default function NewsPortrait({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo);
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo);

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
        src="/templates/10_news/vertical.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Sticker "Producto Nuevo" */}
      <img
        src="/icons/IconNewProduct.png"
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
          alt={nombreFormateado}
          style={{
            position: 'absolute',
            left: 500,
            top: 280,
            width: 550,
            height: 900,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Descripción del producto */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 400,
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

      {/* Código opcional del producto */}
      {product?.codigoMostrar && (
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 680,
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

      {/* Precio, dentro del recuadro naranja "Ahora" */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 885,
          width: 350,
          height: 95,
          fontSize: 70,
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
          left: 231,
          top: 1072,
          width: 165,
          fontSize: 35,
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

      {/* Tag pequeño fijo */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 1270,
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
