import { useState } from 'react'
import ProductRow from './ProductRow'

export default function ProductTable({
  products,
  onUpdateProduct,
  onDeleteProduct,
  onToggleSelect,
  onSelectMany,
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos') // todos | con-imagen | sin-imagen

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-10 border border-dashed border-gray-200 rounded-lg">
        Importa un Excel para ver tus productos aquí.
      </div>
    )
  }

  const term = search.trim().toLowerCase()
  const filtered = products.filter((p) => {
    const matchesSearch =
      term === '' ||
      p.nombre.toLowerCase().includes(term) ||
      (p.codigo ?? '').toLowerCase().includes(term) ||
      (p.codigoMostrar ?? '').toLowerCase().includes(term)

    const matchesFilter =
      filter === 'todos' ? true : filter === 'con-imagen' ? Boolean(p.imagen) : !p.imagen

    return matchesSearch && matchesFilter
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => p.seleccionado)
  const selectedCount = products.filter((p) => p.seleccionado).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-56"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="todos">Todos</option>
            <option value="con-imagen">Con imagen</option>
            <option value="sin-imagen">Sin imagen</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {selectedCount} de {products.length} seleccionados
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-2 py-2 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={(e) =>
                    onSelectMany(filtered.map((p) => p.id), e.target.checked)
                  }
                />
              </th>
              <th className="px-2 py-2">Código (buscar imagen)</th>
              <th className="px-2 py-2">Código a mostrar</th>
              <th className="px-2 py-2">Producto</th>
              <th className="px-2 py-2">Precio</th>
              <th className="px-2 py-2">Precio antes</th>
              <th className="px-2 py-2">Cuotas</th>
              <th className="px-2 py-2 text-center">Imagen</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onUpdate={onUpdateProduct}
                onDelete={onDeleteProduct}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          No hay productos que coincidan con la búsqueda.
        </p>
      )}
    </div>
  )
}
