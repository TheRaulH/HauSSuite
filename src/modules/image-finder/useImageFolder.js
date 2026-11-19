import { useCallback, useEffect, useRef, useState } from 'react'
import { isDirectoryPickerSupported } from '../../utils/imageManager'
import { isImageName } from './finder'
import { clearFolderHandle, ensurePermission, loadFolderHandle, saveFolderHandle, scanFolder } from './folderStore'

const INITIAL = { status: 'checking', files: [], name: '', count: 0, error: '' }

/**
 * La carpeta de imágenes: elegirla, leerla, recordarla entre visitas y volver a leerla.
 * status: checking | idle | needs-permission | scanning | ready | error
 */
export function useImageFolder() {
  const supported = isDirectoryPickerSupported()
  const [state, setState] = useState(supported ? INITIAL : { ...INITIAL, status: 'idle' })
  const handleRef = useRef(null)
  const abortRef = useRef(null)

  const run = useCallback(async (handle) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setState((s) => ({ ...s, status: 'scanning', name: handle.name, count: 0, error: '' }))
    try {
      const files = await scanFolder(handle, {
        signal: controller.signal,
        onProgress: (count) => setState((s) => (s.status === 'scanning' ? { ...s, count } : s)),
      })
      setState({ status: 'ready', files, name: handle.name, count: files.length, error: '' })
    } catch (err) {
      if (err.name === 'AbortError') {
        setState((s) => ({ ...s, status: s.files.length > 0 ? 'ready' : 'idle' }))
        return
      }
      console.error(err)
      setState((s) => ({ ...s, status: 'error', error: 'No se pudo leer la carpeta. Puede que haya cambiado de lugar.' }))
    }
  }, [])

  // Al abrir la página: si ya había una carpeta guardada, se lee sola (o se pide reconectarla).
  useEffect(() => {
    if (!supported) return undefined
    let cancelled = false
    ;(async () => {
      let handle = null
      try {
        handle = await loadFolderHandle()
      } catch {
        handle = null
      }
      if (cancelled) return
      if (!handle) {
        setState((s) => ({ ...s, status: 'idle' }))
        return
      }
      handleRef.current = handle
      if (await ensurePermission(handle)) run(handle)
      else setState((s) => ({ ...s, status: 'needs-permission', name: handle.name }))
    })()
    return () => {
      cancelled = true
    }
  }, [supported, run])

  const pick = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({ id: 'hausuite-imagenes', mode: 'read' })
      handleRef.current = handle
      saveFolderHandle(handle).catch(() => {}) // si no se puede recordar, igual se usa
      await run(handle)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err)
        setState((s) => ({ ...s, status: 'error', error: 'No se pudo abrir la carpeta.' }))
      }
    }
  }, [run])

  const reconnect = useCallback(async () => {
    const handle = handleRef.current
    try {
      if (handle && (await ensurePermission(handle, { request: true }))) {
        await run(handle)
        return
      }
    } catch (err) {
      console.error(err)
    }
    await pick()
  }, [pick, run])

  const refresh = useCallback(() => {
    if (handleRef.current) run(handleRef.current)
  }, [run])

  const cancel = useCallback(() => abortRef.current?.abort(), [])

  const forget = useCallback(() => {
    handleRef.current = null
    clearFolderHandle().catch(() => {})
    setState({ ...INITIAL, status: 'idle' })
  }, [])

  /** Navegadores sin selector de carpetas: se eligen los archivos (no se recuerda la carpeta). */
  const pickFromInput = useCallback((fileList) => {
    const files = Array.from(fileList ?? []).filter((f) => isImageName(f.name))
    if (files.length === 0) {
      setState((s) => ({ ...s, status: 'error', error: 'No se encontraron imágenes en la selección.' }))
      return
    }
    setState({ status: 'ready', files, name: 'carpeta seleccionada', count: files.length, error: '' })
  }, [])

  return { ...state, supported, pick, reconnect, refresh, cancel, forget, pickFromInput }
}
