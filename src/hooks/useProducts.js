import { useState } from 'react'

/**
 * Centraliza el estado de los productos y las operaciones que se hacen
 * sobre ellos (importar, editar, eliminar, seleccionar). Los componentes
 * de UI (ProductTable, ProductRow, etc.) solo reciben datos y callbacks,
 * nunca manipulan el estado directamente.
 */
export function useProducts() {
  const [products, setProducts] = useState([])

  /** Reemplaza la lista completa (por ejemplo, tras importar un Excel). */
  function importProducts(newProducts) {
    setProducts(newProducts)
  }

  /** Aplica cambios parciales a un producto puntual (edición inline en la tabla). */
  function updateProduct(id, changes) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)))
  }

  /**
   * Asocia una imagen a un producto (lo usa ImageUploader / imageManager).
   * `field` es 'imagen' (principal, default), 'imagen2' (combo) o 'regaloImagen'.
   */
  function setProductImage(id, url, field = 'imagen') {
    updateProduct(id, { [field]: url })
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function toggleSelected(id) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p))
    )
  }

  /** Marca/desmarca varios productos a la vez (usado por el checkbox "seleccionar todos"). */
  function selectMany(ids, seleccionado) {
    const idSet = new Set(ids)
    setProducts((prev) => prev.map((p) => (idSet.has(p.id) ? { ...p, seleccionado } : p)))
  }

  const selectedProducts = products.filter((p) => p.seleccionado)

  return {
    products,
    importProducts,
    updateProduct,
    setProductImage,
    deleteProduct,
    toggleSelected,
    selectMany,
    selectedProducts,
  }
}
