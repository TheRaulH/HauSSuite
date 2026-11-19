import { useRef, useState } from 'react'
import { FileSpreadsheet, Trash2 } from 'lucide-react'
import { normalizeDescripcion } from '../../../utils/catalogModel'
import { readSpreadsheet } from '../../../utils/excelParser'
import { formatInt } from '../../reports/format'

/** Paso 2: la lista de productos (se guarda sola en este navegador). */
export default function ListCard({ text, onChange, lineCount, pending, saveState }) {
  const fileRef = useRef(null)
  const [sheet, setSheet] = useState(null) // { headers, rows }
  const [column, setColumn] = useState('')
  const [message, setMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  function fillFromColumn(data, columnName) {
    onChange(data.rows.map((r) => String(r[columnName] ?? '').trim()).filter(Boolean).join('\n'))
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = await readSpreadsheet(file)
      if (data.headers.length === 0) throw new Error('vacío')
      const guess =
        data.headers.find((h) => ['descripcion', 'nombre', 'producto', 'detalle'].includes(normalizeDescripcion(h))) ?? data.headers[0]
      setSheet(data)
      setColumn(guess)
      fillFromColumn(data, guess)
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage('No se pudo leer el archivo. Prueba con un .xlsx o .csv.')
    }
  }

  let status = null
  if (saveState === 'error') status = <span className="text-amber-700">No se pudo guardar: la lista es demasiado grande para este navegador.</span>
  else if (lineCount > 0) status = <span className="text-gray-400">Se guarda sola en este navegador: puedes recargar la página.</span>

  return (
    <section className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 flex flex-col gap-3 min-h-0 flex-1" aria-label="Lista de productos">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-haus-blue flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-haus-blue text-white text-xs flex items-center justify-center">2</span>
          Lista de productos
        </h3>
        <span className="text-xs text-gray-500">
          {pending ? 'Actualizando…' : `${formatInt(lineCount)} ${lineCount === 1 ? 'línea' : 'líneas'}`}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setConfirmClear(false)
          onChange(e.target.value)
        }}
        spellCheck={false}
        placeholder={'Pega o escribe una descripción por línea (puedes copiarlas de una columna de Excel)\n\nRefrigerador Samsung 300L\nTelevisor LG 55" 4K'}
        className="w-full flex-1 min-h-[160px] text-sm border border-gray-300 rounded-xl p-3 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-haus-blue/30"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue"
        >
          <FileSpreadsheet size={13} aria-hidden /> Cargar desde Excel / CSV
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

        {sheet && sheet.headers.length > 1 && (
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            Columna
            <select
              value={column}
              onChange={(e) => {
                setColumn(e.target.value)
                fillFromColumn(sheet, e.target.value)
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs"
            >
              {sheet.headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        )}

        {text &&
          (confirmClear ? (
            <span className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-gray-600">¿Borrar toda la lista?</span>
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setSheet(null)
                  setConfirmClear(false)
                }}
                className="px-2.5 py-1 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                Sí, borrar
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="text-gray-500 hover:underline">
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600"
            >
              <Trash2 size={13} aria-hidden /> Limpiar
            </button>
          ))}
      </div>

      {message && <p className="text-xs text-red-600">{message}</p>}
      <p className="text-xs">{status}</p>
      <p className="text-xs text-gray-400">
        Cada descripción se busca en el catálogo para obtener su código. Si una línea es un código (ej. HR-2260-90), se busca directo.
      </p>
    </section>
  )
}
