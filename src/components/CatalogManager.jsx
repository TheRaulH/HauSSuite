import { useMemo, useRef, useState } from 'react';
import { parseCatalogFile, normalizeDescripcion } from '../utils/catalogModel';

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  descripcion: '',
  codigo_buscar: '',
  codigo_mostrar: '',
};

function getImportValue(entry, snakeCase, camelCase) {
  return entry[snakeCase] ?? entry[camelCase] ?? '';
}

function normalizeImportEntry(entry) {
  return {
    descripcion: String(entry.descripcion ?? '').trim(),
    codigo_buscar: String(
      getImportValue(entry, 'codigo_buscar', 'codigoBuscar')
    ).trim(),
    codigo_mostrar:
      String(getImportValue(entry, 'codigo_mostrar', 'codigoMostrar')).trim() ||
      null,
  };
}

function formatError(error) {
  if (error?.code === '23505') {
    return 'Ya existe un registro con esos datos. Revisa las restricciones de la base de datos.';
  }

  if (error?.code === '42501' || error?.code === 'PGRST301') {
    return 'No tienes permisos para realizar esta operación en Supabase.';
  }

  return error?.message || 'Ocurrió un error inesperado.';
}

export default function CatalogManager({
  entries = [],
  loaded = false,
  loading = false,
  error: catalogError = null,
  createEntry,
  updateEntry,
  deleteEntry,
  clearCatalog,
  refresh,
}) {
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [importProgress, setImportProgress] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const normalizedEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        descripcion: entry.descripcion ?? '',
        codigo_buscar: entry.codigo_buscar ?? '',
        codigo_mostrar: entry.codigo_mostrar ?? '',
      })),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const query = normalizeDescripcion(search);

    if (!query) return normalizedEntries;

    return normalizedEntries.filter((entry) => {
      const description = normalizeDescripcion(entry.descripcion);
      const searchCode = normalizeDescripcion(entry.codigo_buscar);
      const displayCode = normalizeDescripcion(entry.codigo_mostrar);

      return (
        description.includes(query) ||
        searchCode.includes(query) ||
        displayCode.includes(query)
      );
    });
  }, [normalizedEntries, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));

  const visibleEntries = filteredEntries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const pageStart =
    filteredEntries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const pageEnd = Math.min(page * PAGE_SIZE, filteredEntries.length);

  function showMessage(message, type = 'success') {
    setStatus({ message, type });
    setError('');
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
    setStatus(null);
  }

  function openEditForm(entry) {
    setEditingId(entry.id);
    setForm({
      descripcion: entry.descripcion ?? '',
      codigo_buscar: entry.codigo_buscar ?? '',
      codigo_mostrar: entry.codigo_mostrar ?? '',
    });
    setShowForm(true);
    setError('');
    setStatus(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    const descripcion = form.descripcion.trim();
    const codigo_buscar = form.codigo_buscar.trim();
    const codigo_mostrar = form.codigo_mostrar.trim();

    if (!descripcion || !codigo_buscar) {
      setError('La descripción y el código de búsqueda son obligatorios.');
      return;
    }

    const normalizedDescription = normalizeDescripcion(descripcion);

    const duplicate = entries.find(
      (entry) =>
        normalizeDescripcion(entry.descripcion) === normalizedDescription &&
        entry.id !== editingId
    );

    if (duplicate) {
      setError(
        `Ya existe un producto con esa descripción: ${duplicate.descripcion}.`
      );
      return;
    }

    setBusy(true);
    setError('');
    setStatus(null);

    try {
      const payload = {
        descripcion,
        codigo_buscar,
        codigo_mostrar: codigo_mostrar || null,
      };

      if (editingId) {
        await updateEntry(editingId, payload);
        showMessage('Producto actualizado correctamente.');
      } else {
        await createEntry(payload);
        showMessage('Producto agregado correctamente.');
      }

      closeForm();
      setSearch('');
      setPage(1);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;

    setBusy(true);
    setError('');

    try {
      await deleteEntry(confirmDelete.id);

      showMessage(`Se eliminó "${confirmDelete.descripcion}" correctamente.`);

      setConfirmDelete(null);

      const remaining = filteredEntries.length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(Math.max(remaining, 0) / PAGE_SIZE)
      );

      setPage((current) => Math.min(current, newTotalPages));
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setBusy(true);
    setError('');
    setStatus(null);
    setImportProgress({
      current: 0,
      total: 0,
    });

    try {
      const parsedEntries = await parseCatalogFile(file);

      if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
        throw new Error('El archivo no contiene productos válidos.');
      }

      /*
       * Normaliza y agrupa las filas del archivo.
       * Si una descripción aparece varias veces, se conserva
       * su última aparición dentro del Excel.
       */
      const importMap = new Map();

      for (const rawEntry of parsedEntries) {
        const entry = normalizeImportEntry(rawEntry);

        if (!entry.descripcion || !entry.codigo_buscar) continue;

        const key = normalizeDescripcion(entry.descripcion);

        if (!key) continue;

        importMap.set(key, entry);
      }

      const importEntries = [...importMap.entries()].map(([key, entry]) => ({
        key,
        ...entry,
      }));

      if (importEntries.length === 0) {
        throw new Error(
          'No se encontraron filas válidas. Verifica las columnas DESCRIPCION y CODIGOBUSCAR.'
        );
      }

      const existingMap = new Map();

      for (const entry of entries) {
        const key = normalizeDescripcion(entry.descripcion);

        if (key) existingMap.set(key, entry);
      }

      let created = 0;
      let updated = 0;
      let unchanged = 0;
      let failed = 0;

      const failures = [];

      setImportProgress({
        current: 0,
        total: importEntries.length,
      });

      /*
       * Importación incremental:
       * - Si existe la descripción, actualiza ese registro.
       * - Si no existe, crea un registro nuevo.
       * - Nunca elimina registros que no aparezcan en el archivo.
       *
       * Las operaciones se realizan individualmente mediante
       * el hook para mantener sincronizado el estado local.
       */
      for (let index = 0; index < importEntries.length; index += 1) {
        const item = importEntries[index];
        const existing = existingMap.get(item.key);

        const payload = {
          descripcion: item.descripcion,
          codigo_buscar: item.codigo_buscar,
          codigo_mostrar: item.codigo_mostrar,
        };

        try {
          if (existing) {
            const isUnchanged =
              existing.descripcion === payload.descripcion &&
              existing.codigo_buscar === payload.codigo_buscar &&
              (existing.codigo_mostrar || null) === payload.codigo_mostrar;

            if (isUnchanged) {
              unchanged += 1;
            } else {
              const updatedEntry = await updateEntry(existing.id, payload);

              existingMap.set(item.key, updatedEntry);
              updated += 1;
            }
          } else {
            const createdEntry = await createEntry(payload);

            existingMap.set(item.key, createdEntry);
            created += 1;
          }
        } catch (err) {
          failed += 1;

          if (failures.length < 5) {
            failures.push(`${item.descripcion}: ${formatError(err)}`);
          }
        }

        setImportProgress({
          current: index + 1,
          total: importEntries.length,
        });
      }

      if (refresh) {
        try {
          await refresh();
        } catch (refreshError) {
          console.error(
            'La importación terminó, pero no se pudo refrescar el catálogo:',
            refreshError
          );
        }
      }

      setSearch('');
      setPage(1);

      if (failed > 0) {
        setStatus({
          type: 'warning',
          message:
            `Importación parcial: ${created} nuevos, ${updated} actualizados, ` +
            `${unchanged} sin cambios y ${failed} errores.`,
        });

        setError(
          `Algunos productos no se pudieron procesar:\n${failures.join('\n')}`
        );
      } else {
        setStatus({
          type: 'success',
          message:
            `Importación completada: ${created} nuevos, ${updated} actualizados ` +
            `y ${unchanged} sin cambios. No se eliminaron productos.`,
        });
      }
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
      setImportProgress(null);
    }
  }

  async function handleRefresh() {
    if (!refresh) return;

    setBusy(true);
    setError('');
    setStatus(null);

    try {
      await refresh();
      showMessage('Catálogo sincronizado con Supabase.');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!clearCatalog) return;

    setBusy(true);
    setError('');

    try {
      await clearCatalog();
      setConfirmClear(false);
      setPage(1);
      setSearch('');
      showMessage('El catálogo se ha vaciado correctamente.');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  }

  const isBusy = busy || loading;

  return (
    <section className="space-y-5">
      {/* Encabezado y resumen */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Catálogo de productos
                </h2>
                <p className="text-sm text-gray-500">
                  Administración centralizada en Supabase
                </p>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Gestiona códigos, modifica productos e importa actualizaciones
              desde Excel sin reemplazar todo el catálogo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isBusy || !refresh}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sincronizar
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              disabled={isBusy || !loaded}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Nuevo producto
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total de productos
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {loaded ? entries.length.toLocaleString() : '—'}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Resultados de búsqueda
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {loaded ? filteredEntries.length.toLocaleString() : '—'}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Estado de conexión
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  !loaded
                    ? 'bg-amber-400'
                    : catalogError
                      ? 'bg-red-500'
                      : 'bg-emerald-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {!loaded
                  ? 'Cargando catálogo'
                  : catalogError
                    ? 'Error de carga'
                    : 'Catálogo cargado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de creación y edición */}
      {showForm && (
        <div className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {editingId ? 'Editar producto' : 'Registrar producto'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Completa los datos que utilizará la importación de Excel.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={busy}
              className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block md:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Descripción <span className="text-red-500">*</span>
                </span>
                <input
                  autoFocus
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  maxLength={1000}
                  required
                  placeholder="Ej. CAFETERA OSTER 12 TAZAS"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Código de búsqueda <span className="text-red-500">*</span>
                </span>
                <input
                  name="codigo_buscar"
                  value={form.codigo_buscar}
                  onChange={handleFormChange}
                  maxLength={255}
                  required
                  placeholder="Ej. 123456"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Código para mostrar
                </span>
                <input
                  name="codigo_mostrar"
                  value={form.codigo_mostrar}
                  onChange={handleFormChange}
                  maxLength={255}
                  placeholder="Ej. OST-123456"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={busy}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Importación incremental */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-gray-900">
              Importación incremental
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Sube un Excel completo o parcial. Las descripciones existentes se
              actualizan, los productos nuevos se agregan y los que no aparecen
              en el archivo se conservan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy || !loaded}
            className="shrink-0 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Procesando...' : 'Importar Excel'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-600">
            Columnas requeridas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['DESCRIPCION', 'CODIGOBUSCAR'].map((column) => (
              <span
                key={column}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-gray-700"
              >
                {column}
              </span>
            ))}
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-gray-500">
              CODIGOMOSTRAR (opcional)
            </span>
          </div>
        </div>

        {importProgress && (
          <div className="mt-4" aria-live="polite">
            <div className="mb-2 flex justify-between text-xs text-gray-600">
              <span>Procesando productos...</span>
              <span>
                {importProgress.current} / {importProgress.total}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={importProgress.total}
              aria-valuenow={importProgress.current}
            >
              <div
                className="h-full rounded-full bg-purple-600 transition-all"
                style={{
                  width: `${
                    importProgress.total
                      ? (importProgress.current / importProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notificaciones */}
      {(status || error || catalogError) && (
        <div className="space-y-2" aria-live="polite">
          {status && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {status.message}
            </div>
          )}

          {(error || catalogError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">No se pudo completar la operación.</p>
              <p className="mt-1 whitespace-pre-line">
                {error || formatError(catalogError)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabla de productos */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Productos registrados
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Busca, consulta y modifica los productos de tu catálogo.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar descripción o código..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        {!loaded ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-purple-600" />
            <p className="mt-3 text-sm text-gray-500">Cargando catálogo...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </div>
            <p className="mt-3 font-medium text-gray-800">
              {search
                ? 'No se encontraron productos'
                : 'Tu catálogo está vacío'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {search
                ? 'Prueba con otra descripción o código.'
                : 'Agrega un producto o importa un archivo Excel para comenzar.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-3 text-sm font-medium text-purple-700 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3 font-medium">Descripción</th>
                    <th className="px-5 py-3 font-medium">Código búsqueda</th>
                    <th className="px-5 py-3 font-medium">Código visible</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="max-w-sm px-5 py-3.5">
                        <p className="break-words text-sm font-medium text-gray-900">
                          {entry.descripcion}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm text-gray-700">
                          {entry.codigo_buscar}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {entry.codigo_mostrar ? (
                          <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                            {entry.codigo_mostrar}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(entry)}
                            disabled={isBusy}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDelete(entry)}
                            disabled={isBusy}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Mostrando{' '}
                <span className="font-medium text-gray-700">{pageStart}</span> –{' '}
                <span className="font-medium text-gray-700">{pageEnd}</span> de{' '}
                <span className="font-medium text-gray-700">
                  {filteredEntries.length}
                </span>{' '}
                productos
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <span className="min-w-20 text-center text-xs text-gray-500">
                  Página {page} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmación de eliminación individual */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setConfirmDelete(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3" />
              </svg>
            </div>

            <h3
              id="delete-title"
              className="mt-4 text-lg font-semibold text-gray-900"
            >
              Eliminar producto
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-gray-600">
              ¿Seguro que deseas eliminar{' '}
              <strong>{confirmDelete.descripcion}</strong>? Esta acción
              eliminará el registro de Supabase.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? 'Eliminando...' : 'Eliminar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de vaciado total, disponible solo si se conecta la acción */}
      {confirmClear && clearCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3
              id="clear-title"
              className="text-lg font-semibold text-gray-900"
            >
              Vaciar todo el catálogo
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Se eliminarán los {entries.length} registros de Supabase. Esta
              acción no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={busy}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? 'Eliminando...' : 'Vaciar catálogo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
