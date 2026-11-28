import { useCallback, useEffect, useRef, useState } from 'react';
import { isDirectoryPickerSupported } from '../../utils/imageManager';
import { isImageName } from './finder';
import {
  clearFolderHandle,
  ensurePermission,
  loadFolderHandle,
  saveFolderHandle,
  scanFolder,
} from './folderStore';

const CHECK_TIMEOUT_MS = 4000;
const INITIAL = {
  status: 'checking',
  files: [],
  name: '',
  count: 0,
  error: '',
};

// Resultado de la última lectura, vive mientras la pestaña esté abierta.
// Al volver a la sección se muestra al instante, sin releer la carpeta.
let sessionCache = null; // { handle, files, name }

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`timeout:${label}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function initialState(supported) {
  if (!supported) return { ...INITIAL, status: 'idle' };
  if (sessionCache) {
    const { files, name } = sessionCache;
    return { status: 'ready', files, name, count: files.length, error: '' };
  }
  return INITIAL;
}

/**
 * La carpeta de imágenes: elegirla, leerla, recordarla entre visitas y volver a leerla.
 * status: checking | idle | needs-permission | scanning | ready | error
 */
export function useImageFolder() {
  const supported = isDirectoryPickerSupported();
  const [state, setState] = useState(() => initialState(supported));
  const handleRef = useRef(sessionCache?.handle ?? null);
  const abortRef = useRef(null);
  const checkTokenRef = useRef(0); // invalida la comprobación inicial si el usuario actúa antes

  const run = useCallback(async (handle) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const isCurrent = () => abortRef.current === controller;

    setState((s) => ({
      ...s,
      status: 'scanning',
      name: handle.name,
      count: 0,
      error: '',
    }));
    try {
      const files = await scanFolder(handle, {
        signal: controller.signal,
        onProgress: (count) => {
          if (isCurrent())
            setState((s) => (s.status === 'scanning' ? { ...s, count } : s));
        },
      });
      if (!isCurrent()) return;
      sessionCache = { handle, files, name: handle.name };
      setState({
        status: 'ready',
        files,
        name: handle.name,
        count: files.length,
        error: '',
      });
    } catch (err) {
      if (!isCurrent()) return;
      if (err.name === 'AbortError') {
        setState((s) => ({
          ...s,
          status: s.files.length > 0 ? 'ready' : 'idle',
        }));
        return;
      }
      console.error(err);
      setState((s) => ({
        ...s,
        status: 'error',
        error: 'No se pudo leer la carpeta. Puede que haya cambiado de lugar.',
      }));
    }
  }, []);

  // Al abrir la página: si ya había una carpeta guardada, se lee sola (o se pide reconectarla).
  // Nunca se queda esperando: cada paso tiene tiempo límite y siempre termina en un estado con salida.
  useEffect(() => {
    if (!supported || sessionCache) return undefined; // sin soporte o ya en memoria: nada que comprobar
    let cancelled = false;
    const token = ++checkTokenRef.current;
    const stale = () => cancelled || token !== checkTokenRef.current;

    (async () => {
      let handle = null;
      try {
        handle = await withTimeout(
          loadFolderHandle(),
          CHECK_TIMEOUT_MS,
          'indexeddb'
        );
      } catch (err) {
        console.warn(
          '[useImageFolder] no se pudo recuperar la carpeta guardada',
          err
        );
      }
      if (stale()) return;
      if (!handle) {
        setState((s) => ({ ...s, status: 'idle' }));
        return;
      }

      handleRef.current = handle;
      let granted = false;
      try {
        granted = await withTimeout(
          ensurePermission(handle),
          CHECK_TIMEOUT_MS,
          'permission'
        );
      } catch (err) {
        console.warn('[useImageFolder] no se pudo comprobar el permiso', err);
      }
      if (stale()) return;
      if (granted) run(handle);
      else
        setState((s) => ({
          ...s,
          status: 'needs-permission',
          name: handle.name,
        }));
    })();

    return () => {
      cancelled = true;
    };
  }, [supported, run]);

  // Al salir de la página se corta cualquier lectura en curso.
  useEffect(() => () => abortRef.current?.abort(), []);

  const pick = useCallback(async () => {
    checkTokenRef.current += 1; // si la comprobación inicial seguía pendiente, que no pise la elección
    try {
      const handle = await window.showDirectoryPicker({
        id: 'hausuite-imagenes',
        mode: 'read',
      });
      handleRef.current = handle;
      saveFolderHandle(handle).catch(() => {}); // si no se puede recordar, igual se usa
      await run(handle);
    } catch (err) {
      if (err.name === 'AbortError') {
        // El usuario cerró el selector sin elegir: si seguíamos en "checking", que no quede colgado.
        setState((s) =>
          s.status === 'checking' ? { ...s, status: 'idle' } : s
        );
      } else {
        console.error(err);
        setState((s) => ({
          ...s,
          status: 'error',
          error: 'No se pudo abrir la carpeta.',
        }));
      }
    }
  }, [run]);

  const reconnect = useCallback(async () => {
    checkTokenRef.current += 1;
    const handle = handleRef.current;
    try {
      if (handle && (await ensurePermission(handle, { request: true }))) {
        await run(handle);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    await pick();
  }, [pick, run]);

  const refresh = useCallback(() => {
    if (handleRef.current) run(handleRef.current);
  }, [run]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const forget = useCallback(() => {
    checkTokenRef.current += 1;
    abortRef.current?.abort();
    handleRef.current = null;
    sessionCache = null;
    clearFolderHandle().catch(() => {});
    setState({ ...INITIAL, status: 'idle' });
  }, []);

  /** Navegadores sin selector de carpetas: se eligen los archivos (no se recuerda la carpeta). */
  const pickFromInput = useCallback((fileList) => {
    checkTokenRef.current += 1;
    const files = Array.from(fileList ?? []).filter((f) => isImageName(f.name));
    if (files.length === 0) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: 'No se encontraron imágenes en la selección.',
      }));
      return;
    }
    sessionCache = null;
    setState({
      status: 'ready',
      files,
      name: 'carpeta seleccionada',
      count: files.length,
      error: '',
    });
  }, []);

  return {
    ...state,
    supported,
    pick,
    reconnect,
    refresh,
    cancel,
    forget,
    pickFromInput,
  };
}
