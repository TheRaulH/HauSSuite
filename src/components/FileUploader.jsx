import { useState } from 'react'
import { readSpreadsheet, detectColumnMapping, buildProducts, aplicarRegaloDePrimeraFila } from '../utils/excelParser'
import { aplicarCatalogoAProductos } from '../utils/catalogModel'
import { ALL_FIELDS, ALL_FIELDS_COMBO, REQUIRED_FIELDS, FIELD_LABELS } from '../utils/productModel'

const MODES = [
  { id: 'simple', label: 'Producto individual' },
  { id: 'regalo', label: 'Con regalo' },
  { id: 'combo', label: 'Combo (2 productos por fila)' },
]

/**
 * Flujo:
 *  1) el usuario elige el modo de importación (simple / con regalo / combo)
 *  2) sube un .xlsx/.xls/.csv
 *  3) se detectan encabezados y se propone un mapeo automático de columnas
 *     (el modo "combo" pide columnas extra para el 2º producto)
 *  4) el usuario confirma/corrige el mapeo
 *  5) se normalizan las filas a productos:
 *       - simple/combo: tal cual
 *       - regalo: la PRIMERA fila se trata como el regalo (nombre+código,
 *         sin precio) y se aplica al resto — ver aplicarRegaloDePrimeraFila
 *     y luego, para cualquier producto que haya quedado SIN código, se
 *     busca su nombre en el catálogo de códigos (ver CatalogManager) y se
 *     completa automáticamente antes de entregarlos al padre vía onImport
 */
export default function FileUploader({ onImport, catalogLookup }) {
  const [mode, setMode] = useState('simple')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [mapping, setMapping] = useState(null)
  const [error, setError] = useState('')
  const [lastResult, setLastResult] = useState(null)

  const fields = mode === 'combo' ? ALL_FIELDS_COMBO : ALL_FIELDS
  const isMapping = mapping !== null

  function handleModeChange(nextMode) {
    setMode(nextMode)
    resetState()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setFileName(file.name)
    setLastResult(null)

    try {
      const { headers: detectedHeaders, rows: detectedRows } = await readSpreadsheet(file)
      if (detectedHeaders.length === 0) {
        setError('El archivo no tiene datos que se puedan leer.')
        return
      }
      setHeaders(detectedHeaders)
      setRows(detectedRows)
      setMapping(detectColumnMapping(detectedHeaders, fields))
    } catch (err) {
      console.error(err)
      setError('No se pudo leer el archivo. Verifica que sea .xlsx, .xls o .csv')
    } finally {
      e.target.value = '' // permite volver a subir el mismo archivo si se cancela
    }
  }

  function handleMappingChange(field, header) {
    setMapping((prev) => ({ ...prev, [field]: header || null }))
  }

  function handleConfirm() {
    const missing = REQUIRED_FIELDS.filter((field) => !mapping[field])
    if (mode === 'combo' && !mapping.nombre2) missing.push('nombre2')
    if (missing.length > 0) {
      setError(`Faltan columnas obligatorias: ${missing.map((f) => FIELD_LABELS[f] ?? f).join(', ')}`)
      return
    }

    let productos = buildProducts(rows, mapping, fields)

    if (mode === 'regalo') {
      const { regalo, productos: conRegalo } = aplicarRegaloDePrimeraFila(productos)
      if (!regalo) {
        setError('No se detectó ninguna fila para usar como regalo.')
        return
      }
      productos = conRegalo
    }

    let catalogSummary = null
    if (catalogLookup) {
      const { productos: conCatalogo, matched, total } = aplicarCatalogoAProductos(productos, catalogLookup)
      productos = conCatalogo
      if (total > 0) catalogSummary = { matched, total }
    }

    onImport(productos)
    setLastResult({ count: productos.length, catalogSummary })
    resetState()
  }

  function handleCancel() {
    resetState()
  }

  function resetState() {
    setFileName('')
    setHeaders([])
    setRows([])
    setMapping(null)
    setError('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleModeChange(m.id)}
            disabled={isMapping}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === m.id
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!isMapping ? (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:border-purple-400 transition-colors">
          <span className="text-gray-700 font-medium">Cargar Excel / CSV</span>
          <span className="text-sm text-gray-400">.xlsx, .xls o .csv</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-medium text-gray-800">
              Asocia las columnas de <span className="text-purple-600">{fileName}</span>
            </h3>
            <span className="text-sm text-gray-400">{rows.length} filas detectadas</span>
          </div>

          {mode === 'regalo' && (
            <p className="text-sm bg-amber-50 text-amber-700 rounded-md px-3 py-2">
              La <strong>primera fila</strong> del archivo se va a usar como el regalo: se toma su
              nombre y código, y se ignora su precio. El resto de las filas son los productos
              reales, cada uno con ese mismo regalo aplicado.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  {FIELD_LABELS[field]}
                  {(REQUIRED_FIELDS.includes(field) || (mode === 'combo' && field === 'nombre2')) && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <select
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                  value={mapping[field] ?? ''}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                >
                  <option value="">— Ninguno —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
            >
              Importar productos
            </button>
          </div>
        </div>
      )}

      {error && !isMapping && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {!isMapping && lastResult && (
        <p className="text-sm text-green-600">
          {lastResult.count} productos importados.
          {lastResult.catalogSummary &&
            ` Catálogo: ${lastResult.catalogSummary.matched} de ${lastResult.catalogSummary.total} código(s) encontrados automáticamente.`}
        </p>
      )}
    </div>
  )
}
