/**
 * Nombre de la app en Outfit (el logo de Hauscenter no se redibuja ni se reemplaza por texto:
 * esto es solo el nombre de la suite).
 * `onDark`: sobre fondo azul "Suite" va en arena cálida; sobre fondo claro, en azul atenuado.
 */
export default function Wordmark({ className = '', onDark = false }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      HauS
      <span className={`font-medium ${onDark ? 'text-haus-sand' : 'opacity-70'}`}>Suite</span>
    </span>
  )
}
