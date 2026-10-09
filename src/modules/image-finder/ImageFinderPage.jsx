import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../suite/PageHeader'
import { useCatalogContext } from '../../suite/CatalogContext'
import { readSpreadsheet } from '../../utils/excelParser'
import { normalizeDescripcion } from '../../utils/catalogModel'
import { isDirectoryPickerSupported, pickImageFolder } from '../../utils/imageManager'
import {
  parseList,
  indexFiles,
  resolveList,
  isImageName,
  downloadImagesZip,
  downloadReportCsv,
  STATUS_LABEL,
} from './finder'

const STATUS_STYLE = {
  ok: 'bg-green-50 text-green-700',
  'sin-catalogo': 'bg-amber-50 text-amber-700',
  'sin-imagen': 'bg-red-50 text-red-700',
}

function Thumb({ file }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!file || !url) return <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200" />
  return <img src={url} alt="" loading="lazy" className="w-10 h-10 rounded object-contain bg-white border border-gray-200" />
}

export default function ImageFinderPage() {
  const catalog = useCatalogContext()

  const [listText, setListText] = useState('')
  const [files, setFiles] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [numbered, setNumbered] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error' | 'info', text }
  const [isZipping, setIsZipping] = useState(false)

  // Excel opcional con la lista
  const [sheet, setSheet] = useState(null) // { headers, rows }
  const [column, setColumn] = useState('')

  const listInputRef = useRef(null)
  const filesInputRef = useRef(null)

  const lines = useMemo(() => parseList(listText), [listText])
  const index = useMemo(() => indexFiles(files), [files])
  const rows = useMemo(() => resolveList(lines, catalog.lookup, index), [lines, catalog.lookup, index])

  const found = rows.filter((r) => r.status === 'ok')
  const uniqueFound = new Set(found.map((r) => r.file)).size
  const noCatalog = rows.filter((r) => r.status === 'sin-catalogo').length
  const noImage = rows.filter((r) => r.status === 'sin-imagen').length

  async function handleFolderPick() {
    setMessage(null)
    setIsScanning(true)
    try {
      const picked = await pickImageFolder()
      if (picked.length === 0) setMessage({ type: 'error', text: 'No se encontraron imágenes en esa carpeta.' })
      setFiles(picked)
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err)
        setMessage({ type: 'error', text: 'No se pudo leer la carpeta seleccionada.' })
      }
    } finally {
      setIsScanning(false)
    }
  }

  function handleFilesPick(e) {
    const picked = Array.from(e.target.files ?? []).filter((f) => isImageName(f.name))
    e.target.value = ''
    if (picked.length === 0) {
      setMessage({ type: 'error', text: 'No se encontraron imágenes en la selección.' })
      return
    }
    setMessage(null)
    setFiles(picked)
  }

  function fillFromColumn(sheetData, columnName) {
    const values = sheetData.rows.map((r) => String(r[columnName] ?? '').trim()).filter(Boolean)
    setListText(values.join('\n'))
  }

  async function handleListFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = await readSpreadsheet(file)
      if (data.headers.length === 0) throw new Error('vacío')
      const guess =
        data.headers.find((h) =>
          ['descripcion', 'nombre', 'producto', 'detalle'].includes(normalizeDescripcion(h))
        ) ?? data.headers[0]
      setSheet(data)
      setColumn(guess)
      fillFromColumn(data, guess)
      setMessage(null)
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'No se pudo leer el archivo de la lista.' })
    }
  }

  async function handleZip() {
    setIsZipping(true)
    setMessage(null)
    try {
      const count = await downloadImagesZip(rows, { numbered })
      setMessage({ type: 'info', text: `ZIP descargado con ${count} imágenes originales.` })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'No se pudo generar el ZIP.' })
    } finally {
      setIsZipping(false)
    }
  }

  const catalogStatus = catalog.loading
    ? 'Cargando catálogo…'
    : catalog.error
      ? 'No se pudo cargar el catálogo (se buscará solo por código)'
      : `Catálogo: ${catalog.entries.length} productos`

  return (
    <>
      <PageHeader
        title="Buscador de imágenes"
        description="Lista de productos → imágenes originales de tu carpeta → ZIP"
      />

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* 1. Carpeta */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
          <h3 className="font-medium text-gray-800">1. Carpeta de imágenes</h3>
          <div className="flex flex-wrap items-center gap-3">
            {isDirectoryPickerSupported() ? (
              <button
                type="button"
                onClick={handleFolderPick}
                disabled={isScanning}
                className="px-3 py-1.5 text-sm rounded-md bg-haus-blue text-white hover:opacity-90 disabled:opacity-50"
              >
                {isScanning ? 'Escaneando carpeta…' : files.length ? 'Cambiar carpeta' : 'Seleccionar carpeta'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => filesInputRef.current?.click()}
                  className="px-3 py-1.5 text-sm rounded-md bg-haus-blue text-white hover:opacity-90"
                >
                  Seleccionar carpeta
                </button>
                <input
                  ref={filesInputRef}
                  type="file"
                  webkitdirectory=""
                  multiple
                  className="hidden"
                  onChange={handleFilesPick}
                />
              </>
            )}
            <span className="text-sm text-gray-500">
              {files.length > 0
                ? `${files.length} imágenes encontradas (incluye subcarpetas)`
                : 'Elegí la carpeta principal (ej. PRODUCTOS); se recorren todas las subcarpetas.'}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Las imágenes no se suben a ningún lado: se leen en tu navegador. Si un código está en varias
            subcarpetas, se usa la más reciente.
          </p>
        </section>

        {/* 2. Lista */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-medium text-gray-800">2. Lista de productos</h3>
            <span className="text-xs text-gray-400">{catalogStatus}</span>
          </div>

          <textarea
            value={listText}
            onChange={(e) => setListText(e.target.value)}
            rows={6}
            placeholder={'Pegá una descripción por línea (podés copiarlas de una columna de Excel)\nRefrigerador Samsung 300L...\nTelevisor LG 55" 4K...'}
            className="w-full text-sm border border-gray-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-haus-blue/30"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => listInputRef.current?.click()}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cargar lista desde Excel / CSV
            </button>
            <input
              ref={listInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleListFile}
            />

            {sheet && sheet.headers.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Columna:
                <select
                  value={column}
                  onChange={(e) => {
                    setColumn(e.target.value)
                    fillFromColumn(sheet, e.target.value)
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {listText && (
              <button
                type="button"
                onClick={() => {
                  setListText('')
                  setSheet(null)
                }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Limpiar lista
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Cada descripción se busca en el catálogo para obtener su código. Si una línea no está en el
            catálogo pero es un código (ej. HR-2260-90), se busca directamente.
          </p>
        </section>

        {/* 3. Resultado */}
        {rows.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-medium text-gray-800">3. Resultado</h3>
                <p className="text-sm text-gray-500">
                  {found.length} de {rows.length} encontradas
                  {noCatalog > 0 && ` · ${noCatalog} no están en el catálogo`}
                  {noImage > 0 && ` · ${noImage} sin imagen en la carpeta`}
                </p>
                {files.length === 0 && (
                  <p className="text-sm text-amber-600">Elegí la carpeta de imágenes para buscarlas.</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={numbered} onChange={(e) => setNumbered(e.target.checked)} />
                  Numerar según el orden de la lista
                </label>
                <button
                  type="button"
                  onClick={() => downloadReportCsv(rows)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Reporte (.csv)
                </button>
                <button
                  type="button"
                  onClick={handleZip}
                  disabled={uniqueFound === 0 || isZipping}
                  className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isZipping ? 'Preparando ZIP…' : `Descargar ZIP (${uniqueFound})`}
                </button>
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                {message.text}
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                    <th className="py-2 pr-3 font-medium w-12"></th>
                    <th className="py-2 pr-3 font-medium">Descripción</th>
                    <th className="py-2 pr-3 font-medium">Código</th>
                    <th className="py-2 pr-3 font-medium">Archivo</th>
                    <th className="py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 align-middle">
                      <td className="py-2 pr-3">
                        <Thumb file={row.file} />
                      </td>
                      <td className="py-2 pr-3 text-gray-700 max-w-xs truncate" title={row.line}>
                        {row.line}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-gray-600">{row.code ?? '—'}</td>
                      <td className="py-2 pr-3 text-xs text-gray-500">
                        {row.file ? row.file.name : '—'}
                        {row.candidates > 1 && (
                          <span className="text-gray-400"> ({row.candidates} versiones, la más reciente)</span>
                        )}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${STATUS_STYLE[row.status]}`}>
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
