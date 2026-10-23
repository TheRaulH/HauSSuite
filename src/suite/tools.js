import { BookOpen, CalendarDays, GalleryHorizontal, Palette, Search } from 'lucide-react'
import CarouselPage from '../modules/carousel/CarouselPage'
import ImageFinderPage from '../modules/image-finder/ImageFinderPage'
import BrandKitPage from '../modules/brand-kit/BrandKitPage'
import CatalogPage from '../modules/catalog/CatalogPage'
import CalendarPage from '../modules/calendar/CalendarPage'

/**
 * REGISTRO DE HERRAMIENTAS de HauSSuite.
 *
 * Para agregar una herramienta nueva:
 *  1) Crea su carpeta en src/modules/<nombre>/ con un componente de página.
 *  2) Impórtalo arriba y suma una entrada acá.
 * `icon` es un componente de lucide-react (https://lucide.dev/icons).
 * El menú lateral, la portada y las rutas se generan solos a partir de esta lista.
 *
 * Cada herramienta, una vez abierta, queda montada en segundo plano: al volver
 * a ella no se pierde lo que habías cargado (Excel, imágenes, lista, etc.).
 */
export const TOOLS = [
  {
    id: 'carruseles',
    path: '/carruseles',
    label: 'Generador de carruseles',
    description: 'Excel de productos → plantilla → PNG en todos los formatos, listo para descargar en ZIP.',
    icon: GalleryHorizontal,
    Component: CarouselPage,
  },
  {
    id: 'calendario',
    path: '/calendario',
    label: 'Calendario de contenidos',
    description: 'Planifica el mes de publicaciones, arrastra para reprogramar y marca lo ya publicado.',
    icon: CalendarDays,
    Component: CalendarPage,
  },
  {
    id: 'buscador-imagenes',
    path: '/buscador-imagenes',
    label: 'Buscador de imágenes',
    description: 'Pega una lista de productos y descargá en un ZIP las imágenes originales, tal cual están en tu carpeta.',
    icon: Search,
    Component: ImageFinderPage,
  },
  {
    id: 'linea-grafica',
    path: '/linea-grafica',
    label: 'Línea gráfica',
    description: 'Colores, logos y tipografías de Hauscenter para copiar, pegar o descargar.',
    icon: Palette,
    Component: BrandKitPage,
  },
  {
    id: 'catalogo',
    path: '/catalogo',
    label: 'Catálogo de productos',
    description: 'Descripción → código de búsqueda → código a mostrar. Lo usan el generador y el buscador.',
    icon: BookOpen,
    Component: CatalogPage,
  },
]
