// src/components/Sidebar.tsx
import { useState, useMemo } from "react";
import { X, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";
import { G, LUGARES_INICIALES } from "./constants";
import type { Lugar } from "./types";

interface SidebarProps {
  lugares: Lugar[];
  seleccionado: number | null;
  onSeleccionar: (id: number) => void;
  onEliminar: (id: number) => void;
  onAbrirFormulario: () => void;
}

export function Sidebar({
  lugares,
  seleccionado,
  onSeleccionar,
  onEliminar,
  onAbrirFormulario,
}: SidebarProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("TODAS");
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set());

  // Categorías presentes en los lugares actuales
  const categoriasPresentes = useMemo(() => {
    const set = new Set(lugares.map((l) => l.category));
    return ["TODAS", ...Array.from(set)];
  }, [lugares]);

  // Filtrado
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

  // Agrupación por categoría
  const grupos = useMemo(() => {
    const map = new Map<string, Lugar[]>();
    lugaresFiltrados.forEach((l) => {
      if (!map.has(l.category)) map.set(l.category, []);
      map.get(l.category)!.push(l);
    });
    return map;
  }, [lugaresFiltrados]);

  const toggleColapso = (cat: string) =>
    setColapsadas((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const inicioIdxMap = useMemo(() => {
    const map = new Map<number, number>();
    let idx = 0;
    lugares.forEach((l) => {
      map.set(l.id, idx);
      idx++;
    });
    return map;
  }, [lugares]);

  return (
    <aside
      style={{
        width: 240,
        borderRight: `1px solid ${G.border}`,
        background: G.bgPanel,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}>
      {/* ── Cabecera fija ── */}
      <div style={{ borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
        {/* Título */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${G.border}`,
          }}>
          <span style={{ fontSize: 9, color: G.textDim, letterSpacing: 2 }}>
            // LIDERES
          </span>
          <span style={{ fontSize: 9, color: G.accent, letterSpacing: 1 }}>
            {lugaresFiltrados.length}/{lugares.length} REG.
          </span>
        </div>

        {/* Buscador */}
        <div
          style={{
            padding: "8px 10px",
            borderBottom: `1px solid ${G.border}`,
            position: "relative",
          }}>
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
            placeholder="BUSCAR LIDER ACTIVO..."
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
              }}>
              <X size={9} />
            </button>
          )}
        </div>

        {/* Filtro por categoría */}
        <div
          style={{
            padding: "6px 10px",
            overflowX: "auto",
            display: "flex",
            gap: 4,
            scrollbarWidth: "auto",
          }}>
          {categoriasPresentes.map((cat) => {
            const activa = categoriaFiltro === cat;
            const label = cat === "TODAS" ? "TODAS" : (cat ?? "SIN CATEGORÍA");
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
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista agrupada ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {grupos.size === 0 && (
          <div
            style={{
              padding: "20px 14px",
              textAlign: "center",
              fontSize: 10,
              color: G.textDim,
              letterSpacing: 1,
            }}>
            // SIN RESULTADOS
          </div>
        )}

        {Array.from(grupos.entries()).map(([categoria, items]) => {
          const colapsada = colapsadas.has(categoria);
          return (
            <div key={categoria}>
              {/* Header de grupo */}
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
                }}>
                <span
                  style={{
                    fontSize: 8.3,
                    color: G.accent,
                    letterSpacing: 2,
                    fontFamily: "'Courier New', monospace",
                  }}>
                  {categoria}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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

              {/* Items del grupo */}
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
                      }}>
                      <button
                        onClick={() => onSeleccionar(lugar.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 14px 10px 11px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}>
                          <span
                            style={{
                              fontSize: 9,
                              color: G.textDim,
                              letterSpacing: 1,
                            }}>
                            LIDER-{String(globalIdx + 1).padStart(2, "0")}
                          </span>
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: esSeleccionado
                                ? G.accentGreen
                                : G.textDim,
                              boxShadow: esSeleccionado
                                ? `0 0 6px ${G.accentGreen}`
                                : "none",
                              animation: "pulse 3s infinite",
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
                          }}>
                          {lugar.nombre}
                        </p>
                        <p
                          style={{ fontSize: 10, color: G.textDim, margin: 0 }}>
                          {lugar.info || lugar.label}
                        </p>
                      </button>

                      {esUsuario && (
                        <button
                          onClick={() => onEliminar(lugar.id)}
                          title="Eliminar objetivo"
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: G.error + "88",
                            padding: 2,
                          }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}

        {/* Botón agregar */}
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
            (e.currentTarget as HTMLButtonElement).style.color = G.accentGreen;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = G.border;
            (e.currentTarget as HTMLButtonElement).style.color = G.textDim;
          }}>
          <Plus size={11} /> AGREGAR PERSONA
        </button>
      </div>
    </aside>
  );
}
