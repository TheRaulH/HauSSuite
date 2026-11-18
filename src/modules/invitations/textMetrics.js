/**
 * Anchos reales de Montserrat (por cada letra, en milésimas de em) para calcular
 * cuánto ocupa un texto SIN medirlo en el DOM. Así los textos largos se achican
 * solos para no salirse de su caja, y el resultado es idéntico en la vista previa
 * y en el PNG exportado.
 *
 * Generado midiendo Montserrat (variable) en pesos 500 / 700 / 800 / 900.
 */
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:;-–—·/&%()'\"+@#$!?¡¿ÁÉÍÓÚÑÜáéíóúñü°ª•"
const TABLE = {
  500: [667, 370, 574, 572, 669, 574, 617, 598, 644, 617, 732, 757, 713, 826, 670, 635, 772, 812, 310, 513, 719, 594, 955, 812, 840, 722, 840, 727, 621, 587, 791, 712, 1126, 673, 647, 657, 598, 682, 571, 682, 612, 353, 690, 681, 279, 284, 615, 279, 1057, 681, 635, 682, 682, 410, 501, 414, 677, 559, 899, 552, 559, 521, 269, 227, 227, 227, 227, 383, 500, 1000, 267, 352, 686, 843, 337, 338, 210, 391, 582, 1034, 703, 621, 268, 573, 268, 573, 732, 670, 310, 840, 791, 812, 791, 598, 612, 279, 635, 677, 681, 677, 419, 404, 314],
  700: [679, 392, 590, 592, 689, 595, 637, 620, 660, 637, 766, 765, 724, 826, 671, 639, 771, 808, 328, 541, 740, 604, 955, 808, 844, 732, 844, 735, 638, 618, 788, 746, 1163, 714, 676, 671, 617, 690, 591, 692, 631, 387, 700, 691, 301, 307, 655, 301, 1049, 691, 655, 690, 690, 431, 531, 435, 687, 598, 937, 595, 598, 543, 283, 262, 262, 262, 262, 386, 500, 1000, 302, 392, 728, 877, 357, 358, 230, 437, 599, 1035, 720, 638, 289, 589, 289, 589, 766, 671, 328, 844, 788, 808, 788, 617, 631, 301, 655, 687, 691, 687, 418, 412, 358],
  800: [685, 405, 599, 603, 700, 607, 649, 632, 669, 649, 786, 769, 730, 826, 672, 642, 770, 806, 339, 557, 752, 610, 954, 806, 846, 737, 846, 740, 647, 635, 786, 766, 1184, 737, 693, 679, 628, 695, 603, 698, 642, 406, 705, 696, 313, 320, 677, 313, 1045, 696, 666, 695, 695, 443, 547, 447, 692, 620, 956, 619, 620, 556, 291, 283, 283, 283, 283, 388, 500, 1000, 323, 415, 752, 897, 369, 369, 242, 462, 609, 1036, 730, 647, 301, 597, 301, 597, 786, 672, 339, 846, 786, 806, 786, 628, 642, 313, 666, 692, 696, 692, 417, 417, 383],
  900: [692, 418, 608, 614, 712, 619, 661, 645, 678, 661, 806, 773, 737, 826, 673, 644, 769, 804, 350, 574, 765, 617, 954, 804, 848, 743, 848, 745, 657, 654, 784, 786, 1206, 762, 710, 687, 639, 700, 615, 705, 653, 426, 711, 702, 326, 334, 701, 326, 1040, 702, 678, 700, 700, 456, 565, 460, 698, 644, 977, 645, 644, 570, 300, 304, 304, 304, 304, 390, 500, 1000, 344, 440, 777, 917, 381, 381, 254, 489, 620, 1037, 740, 657, 314, 606, 314, 606, 806, 673, 350, 848, 784, 804, 784, 639, 653, 326, 678, 698, 702, 698, 416, 422, 410],
}

const INDEX = new Map([...CHARS].map((ch, i) => [ch, i]))
const FALLBACK = 700 // milésimas de em para caracteres que no están en la tabla (emojis, etc.)

function tableFor(weight) {
  if (weight <= 600) return TABLE[500]
  if (weight <= 750) return TABLE[700]
  if (weight <= 850) return TABLE[800]
  return TABLE[900]
}

/** Ancho aproximado (px) de `text` con la fuente a `size` px. */
export function textWidth(text, size, weight = 900, letterSpacing = 0) {
  const table = tableFor(weight)
  let total = 0
  let count = 0
  for (const ch of String(text ?? '')) {
    const i = INDEX.get(ch)
    total += i === undefined ? FALLBACK : table[i]
    count += 1
  }
  return (total / 1000) * size + count * letterSpacing
}

/**
 * Tamaño de letra que hace que `text` quepa en `maxWidth` (nunca mayor a `size`).
 * Para textos en mayúsculas pasa `upper: true`.
 */
export function fitSize(text, size, maxWidth, { weight = 900, letterSpacing = 0, upper = false, min = 14 } = {}) {
  const value = upper ? String(text ?? '').toUpperCase() : String(text ?? '')
  const width = textWidth(value, size, weight, letterSpacing)
  if (width <= maxWidth || width === 0) return size
  // el letter-spacing no escala con el tamaño: se resuelve en dos pasadas
  let next = Math.floor((size * (maxWidth - value.length * letterSpacing)) / (width - value.length * letterSpacing))
  next = Math.max(min, Math.min(size, next))
  return next
}

/** Divide `text` en líneas como lo haría el navegador (respeta los saltos de línea que escribas). */
export function wrapLines(text, size, maxWidth, { weight = 500, letterSpacing = 0, upper = false } = {}) {
  const lines = []
  for (const paragraph of String(text ?? '').split('\n')) {
    const words = (upper ? paragraph.toUpperCase() : paragraph).split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (current && textWidth(candidate, size, weight, letterSpacing) > maxWidth) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    lines.push(current)
  }
  return lines
}

/** Tamaño de la palabra más larga: evita que una palabra sola se salga de la caja. */
export function fitWords(text, size, maxWidth, { weight = 900, letterSpacing = 0, upper = false, min = 14 } = {}) {
  const longest = String(text ?? '')
    .split(/\s+/)
    .reduce((a, b) => (b.length > a.length ? b : a), '')
  return fitSize(longest, size, maxWidth, { weight, letterSpacing, upper, min })
}

/**
 * Para textos que pueden ocupar varias líneas dentro de una caja de alto limitado:
 * baja el tamaño hasta que el texto (ya partido en líneas) entre en `maxWidth × maxHeight`.
 */
export function fitBlock(text, { size, min = 14, maxWidth, maxHeight, lineHeight = 1.2, weight = 500, letterSpacing = 0, upper = false }) {
  for (let s = size; s > min; s -= 1) {
    const lines = wrapLines(text, s, maxWidth, { weight, letterSpacing, upper })
    const tooWide = lines.some((l) => textWidth(upper ? l.toUpperCase() : l, s, weight, letterSpacing) > maxWidth)
    if (!tooWide && lines.length * s * lineHeight <= maxHeight) return s
  }
  return min
}
