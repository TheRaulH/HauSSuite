import { fitSize, textWidth } from '../textMetrics';
import {
  BrandPill,
  FONT,
  Photo,
  Txt,
  clamp,
  dateParts,
  geometry,
  hourParts,
  makePalette,
} from './shared';

/** V1 · Fecha protagonista */
export default function T1({ data, width, height, kind }) {
  const pal = makePalette(data.colores);
  const dp = dateParts(data);
  const hr = hourParts(data);
  const g = geometry(width, height, kind);
  const { W, H, sp, sb } = g;

  const root = {
    width: W,
    height: H,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: FONT,
    background: pal.bgSoft,
  };

  const barH = (g.story ? 220 : 190) + sb;
  const barTop = H - barH;
  const photoW = g.wide ? 560 : 470;
  const nameMax = g.wide ? 1150 : 988;
  const k = g.story ? 1.18 : kind === 'portrait' ? 1.08 : 1; // en formatos altos los textos de la barra crecen
  const nameSize = fitSize(
    data.nombre,
    g.wide ? 300 : g.story ? 310 : kind === 'portrait' ? 280 : 260,
    nameMax,
    { upper: true }
  );
  const preSize = fitSize(data.pretitulo, 46, W - 112, {
    weight: 800,
    letterSpacing: 4,
    upper: true,
  });
  const tagSize = fitSize(data.etiqueta, 26, g.wide ? 900 : 560, {
    weight: 800,
    letterSpacing: 3,
    upper: true,
  });

  /* Zona de la fecha + foto */
  let dayTop,
    photoTop,
    photoH,
    daySize,
    dayLeft = 56;
  const nameBottom = 206 + sp + nameSize * 1.05;
  if (!g.wide) {
    const top0 = nameBottom - 25;
    const bottom0 = barTop - 30;
    const region = bottom0 - top0;
    photoH = clamp(region - 20, 380, 900);
    photoTop = top0 + (region - photoH) / 2;
    daySize = fitSize(dp.dayBig, 340, W - 112 - photoW - 30, { weight: 900 });
    dayTop = photoTop + (photoH - (daySize * 0.9 + 80)) / 2;
  } else {
    photoTop = 150;
    photoH = barTop - 30 - photoTop;
    daySize = fitSize(dp.dayBig, 420, 640, { weight: 900 });
    dayTop = nameBottom + (barTop - 20 - nameBottom - daySize * 0.9) / 2;
  }
  const monthSize = fitSize(
    dp.monthLong,
    62,
    g.wide ? 700 : W - 112 - photoW - 30,
    { weight: 900, letterSpacing: 2, upper: true }
  );

  /* Barra inferior */
  const hasHour = Boolean(hr.range);
  const hourW = hasHour
    ? clamp(textWidth(hr.range, 46 * k, 900) + 20, 240, 440)
    : 0;
  const gap = 48;
  const leftW = W - 112 - (hasHour ? hourW + gap * 2 + 4 : 0);
  const lugarSize = fitSize(data.lugar, 46 * k, leftW, { weight: 900 });
  const dirSize = fitSize(data.direccion, 22 * k, leftW, { weight: 500 });
  const hourSize = fitSize(hr.range, 46 * k, hourW, { weight: 900 });

  return (
    <div style={root}>
      <BrandPill data={data} pal={pal} style={{ left: 56, top: 52 + sp }} />
      <Txt
        style={{
          right: 56,
          top: 68 + sp,
          width: g.wide ? 900 : 560,
          textAlign: 'right',
          color: pal.accentDark,
          fontWeight: 800,
          fontSize: tagSize,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {data.etiqueta}
      </Txt>

      <Photo
        img={data.fotos?.foto1}
        label={'FOTO DE LA\nACTIVACIÓN'}
        pal={pal}
        style={{
          right: 56,
          top: photoTop,
          width: photoW,
          height: photoH,
          borderRadius: `${photoW / 2}px ${photoW / 2}px 36px 36px`,
        }}
      />

      <Txt
        style={{
          left: 56,
          top: 170 + sp,
          color: pal.primary,
          fontWeight: 800,
          fontSize: preSize,
          letterSpacing: 4,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {data.pretitulo}
      </Txt>
      <Txt
        style={{
          left: 46,
          top: 206 + sp,
          color: pal.accent,
          fontWeight: 900,
          fontSize: nameSize,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {data.nombre}
      </Txt>

      <Txt
        style={{
          left: dayLeft,
          top: dayTop,
          color: pal.primary,
          fontWeight: 900,
          fontSize: daySize,
          lineHeight: 0.9,
          whiteSpace: 'nowrap',
        }}
      >
        {dp.dayBig}
      </Txt>
      <Txt
        style={
          g.wide
            ? {
                left: dayLeft + textWidth(dp.dayBig, daySize, 900) + 50,
                top: dayTop + (daySize * 0.9 - monthSize * 1.2) / 2,
                color: pal.accent,
                fontWeight: 900,
                fontSize: monthSize,
                letterSpacing: 2,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }
            : {
                left: 62,
                top: dayTop + daySize * 0.9 + 14,
                color: pal.accent,
                fontWeight: 900,
                fontSize: monthSize,
                letterSpacing: 2,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }
        }
      >
        {dp.monthLong}
      </Txt>

      {/* Barra inferior: dónde y cuándo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: barH,
          background: pal.primary,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap,
          padding: `0 56px ${sb}px`,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: leftW, flex: 'none' }}>
          <div
            style={{
              color: pal.accentLight,
              fontWeight: 700,
              fontSize: 22 * k,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            {data.rotuloLugar}
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: lugarSize,
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}
          >
            {data.lugar}
          </div>
          <div
            style={{ fontWeight: 500, fontSize: dirSize, whiteSpace: 'nowrap' }}
          >
            {data.direccion}
          </div>
        </div>
        {hasHour && (
          <>
            <div
              style={{
                width: 4,
                height: 110,
                background: pal.accent,
                flex: 'none',
              }}
            />
            <div style={{ width: hourW, flex: 'none' }}>
              <div
                style={{
                  color: pal.accentLight,
                  fontWeight: 700,
                  fontSize: 22 * k,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                {data.rotuloHora}
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: hourSize,
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                }}
              >
                {hr.range}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
