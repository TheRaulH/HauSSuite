import logoHauscenterRaw from '../../assets/LogoHauscenter.svg?raw'
import logoHauscenterUrl from '../../assets/LogoHauscenter.svg?url'
import crediHausRaw from '../../assets/CrediHaus.svg?raw'
import crediHausUrl from '../../assets/CrediHaus.svg?url'
import preciadorRaw from '../../assets/PreciadorDesc.svg?raw'
import preciadorUrl from '../../assets/PreciadorDesc.svg?url'
import curvaAzulRaw from '../../assets/CurvaAzul.svg?raw'
import curvaAzulUrl from '../../assets/CurvaAzul.svg?url'

/**
 * LÍNEA GRÁFICA de Hauscenter — todo lo que muestra la página "Línea gráfica"
 * sale de este archivo. Para cambiar un color, sumar un logo o una tipografía,
 * solo editá las listas de abajo.
 *
 * Para sumar un logo nuevo: dejá el .svg en src/assets/, importalo arriba
 * (con ?raw y ?url) y agregalo a LOGOS o a GRAPHIC_ELEMENTS.
 */

export const COLORS = [
  { id: 'azul', name: 'Azul Hauscenter', hex: '#123B64', use: 'Color patrimonial: siempre la base (Pantone 2955 C)' },
  { id: 'arena', name: 'Arena cálida', hex: '#F3E4CD', use: 'Cercanía y calidez (Pantone 9180 C)' },
  { id: 'azul-apoyo', name: 'Azul apoyo', hex: '#DCE3EB', use: 'Jerarquías suaves del universo corporativo (Pantone 656 C)' },
  { id: 'blanco-calido', name: 'Blanco cálido', hex: '#FAF7F0', use: 'Limpieza y fondos claros' },
  { id: 'naranja', name: 'Naranja comercial', hex: '#E76100', use: 'Modo Vivo: solo precios, CTA, urgencia y descuentos (Pantone Orange 021 C)' },
  { id: 'verde-oliva', name: 'Verde oliva', hex: '#7C8861', use: 'Modo Hogar: detalles editoriales y comunicación emocional (Pantone 5773 C)' },
  { id: 'blanco', name: 'Blanco', hex: '#FFFFFF', use: 'Textos sobre azul y fondos' },
]

export const FONTS = [
  {
    id: 'outfit',
    name: 'Outfit',
    role: 'Tipografía principal',
    weights: [400, 500, 600, 700, 800],
    googleUrl: 'https://fonts.google.com/specimen/Outfit',
    cssImport: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');",
    cssFamily: "font-family: 'Outfit', sans-serif;",
    sample: 'Ofertas que se sienten en casa',
  },
]

export const LOGOS = [
  {
    id: 'logo-hauscenter',
    name: 'Logo Hauscenter',
    description: 'Logo principal',
    svg: logoHauscenterRaw,
    url: logoHauscenterUrl,
    fileName: 'logo-hauscenter',
  },
  {
    id: 'logo-credihaus',
    name: 'CrediHaus',
    description: 'Logo de financiamiento / cuotas',
    svg: crediHausRaw,
    url: crediHausUrl,
    fileName: 'credihaus',
  },
]

export const GRAPHIC_ELEMENTS = [
  {
    id: 'preciador',
    name: 'Preciador de descuento',
    description: 'Recuadro de precio de las plantillas',
    svg: preciadorRaw,
    url: preciadorUrl,
    fileName: 'preciador-descuento',
  },
  {
    id: 'curva-azul',
    name: 'Curva azul',
    description: 'Forma decorativa de fondo',
    svg: curvaAzulRaw,
    url: curvaAzulUrl,
    fileName: 'curva-azul',
  },
]
