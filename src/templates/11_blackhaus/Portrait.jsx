
export default function Vertical({ product, image }) {
  const codigo = product?.codigoMostrar?.toString().trim() || '';
  const nombreSinCodigo = quitarCodigoDelNombre(product?.nombre, codigo);
  const nombreFormateado = formatearNombreProducto(nombreSinCodigo);
  const textoRegalo = obtenerTextoRegalo(codigo, nombreSinCodigo);

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
      {/* Fondo vertical */}
      <img
        src="/templates/11_blackhaus/vertical.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
        }}
      />

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
          top: 440,
          width: 444,
          height: 220,
          fontSize: 70,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {renderTextoSoloSiEsLargo(nombreFormateado)}
      </div>

      {/* Código del producto */}
      {product?.codigoMostrar && (
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: 620,
            maxWidth: 444,
            height: 50,
            fontSize: 30,
            fontWeight: 400,
            border: '3px solid #fff',
            borderRadius: 50,
            color: '#fff',
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

      {/* Precio */}
      <PriceTag
        before={product?.precioAntes}
        price={product?.precio}
        installments={product?.cuotas}
        width={400}
        style={{
          position: 'absolute',
          left: 50,
          top: 690,
        }}
      />

      {/* Aviso legal */}
      <div
        style={{
          position: 'absolute',
          left: 830,
          top: 1290,
          width: 500,
          fontSize: 18,
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        *Precio sujeto a variación
      </div>
    </div>
  );
}
