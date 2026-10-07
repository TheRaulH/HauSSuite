import { useState } from 'react'
import { validateProduct, esCombo, tieneRegalo } from '../utils/productModel'

const inputClass =
  'w-full text-sm border border-transparent bg-transparent focus:bg-white focus:border-purple-300 rounded px-1.5 py-0.5 outline-none'

const miniInputClass =
  'w-full text-xs border border-transparent bg-transparent focus:bg-white focus:border-purple-300 rounded px-1 py-0.5 outline-none'

export default function ProductRow({ product, onUpdate, onDelete, onToggleSelect }) {
  const { valido } = validateProduct(product)
  // Estado local además del dato: así "+ Combo"/"+ Regalo" puede revelar los
  // campos aunque todavía estén vacíos (recién agregados a mano).
  const [showCombo, setShowCombo] = useState(esCombo(product))
  const [showRegalo, setShowRegalo] = useState(tieneRegalo(product))
  const combo = showCombo || esCombo(product)
  const regalo = showRegalo || tieneRegalo(product)

  function handleNumberChange(field, value) {
    onUpdate(product.id, { [field]: value === '' ? null : Number(value) })
  }

  function handleTextChange(field, value) {
    const trimmed = value.trim()
    onUpdate(product.id, { [field]: trimmed === '' ? null : trimmed })
  }

  return (
    <tr className={`border-b border-gray-100 ${!valido ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
      <td className="px-2 py-2 align-top">
        <input
          type="checkbox"
          checked={product.seleccionado}
          onChange={() => onToggleSelect(product.id)}
        />
      </td>
      <td className="px-2 py-2 w-32 align-top">
        <input
          className={inputClass}
          value={product.codigo ?? ''}
          placeholder="—"
          onChange={(e) => handleTextChange('codigo', e.target.value)}
          title="Código para buscar/emparejar la imagen"
        />
        {combo && (
          <input
            className={`${miniInputClass} mt-1 text-purple-600`}
            value={product.codigo2 ?? ''}
            placeholder="código 2 —"
            onChange={(e) => handleTextChange('codigo2', e.target.value)}
            title="Código del 2º producto (combo)"
          />
        )}
        {regalo && (
          <input
            className={`${miniInputClass} mt-1 text-orange-600`}
            value={product.regaloCodigo ?? ''}
            placeholder="código regalo —"
            onChange={(e) => handleTextChange('regaloCodigo', e.target.value)}
            title="Código del regalo"
          />
        )}
      </td>
      <td className="px-2 py-2 w-32 align-top">
        <input
          className={inputClass}
          value={product.codigoMostrar ?? ''}
          placeholder={product.codigo ?? '—'}
          onChange={(e) => handleTextChange('codigoMostrar', e.target.value)}
          title="Código a imprimir en el arte, si es distinto al de búsqueda"
        />
      </td>
      <td className="px-2 py-2 min-w-[180px] align-top">
        <input
          className={inputClass}
          value={product.nombre}
          onChange={(e) => onUpdate(product.id, { nombre: e.target.value })}
        />
        {combo && (
          <input
            className={`${miniInputClass} mt-1 text-purple-600`}
            value={product.nombre2 ?? ''}
            placeholder="+ 2º producto del combo"
            onChange={(e) => handleTextChange('nombre2', e.target.value)}
            title="Nombre del 2º producto (combo)"
          />
        )}
        {regalo && (
          <input
            className={`${miniInputClass} mt-1 text-orange-600`}
            value={product.regaloNombre ?? ''}
            placeholder="+ regalo"
            onChange={(e) => handleTextChange('regaloNombre', e.target.value)}
            title="Nombre del regalo"
          />
        )}
        {(!combo || !regalo) && (
          <div className="flex gap-2 mt-1">
            {!combo && (
              <button
                type="button"
                onClick={() => setShowCombo(true)}
                className="text-[11px] text-purple-500 hover:underline"
              >
                + Combo
              </button>
            )}
            {!regalo && (
              <button
                type="button"
                onClick={() => setShowRegalo(true)}
                className="text-[11px] text-orange-500 hover:underline"
              >
                + Regalo
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-2 py-2 w-24 align-top">
        <input
          type="number"
          className={inputClass}
          value={product.precio ?? ''}
          onChange={(e) => handleNumberChange('precio', e.target.value)}
        />
      </td>
      <td className="px-2 py-2 w-28 align-top">
        <input
          type="number"
          placeholder="—"
          className={inputClass}
          value={product.precioAntes ?? ''}
          onChange={(e) => handleNumberChange('precioAntes', e.target.value)}
        />
      </td>
      <td className="px-2 py-2 w-16 align-top">
        <input
          type="number"
          className={inputClass}
          value={product.cuotas ?? ''}
          onChange={(e) => handleNumberChange('cuotas', e.target.value)}
        />
      </td>
      <td className="px-2 py-2 text-center w-24 align-top">
        <div className="flex justify-center gap-1">
          <Thumb src={product.imagen} title="Imagen principal" />
          {combo && <Thumb src={product.imagen2} title="Imagen 2º producto" />}
          {regalo && <Thumb src={product.regaloImagen} title="Imagen del regalo" />}
        </div>
      </td>
      <td className="px-2 py-2 text-center w-20 align-top">
        <button
          type="button"
          onClick={() => onDelete(product.id)}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          Eliminar
        </button>
      </td>
    </tr>
  )
}

function Thumb({ src, title }) {
  return src ? (
    <img src={src} alt="" title={title} className="w-8 h-8 object-cover rounded border border-gray-200" />
  ) : (
    <span title={title} className="text-amber-500">
      ⚠
    </span>
  )
}
