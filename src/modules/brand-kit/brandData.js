import imagotipoRaw from '../../assets/brand/Imagotipo.svg?raw'
import imagotipoFraseRaw from '../../assets/brand/Imagotipo_con_frase.svg?raw'
import isologoRaw from '../../assets/brand/Isologo.svg?raw'
import isotipoRaw from '../../assets/brand/Isotipo.svg?raw'
import logotipoRaw from '../../assets/brand/Logotipo.svg?raw'

/**
 * LÍNEA GRÁFICA de Hauscenter — todo lo que muestra la página "Línea gráfica"
 * sale de este archivo (fuente: manual de marca).
 *
 *  · Para cambiar un color o una regla, edita las listas de abajo.
 *  · Para sumar un logo: deja el .svg en src/assets/brand/ (con fill="currentColor"),
 *    impórtalo arriba con ?raw y agrégalo a LOGOS.
 */

/* ───────────── Logos ───────────── */

/** Las únicas cuatro versiones cromáticas autorizadas. */
export const LOGO_VARIANTS = [
  { id: 'azul', label: 'Azul sobre claro', color: '#123B64', bg: '#FAF7F0' },
  { id: 'blanco-azul', label: 'Blanco sobre azul', color: '#FFFFFF', bg: '#123B64' },
  { id: 'negro', label: 'Monocromo negro', color: '#000000', bg: '#FFFFFF' },
  { id: 'blanco', label: 'Monocromo blanco', color: '#FFFFFF', bg: '#222222' },
]

export const LOGOS = [
  {
    id: 'imagotipo',
    name: 'Imagotipo',
    role: 'Principal vertical',
    use: 'Piezas institucionales, portadas, presentaciones y señalética, cuando el espacio lo permite.',
    svg: imagotipoRaw,
    fileName: 'hauscenter-imagotipo-vertical',
  },
  {
    id: 'isologo',
    name: 'Isologo',
    role: 'Principal horizontal',
    use: 'Espacios anchos: banners, encabezados, web, cintillos y formatos de baja altura.',
    svg: isologoRaw,
    fileName: 'hauscenter-isologo-horizontal',
  },
  {
    id: 'isotipo',
    name: 'Isotipo',
    role: 'Apoyo',
    use: 'Casa con una H dentro. Ícono, sello, avatar, marca de agua, patrón y señalización.',
    svg: isotipoRaw,
    fileName: 'hauscenter-isotipo',
  },
  {
    id: 'logotipo',
    name: 'Logotipo',
    role: 'Solo el nombre',
    use: 'El nombre “Hauscenter” con sus proporciones oficiales. No se redibuja ni se reemplaza por una tipografía.',
    svg: logotipoRaw,
    fileName: 'hauscenter-logotipo',
  },
  {
    id: 'imagotipo-frase',
    name: 'Imagotipo con frase',
    role: 'Solo institucional',
    use: 'Imagotipo + “Tu hogar avanza contigo”. Únicamente en posicionamiento institucional y con espacio suficiente; no sustituye al imagotipo principal.',
    warning: 'No lo uses en piezas promocionales ni en formatos pequeños.',
    svg: imagotipoFraseRaw,
    fileName: 'hauscenter-imagotipo-con-frase',
  },
]

export const LOGO_ALLOWED_BACKGROUNDS = [
  { title: 'Fondos claros', text: 'Usa la versión azul, con suficiente aire y contraste.' },
  { title: 'Fondos azules', text: 'Usa la versión blanca y evita saturar el espacio con otros elementos.' },
  { title: 'Fotografías', text: 'Solo sobre zonas limpias, sin rostros ni texturas fuertes detrás.' },
  { title: 'Bloques de apoyo', text: 'Si la foto es compleja, pon un bloque azul, blanco o arena detrás del logo.' },
]

export const LOGO_MISUSES = ['Deformarlo', 'Cambiar sus colores', 'Rotarlo', 'Añadirle sombras', 'Encerrarlo sin criterio', 'Reordenar sus elementos']

/* ───────────── Colores ───────────── */

