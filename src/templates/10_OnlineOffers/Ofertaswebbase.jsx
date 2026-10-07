import { formatMoney } from '../shared';
import logoHauscenter from '../../assets/LogoHauscenter.svg';
import PreciadorDescuento from '../../assets/PreciadorDesc.svg';
import CrediHausLogo from '../../assets/CrediHaus.svg';

/* ════════════════════════════════════════════════════════════
   OFERTAS WEB — BASE PARAMETRIZABLE
   Misma composición del 1080x1080 final, pero las posiciones
   verticales se controlan con un objeto `layout`:

   layout = {
     width, height,          // tamaño del lienzo
     dyTitulo,               // desplazamiento vertical del titular
     forma: { dy, stretch }, // dy: baja la forma azul grande
                             // stretch: alarga la diagonal hacia abajo
     imagen: { left, top, width, height },
     dyIzquierda,            // desplaza descripción, código, preciador y CrediHaus
     dyPie,                  // desplaza regalo, nota legal, logo y esquina azul
   }
   ════════════════════════════════════════════════════════════ */

// ───────── Tokens de diseño ─────────
const COLORES = {
  azulFondo: '#00346a',
  azulTexto: '#123b64',
  crema: '#f4e3cd',
  naranja: '#e76100',
  blanco: '#ffffff',
};

const FUENTE_SCRIPT = "'KGFont', cursive";
const FUENTE_BASE = "'Outfit', sans-serif";

const FUENTES_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=Sacramento&display=swap');
`;

// ───────── Utilidades de nombre / código ─────────
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const tienePrecioAntes = (valor) => {
  if (valor === null || valor === undefined || valor === '') return false;
  const numero = Number(String(valor).replace(/[^\d.]/g, ''));
  return Number.isFinite(numero) && numero > 0;
};

// ───────── Formateo de nombre para mostrar ─────────
const MARCAS = { WH: 'WESTINGHOUSE', PH: 'PHILIPS' };
const ABREVIATURAS = { JGO: 'JUEGO', ALUM: 'ALUMINIO' };
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
  if (codigosTazaMasCafe.some((c) => codigoLimpio.includes(c))) {
    return '¡Llévala hoy y recibe gratis 1 Taza + Café de regalo!';
  }

  const codigosCafeterasTaza = [
    'WKCMGO11WH',
    'HD7430/90',
    'WKCMFS273',
    'CM482DB2',
  ];
  if (codigosCafeterasTaza.some((c) => codigoLimpio.includes(c))) {
    return '¡Llévate una taza de regalo por la compra de tu cafetera!';
  }

  return null;
};

// ════════════════════════════════════════════════════════════
// Fondo gráfico adaptable al alto del lienzo
// ════════════════════════════════════════════════════════════
const FondoGrafico = ({ width, height, forma, dyPie }) => {
  const dy = forma?.dy ?? 0;
  const stretch = forma?.stretch ?? 0;

  // La forma original (1080x1080) termina en y ≈ 908.5 sobre el borde derecho.
  const finY = 908.5 + dy + stretch;

  // Curva superior del Figma (igual que la versión final), desplazada `dy`.
  // Si dy > 0, el borde izquierdo baja recto desde y=0 hasta donde empieza la curva.
  const formaAzul = `
    M${width} ${finY}
    V0
    H381.33
    V${dy}
    C330.33 ${dy + 136.5} 387.33 ${dy + 218} 420.83 ${dy + 255.5}
    L${width} ${finY}
    Z
  `;

  // Esquina inferior izquierda: se desplaza con el pie y baja hasta el borde.
  const esquina = `
    M0 ${930 + dyPie}
    C62 ${968 + dyPie} 92 ${1020 + dyPie} 108 ${1080 + dyPie}
    V${height}
    H0
    Z
  `;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <rect width={width} height={height} fill={COLORES.crema} />
      <path d={formaAzul} fill={COLORES.azulFondo} />
      <path d={esquina} fill={COLORES.azulFondo} />
    </svg>
  );
};

// Titular "¡Nos renovamos, ES TU TURNO!"
const Titular = ({ dy = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: 418,
      top: 80 + dy,
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

// ════════════════════════════════════════════════════════════
// Componente base
// ════════════════════════════════════════════════════════════
export default function OfertasWebBase({ product, image, layout }) {
  const {
    width,
    height,
    dyTitulo = 0,
    forma,
    imagen,
    dyIzquierda = 0,
    dyPie = 0,
  } = layout;

  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo); // lógica (regalos)
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo); // para mostrar
  const textoRegalo = obtenerTextoRegalo(codigo, nombreSinCodigo);

  const yi = (v) => v + dyIzquierda; // posiciones de la columna izquierda
  const yp = (v) => v + dyPie; // posiciones del pie

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FUENTE_BASE,
        background: COLORES.crema,
      }}
    >
      <style>{FUENTES_CSS}</style>

      <FondoGrafico width={width} height={height} forma={forma} dyPie={dyPie} />

      <Titular dy={dyTitulo} />

      {/* Imagen del producto */}
      {image && (
        <img
          src={image}
          alt={nombreFormateado}
          style={{
            position: 'absolute',
            left: imagen.left,
            top: imagen.top,
            width: imagen.width,
            height: imagen.height,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Descripción del producto */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: yi(350),
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
            top: yi(582),
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

      {/* Preciador naranja "Ahora" */}
      <img
        src={PreciadorDescuento}
        alt="Ahora"
        style={{ position: 'absolute', left: 20, top: yi(655), width: 350 }}
      />

      {/* Descuento */}
      {tienePrecioAntes(product?.descuento) && (
        <div
          style={{
            position: 'absolute',
            left: 27,
            top: yi(669),
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

      {/* Precio */}
      <div
        style={{
          position: 'absolute',
          left: 65,
          top: yi(720),
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
            top: yi(790),
            width: 270,
            fontSize: 25,
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

      {/* Barra CrediHaus */}
      <img
        src={CrediHausLogo}
        alt="CrediHaus"
        style={{ position: 'absolute', left: 50, top: yi(850), width: 320 }}
      />

      {/* Cuota mensual */}
      <div
        style={{
          position: 'absolute',
          left: 215,
          top: yi(900),
          width: 140,
          fontSize: 31,
          fontWeight: 700,
          color: '#fff',
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

      {/* Tag de promoción dinámico (regalo / descuento) */}
      {textoRegalo && (
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: yp(940),
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
          top: yp(1020),
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
        style={{ position: 'absolute', left: 720, top: yp(980), width: 315 }}
      />
    </div>
  );
}
