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
  { id: 'azul-logo', name: 'Azul del logo', hex: '#003866', use: 'Color exacto de los archivos del logo' },
  { id: 'azul', name: 'Azul Hauscenter', hex: '#123B64', use: 'Fondos de artes, logos y elementos corporativos' },
  { id: 'naranja', name: 'Naranja promocional', hex: '#E76100', use: 'Ofertas, acentos comerciales' },
  { id: 'crema', name: 'Crema', hex: '#FAF7F0', use: 'Fondos claros' },
  { id: 'arena', name: 'Arena cálido', hex: '#F3E4CD', use: 'Fondos y contraste' },
  { id: 'azul-apoyo', name: 'Azul de apoyo', hex: '#DCE3EB', use: 'Fondos de apoyo' },
  { id: 'blanco', name: 'Blanco', hex: '#FFFFFF', use: 'Textos sobre azul, fondos' },
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
