import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../suite/PageHeader'
import { useCatalogContext } from '../../suite/CatalogContext'
import { useClipboard } from '../../suite/useClipboard'
import FolderCard from './components/FolderCard'
import ListCard from './components/ListCard'
import ResultsPanel from './components/ResultsPanel'
import {
  ZIP_PART_LIMIT_BYTES,
  collectZipEntries,
  downloadImagesZip,
  downloadReportCsv,
  indexFiles,
  parseList,
  resolveListAsync,
  splitIntoParts,
} from './finder'
import { useDebouncedValue, usePersistentState } from './hooks'
import { useImageFolder } from './useImageFolder'

const STORAGE_KEY = 'hausuite:buscador-imagenes'
const EMPTY_ANALYSIS = { rows: [], done: 0, total: 0, running: false }

export default function ImageFinderPage() {
  const catalog = useCatalogContext()
  const folder = useImageFolder()
  const { copiedKey, copyText } = useClipboard(2000)

  // La lista y las opciones sobreviven a recargar la página.
  const [saved, patchSaved, saveState] = usePersistentState(STORAGE_KEY, { listText: '', numbered: false })
  const { listText, numbered } = saved

  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS)
  const [zipState, setZipState] = useState({ busy: false, part: 1, parts: 1, percent: 0 })
  const [message, setMessage] = useState(null)

  // El análisis espera a que el usuario deje de escribir: pegar o editar una lista enorme no congela nada.
  const debouncedText = useDebouncedValue(listText, 450)
  const pending = debouncedText !== listText
  const lines = useMemo(() => parseList(debouncedText), [debouncedText])
  const lineCount = useMemo(() => (pending ? parseList(listText).length : lines.length), [pending, listText, lines])
  const index = useMemo(() => indexFiles(folder.files), [folder.files])

  const ready = catalog.loaded && folder.status === 'ready' && folder.files.length > 0 && lines.length > 0

  useEffect(() => {
    if (!ready) {
      setAnalysis(EMPTY_ANALYSIS)
      return undefined
    }
    const controller = new AbortController()
    setAnalysis({ rows: [], done: 0, total: lines.length, running: true })
    resolveListAsync(lines, catalog.lookup, index, {
      signal: controller.signal,
      onProgress: (done, total) => setAnalysis((a) => (a.running ? { ...a, done, total } : a)),
    }).then((rows) => {
      if (rows) setAnalysis({ rows, done: lines.length, total: lines.length, running: false })
    })
    return () => controller.abort()
  }, [ready, lines, index, catalog.lookup])

  const { rows } = analysis

  const counts = useMemo(() => {
    const c = { ok: 0, 'sin-imagen': 0, 'sin-catalogo': 0 }
    for (const r of rows) c[r.status] += 1
    return c
  }, [rows])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (filter === 'all' || r.status === filter) &&
        (!q || r.line.toLowerCase().includes(q) || (r.code ?? '').toLowerCase().includes(q) || (r.file?.name ?? '').toLowerCase().includes(q))
    )
  }, [rows, filter, query])

  const zipInfo = useMemo(() => {
    const entries = collectZipEntries(rows, { numbered })
    const bytes = entries.reduce((sum, e) => sum + e.file.size, 0)
    return { count: entries.length, bytes, expectedParts: bytes > ZIP_PART_LIMIT_BYTES ? splitIntoParts(entries).length : 1 }
  }, [rows, numbered])

  async function handleZip() {
    setMessage(null)
    setZipState({ busy: true, part: 1, parts: 1, percent: 0 })
    try {
      const result = await downloadImagesZip(rows, {
        numbered,
        onProgress: ({ part, parts, percent }) => setZipState({ busy: true, part, parts, percent }),
      })
      setMessage({
        type: 'info',
        text:
          result.parts > 1
            ? `Listo: ${result.count} imágenes originales en ${result.parts} ZIP. Si el navegador pregunta, permite las descargas múltiples.`
            : `Listo: ZIP con ${result.count} imágenes originales.`,
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'No se pudo generar el ZIP. Prueba con una lista más corta.' })
    } finally {
      setZipState({ busy: false, part: 1, parts: 1, percent: 0 })
    }
  }

  function handleCopyMissing() {
    copyText(
      rows
        .filter((r) => r.status !== 'ok')
        .map((r) => r.line)
        .join('\n'),
      'missing'
    )
  }

  // Qué mostrar cuando todavía no hay resultados
  let hint = null
  if (!catalog.loaded) hint = 'Cargando el catálogo de productos…'
  else if (folder.status !== 'ready') hint = 'Primero elige la carpeta de imágenes (paso 1).'
  else if (lineCount === 0) hint = 'Pega o escribe tu lista de productos (paso 2): el resultado aparece acá y se actualiza solo.'
  else if (analysis.running && rows.length === 0) hint = 'Buscando las imágenes…'

  return (
    <>
      <PageHeader title="Buscador de imágenes" description="Lista de productos → imágenes originales de tu carpeta → ZIP" />

      <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr] lg:h-[calc(100vh-9rem)] lg:min-h-[600px]">
          <aside className="flex flex-col gap-4 min-h-0">
            <FolderCard folder={folder} />
            <ListCard
              text={listText}
              onChange={(value) => patchSaved({ listText: value })}
              lineCount={lineCount}
              pending={pending}
              saveState={saveState}
            />
          </aside>

          <div className="min-h-0 h-[75vh] lg:h-auto flex flex-col gap-2">
            <ResultsPanel
              hint={hint}
              rows={rows}
              visible={visible}
              counts={counts}
              filter={filter}
              onFilter={setFilter}
              query={query}
              onQuery={setQuery}
              analysis={analysis}
              zip={{ ...zipInfo, ...zipState }}
              onZip={handleZip}
              onCsv={() => downloadReportCsv(rows)}
              onCopyMissing={handleCopyMissing}
              copiedKey={copiedKey}
              message={message}
            />
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer px-2">
              <input type="checkbox" checked={numbered} onChange={(e) => patchSaved({ numbered: e.target.checked })} />
              Numerar los archivos del ZIP según el orden de la lista (001_, 002_…)
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
