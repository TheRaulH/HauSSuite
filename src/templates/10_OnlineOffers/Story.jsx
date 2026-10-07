import OfertasWebBase from './Ofertaswebbase';

/* OFERTAS WEB — Historias 1080 x 1920 (9:16)

   Zonas seguras de Instagram: se deja libre ~250px arriba y ~270px abajo
   (la interfaz de historias tapa esas franjas). Todo el contenido vive
   entre y ≈ 270 y y ≈ 1650; el fondo sí llega hasta los bordes. */
const LAYOUT = {
  width: 1080,
  height: 1920,

  dyTitulo: 190, // titular arranca en y = 270

  // La forma azul baja 190px (para seguir envolviendo al titular)
  // y su diagonal se alarga para acompañar al producto
  forma: { dy: 190, stretch: 400 },

  imagen: { left: 440, top: 580, width: 620, height: 900 },

  dyIzquierda: 330, // bloque descripción + preciador + CrediHaus
  dyPie: 570, // regalo, nota legal y logo terminan en y ≈ 1615
};

export default function OfertasWebHistorias({ product, image }) {
  return <OfertasWebBase product={product} image={image} layout={LAYOUT} />;
}
