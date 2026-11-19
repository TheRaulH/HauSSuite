import { useEffect, useState } from 'react'

/**
 * Miniaturas livianas. Mostrar el archivo original en un <img> de 52 px obliga al navegador
 * a decodificar la foto completa (varios MB de RAM cada una): con cientos de filas, la página
 * se cae. Acá se genera una miniatura de ~120 px, de a pocas por vez, solo para las filas
 * que se están viendo, y se recuerdan las últimas 400.
 */
const MAX_CACHED = 400
const SIZE = 120
const CONCURRENCY = 3

const cache = new Map() // File -> url
const waiting = []
let active = 0

async function makeThumbnail(file) {
  const bitmap = await createImageBitmap(file, { resizeWidth: SIZE, resizeQuality: 'low' })
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d').drawImage(bitmap, 0, 0)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7))
    return blob ? URL.createObjectURL(blob) : null
  } finally {
    bitmap.close?.()
  }
}

function pump() {
  while (active < CONCURRENCY && waiting.length > 0) {
    const job = waiting.shift()
    if (job.cancelled) continue
    active += 1
    makeThumbnail(job.file)
      .catch(() => null)
      .then((url) => {
        if (url) {
          cache.set(job.file, url)
          if (cache.size > MAX_CACHED) {
            const oldest = cache.keys().next().value
            URL.revokeObjectURL(cache.get(oldest))
            cache.delete(oldest)
          }
        }
        job.resolve(url)
      })
      .finally(() => {
        active -= 1
        pump()
      })
  }
}

function request(file) {
  const job = { file, cancelled: false }
  const promise = new Promise((resolve) => {
    job.resolve = resolve
  })
  waiting.push(job)
  pump()
  return { promise, cancel: () => (job.cancelled = true) }
}

export function useThumbnail(file) {
  const [url, setUrl] = useState(() => (file ? (cache.get(file) ?? null) : null))

  useEffect(() => {
    if (!file) return undefined
    const cached = cache.get(file)
    if (cached) {
      setUrl(cached)
      return undefined
    }
    setUrl(null)
    const job = request(file)
    let alive = true
    job.promise.then((u) => alive && setUrl(u))
    return () => {
      alive = false
      job.cancel()
    }
  }, [file])

  return file ? url : null
}
