import { useState, useRef } from "react";
import {
  Plus,
  MapPin,
  X,
  Upload,
  Link,
  FileText,
  Loader,
  Phone,
  Edit2,
} from "lucide-react";
import { MUNICIPIOS, Dist_Loc } from "./constants";
import type { Lugar, Evento, EstadoEvento } from "./types";
import { cn } from "@/lib/utils";

interface FormularioNuevoLugarProps {
  onAgregar: (lugar: Lugar) => void;
  onClose: () => void;
  lugarEditar?: Lugar;
  onEditar?: (lugar: Lugar) => void;
}

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

/* ── Shared field style helpers ────────────────────────────────────────── */
const inputCls = cn(
  "w-full px-2.5 py-1.5 border rounded font-mono text-[11px] bg-transparent",
  "transition-colors focus-visible:outline focus-visible:outline-2",
);

const sectionCls = "border rounded p-3 flex flex-col gap-2.5";

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
    rating: lugarEditar?.rating ?? Dist_Loc[27],
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
  const [evento] = useState<Partial<Evento> | null>(
    lugarEditar?.evento ?? null,
  );

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
        setError("No se pudieron extraer coordenadas del enlace.");
      }
    }, 400);
  };

  const handleSubmit = () => {
    if (!form.nombre || !form.lat || !form.lng) {
      setError("Nombre, latitud y longitud son obligatorios.");
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError("Coordenadas inválidas.");
      return;
    }
    const imageFinal =
      imageModo === "file" && imageBase64
        ? imageBase64
        : form.imageUrl ||
          lugarEditar?.image ||
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop";
    const eventoFinal: Evento | undefined = evento
      ? {
          id: lugarEditar?.evento?.id ?? Date.now(),
          category: "Evento",
          nombre: evento.nombre ?? "",
          descripcion: evento.descripcion ?? "",
          estado: (evento.estado ?? "ACTIVO") as EstadoEvento,
          fechaInicio: evento.fechaInicio ?? new Date().toISOString(),
          fechaFin: evento.fechaFin || undefined,
          notas: evento.notas || undefined,
        }
      : undefined;
    const payload: Lugar = {
      id: lugarEditar?.id ?? Date.now(),
      nombre: form.nombre,
      label: form.label || form.nombre.slice(0, 5).toUpperCase(),
      category: form.category,
      coords: [lng, lat],
      info: form.info,
      rating: form.rating || Dist_Loc[0],
      reviews: lugarEditar?.reviews ?? 0,
      hours: form.hours || "N/D",
      image: imageFinal,
      cvUrl: form.cvUrl || undefined,
      celular: form.celular || undefined,
      evento: eventoFinal,
    };
    if (esEdicion && onEditar) onEditar(payload);
    else onAgregar(payload);
    onClose();
  };

  const accentColor = esEdicion ? "var(--cyber-orange)" : "var(--cyber-cyan)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.78)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[460px] max-h-[calc(100dvh-2rem)] flex flex-col rounded border overflow-hidden"
        style={{
          background: "var(--cyber-surface-1)",
          borderColor: "var(--cyber-border)",
          boxShadow: "var(--cyber-shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--cyber-border-subtle)" }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />
          <div className="flex items-center gap-2.5">
            {esEdicion ? (
              <Edit2
                size={13}
                aria-hidden="true"
                style={{ color: accentColor }}
              />
            ) : (
              <Plus
                size={13}
                aria-hidden="true"
                style={{ color: accentColor }}
              />
            )}
            <h2
              className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: accentColor }}
            >
              {esEdicion ? "Editar información" : "Registrar nuevo integrante"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="p-1 rounded hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
            style={{
              color: "var(--cyber-text-secondary)",
              outlineColor: "var(--cyber-cyan)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3.5 p-4">
            {/* Nombre + Label */}
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="// Nombre">
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Nombre completo"
                />
              </Field>
              <Field label="// Equipo / enlace">
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="MEXARM-01"
                />
              </Field>
            </div>

            {/* Municipio */}
            <Field label="// Municipio">
              <select
                className={inputCls}
                style={{ ...fieldStyle, cursor: "pointer" }}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {Array.from(new Set(MUNICIPIOS)).map((c, i) => (
                  <option
                    key={`${c}-${i}`}
                    value={c}
                    style={{ background: "var(--cyber-surface-2)" }}
                  >
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Sección */}
            <Field label="// Sección">
              <input
                className={inputCls}
                style={fieldStyle}
                value={form.info}
                onChange={(e) => set("info", e.target.value)}
                placeholder="Ingrese sección"
              />
            </Field>

            {/* Celular */}
            <div
              className={sectionCls}
              style={{ borderColor: "var(--cyber-border-subtle)" }}
            >
              <SectionTitle
                icon={<Phone size={10} aria-hidden="true" />}
                label="Celular / WhatsApp"
              />
              <Field label="// Número (código de país, sin + ni espacios)">
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.celular}
                  onChange={(e) =>
                    set("celular", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="522212345678"
                  type="tel"
                />
              </Field>
              {form.celular && (
                <p
                  className="font-mono text-[9px]"
                  style={{ color: "var(--cyber-text-secondary)" }}
                >
                  Enlace:{" "}
                  <a
                    href={`https://wa.me/${form.celular}`}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-visible:outline focus-visible:outline-2"
                    style={{
                      color: "var(--cyber-green)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    wa.me/{form.celular}
                  </a>
                </p>
              )}
            </div>

            {/* Ubicación */}
            <div
              className={sectionCls}
              style={{ borderColor: "var(--cyber-border-subtle)" }}
            >
              <SectionTitle label="// Ubicación" />
              <Field label="// Pegar enlace (Google Maps / Waze / lat,lng)">
                <div className="flex gap-1.5">
                  <input
                    className={cn(inputCls, "flex-1")}
                    style={fieldStyle}
                    value={form.ubicLink}
                    onChange={(e) => {
                      set("ubicLink", e.target.value);
                      setExtractOk(false);
                    }}
                    placeholder="https://maps.google.com/…  o  19.04, -98.20"
                  />
                  <button
                    type="button"
                    onClick={handleExtraerCoords}
                    disabled={extracting || !form.ubicLink.trim()}
                    className={cn(
                      "flex items-center gap-1 px-3 border font-mono text-[10px] tracking-wide rounded",
                      "transition-colors focus-visible:outline focus-visible:outline-2 disabled:opacity-50",
                    )}
                    style={{
                      background: extractOk
                        ? "oklch(0.07 0.02 155 / 0.5)"
                        : "var(--cyber-cyan-dim)",
                      borderColor: extractOk
                        ? "var(--cyber-green)"
                        : "var(--cyber-cyan)",
                      color: extractOk
                        ? "var(--cyber-green)"
                        : "var(--cyber-cyan)",
                      outlineColor: "var(--cyber-cyan)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {extracting ? (
                      <Loader
                        size={10}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Link size={10} aria-hidden="true" />
                    )}
                    {extractOk ? "OK ✓" : "Extraer"}
                  </button>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="// Latitud *">
                  <input
                    className={inputCls}
                    style={{
                      ...fieldStyle,
                      borderColor: extractOk
                        ? "var(--cyber-green)"
                        : "var(--cyber-border-subtle)",
                    }}
                    value={form.lat}
                    onChange={(e) => set("lat", e.target.value)}
                    placeholder="19.0427"
                    type="number"
                    step="any"
                  />
                </Field>
                <Field label="// Longitud *">
                  <input
                    className={inputCls}
                    style={{
                      ...fieldStyle,
                      borderColor: extractOk
                        ? "var(--cyber-green)"
                        : "var(--cyber-border-subtle)",
                    }}
                    value={form.lng}
                    onChange={(e) => set("lng", e.target.value)}
                    placeholder="-98.2035"
                    type="number"
                    step="any"
                  />
                </Field>
              </div>
            </div>

            {/* Imagen */}
            <div
              className={sectionCls}
              style={{ borderColor: "var(--cyber-border-subtle)" }}
            >
              <SectionTitle label="// Imagen" />
              <div className="flex gap-0">
                {(["url", "file"] as const).map((modo) => (
                  <button
                    key={modo}
                    type="button"
                    onClick={() => {
                      setImageModo(modo);
                      setImagePreview("");
                      setImageBase64("");
                      set("imageUrl", "");
                    }}
                    className={cn(
                      "flex-1 py-1.5 border font-mono text-[9px] tracking-wide uppercase",
                      "first:rounded-l last:rounded-r transition-colors focus-visible:outline focus-visible:outline-2",
                    )}
                    style={{
                      background:
                        imageModo === modo
                          ? "var(--cyber-cyan-dim)"
                          : "transparent",
                      borderColor:
                        imageModo === modo
                          ? "var(--cyber-cyan)"
                          : "var(--cyber-border-subtle)",
                      color:
                        imageModo === modo
                          ? "var(--cyber-cyan)"
                          : "var(--cyber-text-secondary)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    {modo === "url" ? "URL externa" : "Subir archivo"}
                  </button>
                ))}
              </div>

              {imageModo === "url" ? (
                <Field label="// URL de imagen">
                  <input
                    className={inputCls}
                    style={fieldStyle}
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    onBlur={() => {
                      if (form.imageUrl) setImagePreview(form.imageUrl);
                    }}
                    placeholder="https://…"
                  />
                </Field>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full py-2.5 border border-dashed rounded flex items-center justify-center gap-2",
                      "font-mono text-[10px] tracking-wide uppercase focus-visible:outline focus-visible:outline-2",
                    )}
                    style={{
                      borderColor: imageBase64
                        ? "var(--cyber-green)"
                        : "var(--cyber-border-subtle)",
                      color: imageBase64
                        ? "var(--cyber-green)"
                        : "var(--cyber-text-secondary)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <Upload size={11} aria-hidden="true" />
                    {imageBase64 ? "Imagen cargada ✓" : "Seleccionar imagen"}
                  </button>
                </>
              )}

              {imagePreview && (
                <div className="relative mt-1">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-20 object-cover rounded border"
                    style={{ borderColor: "var(--cyber-border-subtle)" }}
                    onError={() => setImagePreview("")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageBase64("");
                      set("imageUrl", "");
                    }}
                    aria-label="Quitar imagen"
                    className="absolute top-1 right-1 p-1 rounded focus-visible:outline focus-visible:outline-2"
                    style={{
                      background: "oklch(0.07 0.02 220 / 0.85)",
                      color: "var(--cyber-error)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* CV */}
            <div
              className={sectionCls}
              style={{ borderColor: "var(--cyber-border-subtle)" }}
            >
              <SectionTitle
                icon={<FileText size={10} aria-hidden="true" />}
                label="// CV / Currículum"
              />
              <Field label="// URL del CV o portafolio">
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.cvUrl}
                  onChange={(e) => set("cvUrl", e.target.value)}
                  placeholder="https://drive.google.com/…"
                />
              </Field>
              {form.cvUrl && (
                <p
                  className="font-mono text-[9px]"
                  style={{ color: "var(--cyber-text-secondary)" }}
                >
                  Enlace:{" "}
                  <a
                    href={form.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-visible:outline focus-visible:outline-2"
                    style={{
                      color: "var(--cyber-cyan)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    {form.cvUrl.length > 48
                      ? form.cvUrl.slice(0, 48) + "…"
                      : form.cvUrl}
                  </a>
                </p>
              )}
            </div>

            {/* Perfil + Distrito */}
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="// Perfil académico">
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.hours}
                  onChange={(e) => set("hours", e.target.value)}
                  placeholder="Ingeniería"
                />
              </Field>
              <Field label="// Distrito">
                <select
                  className={inputCls}
                  style={{ ...fieldStyle, cursor: "pointer" }}
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                >
                  {Array.from(new Set(Dist_Loc)).map((c, i) => (
                    <option
                      key={`${c}-${i}`}
                      value={c}
                      style={{ background: "var(--cyber-surface-2)" }}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Error */}
            {error && (
              <p
                className="font-mono text-[10px] px-3 py-2 border rounded"
                role="alert"
                style={{
                  color: "var(--cyber-error)",
                  borderColor: "var(--cyber-error)",
                  background: "oklch(0.60 0.23 20 / 0.08)",
                }}
              >
                {error}
              </p>
            )}

            {/* Footer actions */}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 py-2 border rounded font-mono text-[10px] tracking-[0.15em] uppercase",
                  "transition-colors focus-visible:outline focus-visible:outline-2",
                )}
                style={{
                  borderColor: "var(--cyber-border-subtle)",
                  color: "var(--cyber-text-secondary)",
                  outlineColor: "var(--cyber-cyan)",
                  transitionDuration: "var(--cyber-duration-fast)",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "flex-[2] py-2 border rounded font-mono text-[10px] tracking-[0.15em] uppercase",
                  "flex items-center justify-center gap-2",
                  "transition-colors focus-visible:outline focus-visible:outline-2",
                )}
                style={{
                  background: esEdicion
                    ? "oklch(0.08 0.04 50 / 0.5)"
                    : "var(--cyber-cyan-dim)",
                  borderColor: accentColor,
                  color: accentColor,
                  outlineColor: "var(--cyber-cyan)",
                  transitionDuration: "var(--cyber-duration-fast)",
                }}
              >
                {esEdicion ? (
                  <>
                    <Edit2 size={11} aria-hidden="true" /> Guardar cambios
                  </>
                ) : (
                  <>
                    <MapPin size={11} aria-hidden="true" /> Registrar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const fieldStyle: React.CSSProperties = {
  borderColor: "var(--cyber-border-subtle)",
  color: "var(--cyber-text)",
  outlineColor: "var(--cyber-cyan)",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-mono text-[9px] tracking-[0.15em] uppercase"
        style={{ color: "var(--cyber-text-secondary)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function SectionTitle({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span style={{ color: "var(--cyber-cyan)" }}>{icon}</span>}
      <span
        className="font-mono text-[9px] tracking-[0.15em] uppercase font-semibold"
        style={{ color: "var(--cyber-cyan)" }}
      >
        {label}
      </span>
    </div>
  );
}
