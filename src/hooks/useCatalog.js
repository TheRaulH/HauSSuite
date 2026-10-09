import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { normalizeDescripcion } from '../utils/catalogModel';

const TABLE_NAME = 'catalogo_productos';

export function useCatalog() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * READ
   * Obtiene todos los productos del catálogo.
   */
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .select('id, descripcion, codigo_buscar, codigo_mostrar, created_at')
        .order('descripcion', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries(data ?? []);

      return data ?? [];
    } catch (err) {
      console.error('Error al cargar el catálogo:', err);
      setError(err);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  /**
   * Carga inicial.
   */
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  /**
   * CREATE
   * Crea un nuevo producto en el catálogo.
   */
  const createEntry = useCallback(async (entry) => {
    setError(null);

    try {
      const payload = {
        descripcion: entry.descripcion?.trim(),
        codigo_buscar: entry.codigo_buscar?.trim(),
        codigo_mostrar: entry.codigo_mostrar?.trim() || null,
      };

      const { data, error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .insert(payload)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries((current) =>
        [...current, data].sort((a, b) =>
          a.descripcion.localeCompare(b.descripcion)
        )
      );

      return data;
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err);
      throw err;
    }
  }, []);

  /**
   * UPDATE
   * Actualiza un producto existente.
   */
  const updateEntry = useCallback(async (id, changes) => {
    setError(null);

    try {
      const payload = {};

      if (changes.descripcion !== undefined) {
        payload.descripcion = changes.descripcion.trim();
      }

      if (changes.codigo_buscar !== undefined) {
        payload.codigo_buscar = changes.codigo_buscar.trim();
      }

      if (changes.codigo_mostrar !== undefined) {
        payload.codigo_mostrar = changes.codigo_mostrar?.trim() || null;
      }

      const { data, error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries((current) =>
        current
          .map((entry) => (entry.id === id ? data : entry))
          .sort((a, b) => a.descripcion.localeCompare(b.descripcion))
      );

      return data;
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError(err);
      throw err;
    }
  }, []);

  /**
   * DELETE
   * Elimina un producto del catálogo.
   */
  const deleteEntry = useCallback(async (id) => {
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err);
      throw err;
    }
  }, []);

  /**
   * DELETE ALL
   * Elimina todo el catálogo.
   *
   * Se deja preparado para una función de
   * "vaciar catálogo" desde la interfaz.
   */
  const clearCatalog = useCallback(async () => {
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .not('id', 'is', null);

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries([]);
    } catch (err) {
      console.error('Error al vaciar el catálogo:', err);
      setError(err);
      throw err;
    }
  }, []);

  /**
   * LOOKUP
   *
   * Crea un Map en memoria para poder encontrar
   * rápidamente un producto por descripción.
   */
  const lookupMap = useMemo(() => {
    const map = new Map();

    for (const entry of entries) {
      const normalized = normalizeDescripcion(entry.descripcion);

      if (!normalized) continue;

      map.set(normalized, entry);
    }

    return map;
  }, [entries]);

  /**
   * Busca un producto por descripción.
   */
  const lookup = useCallback(
    (nombre) => {
      if (!nombre) return null;

      return lookupMap.get(normalizeDescripcion(nombre)) ?? null;
    },
    [lookupMap]
  );

  /**
   * Busca directamente por ID.
   */
  const getEntryById = useCallback(
    (id) => {
      return entries.find((entry) => entry.id === id) ?? null;
    },
    [entries]
  );

  /**
   * Permite refrescar manualmente el catálogo.
   */
  const refresh = useCallback(async () => {
    return fetchCatalog();
  }, [fetchCatalog]);

  return {
    // Estado
    entries,
    loaded,
    loading,
    error,

    // CRUD
    fetchCatalog,
    createEntry,
    updateEntry,
    deleteEntry,
    clearCatalog,

    // Consultas
    lookup,
    getEntryById,

    // Utilidad
    refresh,
  };
}