export const COLORS = [
  { id: 'azul', group: 'Principales', name: 'Azul Hauscenter', hex: '#123B64', rgb: '18, 59, 100', cmyk: '100 / 45 / 0 / 59', pantone: '2955 C', role: 'Color patrimonial: siempre la base.' },
  { id: 'arena', group: 'Principales', name: 'Arena cálida', hex: '#F3E4CD', rgb: '243, 228, 205', cmyk: '7 / 15 / 23 / 0', pantone: '9180 C', role: 'Cercanía y calidez.' },
  { id: 'azul-apoyo', group: 'Principales', name: 'Azul apoyo', hex: '#DCE3EB', rgb: '220, 227, 235', cmyk: '17 / 11 / 7 / 0', pantone: '656 C', role: 'Jerarquías suaves dentro del universo corporativo.' },
  { id: 'blanco-calido', group: 'Principales', name: 'Blanco cálido', hex: '#FAF7F0', rgb: '250, 247, 240', cmyk: '3 / 5 / 7 / 0', pantone: '—', role: 'Limpieza (color complementario).' },
  { id: 'naranja', group: 'Acentos (uno por modo)', name: 'Naranja comercial', hex: '#E76100', rgb: '231, 97, 0', cmyk: '0 / 80 / 100 / 0', pantone: 'Orange 021 C', role: 'Modo Vivo: solo precios, CTA, urgencia, descuentos y campañas comerciales.' },
  { id: 'verde-oliva', group: 'Acentos (uno por modo)', name: 'Verde oliva', hex: '#7C8861', rgb: '124, 136, 97', cmyk: '60 / 40 / 71 / 0', pantone: '5773 C', role: 'Modo Hogar: detalles editoriales y comunicación emocional.' },
]

export const COLOR_BY_ID = Object.fromEntries(COLORS.map((c) => [c.id, c]))

/** Variables CSS oficiales. */
export const CSS_VARIABLES = `:root {
  --haus-azul: #123B64;
  --haus-arena: #F3E4CD;
  --haus-azul-apoyo: #DCE3EB;
  --haus-blanco: #FAF7F0;
  --haus-naranja: #E76100;  /* solo Modo Vivo: precios, CTA, descuentos */
  --haus-oliva: #7C8861;    /* solo Modo Hogar */
  --font-main: 'Outfit', sans-serif;
  --font-accent: 'KG The Fighter', cursive; /* solo palabras clave */
}`

/* ───────────── Tipografía ───────────── */

export const OUTFIT = {
  name: 'Outfit',
  role: 'Tipografía principal',
  use: 'Títulos, subtítulos, cuerpos breves y piezas digitales.',
  weights: [400, 500, 600, 700, 800],
  googleUrl: 'https://fonts.google.com/specimen/Outfit',
  cssImport: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');",
  cssFamily: "font-family: 'Outfit', sans-serif;",
}

export const KG = {
  name: 'KG The Fighter',
  role: 'Tipografía emocional (manuscrita)',
  use: 'Exclusiva de Hauscenter. Solo como acento en 1 o 2 palabras clave (sustantivos, adjetivos o verbos) que humanicen el contenido.',
  never: ['Precios', 'Textos legales', 'Textos largos'],
  cssFamily: "font-family: 'KG The Fighter', cursive;",
}

/* ───────────── Formas ───────────── */

export const SHAPES = [
  {
    id: 'circulo',
    name: 'Círculo',
    use: 'Badges, sellos, avatares, íconos y marcos de foto.',
    css: '.forma-circulo { border-radius: 50%; }',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="currentColor"><circle cx="120" cy="120" r="120"/></svg>',
    fileName: 'forma-circulo',
  },
  {
    id: 'rect-3r',
    name: 'Rectángulo de tres esquinas redondeadas',
    use: 'Contenedores de texto, tarjetas y etiquetas. Una esquina conserva su ángulo recto (elige siempre la misma dentro de una pieza).',
    css: '.forma-rect-3r { border-radius: 9999px 9999px 9999px 0; }',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" fill="currentColor"><path d="M120,0H240A120,120 0 0 1 360,120A120,120 0 0 1 240,240H0V120A120,120 0 0 1 120,0Z"/></svg>',
    fileName: 'forma-rectangulo-tres-esquinas',
  },
  {
    id: 'rect-corte',
    name: 'Rectángulo con dos esquinas cortadas',
    use: 'Marcos, conectores y bloques de información (esquinas 1 y 4 rectas, 2 y 3 cortadas).',
    css: '.forma-rect-corte { clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%); }',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" fill="currentColor"><path d="M0,0H324L360,36V204L324,240H0Z"/></svg>',
    fileName: 'forma-rectangulo-esquinas-cortadas',
  },
]

