import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  CalendarPlus,
  Edit2,
  Trash2,
  MapPin,
} from "lucide-react";
import { LUGARES_INICIALES } from "./constants";
import type { Lugar, Evento } from "./types";
import { ESTADO_EVENTO_CONFIG } from "./types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  lugares: Lugar[];
  eventos: Evento[];
  seleccionado: number | null;
  eventoSeleccionado: number | null;
  onSeleccionar: (id: number) => void;
  onSeleccionarEvento: (id: number) => void;
  onEliminar: (id: number) => void;
  onEliminarEvento: (id: number) => void;
  onAbrirFormulario: () => void;
  onAbrirFormularioEvento: () => void;
  onEditarEvento: (ev: Evento) => void;
}

type Tab = "OBJETIVOS" | "EVENTOS";

export function Sidebar({
  lugares,
  eventos,
  seleccionado,
  eventoSeleccionado,
  onSeleccionar,
  onSeleccionarEvento,
  onEliminar,
  onEliminarEvento,
  onAbrirFormulario,
  onAbrirFormularioEvento,
  onEditarEvento,
}: SidebarProps) {
  const [tab, setTab] = useState<Tab>("OBJETIVOS");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("TODAS");
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set());

  const categoriasPresentes = useMemo(() => {
    const set = new Set(lugares.map((l) => l.category ?? "SIN CATEGORÍA"));
    return ["TODAS", ...Array.from(set)];
  }, [lugares]);

  const lugaresFiltrados = useMemo(() => {
    return lugares.filter((l) => {
      const matchBusqueda =
        busqueda.trim() === "" ||
        l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.info.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.label.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria =
        categoriaFiltro === "TODAS" || l.category === categoriaFiltro;
      return matchBusqueda && matchCategoria;
    });
  }, [lugares, busqueda, categoriaFiltro]);

  const eventosFiltrados = useMemo(() => {
    if (busqueda.trim() === "") return eventos;
    return eventos.filter(
      (e) =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.descripcion?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [eventos, busqueda]);

  const grupos = useMemo(() => {
    const map = new Map<string, Lugar[]>();
    lugaresFiltrados.forEach((l) => {
      const cat = l.category ?? "SIN CATEGORÍA";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(l);
    });
    return map;
  }, [lugaresFiltrados]);

  const toggleColapso = (cat: string) =>
    setColapsadas((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const inicioIdxMap = useMemo(() => {
    const map = new Map<number, number>();
    lugares.forEach((l, idx) => map.set(l.id, idx));
    return map;
  }, [lugares]);

  return (
    <aside
      className="flex flex-col w-full h-full overflow-hidden"
      style={{
        background: "var(--cyber-surface-1)",
        borderRight: "1px solid var(--cyber-border-subtle)",
      }}
    >
      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 border-b"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
        role="tablist"
        aria-label="Secciones"
      >
        {(["OBJETIVOS", "EVENTOS"] as Tab[]).map((t) => {
          const activa = tab === t;
          const badge = t === "EVENTOS" ? eventos.length : null;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={activa}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5",
                "font-mono text-[9px] tracking-[0.18em] uppercase border-b-2",
                "transition-colors focus-visible:outline focus-visible:outline-2",
              )}
              style={{
                background: activa ? "var(--cyber-cyan-dim)" : "transparent",
                borderBottomColor: activa ? "var(--cyber-cyan)" : "transparent",
                color: activa
                  ? "var(--cyber-cyan)"
                  : "var(--cyber-text-secondary)",
                outlineColor: "var(--cyber-cyan)",
                transitionDuration: "var(--cyber-duration-fast)",
              }}
            >
              {t === "EVENTOS" && <CalendarPlus size={10} aria-hidden="true" />}
              {t}
              {badge !== null && badge > 0 && (
                <span
                  className="font-mono text-[8px] font-bold px-1 rounded-sm min-w-[14px] text-center"
                  style={{
                    background: "var(--cyber-cyan)",
                    color: "var(--cyber-bg)",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div
        className="relative px-2.5 py-2 shrink-0 border-b"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <Search
          size={10}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--cyber-text-secondary)" }}
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            tab === "OBJETIVOS" ? "Buscar objetivo…" : "Buscar evento…"
          }
          aria-label={tab === "OBJETIVOS" ? "Buscar objetivo" : "Buscar evento"}
          className="w-full pl-6 pr-7 py-1.5 font-mono text-[10px] rounded border bg-transparent focus-visible:outline focus-visible:outline-2"
          style={{
            borderColor: "var(--cyber-border-subtle)",
            color: "var(--cyber-text)",
            outlineColor: "var(--cyber-cyan)",
          }}
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded focus-visible:outline focus-visible:outline-2"
            style={{
              color: "var(--cyber-text-secondary)",
              outlineColor: "var(--cyber-cyan)",
            }}
          >
            <X size={9} />
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: OBJETIVOS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "OBJETIVOS" && (
        <>
          {/* Category filter chips */}
          <div
            className="flex gap-1.5 px-2.5 py-1.5 overflow-x-auto no-scrollbar shrink-0 border-b"
            style={{ borderColor: "var(--cyber-border-subtle)" }}
          >
            <span
              className="font-mono text-[9px] self-center whitespace-nowrap shrink-0"
              style={{ color: "var(--cyber-cyan)" }}
            >
              {lugaresFiltrados.length}/{lugares.length}
            </span>
            {categoriasPresentes.map((cat) => {
              const activa = categoriaFiltro === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaFiltro(cat)}
                  title={cat}
                  className={cn(
                    "shrink-0 px-2 py-0.5 rounded border font-mono text-[8px] tracking-wide uppercase",
                    "whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2",
                  )}
                  style={{
                    background: activa
                      ? "var(--cyber-cyan-dim)"
                      : "transparent",
                    borderColor: activa
                      ? "var(--cyber-cyan)"
                      : "var(--cyber-border-subtle)",
                    color: activa
                      ? "var(--cyber-cyan)"
                      : "var(--cyber-text-secondary)",
                    outlineColor: "var(--cyber-cyan)",
                    transitionDuration: "var(--cyber-duration-fast)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grouped list */}
          <div className="flex-1 overflow-y-auto">
            {grupos.size === 0 && (
              <p
                className="text-center font-mono text-[10px] py-8 px-3"
                style={{ color: "var(--cyber-text-secondary)" }}
              >
                // Sin resultados
              </p>
            )}

            {Array.from(grupos.entries()).map(([categoria, items]) => {
              const colapsada = colapsadas.has(categoria);
              return (
                <div key={categoria}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleColapso(categoria)}
                    aria-expanded={!colapsada}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 border-b",
                      "focus-visible:outline focus-visible:outline-2",
                    )}
                    style={{
                      background: "var(--cyber-bg)",
                      borderColor: "var(--cyber-border-subtle)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <span
                      className="font-mono text-[8px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--cyber-cyan)" }}
                    >
                      {categoria}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8px]"
                        style={{ color: "var(--cyber-text-secondary)" }}
                      >
                        {items.length}
                      </span>
                      {colapsada ? (
                        <ChevronRight
                          size={10}
                          style={{ color: "var(--cyber-text-secondary)" }}
                        />
                      ) : (
                        <ChevronDown
                          size={10}
                          style={{ color: "var(--cyber-text-secondary)" }}
                        />
                      )}
                    </div>
                  </button>

                  {!colapsada &&
                    items.map((lugar) => {
                      const globalIdx = inicioIdxMap.get(lugar.id) ?? 0;
                      const esSeleccionado = seleccionado === lugar.id;
                      const esUsuario = globalIdx >= LUGARES_INICIALES.length;
                      return (
                        <div
                          key={lugar.id}
                          className="relative border-b"
                          style={{
                            borderColor: "var(--cyber-border-subtle)",
                            borderLeft: `3px solid ${esSeleccionado ? "var(--cyber-cyan)" : "transparent"}`,
                            background: esSeleccionado
                              ? "var(--cyber-cyan-dim)"
                              : "transparent",
                            transitionProperty: "background, border-left-color",
                            transitionDuration: "var(--cyber-duration-fast)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onSeleccionar(lugar.id)}
                            className="w-full text-left px-3 py-2.5 focus-visible:outline focus-visible:outline-2"
                            style={{ outlineColor: "var(--cyber-cyan)" }}
                          >
                            <div className="flex justify-between items-start mb-0.5">
                              <span
                                className="font-mono text-[9px] tracking-wide"
                                style={{ color: "var(--cyber-text-secondary)" }}
                              >
                                OBJ-{String(globalIdx + 1).padStart(2, "0")}
                              </span>
                              <span
                                className="size-1.5 rounded-full"
                                style={{
                                  background: esSeleccionado
                                    ? "var(--cyber-green)"
                                    : "var(--cyber-text-secondary)",
                                  boxShadow: esSeleccionado
                                    ? "var(--cyber-glow-green)"
                                    : "none",
                                }}
                              />
                            </div>
                            <p
                              className="text-[12px] font-bold tracking-[0.03em] mb-0.5"
                              style={{
                                color: esSeleccionado
                                  ? "var(--cyber-text-bright)"
                                  : "var(--cyber-text)",
                              }}
                            >
                              {lugar.nombre}
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: "var(--cyber-text-secondary)" }}
                            >
                              {lugar.info || lugar.label}
                            </p>
                          </button>

                          {esUsuario && (
                            <button
                              type="button"
                              onClick={() => onEliminar(lugar.id)}
                              title="Eliminar objetivo"
                              aria-label={`Eliminar ${lugar.nombre}`}
                              className="absolute top-2 right-2 p-1 rounded focus-visible:outline focus-visible:outline-2"
                              style={{
                                color: "var(--cyber-error)",
                                outlineColor: "var(--cyber-cyan)",
                              }}
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              );
            })}

            {/* Add button */}
            <button
              type="button"
              onClick={onAbrirFormulario}
              className={cn(
                "w-[calc(100%-20px)] mx-2.5 my-2.5 py-2 flex items-center justify-center gap-1.5",
                "font-mono text-[10px] tracking-[0.15em] uppercase rounded border border-dashed",
                "transition-colors focus-visible:outline focus-visible:outline-2",
                "hover:border-[var(--cyber-green)] hover:text-[var(--cyber-green)]",
              )}
              style={{
                borderColor: "var(--cyber-border-subtle)",
                color: "var(--cyber-text-secondary)",
                outlineColor: "var(--cyber-cyan)",
                transitionDuration: "var(--cyber-duration-fast)",
              }}
            >
              <Plus size={11} aria-hidden="true" />
              Agregar objetivo
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: EVENTOS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === "EVENTOS" && (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {eventosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 gap-2">
              <CalendarPlus
                size={24}
                aria-hidden="true"
                style={{ color: "var(--cyber-text-secondary)" }}
              />
              <p
                className="font-mono text-[10px] tracking-wide text-center"
                style={{ color: "var(--cyber-text-secondary)" }}
              >
                {busqueda ? "// Sin resultados" : "// Sin eventos registrados"}
              </p>
            </div>
          )}

          {eventosFiltrados.map((ev, idx) => {
            const cfg = ESTADO_EVENTO_CONFIG[ev.estado];
            const esSeleccionado = eventoSeleccionado === ev.id;

            return (
              <div
                key={ev.id}
                className="relative border-b"
                style={{
                  borderColor: "var(--cyber-border-subtle)",
                  borderLeft: `3px solid ${esSeleccionado ? cfg.color : "transparent"}`,
                  background: esSeleccionado ? cfg.color + "0d" : "transparent",
                  transitionProperty: "background, border-left-color",
                  transitionDuration: "var(--cyber-duration-fast)",
                }}
              >
                <button
                  type="button"
                  onClick={() => onSeleccionarEvento(ev.id)}
                  className="w-full text-left px-3 pr-9 py-2.5 focus-visible:outline focus-visible:outline-2"
                  style={{ outlineColor: "var(--cyber-cyan)" }}
                >
                  {/* Header row */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="font-mono text-[9px] tracking-wide"
                      style={{ color: "var(--cyber-text-secondary)" }}
                    >
                      EVT-{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-wide flex items-center gap-1 border px-1.5 py-0.5"
                      style={{
                        color: cfg.color,
                        borderColor: cfg.color + "55",
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          background: cfg.color,
                          boxShadow: ev.estado === "ACTIVO" ? cfg.glow : "none",
                        }}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  <p
                    className="text-[12px] font-bold tracking-[0.03em] mb-0.5"
                    style={{
                      color: esSeleccionado
                        ? "var(--cyber-text-bright)"
                        : "var(--cyber-text)",
                    }}
                  >
                    {ev.nombre}
                  </p>

                  {ev.descripcion && (
                    <p
                      className="text-[10px] mb-1"
                      style={{ color: "var(--cyber-text-secondary)" }}
                    >
                      {ev.descripcion.length > 40
                        ? ev.descripcion.slice(0, 40) + "…"
                        : ev.descripcion}
                    </p>
                  )}

                  <p
                    className="font-mono text-[9px]"
                    style={{ color: "var(--cyber-text-secondary)" }}
                  >
                    {new Date(ev.fechaInicio).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {ev.fechaFin && (
                      <span>
                        {" → "}
                        {new Date(ev.fechaFin).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                  </p>

                  {ev.coords && (
                    <div
                      className="mt-1 flex items-center gap-1 font-mono text-[8px]"
                      style={{ color: cfg.color + "99" }}
                    >
                      <MapPin size={8} aria-hidden="true" />
                      {ev.coords[1].toFixed(4)}° N{" "}
                      {Math.abs(ev.coords[0]).toFixed(4)}° W
                    </div>
                  )}

                  {ev.notas && (
                    <p
                      className="mt-1 text-[9px] px-1.5 py-1 border rounded"
                      style={{
                        color: "var(--cyber-text-secondary)",
                        background: "var(--cyber-bg)",
                        borderColor: "var(--cyber-border-subtle)",
                      }}
                    >
                      {ev.notas.length > 50
                        ? ev.notas.slice(0, 50) + "…"
                        : ev.notas}
                    </p>
                  )}
                </button>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditarEvento(ev);
                    }}
                    title="Editar evento"
                    aria-label={`Editar ${ev.nombre}`}
                    className="p-1 rounded focus-visible:outline focus-visible:outline-2"
                    style={{
                      color: cfg.color + "88",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <Edit2 size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarEvento(ev.id);
                    }}
                    title="Eliminar evento"
                    aria-label={`Eliminar ${ev.nombre}`}
                    className="p-1 rounded focus-visible:outline focus-visible:outline-2"
                    style={{
                      color: "var(--cyber-error)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add event button */}
          <button
            type="button"
            onClick={onAbrirFormularioEvento}
            className={cn(
              "w-[calc(100%-20px)] mx-2.5 my-2.5 py-2 flex items-center justify-center gap-1.5",
              "font-mono text-[10px] tracking-[0.15em] uppercase rounded border border-dashed",
              "transition-colors focus-visible:outline focus-visible:outline-2",
              "hover:border-[var(--cyber-violet)] hover:text-[var(--cyber-violet)]",
              "mt-auto",
            )}
            style={{
              borderColor: "var(--cyber-border-subtle)",
              color: "var(--cyber-text-secondary)",
              outlineColor: "var(--cyber-cyan)",
              transitionDuration: "var(--cyber-duration-fast)",
            }}
          >
            <CalendarPlus size={11} aria-hidden="true" />
            Agregar evento
          </button>
        </div>
      )}
    </aside>
  );
}
