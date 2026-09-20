import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Layers, Search, X } from "lucide-react";
import {
  GEOFENCE_TYPES,
  type Geofence,
  type GeofenceType,
} from "@/api/geofences";
import { useModalFocus } from "@/hooks/useModalFocus";
import {
  filterGeofencesForPanelList,
  type GeofenceListScope,
} from "@/lib/geofence-panel";
import { MapControlsSkeleton } from "./Skeleton";

const typeLabels: Record<GeofenceType, string> = {
  ESTADO: "Estado",
  MUNICIPIO: "Municipios",
  DISTRITO: "Distritos (legado)",
  SECCION: "Secciones",
  DISTRITO_LOCAL: "Distrito local",
  DISTRITO_FEDERAL: "Distrito federal",
};

export function PanelCapas({
  items,
  visible,
  selectedId,
  loading,
  error,
  countsByType,
  isTypeLoading,
  isTypeLoaded,
  pointGeofences,
  pointLookup,
  onToggle,
  onSelect,
  onEnsureTypeLoaded,
  onClose,
  returnFocusRef,
}: {
  items: Geofence[];
  visible: Record<GeofenceType, boolean>;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  countsByType?: Record<GeofenceType, number>;
  isTypeLoading?: (type: GeofenceType) => boolean;
  isTypeLoaded?: (type: GeofenceType) => boolean;
  onToggle: (type: GeofenceType, visible?: boolean) => void;
  pointGeofences: Geofence[];
  pointLookup: { loading: boolean; error: string | null };
  onSelect: (id: string) => void;
  onEnsureTypeLoaded?: (type: GeofenceType) => void;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [search, setSearch] = useState("");
  const [listScope, setListScope] = useState<GeofenceListScope>("ALL");
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalFocus({
    containerRef: dialogRef,
    returnFocusRef,
    onClose,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (listScope !== "ALL") onEnsureTypeLoaded?.(listScope);
  }, [listScope, onEnsureTypeLoaded]);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2 || !onEnsureTypeLoaded) return;
    for (const type of GEOFENCE_TYPES) {
      if (visible[type] && !(isTypeLoaded?.(type) ?? true)) {
        onEnsureTypeLoaded(type);
      }
    }
  }, [isTypeLoaded, onEnsureTypeLoaded, search, visible]);

  const listResult = useMemo(
    () =>
      filterGeofencesForPanelList({
        items,
        visible,
        listScope,
        search,
      }),
    [items, listScope, search, visible],
  );

  const selected = items.find((item) => item.id === selectedId);
  const anyLayerVisible = GEOFENCE_TYPES.some((type) => visible[type]);

  const setAllLayers = (next: boolean) => {
    for (const type of GEOFENCE_TYPES) {
      if (visible[type] !== next) onToggle(type, next);
    }
  };

  return (
    <section
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Capas territoriales"
      className="absolute top-3 right-3 z-20 flex max-h-[calc(100%-1.5rem)] w-80 flex-col overflow-hidden rounded border max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-h-[78%] max-sm:rounded-b-none"
      style={{
        background: "var(--cyber-surface-1)",
        borderColor: "var(--cyber-border)",
        boxShadow: "var(--cyber-shadow-md)",
      }}
    >
      <header
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <span
          className="flex gap-2 items-center text-xs font-semibold"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          <Layers size={14} aria-hidden />
          Capas territoriales
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar capas"
          className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: "var(--md-sys-color-primary)" }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </header>

      <div
        className="p-2 border-b space-y-2"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <p className="text-[11px] leading-snug text-muted-foreground">
          Activa las capas que quieres ver en el mapa. Usa el listado para
          buscar y centrar un territorio.
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className="rounded border px-2 py-1 text-[11px]"
            onClick={() => setAllLayers(true)}
          >
            Mostrar todas
          </button>
          <button
            type="button"
            className="rounded border px-2 py-1 text-[11px]"
            onClick={() => setAllLayers(false)}
          >
            Ocultar todas
          </button>
        </div>
        <ul className="max-h-36 space-y-1 overflow-y-auto">
          {GEOFENCE_TYPES.map((type) => {
            const count = countsByType?.[type];
            const loaded = isTypeLoaded?.(type) ?? true;
            const typeLoading = isTypeLoading?.(type) ?? false;
            return (
              <li key={type}>
                <label className="flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={visible[type]}
                    onChange={(event) => onToggle(type, event.target.checked)}
                    className="size-3.5 shrink-0"
                  />
                  <span className="min-w-0 flex-1">{typeLabels[type]}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {typeLoading
                      ? "…"
                      : loaded && count !== undefined
                        ? count
                        : visible[type]
                          ? "—"
                          : ""}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="space-y-2 border-b p-2"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <label
          className="block text-[11px] font-medium"
          htmlFor="geofence-list-scope"
        >
          Listado
        </label>
        <select
          id="geofence-list-scope"
          value={listScope}
          onChange={(event) =>
            setListScope(event.target.value as GeofenceListScope)
          }
          className="min-h-9 w-full rounded border bg-transparent px-2 text-xs"
        >
          <option value="ALL">Todas las capas activas</option>
          {GEOFENCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
              {countsByType?.[type] !== undefined
                ? ` (${countsByType[type]})`
                : ""}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="geofence-search">
          Buscar territorio
        </label>
        <div className="flex items-center gap-2 rounded border px-2 py-1.5">
          <Search size={12} aria-hidden />
          <input
            id="geofence-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o código (ej. Puebla, 140)"
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
      </div>

      {(pointLookup.loading ||
        pointLookup.error ||
        pointGeofences.length > 0) && (
        <div
          className="border-b px-3 py-2 text-[10px]"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          {pointLookup.loading
            ? "Consultando territorio del punto…"
            : (pointLookup.error ??
              `Punto en: ${pointGeofences.map((item) => item.name).join(", ")}`)}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div role="status" aria-live="polite">
            <span className="sr-only">Cargando geocercas…</span>
            <MapControlsSkeleton />
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="text-xs"
            style={{ color: "var(--cyber-error)" }}
          >
            {error}
          </p>
        )}
        {!loading && !error && !anyLayerVisible && (
          <p className="text-xs text-muted-foreground">
            Activa al menos una capa arriba para ver polígonos en el mapa.
          </p>
        )}
        {!loading &&
          !error &&
          anyLayerVisible &&
          listResult.items.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {search.trim()
                ? "Ningún territorio coincide. Prueba otro nombre, activa la capa correspondiente o espera a que termine la carga."
                : listScope === "ALL"
                  ? "No hay datos cargados para las capas activas. Marca una capa y espera el conteo numérico."
                  : `No hay ${typeLabels[listScope as GeofenceType].toLocaleLowerCase("es-MX")} cargados. Activa la capa y espera la carga.`}
            </p>
          )}
        {listResult.truncated && (
          <p className="text-[10px] text-muted-foreground" role="status">
            Mostrando {listResult.items.length} de {listResult.totalMatches}.
            Escribe en buscar para acotar.
          </p>
        )}
        {listResult.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={item.id === selectedId}
            className="w-full text-left rounded border p-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              outlineColor: "var(--md-sys-color-primary)",
              borderColor:
                item.id === selectedId
                  ? "var(--cyber-cyan)"
                  : "var(--cyber-border-subtle)",
            }}
          >
            <strong>{item.name}</strong>
            <span className="block text-[10px] text-muted-foreground">
              {typeLabels[item.type]}
              {item.code ? ` · ${item.code}` : ""}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <footer
          className="border-t p-3 text-xs"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          <strong>{selected.name}</strong>
          <p className="text-muted-foreground">
            {typeLabels[selected.type]}
            {selected.code ? ` · ${selected.code}` : ""} · v{selected.version}
          </p>
          <p className="text-[10px] text-muted-foreground">
            El mapa centra y resalta este territorio al seleccionarlo.
          </p>
        </footer>
      )}
    </section>
  );
}
