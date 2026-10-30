import React from 'react';
import { formatMoney } from '../templates/shared';

const tieneValor = (valor) =>
  valor !== null && valor !== undefined && valor !== '';

const tienePrecioAntes = (valor) => {
  if (!tieneValor(valor)) return false;

  const numero = Number(String(valor).replace(/[^\d.]/g, ''));

  return Number.isFinite(numero) && numero > 0;
};

export default function PriceTag({
  before,
  price,
  installments,
  width = 600,
  style = {},
  className = '',
}) {
  const scale = width / 1080;

  const beforeHeight = 75 * scale;
  const backgroundHeight = 513 * scale;

  const textStyle = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height: beforeHeight + backgroundHeight,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* PRECIO ANTERIOR */}
      {tienePrecioAntes(before) && (
        <div
          style={{
            ...textStyle,
            left: 0,
            top: 0,
            width: '100%',
            height: beforeHeight,
            fontSize: 90 * scale,
            fontWeight: 600,
            color: '#123B64',
            textDecoration: 'line-through',
            textDecorationColor: '#E76100',
            textDecorationThickness: `${3 * scale}px`,
          }}
        >
          Antes: Bs. {formatMoney(before)}
        </div>
      )}

      {/* FONDO SVG */}
      <img
        src="src\assets\price-tag-bg.svg"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: 0,
          top: beforeHeight + 30 * scale,
          width: '100%',
          height: backgroundHeight,
          objectFit: 'fill',
          pointerEvents: 'none',
        }}
      />

      {/* PRECIO ACTUAL */}
      {tieneValor(price) && (
        <div
          style={{
            ...textStyle,
            left: 30 * scale,
            top: beforeHeight + 132 * scale,
            width: 1020 * scale,
            height: 180 * scale,
            fontSize: 200 * scale,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          Bs. {formatMoney(price)}
        </div>
      )}

      {/* IMPORTE DE CUOTA */}
      {tieneValor(installments) && (
        <div
          style={{
            ...textStyle,
            left: 630 * scale,
            top: beforeHeight + 415 * scale,
            width: 300 * scale,
            height: 100 * scale,
            fontSize: 68 * scale,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          Bs. {formatMoney(installments)}
        </div>
      )}
    </div>
  );
}
