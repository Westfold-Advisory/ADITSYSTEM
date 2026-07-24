// src/components/Sidebar.tsx
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
import { G, LUGARES_INICIALES } from "./constants";
import type { Lugar, Evento } from "./types";
import { ESTADO_EVENTO_CONFIG } from "./types";

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

// ─── Tab activa ───────────────────────────────────────────────────────────────
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

  // ── Categorías ──
  const categoriasPresentes = useMemo(() => {
    const set = new Set(lugares.map((l) => l.category ?? "SIN CATEGORÍA"));
    return ["TODAS", ...Array.from(set)];
  }, [lugares]);

  // ── Filtrado de lugares ──
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

  // ── Filtrado de eventos ──
  const eventosFiltrados = useMemo(() => {
    if (busqueda.trim() === "") return eventos;
    return eventos.filter(
      (e) =>
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.descripcion?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [eventos, busqueda]);

  // ── Agrupación lugares ──
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
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });

  const inicioIdxMap = useMemo(() => {
    const map = new Map<number, number>();
    lugares.forEach((l, idx) => map.set(l.id, idx));
    return map;
  }, [lugares]);

  return (
    <aside
      style={{
        width: 250,
        borderRight: `1px solid ${G.border}`,
        background: G.bgPanel,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Tabs OBJETIVOS / EVENTOS ── */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${G.border}`,
          flexShrink: 0,
        }}
      >
        {(["OBJETIVOS", "EVENTOS"] as Tab[]).map((t) => {
          const activa = tab === t;
          const badge = t === "EVENTOS" ? eventos.length : null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "10px 0",
                background: activa ? G.accentDim + "44" : "transparent",
                border: "none",
                borderBottom: `2px solid ${activa ? G.accent : "transparent"}`,
                color: activa ? G.accent : G.textDim,
                cursor: "pointer",
                fontSize: 9,
                letterSpacing: 2,
                fontFamily: "'Courier New', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              {t === "EVENTOS" ? <CalendarPlus size={10} /> : null}
              {t}
              {badge !== null && badge > 0 && (
                <span
                  style={{
                    background: G.accent,
                    color: G.bg,
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "0 4px",
                    borderRadius: 2,
                    minWidth: 14,
                    textAlign: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Buscador (compartido) ── */}
      <div
        style={{
          padding: "8px 10px",
          borderBottom: `1px solid ${G.border}`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Search
          size={10}
          color={G.textDim}
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            tab === "OBJETIVOS" ? "BUSCAR OBJETIVO..." : "BUSCAR EVENTO..."
          }
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: G.bg,
            border: `1px solid ${G.border}`,
            color: G.text,
            padding: "5px 8px 5px 24px",
            fontSize: 10,
            fontFamily: "'Courier New', monospace",
            outline: "none",
            letterSpacing: 0.5,
          }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: G.textDim,
              padding: 0,
            }}
          >
            <X size={9} />
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════
          TAB: OBJETIVOS
      ══════════════════════════════════════════ */}
      {tab === "OBJETIVOS" && (
        <>
          {/* Filtro categoría */}
          <div
            style={{
              padding: "6px 10px",
              overflowX: "auto",
              display: "flex",
              gap: 4,
              scrollbarWidth: "none",
              flexShrink: 0,
              borderBottom: `1px solid ${G.border}`,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: G.accent,
                letterSpacing: 1,
                alignSelf: "center",
                marginRight: 2,
                whiteSpace: "nowrap",
              }}
            >
              {lugaresFiltrados.length}/{lugares.length}
            </span>
            {categoriasPresentes.map((cat) => {
              const activa = categoriaFiltro === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  title={cat}
                  style={{
                    flexShrink: 0,
                    padding: "3px 7px",
                    background: activa ? G.accentDim : "transparent",
                    border: `1px solid ${activa ? G.accent : G.border}`,
                    color: activa ? G.accent : G.textDim,
                    cursor: "pointer",
                    fontSize: 8,
                    letterSpacing: 1,
                    fontFamily: "'Courier New', monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat === "TODAS" ? "TODAS" : cat}
                </button>
              );
            })}
          </div>

          {/* Lista agrupada */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {grupos.size === 0 && (
              <div
                style={{
                  padding: "20px 14px",
                  textAlign: "center",
                  fontSize: 10,
                  color: G.textDim,
                  letterSpacing: 1,
                }}
              >
                // SIN RESULTADOS
              </div>
            )}
            {Array.from(grupos.entries()).map(([categoria, items]) => {
              const colapsada = colapsadas.has(categoria);
              return (
                <div key={categoria}>
                  <button
                    onClick={() => toggleColapso(categoria)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 14px",
                      background: G.bg + "88",
                      border: "none",
                      borderBottom: `1px solid ${G.border}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        color: G.accent,
                        letterSpacing: 2,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {categoria}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ fontSize: 8, color: G.textDim }}>
                        {items.length}
                      </span>
                      {colapsada ? (
                        <ChevronRight size={10} color={G.textDim} />
                      ) : (
                        <ChevronDown size={10} color={G.textDim} />
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
                          style={{
                            borderBottom: `1px solid ${G.border}`,
                            borderLeft: `3px solid ${esSeleccionado ? G.accent : "transparent"}`,
                            background: esSeleccionado
                              ? G.accentDim + "55"
                              : "transparent",
                            transition: "all 0.15s",
                            position: "relative",
                          }}
                        >
                          <button
                            onClick={() => onSeleccionar(lugar.id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 14px 10px 11px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 9,
                                  color: G.textDim,
                                  letterSpacing: 1,
                                }}
                              >
                                OBJ-{String(globalIdx + 1).padStart(2, "0")}
                              </span>
                              <div
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: esSeleccionado
                                    ? G.accentGreen
                                    : G.textDim,
                                  boxShadow: esSeleccionado
                                    ? `0 0 6px ${G.accentGreen}`
                                    : "none",
                                }}
                              />
                            </div>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: esSeleccionado ? G.textBright : G.text,
                                margin: "3px 0 2px",
                                letterSpacing: 0.5,
                              }}
                            >
                              {lugar.nombre}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: G.textDim,
                                margin: 0,
                              }}
                            >
                              {lugar.info || lugar.label}
                            </p>
                          </button>
                          {esUsuario && (
                            <button
                              onClick={() => onEliminar(lugar.id)}
                              title="Eliminar"
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: G.error + "88",
                                padding: 2,
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
            <button
              onClick={onAbrirFormulario}
              style={{
                margin: 10,
                padding: "8px",
                background: "transparent",
                border: `1px dashed ${G.border}`,
                color: G.textDim,
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: 1.5,
                fontFamily: "'Courier New', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s",
                width: "calc(100% - 20px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  G.accentGreen;
                (e.currentTarget as HTMLButtonElement).style.color =
                  G.accentGreen;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  G.border;
                (e.currentTarget as HTMLButtonElement).style.color = G.textDim;
              }}
            >
              <Plus size={11} /> AGREGAR OBJETIVO
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          TAB: EVENTOS
      ══════════════════════════════════════════ */}
      {tab === "EVENTOS" && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sin eventos */}
          {eventosFiltrados.length === 0 && (
            <div style={{ padding: "24px 14px", textAlign: "center" }}>
              <CalendarPlus
                size={24}
                color={G.textDim}
                style={{ margin: "0 auto 8px", display: "block" }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: G.textDim,
                  letterSpacing: 1,
                  margin: 0,
                }}
              >
                {busqueda ? "// SIN RESULTADOS" : "// SIN EVENTOS REGISTRADOS"}
              </p>
            </div>
          )}

          {/* Lista de eventos */}
          {eventosFiltrados.map((ev, idx) => {
            const cfg = ESTADO_EVENTO_CONFIG[ev.estado];
            const esSeleccionado = eventoSeleccionado === ev.id;

            return (
              <div
                key={ev.id}
                style={{
                  borderBottom: `1px solid ${G.border}`,
                  borderLeft: `3px solid ${esSeleccionado ? cfg.color : "transparent"}`,
                  background: esSeleccionado ? cfg.color + "0d" : "transparent",
                  transition: "all 0.15s",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => onSeleccionarEvento(ev.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 36px 10px 11px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {/* Fila superior: índice + badge estado */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        color: G.textDim,
                        letterSpacing: 1,
                      }}
                    >
                      EVT-{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontSize: 8,
                        letterSpacing: 1,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}55`,
                        padding: "1px 5px",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: cfg.color,
                          display: "inline-block",
                          boxShadow: ev.estado === "ACTIVO" ? cfg.glow : "none",
                        }}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Nombre */}
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: esSeleccionado ? G.textBright : G.text,
                      margin: "0 0 2px",
                      letterSpacing: 0.5,
                    }}
                  >
                    {ev.nombre}
                  </p>

                  {/* Descripción */}
                  {ev.descripcion && (
                    <p
                      style={{
                        fontSize: 10,
                        color: G.textDim,
                        margin: "0 0 4px",
                      }}
                    >
                      {ev.descripcion.length > 40
                        ? ev.descripcion.slice(0, 40) + "…"
                        : ev.descripcion}
                    </p>
                  )}

                  {/* Fecha inicio */}
                  <div
                    style={{
                      fontSize: 9,
                      color: G.textDim,
                      letterSpacing: 0.5,
                    }}
                  >
                    {new Date(ev.fechaInicio).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {ev.fechaFin && (
                      <span>
                        {" "}
                        →{" "}
                        {new Date(ev.fechaFin).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Coords */}
                  {ev.coords && (
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 8,
                        color: cfg.color + "99",
                      }}
                    >
                      <MapPin size={8} />
                      {ev.coords[1].toFixed(4)}°N{" "}
                      {Math.abs(ev.coords[0]).toFixed(4)}°W
                    </div>
                  )}

                  {/* Notas */}
                  {ev.notas && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 9,
                        color: G.textDim,
                        padding: "3px 6px",
                        background: G.bg,
                        border: `1px solid ${G.border}`,
                      }}
                    >
                      {ev.notas.length > 50
                        ? ev.notas.slice(0, 50) + "…"
                        : ev.notas}
                    </div>
                  )}
                </button>

                {/* Acciones: editar + eliminar */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditarEvento(ev);
                    }}
                    title="Editar evento"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: cfg.color + "88",
                      padding: 2,
                    }}
                  >
                    <Edit2 size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarEvento(ev.id);
                    }}
                    title="Eliminar evento"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: G.error + "88",
                      padding: 2,
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Botón agregar evento */}
          <button
            onClick={onAbrirFormularioEvento}
            style={{
              margin: 10,
              padding: "8px",
              background: "transparent",
              border: `1px dashed ${G.border}`,
              color: G.textDim,
              cursor: "pointer",
              fontSize: 10,
              letterSpacing: 1.5,
              fontFamily: "'Courier New', monospace",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s",
              width: "calc(100% - 20px)",
              marginTop: "auto",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#a855f7";
              (e.currentTarget as HTMLButtonElement).style.color = "#a855f7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                G.border;
              (e.currentTarget as HTMLButtonElement).style.color = G.textDim;
            }}
          >
            <CalendarPlus size={11} /> AGREGAR EVENTO
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </aside>
  );
}