/* ───────────── Modos de comunicación ───────────── */

export const MODES_GUIDE = [
  { goal: 'Asesorar, explicar, orientar', mode: 'Experto' },
  { goal: 'Vender, promocionar', mode: 'Vivo' },
  { goal: 'Conectar emocionalmente', mode: 'Hogar' },
]

export const MODES = [
  {
    id: 'experto',
    name: 'Experto',
    tagline: 'Claridad + confianza + orientación',
    summary: 'La asesoría es el mensaje principal. Debe verse limpio, profesional y moderno: “somos confiables, ordenados, expertos y fáciles de entender”.',
    proportions: [
      { color: 'azul', pct: 70 },
      { color: 'arena', pct: 20 },
      { color: 'azul-apoyo', pct: 10 },
    ],
    rules: [
      'Una sola idea principal por pieza.',
      'Información ordenada por importancia, sin recursos que dificulten la lectura.',
      'Jerarquía: 1) beneficio principal → 2) producto o categoría → 3) recomendación → 4) marca, garantía o crédito → 5) CTA.',
    ],
  },
  {
    id: 'vivo',
    name: 'Vivo',
    tagline: 'Energía + oportunidad + facilidad',
    summary: 'Impulsa tráfico y ventas con comunicación joven, dinámica y positiva: mensajes directos y promociones claras.',
    proportions: [
      { color: 'azul', pct: 60 },
      { color: 'arena', pct: 25 },
      { color: 'naranja', pct: 15 },
    ],
    rules: [
      'El naranja solo va en precios, CTA, urgencia, descuentos y campañas comerciales.',
      'El naranja es acento: nunca desplaza al azul ni satura la composición.',
      'Máximo dos badges destacados por pieza, cada uno con un beneficio distinto, con el azul como soporte.',
    ],
  },
  {
    id: 'hogar',
    name: 'Hogar',
    tagline: 'Emoción + bienestar',
    summary: 'Vida cotidiana y momentos que hacen sentir mejor el hogar (Haus Hogar).',
    proportions: [
      { color: 'azul', pct: 50 },
      { color: 'blanco-calido', pct: 30 },
      { color: 'verde-oliva', pct: 20 },
    ],
    rules: [
      'El verde oliva va en detalles editoriales, categorías suaves y comunicación emocional.',
      'Prioriza escenas reales, mensajes cercanos y composición cálida.',
      'Hausito no se asigna a este modo.',
    ],
  },
]

/* ───────────── Hausito y lista de verificación ───────────── */

export const HAUSITO = {
  summary: 'Experto amigable que acerca la marca al hogar: confianza, asesoría y energía positiva. Moderno, útil y cercano, sin caer en lo infantil ni en lo demasiado técnico.',
  traits: ['Azul corporativo como color principal', 'Detalles beige (calidez)', 'Acentos naranjas (dinamismo comercial)', 'Sonrisa y gestos expresivos', 'Tablet y flexómetro'],
  rules: [
    'No reemplaza al logo: lo complementa, sin competir con el producto ni el mensaje principal.',
    'Modo Experto: orienta, explica o acompaña información útil.',
    'Modo Vivo: refuerza promociones, beneficios y CTA.',
    'No se usa en Modo Hogar.',
  ],
}

export const CHECKLIST = [
  'El azul Hauscenter domina y el acento no lo desplaza',
  'Se respeta la proporción de color del modo',
  'Logo oficial, en una versión cromática permitida, sin sombras, rotación ni deformación',
  'El logo va sobre una zona limpia o un bloque de apoyo, sin rostros detrás',
  'Outfit en los textos; KG The Fighter solo como acento (nunca en precios, textos legales ni textos largos)',
  'Las formas derivan del isotipo (círculo y los dos rectángulos)',
  'Modo Vivo: máximo 2 badges y naranja solo en precio, CTA o descuento',
  'Modo Experto: una idea principal y jerarquía clara',
  'Hausito complementa, no compite con el logo ni el producto',
  'El imagotipo con frase solo en piezas institucionales con espacio',
]
