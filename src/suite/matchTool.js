/** Una herramienta está activa en su ruta exacta o en cualquier sub-ruta (#/reportes/pauta-tiktok). */
export function isToolPath(tool, path) {
  return path === tool.path || path.startsWith(`${tool.path}/`)
}
