/**
 * Persistencia del catálogo de códigos (DESCRIPCION -> CODIGOBUSCAR /
 * CODIGOMOSTRAR) en IndexedDB. A diferencia del Excel diario de productos
 * (que se importa de nuevo cada vez), este catálogo es una tabla de
 * referencia que cambia poco — se carga una vez desde la app y queda
 * disponible entre sesiones hasta que el usuario la actualice.
 */

const DB_NAME = 'carousel-generator'
const DB_VERSION = 1
const STORE_NAME = 'catalogo'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'descripcionNormalizada' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Reemplaza el catálogo completo por estas entradas. */
export async function saveCatalog(entries) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    for (const entry of entries) store.put(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadCatalog() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result ?? [])
    request.onerror = () => reject(request.error)
  })
}

export async function clearCatalog() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
