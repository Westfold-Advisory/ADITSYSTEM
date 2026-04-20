// src/components/FormularioNuevoLugar.tsx
import { useState, useRef } from "react";
import {
  Plus,
  CircleUser,
  MapPin,
  X,
  Upload,
  Link,
  FileText,
  Loader,
  Phone,
  Edit2,
} from "lucide-react";
import { G, MUNICIPIOS } from "./constants";
import type { Lugar } from "./types";

interface FormularioNuevoLugarProps {
  onAgregar: (lugar: Lugar) => void;
  onClose: () => void;
  /** Si se pasa lugarEditar, el formulario opera en modo EDICIÓN */
  lugarEditar?: Lugar;
  onEditar?: (lugar: Lugar) => void;
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
const sectionTitle: React.CSSProperties = {
  fontSize: 9,
  color: G.accent,
  letterSpacing: 2,
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// ─── Componente ───────────────────────────────────────────────────────────────
export function FormularioNuevoLugar({
  onAgregar,
  onClose,
  lugarEditar,
  onEditar,
}: FormularioNuevoLugarProps) {
  const esEdicion = !!lugarEditar;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: lugarEditar?.nombre ?? "",
    label: lugarEditar?.label ?? "",
    category: lugarEditar?.category ?? MUNICIPIOS[217],
    info: lugarEditar?.info ?? "",
    lat: lugarEditar ? String(lugarEditar.coords[1]) : "",
    lng: lugarEditar ? String(lugarEditar.coords[0]) : "",
    hours: lugarEditar?.hours ?? "",
    rating: lugarEditar ? String(lugarEditar.rating) : "Dato Necesario",
    cvUrl: lugarEditar?.cvUrl ?? "",
    celular: lugarEditar?.celular ?? "",
    imageUrl: lugarEditar?.image?.startsWith("http") ? lugarEditar.image : "",
    ubicLink: "",
  });

  const [imageBase64, setImageBase64] = useState(
    lugarEditar?.image?.startsWith("data:") ? lugarEditar.image : "",
  );
  const [imagePreview, setImagePreview] = useState(lugarEditar?.image ?? "");
  const [imageModo, setImageModo] = useState<"url" | "file">("url");
  const [extracting, setExtracting] = useState(false);
  const [extractOk, setExtractOk] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
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
    if (!form.nombre || !form.lat || !form.lng) {
      setError("// ERROR: NOMBRE, LAT Y LNG SON OBLIGATORIOS");
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError("// ERROR: COORDENADAS INVÁLIDAS");
      return;
    }
    const imageFinal =
      imageModo === "file" && imageBase64
        ? imageBase64
        : form.imageUrl ||
          lugarEditar?.image ||
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop";

    const payload: Lugar = {
      id: lugarEditar?.id ?? Date.now(),
      nombre: form.nombre,
      label: form.label || form.nombre.slice(0, 5).toUpperCase(),
      category: form.category,
      coords: [lng, lat],
      info: form.info,
      rating: form.rating || "Solicitar Dato",
      reviews: lugarEditar?.reviews ?? 0,
      hours: form.hours || "N/D",
      image: imageFinal,
      cvUrl: form.cvUrl || undefined,
      celular: form.celular || undefined,
    };

