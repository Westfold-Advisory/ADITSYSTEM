import { useMemo, useState } from "react";
import { Layers, Search, X } from "lucide-react";
import type { Geofence, GeofenceType } from "@/api/geofences";
import { MapControlsSkeleton } from "./Skeleton";

const typeLabels: Record<GeofenceType, string> = {
  ESTADO: "Estados",
  MUNICIPIO: "Municipios",
  DISTRITO: "Distritos",
};

export function PanelCapas({
  items,
  visible,
  selectedId,
  loading,
  error,
  pointGeofences,
  pointLookup,
  onToggle,
  onSelect,
  onClose,
}: {
  items: Geofence[];
  visible: Record<GeofenceType, boolean>;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  onToggle: (type: GeofenceType) => void;
  pointGeofences: Geofence[];
  pointLookup: { loading: boolean; error: string | null };
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term
      ? items.filter((item) =>
          `${item.name} ${item.code ?? ""}`.toLocaleLowerCase().includes(term),
        )
      : items;
  }, [items, search]);
  const selected = items.find((item) => item.id === selectedId);
  return (
    <section
      role="dialog"
      aria-label="Capas territoriales"
      className="absolute top-3 right-3 z-20 flex max-h-[calc(100%-1.5rem)] w-72 flex-col overflow-hidden rounded border max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-h-[70%] max-sm:rounded-b-none"
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
          className="flex gap-2 items-center font-mono text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--cyber-cyan)" }}
        >
          <Layers size={13} />
          Capas territoriales
        </span>
        <button type="button" onClick={onClose} aria-label="Cerrar capas">
          <X size={14} />
        </button>
      </header>
      <div
        className="p-2 border-b"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <label className="sr-only" htmlFor="geofence-search">
          Buscar geocerca
        </label>
        <div className="flex items-center gap-2 px-2 py-1 border">
          <Search size={12} />
          <input
            id="geofence-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar nombre o código"
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
      </div>
      <div
        className="p-2 flex gap-1 border-b"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        {(Object.keys(typeLabels) as GeofenceType[]).map((type) => (
          <button
            key={type}
            type="button"
            role="switch"
            aria-checked={visible[type]}
            onClick={() => onToggle(type)}
            className="px-2 py-1 text-[9px] font-mono border"
            style={{
              color: visible[type]
                ? "var(--cyber-cyan)"
                : "var(--cyber-text-secondary)",
            }}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>
      {(pointLookup.loading ||
        pointLookup.error ||
        pointGeofences.length > 0) && (
        <div
          className="px-3 py-2 border-b text-[10px]"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          {pointLookup.loading
            ? "Consultando territorio del punto…"
            : (pointLookup.error ??
              `Punto en: ${pointGeofences.map((item) => item.name).join(", ")}`)}
        </div>
      )}
      <div className="overflow-y-auto p-2 space-y-1">
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
        {!loading && !error && filtered.length === 0 && (
          <p className="text-xs">No hay geocercas que coincidan.</p>
        )}
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="w-full text-left p-2 border text-xs"
            style={{
              borderColor:
                item.id === selectedId
                  ? "var(--cyber-cyan)"
                  : "var(--cyber-border-subtle)",
            }}
          >
            <strong>{item.name}</strong>
            <span className="block text-[10px]">
              {typeLabels[item.type]}
              {item.code ? ` · ${item.code}` : ""} · v{item.version}
            </span>
            {!item.geometry && (
              <span
                className="block text-[10px]"
                style={{ color: "var(--cyber-warning)" }}
              >
                Geometría no disponible
              </span>
            )}
          </button>
        ))}
      </div>
      {selected && (
        <footer
          className="p-3 border-t text-xs"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          <strong>{selected.name}</strong>
          <p>
            {selected.code ?? "Sin código"} · versión {selected.version}
          </p>
          <p>
            {selected.active ? "Vigente" : "No vigente"} · {selected.source}
          </p>
        </footer>
      )}
    </section>
  );
}
