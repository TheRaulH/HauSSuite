import { useState } from 'react'
import { renderTemplateToPng } from '../utils/imageGenerator'

// No se generan todas las imágenes a la vez (la app es 100% local, sin
// backend, y con muchos productos podría consumir demasiada RAM). Se
// procesan en bloques de 5, uno detrás de otro.
const BATCH_SIZE = 1

// Función para convertir una URL blob (o cualquier URL) a Base64
async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error al convertir la imagen a Base64:", error);
    throw error;
  }
}

/**
 * Genera un PNG por cada combinación producto × plantilla seleccionada,
 * en bloques, mostrando progreso en tiempo real, y entrega el resultado
 * final al padre (App.jsx) vía onComplete para que ExportPanel arme el ZIP.
 */
export default function GenerationPanel({ products, templates, onComplete }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [failedCount, setFailedCount] = useState(0)

  const totalToGenerate = products.length * templates.length

  async function handleGenerate() {
    setIsGenerating(true)
    setFailedCount(0)

    const tasks = []
    for (const product of products) {
      for (const template of templates) {
        tasks.push({ product, template })
      }
    }

    const total = tasks.length
    let done = 0
    let failed = 0
    const results = []

    setProgress({ done: 0, total })

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE)

      const batchResults = await Promise.all(
        batch.map(async ({ product, template }) => {
          try {

            // 1. Convertimos la imagen conflictiva a Base64 seguro
            const imagenSeguraBase64 = await urlToBase64(product.imagen);

            // 2. Pasamos la imagen segura a tu generador
            const dataUrl = await renderTemplateToPng(
              template.Component,
              { product, image: imagenSeguraBase64 }, // <-- Usamos la imagen segura aquí
              { width: template.width, height: template.height }
            )

             
            return {
              productId: product.id,
              nombre: product.nombre,
              plantilla: template.nombre,
              dataUrl,
              fileName: buildFileName(product, template),
            }
          } catch (err) {
            console.error('No se pudo generar', product.nombre, template.nombre, err)
            failed++
            return null
          } finally {
            done++
            setProgress({ done, total })
          }
        })
      )

      results.push(...batchResults.filter(Boolean))
    }

    setFailedCount(failed)
    setIsGenerating(false)
    onComplete(results)
  }

  if (templates.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-lg">
        Selecciona al menos una plantilla ("Usar para generar") para poder generar artes.
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-lg">
        Selecciona al menos un producto en la tabla para generar.
      </div>
    )
  }

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-medium text-gray-800">Generar artes</h3>
        <span className="text-sm text-gray-500">
          {products.length} producto{products.length !== 1 ? 's' : ''} × {templates.length} plantilla
          {templates.length > 1 ? 's' : ''} = {totalToGenerate} imágenes
        </span>
      </div>

      {!isGenerating ? (
        <button
          type="button"
          onClick={handleGenerate}
          className="self-start px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
        >
          Generar seleccionados
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-200"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Generando {progress.done} de {progress.total}...
          </p>
        </div>
      )}

      {!isGenerating && failedCount > 0 && (
        <p className="text-sm text-amber-500">
          ⚠ {failedCount} imágenes no se pudieron generar — revisa la consola del navegador.
        </p>
      )}
    </div>
  )
}

function buildFileName(product, template) {
  const base = String(product.codigo || product.id || product.nombre || 'producto')
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
  const plantilla = String(template.nombre || template.id)
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
  return `${base}-${plantilla}.png`
}
