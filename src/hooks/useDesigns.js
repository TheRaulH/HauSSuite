import { useEffect, useMemo, useState } from 'react'
import { DESIGNS } from '../templates/definitions'
import { FORMATS, validateDesign } from '../utils/templateModel'
import { saveConfig, loadConfig } from '../utils/storage'

// Valida cada diseño al cargar el módulo: si a alguno le falta un formato
// o las medidas no coinciden, avisa fuerte en la consola. Mejor detectarlo
// mientras se desarrolla el diseño que cuando el usuario ya está generando.
for (const design of DESIGNS) {
  const errors = validateDesign(design)
  if (errors.length > 0) {
    console.warn(`[diseño "${design.nombre}"] configuración incompleta:`, errors)
  }
}

const savedConfig = loadConfig()

/** Selección de diseño + formato(s) a generar, entre los diseños predefinidos. */
export function useDesigns() {
  const [selectedDesignId, setSelectedDesignId] = useState(() => {
    const savedId = savedConfig?.designId
    if (savedId && DESIGNS.some((d) => d.id === savedId)) return savedId
    return DESIGNS[0]?.id ?? null
  })

  const [selectedFormatIds, setSelectedFormatIds] = useState(() => {
    if (savedConfig?.formatIds?.length) return savedConfig.formatIds
    return FORMATS[0] ? [FORMATS[0].id] : []
  })

  useEffect(() => {
    saveConfig({ designId: selectedDesignId, formatIds: selectedFormatIds })
  }, [selectedDesignId, selectedFormatIds])

  function toggleFormat(formatId) {
    setSelectedFormatIds((prev) =>
      prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]
    )
  }

  const selectedDesign = DESIGNS.find((d) => d.id === selectedDesignId) ?? null

  // Arma la lista de "plantillas a generar": una entrada por cada formato
  // seleccionado del diseño elegido, lista para pasarle a GenerationPanel.
  const selectedTemplates = useMemo(() => {
    if (!selectedDesign) return []
    return selectedFormatIds
      .map((formatId) => {
        const tpl = selectedDesign.formatos[formatId]
        if (!tpl) return null
        const formatDef = FORMATS.find((f) => f.id === formatId)
        return {
          ...tpl,
          id: `${selectedDesign.id}-${formatId}`,
          nombre: `${selectedDesign.nombre} — ${formatDef?.label ?? formatId}`,
        }
      })
      .filter(Boolean)
  }, [selectedDesign, selectedFormatIds])

  return {
    designs: DESIGNS,
    selectedDesignId,
    setSelectedDesignId,
    selectedDesign,
    selectedFormatIds,
    toggleFormat,
    selectedTemplates,
  }
}
