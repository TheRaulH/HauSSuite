import { isImageName } from './finder';

/**
 * Recuerda la carpeta elegida entre visitas. Un FileSystemDirectoryHandle se puede guardar
 * en IndexedDB: al recargar la página no hay que volver a buscarla, solo reconectarla
 * (el navegador pide permiso una vez por sesión).
 */
const DB_NAME = 'hausuite';
const STORE = 'handles';
const KEY = 'carpeta-imagenes';
const OPEN_TIMEOUT_MS = 3000;

function openDb() {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    // Algunos navegadores nunca responden (modo privado, almacenamiento restringido).
    const timer = setTimeout(
      () => done(reject, new Error('idb-timeout')),
      OPEN_TIMEOUT_MS
    );

    let request;
    try {
      request = indexedDB.open(DB_NAME, 1);
    } catch (err) {
      done(reject, err);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close(); // no bloquear a otras pestañas
      if (settled) db.close(); // llegó tarde: nadie lo va a usar
      done(resolve, db);
    };
    request.onerror = () => done(reject, request.error);
    request.onblocked = () => done(reject, new Error('idb-blocked'));
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error('idb-abort'));
    });
  } finally {
    db.close();
  }
}

export const saveFolderHandle = (handle) =>
  withStore('readwrite', (s) => s.put(handle, KEY));
export const loadFolderHandle = () => withStore('readonly', (s) => s.get(KEY));
export const clearFolderHandle = () =>
  withStore('readwrite', (s) => s.delete(KEY));

/** ¿Tenemos permiso de lectura? Con `request: true` lo pide (requiere un clic del usuario). */
export async function ensurePermission(handle, { request = false } = {}) {
  const options = { mode: 'read' };
  try {
    if ((await handle.queryPermission?.(options)) === 'granted') return true;
    if (!request) return false;
    return (await handle.requestPermission?.(options)) === 'granted';
  } catch {
    return false; // handle inválido o carpeta que ya no existe
  }
}

/** Recorre la carpeta y todas sus subcarpetas juntando las imágenes. */
export async function scanFolder(dirHandle, { signal, onProgress } = {}) {
  const files = [];
  let lastReport = 0;

  const report = (force = false) => {
    const now = performance.now();
    if (force || now - lastReport > 120) {
      lastReport = now;
      onProgress?.(files.length);
    }
  };

  async function walk(dir) {
    for await (const entry of dir.values()) {
      if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
      if (entry.kind === 'file' && isImageName(entry.name)) {
        files.push(await entry.getFile());
        report(); // por tiempo, no cada 100 archivos: el contador se mueve desde el primer momento
      } else if (entry.kind === 'directory') {
        await walk(entry);
      }
    }
  }

  await walk(dirHandle);
  report(true);
  return files;
}
