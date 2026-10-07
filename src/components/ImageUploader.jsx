import { useRef, useState } from 'react'
import { isDirectoryPickerSupported, pickImageFolder, matchImagesToProducts } from '../utils/imageManager'

/**
 * Selección de imágenes para emparejar por código (punto 7-8 del documento).
 *  - "Seleccionar carpeta de productos": recorre TODA la carpeta y sus
 *    subcarpetas (ej. PRODUCTOS/marca/categoría) de una sola vez. Si el
 *    mismo código aparece repetido en varias subcarpetas (historial a lo
 *    largo del tiempo), se usa automáticamente la imagen más reciente.
 *  - "Seleccionar imágenes": selección manual archivo por archivo, útil
 *    para sumar una imagen suelta (por ejemplo, recién descargada de
 *    internet) que no está en esa carpeta.
 */
export default function ImageUploader({ products, onImagesMatched }) {
  const fileInputRef = useRef(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  async function handleFolderPick() {
    setError('')
    setIsScanning(true)
    try {
      const files = await pickImageFolder()
      applyMatch(files)
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err)
        setError('No se pudo leer la carpeta seleccionada.')
      }
    } finally {
      setIsScanning(false)
    }
  }

  function handleFilesPick(e) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // permite volver a elegir la misma selección después
    if (files.length > 0) applyMatch(files)
  }

  function applyMatch(files) {
    if (files.length === 0) {
      setError('No se encontraron imágenes en la selección.')
      return
    }
    const result = matchImagesToProducts(products, files)
    onImagesMatched(result.matched)
    setSummary({
      matched: result.matched.length,
      unmatchedSlots: result.unmatchedSlots.length,
      unmatchedFiles: result.unmatchedFiles.length,
      productsWithoutCode: result.productsWithoutCode.length,
    })
    setError('')
  }

  const hasCodedProducts = products.some((p) => p.codigo)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-medium text-gray-800">Asociar imágenes por código</h3>
        {!hasCodedProducts && (
          <span className="text-xs text-amber-500">
            Ninguno de tus productos tiene código — no se podrán emparejar automáticamente.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isDirectoryPickerSupported() && (
          <button
            type="button"
            onClick={handleFolderPick}
            disabled={isScanning}
            className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isScanning ? 'Escaneando carpeta...' : 'Seleccionar carpeta de productos'}
          </button>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Seleccionar imágenes
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFilesPick}
        />
        {!isDirectoryPickerSupported() && (
          <span className="text-xs text-gray-400">
            Tu navegador no soporta elegir una carpeta completa — selecciona las imágenes a la vez.
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {summary && (
        <div className="text-sm flex flex-col gap-0.5">
          <p className="text-green-600">✓ {summary.matched} imágenes emparejadas por código</p>
          {summary.unmatchedSlots > 0 && (
            <p className="text-amber-500">
              ⚠ {summary.unmatchedSlots} imágenes (producto, combo o regalo) con código sin encontrar
            </p>
          )}
          {summary.unmatchedFiles > 0 && (
            <p className="text-gray-400">
              {summary.unmatchedFiles} imágenes seleccionadas no correspondieron a ningún producto
            </p>
          )}
          {summary.productsWithoutCode > 0 && (
            <p className="text-gray-400">
              {summary.productsWithoutCode} productos no tienen código y no se pueden emparejar así
            </p>
          )}
        </div>
      )}
    </div>
  )
}
