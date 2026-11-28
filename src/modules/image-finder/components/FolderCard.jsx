import { useRef } from 'react';
import { FolderOpen, FolderSync, LoaderCircle, RefreshCw } from 'lucide-react';
import { formatInt } from '../../reports/format';
import { useEffect, useRef, useState } from 'react';

function useElapsed(active, ms) {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    if (!active) {
      setElapsed(false);
      return undefined;
    }
    const t = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(t);
  }, [active, ms]);
  return elapsed;
}

const primary =
  'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-haus-blue hover:opacity-90 rounded-full rounded-bl-none';
const secondary =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-haus-sky hover:text-haus-blue';

/** Paso 1: la carpeta de imágenes (se recuerda entre visitas). */
export default function FolderCard({ folder }) {
  const inputRef = useRef(null);
  const { status, name, count, error, supported } = folder;

  let body;
  if (status === 'checking') {
    body = (
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <LoaderCircle size={16} className="animate-spin" aria-hidden />
          Buscando la carpeta guardada…
        </p>
        {slow && (
          <>
            <p className="text-xs text-gray-500">
              Está tardando más de lo normal. Puedes elegir la carpeta
              manualmente.
            </p>
            <div>
              <button type="button" onClick={choose} className={primary}>
                <FolderOpen size={16} aria-hidden /> Seleccionar carpeta
              </button>
            </div>
          </>
        )}
      </div>
    );
  } else if (status === 'scanning') {
    body = (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="flex items-center gap-2 text-sm text-haus-blue">
          <LoaderCircle size={16} className="animate-spin" aria-hidden />
          Leyendo «{name}»… <strong>{formatInt(count)}</strong> imágenes
        </p>
        <button type="button" onClick={folder.cancel} className={secondary}>
          Cancelar
        </button>
      </div>
    );
  } else if (status === 'needs-permission') {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Tu carpeta guardada es{' '}
          <strong className="text-haus-blue">«{name}»</strong>. El navegador
          necesita que la vuelvas a autorizar.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={folder.reconnect} className={primary}>
            <FolderSync size={16} aria-hidden /> Reconectar carpeta
          </button>
          <button type="button" onClick={folder.pick} className={secondary}>
            Elegir otra
          </button>
        </div>
      </div>
    );
  } else if (status === 'ready') {
    body = (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-700">
          <strong className="text-haus-blue">{formatInt(count)}</strong>{' '}
          imágenes en «{name}»
        </p>
        <div className="flex items-center gap-2">
          {supported && (
            <button
              type="button"
              onClick={folder.refresh}
              className={secondary}
              title="Volver a leer la carpeta (si agregaste imágenes nuevas)"
            >
              <RefreshCw size={13} aria-hidden /> Actualizar
            </button>
          )}
          <button
            type="button"
            onClick={supported ? folder.pick : () => inputRef.current?.click()}
            className={secondary}
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Elige la carpeta principal (ej. PRODUCTOS). Se leen todas sus
          subcarpetas
          {supported ? ' y se recuerda para la próxima vez.' : '.'}
        </p>
        <div>
          <button
            type="button"
            onClick={supported ? folder.pick : () => inputRef.current?.click()}
            className={primary}
          >
            <FolderOpen size={16} aria-hidden /> Seleccionar carpeta
          </button>
        </div>
        {!supported && (
          <p className="text-xs text-gray-400">
            Este navegador no puede recordar la carpeta; en Chrome o Edge sí.
          </p>
        )}
      </div>
    );
  }

  return (
    <section
      className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 flex flex-col gap-3"
      aria-label="Carpeta de imágenes"
    >
      <h3 className="font-semibold text-haus-blue flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-haus-blue text-white text-xs flex items-center justify-center">
          1
        </span>
        Carpeta de imágenes
      </h3>
      {body}
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">
        Las imágenes no se suben a ningún lado: se leen en tu navegador.
      </p>
      <input
        ref={inputRef}
        type="file"
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={(e) => {
          folder.pickFromInput(e.target.files);
          e.target.value = '';
        }}
      />
    </section>
  );
}
