import { useState } from 'react'
import { exportImagesAsZip } from '../utils/zipGenerator'

export default function ExportPanel({ images }) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')

  if (images.length === 0) return null

  async function handleExport() {
    setIsExporting(true)
    setError('')
    try {
      await exportImagesAsZip(images)
    } catch (err) {
      console.error(err)
      setError('No se pudo generar el ZIP.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-medium text-gray-800">Listo para descargar</h3>
          <p className="text-sm text-gray-500">{images.length} imágenes generadas</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isExporting ? 'Preparando ZIP...' : 'Descargar ZIP'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto py-1">
        {images.slice(0, 24).map((img, i) => (
          <img
            key={`${img.fileName}-${i}`}
            src={img.dataUrl}
            alt={img.fileName}
            title={img.fileName}
            className="w-32 h-32 object-cover rounded border border-gray-200 flex-shrink-0"
          />
        ))}
        {images.length > 24 && (
          <div className="w-32 h-32 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 border border-dashed border-gray-200 rounded">
            +{images.length - 24}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
