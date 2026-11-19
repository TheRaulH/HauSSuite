import { isImageName } from './finder'

/**
 * Recuerda la carpeta elegida entre visitas. Un FileSystemDirectoryHandle se puede guardar
 * en IndexedDB: al recargar la página no hay que volver a buscarla, solo reconectarla
 * (el navegador pide permiso una vez por sesión).
 */
const DB_NAME = 'hausuite'
const STORE = 'handles'
const KEY = 'carpeta-imagenes'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore(mode, fn) {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = fn(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request?.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export const saveFolderHandle = (handle) => withStore('readwrite', (s) => s.put(handle, KEY))
export const loadFolderHandle = () => withStore('readonly', (s) => s.get(KEY))
export const clearFolderHandle = () => withStore('readwrite', (s) => s.delete(KEY))

/** ¿Tenemos permiso de lectura? Con `request: true` lo pide (requiere un clic del usuario). */
export async function ensurePermission(handle, { request = false } = {}) {
  const options = { mode: 'read' }
  if ((await handle.queryPermission?.(options)) === 'granted') return true
  if (!request) return false
  return (await handle.requestPermission?.(options)) === 'granted'
}

/** Recorre la carpeta y todas sus subcarpetas juntando las imágenes. */
export async function scanFolder(dirHandle, { signal, onProgress } = {}) {
  const files = []
  async function walk(dir) {
    for await (const entry of dir.values()) {
      if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError')
      if (entry.kind === 'file' && isImageName(entry.name)) {
        files.push(await entry.getFile())
        if (files.length % 100 === 0) onProgress?.(files.length)
      } else if (entry.kind === 'directory') {
        await walk(entry)
      }
    }
  }
  await walk(dirHandle)
  onProgress?.(files.length)
  return files
}
