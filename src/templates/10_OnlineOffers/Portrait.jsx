import OfertasWebBase from './Ofertaswebbase';

/* OFERTAS WEB — Instagram 1080 x 1350 (4:5) */
const LAYOUT = {
  width: 1080,
  height: 1350,

  dyTitulo: 0, // el titular queda igual que en el cuadrado

  // Forma azul: misma curva superior, diagonal alargada hacia abajo
  forma: { dy: 0, stretch: 200 },

  // Producto más alto para aprovechar los 270px extra
  imagen: { left: 470, top: 300, width: 590, height: 860 },

  dyIzquierda: 120, // descripción, código, preciador y CrediHaus
  dyPie: 270, // regalo, nota legal, logo y esquina azul pegados al borde inferior
};

export default function OfertasWebInstagram({ product, image }) {
  return <OfertasWebBase product={product} image={image} layout={LAYOUT} />;
}