    if (esEdicion && onEditar) {
      onEditar(payload);
    } else {
      onAgregar(payload);
    }
    onClose();
  };

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
          width: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          background: G.bgPanel,
          border: `1px solid ${G.borderBright}`,
          fontFamily: "'Courier New', monospace",
          boxShadow: `0 0 40px rgba(0,212,255,0.15)`,
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
              background: `linear-gradient(90deg, transparent, ${G.accent}, transparent)`,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {esEdicion ? (
              <Edit2 size={13} color={G.warn} />
            ) : (
              <Plus size={13} color={G.accentGreen} />
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: esEdicion ? G.warn : G.accentGreen,
                letterSpacing: 2,
              }}>
              {esEdicion ? "EDITAR INFORMACION" : "REGISTRAR NUEVO INTEGRANTE"}
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
            gap: 14,
          }}>
          {/* Nombre + Label */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
            <div>
              <label style={labelStyle}>// NOMBRE </label>
              <input
                style={inputStyle}
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ingrese Nombre Completo"
              />
            </div>
            <div>
              <label style={labelStyle}>// EQUIPO // ENLACE</label>
              <input
                style={inputStyle}
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Equipo: MEXARM-01"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label style={labelStyle}>// SELECCIONA MUNICIPIO</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}>
              {/* Filtramos duplicados y mapeamos con una key única combinada */}
              {Array.from(new Set(MUNICIPIOS)).map((c, i) => (
                <option
                  key={`${c}-${i}`}
                  value={c}
                  style={{ background: G.bgCard }}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {/* Descripción */}
          <div>
            <label style={labelStyle}>// SECCIÓN</label>
            <input
              style={inputStyle}
              value={form.info}
              onChange={(e) => set("info", e.target.value)}
              placeholder="INGRESE SECCIÓN"
            />
          </div>

          {/* ── CELULAR / WHATSAPP ── */}
          <div style={{ border: `1px solid ${G.border}`, padding: 10 }}>
            <div style={sectionTitle}>
              <Phone size={10} color={G.accent} />
              // CELULAR / WHATSAPP
            </div>
            <label style={labelStyle}>
              // NÚMERO (con código de país, sin + ni espacios)
            </label>
            <input
              style={inputStyle}
              value={form.celular}
              onChange={(e) =>
                set("celular", e.target.value.replace(/\D/g, ""))
              }
              placeholder="Ej: 522212345678"
              type="tel"
            />
            {form.celular && (
              <div style={{ marginTop: 6, fontSize: 9, color: G.textDim }}>
                ENLACE:{" "}
                <a
                  href={`https://wa.me/${form.celular}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: G.accentGreen }}>
                  wa.me/{form.celular}
                </a>
              </div>
            )}
          </div>

          {/* ── UBICACIÓN ── */}
          <div style={{ border: `1px solid ${G.border}`, padding: 10 }}>
            <div style={sectionTitle}>// UBICACIÓN</div>
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

          {/* ── IMAGEN ── */}
          <div style={{ border: `1px solid ${G.border}`, padding: 10 }}>
            <div style={sectionTitle}>// IMAGEN</div>
            <div style={{ display: "flex", marginBottom: 10 }}>
              {(["url", "file"] as const).map((modo) => (
                <button
                  key={modo}
                  onClick={() => {
                    setImageModo(modo);
                    setImagePreview("");
                    setImageBase64("");
                    set("imageUrl", "");
                  }}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    background:
                      imageModo === modo ? G.accentDim : "transparent",
                    border: `1px solid ${imageModo === modo ? G.accent : G.border}`,
                    color: imageModo === modo ? G.accent : G.textDim,
                    cursor: "pointer",
                    fontSize: 9,
                    letterSpacing: 1.5,
                    fontFamily: "'Courier New', monospace",
                  }}>
                  {modo === "url" ? "URL EXTERNA" : "SUBIR ARCHIVO"}
                </button>
              ))}
            </div>
            {imageModo === "url" ? (
              <div>
                <label style={labelStyle}>// URL DE IMAGEN</label>
                <input
                  style={inputStyle}
                  value={form.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  onBlur={() => {
                    if (form.imageUrl) setImagePreview(form.imageUrl);
                  }}
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "transparent",
                    border: `1px dashed ${imageBase64 ? G.accentGreen : G.border}`,
                    color: imageBase64 ? G.accentGreen : G.textDim,
                    cursor: "pointer",
                    fontSize: 10,
                    letterSpacing: 1.5,
                    fontFamily: "'Courier New', monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}>
                  <Upload size={11} />
                  {imageBase64 ? "IMAGEN CARGADA ✓" : "SELECCIONAR IMAGEN"}
                </button>
              </div>
            )}
            {imagePreview && (
              <div style={{ marginTop: 8, position: "relative" }}>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 80,
                    objectFit: "cover",
                    border: `1px solid ${G.border}`,
                  }}
                  onError={() => setImagePreview("")}
                />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setImageBase64("");
                    set("imageUrl", "");
                  }}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: G.bg + "cc",
                    border: "none",
                    cursor: "pointer",
                    color: G.error,
                    padding: 2,
                  }}>
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          {/* ── CV ── */}
          <div style={{ border: `1px solid ${G.border}`, padding: 10 }}>
            <div style={sectionTitle}>
              <FileText size={10} color={G.accent} />
              // CV / CURRÍCULUM
            </div>
            <label style={labelStyle}>// URL DEL CV O PORTAFOLIO</label>
            <input
              style={inputStyle}
              value={form.cvUrl}
              onChange={(e) => set("cvUrl", e.target.value)}
              placeholder="https://drive.google.com/... o linkedin.com/in/..."
            />
            {form.cvUrl && (
              <div style={{ marginTop: 6, fontSize: 9, color: G.textDim }}>
                ENLACE:{" "}
                <a
                  href={form.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: G.accent }}>
                  {form.cvUrl.length > 48
                    ? form.cvUrl.slice(0, 48) + "…"
                    : form.cvUrl}
                </a>
              </div>
            )}
          </div>

          {/* Horario + Rating */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
            <div>
              <label style={labelStyle}>// PERFIL ACADEMICO</label>
              <input
                style={inputStyle}
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
                placeholder="INGENIERÍA"
              />
            </div>
            <div>
              <label style={labelStyle}>// DISTRITO</label>
              <input
                style={inputStyle}
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                placeholder="Distrito"
              />
            </div>
          </div>

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
                background: esEdicion ? "#2a1500" : G.accentDim,
                border: `1px solid ${esEdicion ? G.warn : G.accent}`,
                color: esEdicion ? G.warn : G.accent,
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: 1.5,
                fontFamily: "'Courier New', monospace",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}>
              {esEdicion ? (
                <>
                  <Edit2 size={11} /> GUARDAR CAMBIOS
                </>
              ) : (
                <>
                  <MapPin size={11} /> REGISTRAR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  );
}
