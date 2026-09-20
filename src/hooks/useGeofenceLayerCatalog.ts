import { useCallback, useMemo, useRef, useState } from "react";

import { ApiError } from "@/api/http";
import {
  GEOFENCE_TYPES,
  type Geofence,
  type GeofenceType,
  type GeofencesApi,
} from "@/api/geofences";
import { catalogLimitsFor } from "@/lib/geofence-catalog-limits";

function geofenceLoadErrorMessage(reason: unknown): string {
  if (reason instanceof ApiError && reason.status === 404) {
    return "El catálogo territorial (/geocercas) no está disponible en el servidor. Despliega la versión actual del backend.";
  }
  if (reason instanceof ApiError && reason.status === 500) {
    return "El servidor no pudo devolver esta capa (respuesta demasiado grande). Se reintentará con lotes más pequeños.";
  }
  if (reason instanceof Error) return reason.message;
  return "No fue posible cargar las capas territoriales.";
}

export function useGeofenceLayerCatalog(api: GeofencesApi) {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<Set<GeofenceType>>(
    () => new Set(),
  );
  const [errorsByType, setErrorsByType] = useState<
    Partial<Record<GeofenceType, string>>
  >({});
  const [truncatedTypes, setTruncatedTypes] = useState<Set<GeofenceType>>(
    () => new Set(),
  );
  const loadedTypesRef = useRef<Set<GeofenceType>>(new Set());
  const [loadedTypes, setLoadedTypes] = useState<Set<GeofenceType>>(
    () => new Set(),
  );

  const ensureTypeLoaded = useCallback(
    async (type: GeofenceType, signal?: AbortSignal) => {
      if (loadedTypesRef.current.has(type)) return;
      setLoadingTypes((current) => new Set(current).add(type));
      setErrorsByType((current) => {
        if (!current[type]) return current;
        const next = { ...current };
        delete next[type];
        return next;
      });
      try {
        const items = await api.listAll({ tipo: type, signal });
        loadedTypesRef.current.add(type);
        setLoadedTypes((current) => new Set(current).add(type));
        const limits = catalogLimitsFor(type);
        if (limits.maxItems !== null && items.length >= limits.maxItems) {
          setTruncatedTypes((current) => new Set(current).add(type));
        }
        setGeofences((current) => [
          ...current.filter((item) => item.type !== type),
          ...items,
        ]);
      } catch (reason: unknown) {
        if (signal?.aborted) return;
        setErrorsByType((current) => ({
          ...current,
          [type]: geofenceLoadErrorMessage(reason),
        }));
      } finally {
        setLoadingTypes((current) => {
          const next = new Set(current);
          next.delete(type);
          return next;
        });
      }
    },
    [api],
  );

  const loading = loadingTypes.size > 0;

  const countsByType = useMemo(() => {
    const counts = Object.fromEntries(
      GEOFENCE_TYPES.map((type) => [type, 0]),
    ) as Record<GeofenceType, number>;
    for (const item of geofences) counts[item.type] += 1;
    return counts;
  }, [geofences]);

  const error = useMemo(() => {
    const messages = Object.values(errorsByType);
    return messages.length ? messages.join(" ") : null;
  }, [errorsByType]);

  return {
    geofences,
    loading,
    error,
    errorsByType,
    truncatedTypes,
    countsByType,
    ensureTypeLoaded,
    isTypeLoaded: (type: GeofenceType) => loadedTypes.has(type),
    isTypeLoading: (type: GeofenceType) => loadingTypes.has(type),
  };
}
