/**
 * Guarda/lee configuración simple en localStorage — por ahora, el último
 * diseño y formato(s) elegidos (ver hooks/useDesigns.js), para que no haya
 * que reseleccionarlos cada vez que se abre la app.
 */

const STORAGE_KEY = 'carousel-generator:config'

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}
