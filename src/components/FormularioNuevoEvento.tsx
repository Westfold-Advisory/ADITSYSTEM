// src/components/FormularioNuevoEvento.tsx
import { useState } from "react";
import {
  CalendarPlus,
  X,
  Link,
  Loader,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { G } from "./ui/constants";
import type { Evento, EstadoEvento } from "./ui/types";
import { ESTADO_EVENTO_CONFIG } from "./ui/types";

interface FormularioNuevoEventoProps {
  onAgregar: (evento: Evento) => void;
  onClose: () => void;
  eventoEditar?: Evento;
  onEditar?: (evento: Evento) => void;
}

// ─── Extractor de coordenadas ─────────────────────────────────────────────────
function extraerCoordenadas(
  input: string,
): { lat: number; lng: number } | null {
  const text = input.trim();
  const directa = text.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (directa) {
    const lat = parseFloat(directa[1]);
    const lng = parseFloat(directa[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)
      return { lat, lng };
  }
  const gmaps =
    text.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
    text.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
    text.match(/ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
    text.match(/!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/);
  if (gmaps) return { lat: parseFloat(gmaps[1]), lng: parseFloat(gmaps[2]) };
  const waze = text.match(/[?&]ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
  if (waze) return { lat: parseFloat(waze[1]), lng: parseFloat(waze[2]) };
  return null;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: G.bg,
  border: `1px solid ${G.border}`,
  color: G.text,
  padding: "7px 10px",
  fontSize: 11,
  fontFamily: "'Courier New', monospace",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 9,
  color: G.textDim,
  letterSpacing: 2,
  display: "block",
  marginBottom: 4,
};

// ─── Selector de estado ───────────────────────────────────────────────────────
function SelectorEstado({
  value,
  onChange,
}: {
  value: EstadoEvento;
  onChange: (v: EstadoEvento) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = ESTADO_EVENTO_CONFIG[value];

  return (
    <div style={{ position: "relative" }}>
      <label style={labelStyle}>// ESTADO</label>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: G.bg,
          border: `1px solid ${cfg.color}55`,
          color: cfg.color,
          padding: "7px 10px",
          fontSize: 11,
          fontFamily: "'Courier New', monospace",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: open ? cfg.glow : "none",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: cfg.color,
              boxShadow: cfg.glow,
              animation: value === "ACTIVO" ? "pulse 2s infinite" : "none",
            }}
          />
          <span style={{ letterSpacing: 2 }}>{cfg.label}</span>
        </div>
        <ChevronDown
          size={11}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: G.bgPanel,
            border: `1px solid ${G.borderBright}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}>
          {(
            Object.entries(ESTADO_EVENTO_CONFIG) as [
              EstadoEvento,
              (typeof ESTADO_EVENTO_CONFIG)[EstadoEvento],
            ][]
          ).map(([estado, c]) => (
            <button
              key={estado}
              onClick={() => {
                onChange(estado);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: value === estado ? c.color + "15" : "transparent",
                border: "none",
                borderBottom: `1px solid ${G.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Courier New', monospace",
              }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: c.color,
                  boxShadow: c.glow,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, color: c.color, letterSpacing: 2 }}>
                {c.label}
              </span>
              {value === estado && (
                <span
                  style={{ marginLeft: "auto", fontSize: 9, color: c.color }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function FormularioNuevoEvento({
  onAgregar,
  onClose,
  eventoEditar,
  onEditar,
}: FormularioNuevoEventoProps) {
  const esEdicion = !!eventoEditar;
  const now = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    nombre: eventoEditar?.nombre ?? "",
    descripcion: eventoEditar?.descripcion ?? "",
    notas: eventoEditar?.notas ?? "",
    fechaInicio: eventoEditar?.fechaInicio ?? now,
    fechaFin: eventoEditar?.fechaFin ?? "",
    estado: (eventoEditar?.estado ?? "ACTIVO") as EstadoEvento,
    lat: eventoEditar?.coords ? String(eventoEditar.coords[1]) : "",
    lng: eventoEditar?.coords ? String(eventoEditar.coords[0]) : "",
    ubicLink: "",
  });

  const [extracting, setExtracting] = useState(false);
  const [extractOk, setExtractOk] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };

  const handleExtraerCoords = () => {
    if (!form.ubicLink.trim()) return;
    setExtracting(true);
    setExtractOk(false);
    setTimeout(() => {
      const coords = extraerCoordenadas(form.ubicLink);
      setExtracting(false);
      if (coords) {
        setForm((f) => ({
          ...f,
          lat: String(coords.lat),
          lng: String(coords.lng),
        }));
        setExtractOk(true);
        setError("");
      } else {
        setError("// ERROR: NO SE PUDIERON EXTRAER COORDENADAS DEL LINK");
      }
    }, 400);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim()) {
      setError("// ERROR: NOMBRE ES OBLIGATORIO");
      return;
    }
    if (!form.lat || !form.lng) {
      setError("// ERROR: COORDENADAS SON OBLIGATORIAS");
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError("// ERROR: COORDENADAS INVÁLIDAS");
      return;
    }

    const payload: Evento = {
      id: eventoEditar?.id ?? Date.now(),
      nombre: form.nombre,
      descripcion: form.descripcion,
      estado: form.estado,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin || undefined,
      notas: form.notas || undefined,
      coords: [lng, lat],
    };

    if (esEdicion && onEditar) {
      onEditar(payload);
    } else {
      onAgregar(payload);
    }
    onClose();
  };

  const cfg = ESTADO_EVENTO_CONFIG[form.estado];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}>
      <div
        style={{
          width: 550,
          maxHeight: "90vh",
          overflowY: "auto",
          background: G.bgPanel,
          border: `1px solid ${cfg.color}55`,
          fontFamily: "'Courier New', monospace",
          boxShadow: `0 0 40px ${cfg.color}18`,
        }}>
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${G.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: G.bgPanel,
            zIndex: 2,
          }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarPlus size={13} color={cfg.color} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: cfg.color,
                letterSpacing: 2,
              }}>
              {esEdicion ? "EDITAR EVENTO" : "NUEVO EVENTO"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: G.textDim,
            }}>
            <X size={14} />
          </button>
        </div>

        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
          {/* Nombre */}
          <div>
            <label style={labelStyle}>// NOMBRE *</label>
            <input
              style={inputStyle}
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Reunión de coordinación"
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>// DESCRIPCIÓN</label>
            <input
              style={inputStyle}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Breve descripción del evento"
            />
          </div>

          {/* Estado */}
          <SelectorEstado
            value={form.estado}
            onChange={(v) => setForm((f) => ({ ...f, estado: v }))}
          />

          {/* Indicador visual estado */}
          <div
            style={{
              padding: "7px 10px",
              border: `1px solid ${cfg.color}44`,
              background: cfg.color + "0d",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cfg.color,
                boxShadow: cfg.glow,
                flexShrink: 0,
                animation:
                  form.estado === "ACTIVO" ? "pulse 2s infinite" : "none",
              }}
            />
            <span style={{ fontSize: 9, color: cfg.color, letterSpacing: 2 }}>
              EVENTO {cfg.label}
            </span>
          </div>

          {/* Fechas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
            <div>
              <label style={labelStyle}>// FECHA INICIO *</label>
              <input
                style={inputStyle}
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) => set("fechaInicio", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>// FECHA FIN (opcional)</label>
              <input
                style={inputStyle}
                type="datetime-local"
                value={form.fechaFin}
                onChange={(e) => set("fechaFin", e.target.value)}
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label style={labelStyle}>// NOTAS</label>
            <input
              style={inputStyle}
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Información adicional..."
            />
          </div>

          {/* ── COORDENADAS ── */}
          <div style={{ border: `1px solid ${G.border}`, padding: 10 }}>
            <div
              style={{
                fontSize: 9,
                color: G.accent,
                letterSpacing: 2,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
              <MapPin size={10} color={G.accent} />
              // UBICACIÓN EN EL MAPA *
            </div>

            {/* Extractor link */}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>
                // PEGAR LINK (Google Maps / Waze / lat,lng)
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={form.ubicLink}
                  onChange={(e) => {
                    set("ubicLink", e.target.value);
                    setExtractOk(false);
                  }}
                  placeholder="https://maps.google.com/... o 19.04, -98.20"
                />
                <button
                  onClick={handleExtraerCoords}
                  disabled={extracting || !form.ubicLink.trim()}
                  style={{
                    padding: "0 12px",
                    background: extractOk ? "#003322" : G.accentDim,
                    border: `1px solid ${extractOk ? G.accentGreen : G.accent}`,
                    color: extractOk ? G.accentGreen : G.accent,
                    cursor:
                      extracting || !form.ubicLink.trim()
                        ? "not-allowed"
                        : "pointer",
                    fontSize: 10,
                    letterSpacing: 1,
                    fontFamily: "'Courier New', monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    whiteSpace: "nowrap",
                    opacity: extracting || !form.ubicLink.trim() ? 0.5 : 1,
                  }}>
                  {extracting ? (
                    <Loader
                      size={10}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Link size={10} />
                  )}
                  {extractOk ? "OK ✓" : "EXTRAER"}
                </button>
              </div>
            </div>

            {/* Lat / Lng */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}>
              <div>
                <label style={labelStyle}>// LATITUD *</label>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: extractOk ? G.accentGreen + "88" : G.border,
                  }}
                  value={form.lat}
                  onChange={(e) => set("lat", e.target.value)}
                  placeholder="Ej: 17.0732"
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <label style={labelStyle}>// LONGITUD *</label>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: extractOk ? G.accentGreen + "88" : G.border,
                  }}
                  value={form.lng}
                  onChange={(e) => set("lng", e.target.value)}
                  placeholder="Ej: -96.7266"
                  type="number"
                  step="any"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                fontSize: 10,
                color: G.error,
                letterSpacing: 1,
                padding: "6px 10px",
                border: `1px solid ${G.error}44`,
                background: G.error + "11",
              }}>
              {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "8px",
                background: "transparent",
                border: `1px solid ${G.border}`,
                color: G.textDim,
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: 1.5,
                fontFamily: "'Courier New', monospace",
              }}>
              CANCELAR
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 2,
                padding: "8px",
                background: cfg.color + "18",
                border: `1px solid ${cfg.color}`,
                color: cfg.color,
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: 1.5,
                fontFamily: "'Courier New', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}>
              <CalendarPlus size={11} />
              {esEdicion ? "GUARDAR EVENTO" : "REGISTRAR EVENTO"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input[type=datetime-local]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  );
}
