/**
 * DISEÑOS — definidos directamente en código.
 *
 * Un "diseño" es un paquete de 4 plantillas (una por cada formato
 * obligatorio: square, portrait, landscape, story — ver FORMATS en
 * utils/templateModel.js). A diferencia de antes, cada formato NO es un
 * objeto de configuración genérico — es un componente React propio,
 * hecho a mano para ese diseño y ese formato puntual. Esto da control
 * total: un diseño puede ser un simple precio + imagen, uno con
 * porcentaje de descuento, un combo de 2 productos, condiciones, etc. —
 * lo que haga falta, sin las limitaciones de un renderer genérico.
 *
 * ── Cómo agregar un diseño nuevo ──────────────────────────────────────
 *  1) Creá una carpeta src/templates/<id-del-diseño>/ con 4 componentes:
 *     Square.jsx, Portrait.jsx, Landscape.jsx, Story.jsx (mirá
 *     src/templates/expohaus/ como referencia). Cada uno recibe
 *     `{ product, image }` y devuelve el lienzo completo del tamaño que
 *     le toca (1080×1080, 1080×1350, 1920×1080 o 1080×1920).
 *  2) Poné los fondos PNG en /public/templates/<id-del-diseño>/ y
 *     referencialos con <img src="/templates/..."> dentro de cada
 *     componente (no pasan por el bundler — podés reemplazarlos sin
 *     tocar el código).
 *  3) Importá los 4 componentes acá abajo y agregá la entrada al array
 *     DESIGNS, con el `width`/`height` que le corresponde a cada uno.
 *
 * Si te falta un formato o las medidas no coinciden con las esperadas,
 * vas a ver un aviso en la consola del navegador al cargar la app (ver
 * validateDesign en utils/templateModel.js).
 */

import ExpoHausSquare from './expohaus/Square'
import ExpoHausPortrait from './expohaus/Portrait'
import ExpoHausLandscape from './expohaus/Landscape'
import ExpoHausStory from './expohaus/Story'

import PromoSquare from './10_promo/Square'
import PromoPortrait from './10_promo/Portrait'
import PromoLandscape from './10_promo/Landscape'
import PromoStory from './10_promo/Story'

import GeneralSquare from './10_general/Square'
import GeneralPortrait from './10_general/Portrait'
import GeneralLandscape from './10_general/Landscape'
import GeneralStory from './10_general/Story'

import NewsSquare from './10_news/Square'
import NewsPortrait from './10_news/Portrait'
import NewsLandscape from './10_news/Landscape'
import NewsStory from './10_news/Story'

import NewsMatterSSSquare from './10_newsmatterss/Square'
import NewsMatterSSPortrait from './10_newsmatterss/Portrait'
import NewsMatterSSLandscape from './10_newsmatterss/Landscape'
import NewsMatterSSStory from './10_newsmatterss/Story'

import MattersPromoBadgeSquare from './10_MattressPromoBadge/Square'
import MattersPromoBadgePortrait from './10_MattressPromoBadge/Portrait'
import MattersPromoBadgeLandscape from './10_MattressPromoBadge/Landscape'
import MattersPromoBadgeStory from './10_MattressPromoBadge/Story'

import GiftProductSquare from './10_GiftProduct/Square'
import GiftProductPortrait from './10_GiftProduct/Portrait'
import GiftProductLandscape from './10_GiftProduct/Landscape'
import GiftProductStory from './10_GiftProduct/Story'

import OnlineOffersSquare from './10_OnlineOffers/Square'
import OnlineOffersPortrait from './10_OnlineOffers/Portrait'
import OnlineOffersLandscape from './10_OnlineOffers/Landscape'
import OnlineOffersStory from './10_OnlineOffers/Story'

export const DESIGNS = [
  {
    id: 'expohaus',
    nombre: 'ExpoHaus',
    formatos: {
      square: { width: 1080, height: 1080, Component: ExpoHausSquare },
      portrait: { width: 1080, height: 1350, Component: ExpoHausPortrait },
      landscape: { width: 1920, height: 1080, Component: ExpoHausLandscape },
      story: { width: 1080, height: 1920, Component: ExpoHausStory },
    },
  },
  {
    id: '10_promo',
    nombre: 'PROMO OCTUBRE',
    formatos: {
      square: { width: 1080, height: 1080, Component: PromoSquare },
      portrait: { width: 1080, height: 1350, Component: PromoPortrait },
      landscape: { width: 1920, height: 1080, Component: PromoLandscape },
      story: { width: 1080, height: 1920, Component: PromoStory },
    },
  },
  {
    id: '10_general',
    nombre: 'GENERAL OCTUBRE',
    formatos: {
      square: { width: 1080, height: 1080, Component: GeneralSquare },
      portrait: { width: 1080, height: 1350, Component: GeneralPortrait },
      landscape: { width: 1920, height: 1080, Component: GeneralLandscape },
      story: { width: 1080, height: 1920, Component: GeneralStory },
    },
  },
  {
    id: '10_nuevos',
    nombre: 'NUEVOS PRODUCTOS',
    formatos: {
      square: { width: 1080, height: 1080, Component: NewsSquare },
      portrait: { width: 1080, height: 1350, Component: NewsPortrait },
      landscape: { width: 1920, height: 1080, Component: NewsLandscape },
      story: { width: 1080, height: 1920, Component: NewsStory },
    },
  },
  {
    id: '10_newsmatterss',
    nombre: 'NUEVOS COLCHONES',
    formatos: {
      square: { width: 1080, height: 1080, Component: NewsMatterSSSquare },
      portrait: { width: 1080, height: 1350, Component: NewsMatterSSPortrait },
      landscape: { width: 1920, height: 1080, Component: NewsMatterSSLandscape },
      story: { width: 1080, height: 1920, Component: NewsMatterSSStory },
    },
  },
  {
    id: '10_MattressPromoBadge',
    nombre: 'SOLO CON COLCHONES',
    formatos: {
      square: { width: 1080, height: 1080, Component: MattersPromoBadgeSquare },
      portrait: { width: 1080, height: 1350, Component: MattersPromoBadgePortrait },
      landscape: { width: 1920, height: 1080, Component: MattersPromoBadgeLandscape },
      story: { width: 1080, height: 1920, Component: MattersPromoBadgeStory },
    },
  },
  {
    id: '10_GiftProduct',
    nombre: 'REGALO CON COMPRA',
    formatos: {
      square: { width: 1080, height: 1080, Component: GiftProductSquare },
      portrait: { width: 1080, height: 1350, Component: GiftProductPortrait },
      landscape: { width: 1920, height: 1080, Component: GiftProductLandscape },
      story: { width: 1080, height: 1920, Component: GiftProductStory },
    },
  },
  {
    id: '10_OnlineOffers',
    nombre: 'OFERTAS WEB OCTUBRE',
    formatos: {
      square: { width: 1080, height: 1080, Component: OnlineOffersSquare },
      portrait: { width: 1080, height: 1350, Component: OnlineOffersPortrait },
      landscape: { width: 1920, height: 1080, Component: OnlineOffersLandscape },
      story: { width: 1080, height: 1920, Component: OnlineOffersStory },
    },
  },


]
