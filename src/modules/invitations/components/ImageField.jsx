import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { loadImageFile } from '../imageUtils'

/**
 * Un espacio de imagen: elegir o arrastrar un archivo local, y ajustar el encuadre
 * (zoom y posición) para que la foto quede bien dentro del marco.
 */
export default function ImageField({ label, value, onChange, hint }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setError('')
    try {
      const src = await loadImageFile(file)
      onChange({ src, zoom: 1, x: 50, y: 50 })
    } catch (err) {
      setError(err.message)
    }
  }

  const slider = (name, min, max, step, key, suffix = '') => (
    <label className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-14 shrink-0">{name}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
        className="flex-1 accent-[#123B64]"
      />
      <span className="w-10 text-right tabular-nums">
        {key === 'zoom' ? value[key].toFixed(2) : Math.round(value[key])}
        {suffix}
      </span>
    </label>
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {value?.src && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600">
            <X size={13} aria-hidden /> Quitar
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-2 ${dragging ? 'border-haus-blue bg-haus-sky/40' : 'border-gray-300'}`}
      >
        {value?.src ? (
          <img src={value.src} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
            <ImagePlus size={22} aria-hidden />
          </div>
        )}
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-haus-blue hover:underline"
          >
            {value?.src ? 'Cambiar imagen' : 'Elegir imagen'}
          </button>
          <span className="text-xs text-gray-400">{hint ?? 'o arrástrala aquí'}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {value?.src && (
        <div className="flex flex-col gap-1 pl-1">
          {slider('Zoom', 1, 3, 0.05, 'zoom')}
          {slider('Horizontal', 0, 100, 1, 'x', '%')}
          {slider('Vertical', 0, 100, 1, 'y', '%')}
        </div>
      )}
    </div>
  )
}
