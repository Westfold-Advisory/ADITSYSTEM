// src/components/MapaVista.tsx
import {
  Star,
  Diamond,
  CircleUser,
  ExternalLink,
  FileText,
  Edit2,
  MessageCircle,
  Navigation,
} from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "@/components/ui/map";
import { G } from "./constants";
import { Capa } from "./Capa";
import { PanelCapas } from "./PanelCapas";
import type { Lugar } from "./types";

interface MapaVistaProps {
  lugares: Lugar[];
  seleccionado: number | null;
  onSeleccionar: (id: number) => void;
  visibleOaxaca: boolean;
  visiblePuebla: boolean;
  onToggleOaxaca: () => void;
  onTogglePuebla: () => void;
  panelAbierto: boolean;
  onCerrarPanel: () => void;
  onEditarLugar: (lugar: Lugar) => void;
}

const esquinas = [
  {
    top: 0,
    left: 0,
    borderTop: `2px solid ${G.accent}`,
    borderLeft: `2px solid ${G.accent}`,
  },
  {
    top: 0,
    right: 0,
    borderTop: `2px solid ${G.accent}`,
    borderRight: `2px solid ${G.accent}`,
  },
  {
    bottom: 0,
    left: 0,
    borderBottom: `2px solid ${G.accent}`,
    borderLeft: `2px solid ${G.accent}`,
  },
  {
    bottom: 0,
    right: 0,
    borderBottom: `2px solid ${G.accent}`,
    borderRight: `2px solid ${G.accent}`,
  },
];

export function MapaVista({
  lugares,
  seleccionado,
  onSeleccionar,
  visibleOaxaca,
  visiblePuebla,
  onToggleOaxaca,
  onTogglePuebla,
  panelAbierto,
  onCerrarPanel,
  onEditarLugar,
}: MapaVistaProps) {
  const activo = lugares.find((l) => l.id === seleccionado);
  const center = activo ? activo.coords : ([-98.5, 19.0] as [number, number]);
  const zoom = activo ? 12 : 7;

  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${G.border}`,
        overflow: "hidden",
        position: "relative",
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.8)`,
      }}>
      {esquinas.map((style, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            zIndex: 10,
            ...style,
          }}
        />
      ))}

      <Map center={center} zoom={zoom}>
        <MapControls />
        <Capa visibleOaxaca={visibleOaxaca} visiblePuebla={visiblePuebla} />

        {lugares.map((lugar) => (
          <MapMarker
            key={lugar.id}
            longitude={lugar.coords[0]}
            latitude={lugar.coords[1]}>
            <MarkerContent>
              {/*LIDERES EN EL MAPA  */}
              <div
                onClick={() => onSeleccionar(lugar.id)}
                style={{
                  width: 10,
                  height: 10,
                  border: `2px solid ${G.accent}`,
                  background:
                    seleccionado === lugar.id ? G.accent : G.accentDim,
                  cursor: "pointer",
                  transform: "rotate(45deg)",
                  boxShadow: `0 0 10px ${G.accent}88`,
                  transition: "all 0.2s",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <MarkerLabel position="bottom">
                <span
                  style={{
                    fontSize: 9,
                    color: G.accent,
                    letterSpacing: 2,
                    fontFamily: "'Courier New', monospace",
                    textShadow: `0 0 8px ${G.accent}`,
                  }}>
                  {lugar.label}
                </span>
              </MarkerLabel>
            </MarkerContent>

            <MarkerPopup className="p-0">
              <div
                style={{
                  width: 280,
                  background: G.bgCard,
                  border: `1px solid ${G.borderBright}`,
                  fontFamily: "'Courier New', monospace",
                }}>
                {/* Imagen + botón editar superpuesto */}
                <div
                  style={{
                    height: 200,
                    backgroundImage: `url(${lugar.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, transparent 50%, #0a1520 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      fontSize: 10,
                      color: G.accent,
                      letterSpacing: 2,
                      background: G.bgCard + "cc",
                      padding: "2px 6px",
                      border: `1px solid ${G.accent}44`,
                    }}>
                    {lugar.category}
                  </div>
                  {/* Botón EDITAR */}
                  <button
                    onClick={() => onEditarLugar(lugar)}
                    title="Editar objetivo"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: G.bgCard + "dd",
                      border: `1px solid ${G.warn}66`,
                      color: G.warn,
                      cursor: "pointer",
                      padding: "3px 7px",
                      fontSize: 9,
                      letterSpacing: 1,
                      fontFamily: "'Courier New', monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                    <Edit2 size={9} /> EDITAR
                  </button>
                </div>

                {/* Info */}
                <div
                  style={{
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: G.textBright,
                      margin: 0,
                    }}>
                    {lugar.nombre}
                  </p>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Diamond size={10} fill="#ffaa00" color="#ffaa00" />
                    <span style={{ fontSize: 12, color: G.textBright }}>
                      Distrito:
                      {lugar.rating}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Diamond size={10} fill="#ffaa00" color="#ffaa00" />
                    <span style={{ fontSize: 12, color: G.textBright }}>
                      Sección:
                      {lugar.info}
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CircleUser size={19} color={G.textDim} />
                    <span style={{ fontSize: 12, color: G.textDim }}>
                      Perfil:
                      {lugar.hours}
                    </span>
                  </div>

                  {/* CV */}
                  {lugar.cvUrl && (
                    <a
                      href={lugar.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 8px",
                        background: "#001a33",
                        border: `1px solid ${G.accent}55`,
                        color: G.accent,
                        fontSize: 9,
                        letterSpacing: 1,
                        textDecoration: "none",
                        marginTop: 2,
                      }}>
                      <FileText size={9} />
                      VER CV / PORTAFOLIO
                      <ExternalLink size={8} style={{ marginLeft: "auto" }} />
                    </a>
                  )}

                  {/* Botones acción */}
                  <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                    {/* NAVEGAR → WhatsApp si tiene celular, Google Maps si no */}
                    {lugar.celular ? (
                      <a
                        href={`https://wa.me/${lugar.celular}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          background: "#003a1a",
                          border: `1px solid #25D366`,
                          color: "#25D366",
                          fontSize: 9,
                          letterSpacing: 1,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          fontFamily: "'Courier New', monospace",
                        }}>
                        <MessageCircle size={9} /> WHATSAPP
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.coords[1]},${lugar.coords[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          background: G.accentDim,
                          border: `1px solid ${G.accent}`,
                          color: G.accent,
                          fontSize: 9,
                          letterSpacing: 1,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          fontFamily: "'Courier New', monospace",
                        }}>
                        <Navigation size={9} /> NAVEGAR
                      </a>
                    )}

                    {/* Si tiene celular también mostrar navegar */}
                    {lugar.celular && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.coords[1]},${lugar.coords[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Navegar"
                        style={{
                          padding: "6px 8px",
                          background: G.accentDim,
                          border: `1px solid ${G.accent}`,
                          color: G.accent,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                        }}>
                        <Navigation size={9} />
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lugar.coords[1]},${lugar.coords[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Ver en Google Maps"
                      style={{
                        padding: "6px 8px",
                        background: "transparent",
                        border: `1px solid ${G.border}`,
                        color: G.textDim,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                      }}>
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}

        {panelAbierto && (
          <PanelCapas
            visibleOaxaca={visibleOaxaca}
            visiblePuebla={visiblePuebla}
            onToggleOaxaca={onToggleOaxaca}
            onTogglePuebla={onTogglePuebla}
            onClose={onCerrarPanel}
          />
        )}
      </Map>
    </div>
  );
}
