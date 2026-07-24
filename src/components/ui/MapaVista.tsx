// src/components/MapaVista.tsx
import {
  Star,
  Clock,
  ExternalLink,
  FileText,
  Edit2,
  MessageCircle,
  Navigation,
  Trash2,
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
import type { Lugar, Evento } from "./types";
import { ESTADO_EVENTO_CONFIG } from "./types";

interface MapaVistaProps {
  lugares: Lugar[];
  eventos: Evento[];
  seleccionado: number | null;
  eventoSeleccionado: number | null;
  onSeleccionar: (id: number) => void;

  visibleDistritoLocal01: boolean;
  visibleDistritoLocal02: boolean;
  visibleDistritoLocal05: boolean;
  visibleDistritoLocal06: boolean;
  visibleDistritoLocal07: boolean;
  visibleDistritoLocal08: boolean;
  visibleDistritoLocal09: boolean;
  visibleDistritoLocal10: boolean;
  visibleDistritoLocal11: boolean;
  visibleDistritoLocal12: boolean;
  visibleDistritoLocal13: boolean;
  visibleDistritoLocal14: boolean;
  visibleDistritoLocal15: boolean;
  visibleDistritoLocal16: boolean;
  visibleDistritoLocal17: boolean;
  visibleDistritoLocal18: boolean;
  visibleDistritoLocal19: boolean;
  visibleDistritoLocal20: boolean;
  visibleDistritoLocal21: boolean;
  visibleDistritoLocal22: boolean;
  visibleDistritoLocal23: boolean;
  visibleDistritoLocal24: boolean;
  visibleDistritoLocal25: boolean;
  visibleDistritoLocal26: boolean;

  visibleOaxaca: boolean;
  visiblePuebla: boolean;

  onToggleDistritoLocal01: () => void;
  onToggleDistritoLocal02: () => void;
  onToggleDistritoLocal05: () => void;
  onToggleDistritoLocal06: () => void;
  onToggleDistritoLocal07: () => void;
  onToggleDistritoLocal08: () => void;
  onToggleDistritoLocal09: () => void;
  onToggleDistritoLocal10: () => void;
  onToggleDistritoLocal11: () => void;
  onToggleDistritoLocal12: () => void;
  onToggleDistritoLocal13: () => void;
  onToggleDistritoLocal14: () => void;
  onToggleDistritoLocal15: () => void;
  onToggleDistritoLocal16: () => void;
  onToggleDistritoLocal17: () => void;
  onToggleDistritoLocal18: () => void;
  onToggleDistritoLocal19: () => void;
  onToggleDistritoLocal20: () => void;
  onToggleDistritoLocal21: () => void;
  onToggleDistritoLocal22: () => void;
  onToggleDistritoLocal23: () => void;
  onToggleDistritoLocal24: () => void;
  onToggleDistritoLocal25: () => void;
  onToggleDistritoLocal26: () => void;

  onToggleOaxaca: () => void;
  onTogglePuebla: () => void;
  panelAbierto: boolean;
  onCerrarPanel: () => void;
  onEditarLugar: (lugar: Lugar) => void;
  onEditarEvento: (evento: Evento) => void;
  onEliminarEvento: (id: number) => void;
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
  eventos,
  seleccionado,
  eventoSeleccionado,
  onSeleccionar,

  visibleDistritoLocal01,
  visibleDistritoLocal02,
  visibleDistritoLocal05,
  visibleDistritoLocal06,
  visibleDistritoLocal07,
  visibleDistritoLocal08,
  visibleDistritoLocal09,
  visibleDistritoLocal10,
  visibleDistritoLocal11,
  visibleDistritoLocal12,
  visibleDistritoLocal13,
  visibleDistritoLocal14,
  visibleDistritoLocal15,
  visibleDistritoLocal16,
  visibleDistritoLocal17,
  visibleDistritoLocal18,
  visibleDistritoLocal19,
  visibleDistritoLocal20,
  visibleDistritoLocal21,
  visibleDistritoLocal22,
  visibleDistritoLocal23,
  visibleDistritoLocal24,
  visibleDistritoLocal25,
  visibleDistritoLocal26,

  visibleOaxaca,
  visiblePuebla,
  onToggleOaxaca,
  onToggleDistritoLocal01,
  onToggleDistritoLocal02,
  onToggleDistritoLocal05,
  onToggleDistritoLocal06,
  onToggleDistritoLocal07,
  onToggleDistritoLocal08,
  onToggleDistritoLocal09,
  onToggleDistritoLocal10,
  onToggleDistritoLocal11,
  onToggleDistritoLocal12,
  onToggleDistritoLocal13,
  onToggleDistritoLocal14,
  onToggleDistritoLocal15,
  onToggleDistritoLocal16,
  onToggleDistritoLocal17,
  onToggleDistritoLocal18,
  onToggleDistritoLocal19,
  onToggleDistritoLocal20,
  onToggleDistritoLocal21,
  onToggleDistritoLocal22,
  onToggleDistritoLocal23,
  onToggleDistritoLocal24,
  onToggleDistritoLocal25,
  onToggleDistritoLocal26,
  onTogglePuebla,
  panelAbierto,
  onCerrarPanel,
  onEditarLugar,
  onEditarEvento,
  onEliminarEvento,
}: MapaVistaProps) {
  const activo = lugares.find((l) => l.id === seleccionado);
  const activoEvento = eventos.find((e) => e.id === eventoSeleccionado);

  const center: [number, number] = activoEvento?.coords ??
    activo?.coords ?? [-98.5, 19.0];
  const zoom = activoEvento?.coords || activo ? 13 : 7;

  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${G.border}`,
        overflow: "hidden",
        position: "relative",
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.8)`,
      }}
    >
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
        <Capa
          visibleOaxaca={visibleOaxaca}
          visiblePuebla={visiblePuebla}
          visibleDistritoLocal01={visibleDistritoLocal01}
          visibleDistritoLocal02={visibleDistritoLocal02}
          visibleDistritoLocal05={visibleDistritoLocal05}
          visibleDistritoLocal06={visibleDistritoLocal06}
          visibleDistritoLocal07={visibleDistritoLocal07}
          visibleDistritoLocal08={visibleDistritoLocal08}
          visibleDistritoLocal09={visibleDistritoLocal09}
          visibleDistritoLocal10={visibleDistritoLocal10}
          visibleDistritoLocal11={visibleDistritoLocal11}
          visibleDistritoLocal12={visibleDistritoLocal12}
          visibleDistritoLocal13={visibleDistritoLocal13}
          visibleDistritoLocal14={visibleDistritoLocal14}
          visibleDistritoLocal15={visibleDistritoLocal15}
          visibleDistritoLocal16={visibleDistritoLocal16}
          visibleDistritoLocal17={visibleDistritoLocal17}
          visibleDistritoLocal18={visibleDistritoLocal18}
          visibleDistritoLocal19={visibleDistritoLocal19}
          visibleDistritoLocal20={visibleDistritoLocal20}
          visibleDistritoLocal21={visibleDistritoLocal21}
          visibleDistritoLocal22={visibleDistritoLocal22}
          visibleDistritoLocal23={visibleDistritoLocal23}
          visibleDistritoLocal24={visibleDistritoLocal24}
          visibleDistritoLocal25={visibleDistritoLocal25}
          visibleDistritoLocal26={visibleDistritoLocal26}
        />

        {lugares.map((lugar) => (
          <MapMarker
            key={lugar.id}
            longitude={lugar.coords[0]}
            latitude={lugar.coords[1]}
          >
            <MarkerContent>
              <div
                onClick={() => onSeleccionar(lugar.id)}
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${G.accent}`,
                  background:
                    seleccionado === lugar.id ? G.accent : G.accentDim,
                  cursor: "pointer",
                  transform: "rotate(45deg)",
                  boxShadow: `0 0 10px ${G.accent}88`,
                  transition: "all 0.2s",
                }}
              />
              <MarkerLabel position="bottom">
                <span
                  style={{
                    fontSize: 9,
                    color: G.accent,
                    letterSpacing: 1,
                    fontFamily: "'Courier New', monospace",
                    textShadow: `0 0 8px ${G.accent}`,
                  }}
                >
                  {lugar.label}
                </span>
              </MarkerLabel>
            </MarkerContent>

            <MarkerPopup className="p-0">
              <div
                style={{
                  width: 265,
                  background: G.bgCard,
                  border: `1px solid ${G.borderBright}`,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {/* Imagen + botón editar superpuesto */}
                <div
                  style={{
                    height: 100,
                    backgroundImage: `url(${lugar.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
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
                      fontSize: 8,
                      color: G.accent,
                      letterSpacing: 2,
                      background: G.bgCard + "cc",
                      padding: "2px 6px",
                      border: `1px solid ${G.accent}44`,
                    }}
                  >
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
                    }}
                  >
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
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: G.textBright,
                      margin: 0,
                    }}
                  >
                    {lugar.nombre}
                  </p>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Star size={10} fill="#ffaa00" color="#ffaa00" />
                    <span style={{ fontSize: 10, color: G.textBright }}>
                      {lugar.rating}
                    </span>
                    <span style={{ fontSize: 10, color: G.textDim }}>
                      ({lugar.reviews.toLocaleString()})
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Clock size={10} color={G.textDim} />
                    <span style={{ fontSize: 10, color: G.textDim }}>
                      {lugar.hours}
                    </span>
                  </div>

                  {/* Evento vinculado */}
                  {lugar.evento &&
                    (() => {
                      const cfg = ESTADO_EVENTO_CONFIG[lugar.evento.estado];
                      return (
                        <div
                          style={{
                            padding: "6px 8px",
                            marginTop: 2,
                            background: cfg.color + "0d",
                            border: `1px solid ${cfg.color}44`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: cfg.color,
                                boxShadow: cfg.glow,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 9,
                                color: cfg.color,
                                letterSpacing: 1.5,
                                fontWeight: 700,
                              }}
                            >
                              {lugar.evento.nombre || "EVENTO"}
                            </span>
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: 8,
                                color: cfg.color,
                                letterSpacing: 1,
                                border: `1px solid ${cfg.color}55`,
                                padding: "1px 4px",
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          {lugar.evento.descripcion && (
                            <span
                              style={{
                                fontSize: 9,
                                color: G.textDim,
                                paddingLeft: 13,
                              }}
                            >
                              {lugar.evento.descripcion}
                            </span>
                          )}
                        </div>
                      );
                    })()}

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
                      }}
                    >
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
                        }}
                      >
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
                        }}
                      >
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
                        }}
                      >
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
                      }}
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}

        {/* ── Marcadores de eventos independientes ── */}
        {eventos
          .filter((ev) => ev.coords)
          .map((ev) => {
            const cfg = ESTADO_EVENTO_CONFIG[ev.estado];
            const [eLng, eLat] = ev.coords!;
            return (
              <MapMarker key={`ev-${ev.id}`} longitude={eLng} latitude={eLat}>
                <MarkerContent>
                  {/* Rombo con color del estado — más grande si está seleccionado */}
                  <div
                    style={{
                      width: eventoSeleccionado === ev.id ? 14 : 10,
                      height: eventoSeleccionado === ev.id ? 14 : 10,
                      border: `2px solid ${cfg.color}`,
                      background:
                        eventoSeleccionado === ev.id
                          ? cfg.color
                          : cfg.color + "55",
                      transform: "rotate(45deg)",
                      boxShadow:
                        eventoSeleccionado === ev.id
                          ? `0 0 16px ${cfg.color}`
                          : cfg.glow,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  />
                  <MarkerLabel position="bottom">
                    <span
                      style={{
                        fontSize: 8,
                        color: cfg.color,
                        letterSpacing: 1,
                        fontFamily: "'Courier New', monospace",
                        textShadow: cfg.glow,
                      }}
                    >
                      {ev.nombre?.slice(0, 10) || "EVT"}
                    </span>
                  </MarkerLabel>
                </MarkerContent>

                <MarkerPopup className="p-0">
                  <div
                    style={{
                      width: 240,
                      background: G.bgCard,
                      border: `1px solid ${cfg.color}55`,
                      fontFamily: "'Courier New', monospace",
                      boxShadow: `0 0 16px ${cfg.color}22`,
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: "8px 10px",
                        borderBottom: `1px solid ${cfg.color}33`,
                        background: cfg.color + "0d",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: cfg.color,
                          boxShadow: cfg.glow,
                          flexShrink: 0,
                          animation:
                            ev.estado === "ACTIVO"
                              ? "pulse 2s infinite"
                              : "none",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: cfg.color,
                          letterSpacing: 1,
                          flex: 1,
                        }}
                      >
                        {ev.nombre || "EVENTO"}
                      </span>
                      <span
                        style={{
                          fontSize: 8,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}55`,
                          padding: "1px 5px",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {ev.descripcion && (
                        <div style={{ fontSize: 9, color: G.text }}>
                          {ev.descripcion}
                        </div>
                      )}
                      <div style={{ fontSize: 9, color: G.textDim }}>
                        INICIO:{" "}
                        <span style={{ color: G.text }}>
                          {new Date(ev.fechaInicio).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {ev.fechaFin && (
                        <div style={{ fontSize: 9, color: G.textDim }}>
                          FIN:{" "}
                          <span style={{ color: G.text }}>
                            {new Date(ev.fechaFin).toLocaleString("es-MX", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      )}
                      {ev.notas && (
                        <div
                          style={{
                            fontSize: 9,
                            color: G.textDim,
                            padding: "4px 6px",
                            background: G.bg,
                            border: `1px solid ${G.border}`,
                          }}
                        >
                          {ev.notas}
                        </div>
                      )}
                      <div style={{ fontSize: 8, color: G.textDim }}>
                        {eLat.toFixed(4)}° N &nbsp; {Math.abs(eLng).toFixed(4)}°
                        W
                      </div>

                      {/* Acciones */}
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <button
                          onClick={() => onEditarEvento(ev)}
                          style={{
                            flex: 1,
                            padding: "5px 8px",
                            background: cfg.color + "18",
                            border: `1px solid ${cfg.color}55`,
                            color: cfg.color,
                            cursor: "pointer",
                            fontSize: 9,
                            letterSpacing: 1,
                            fontFamily: "'Courier New', monospace",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <Edit2 size={9} /> EDITAR
                        </button>
                        <button
                          onClick={() => onEliminarEvento(ev.id)}
                          style={{
                            padding: "5px 8px",
                            background: "transparent",
                            border: `1px solid ${G.error}55`,
                            color: G.error,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}

        {panelAbierto && (
          <PanelCapas
            visibleDistritoLocal01={visibleDistritoLocal01}
            visibleDistritoLocal02={visibleDistritoLocal02}
            visibleDistritoLocal05={visibleDistritoLocal05}
            visibleDistritoLocal06={visibleDistritoLocal06}
            visibleDistritoLocal07={visibleDistritoLocal07}
            visibleDistritoLocal08={visibleDistritoLocal08}
            visibleDistritoLocal09={visibleDistritoLocal09}
            visibleDistritoLocal10={visibleDistritoLocal10}
            visibleDistritoLocal11={visibleDistritoLocal11}
            visibleDistritoLocal12={visibleDistritoLocal12}
            visibleDistritoLocal13={visibleDistritoLocal13}
            visibleDistritoLocal14={visibleDistritoLocal14}
            visibleDistritoLocal15={visibleDistritoLocal15}
            visibleDistritoLocal16={visibleDistritoLocal16}
            visibleDistritoLocal17={visibleDistritoLocal17}
            visibleDistritoLocal18={visibleDistritoLocal18}
            visibleDistritoLocal19={visibleDistritoLocal19}
            visibleDistritoLocal20={visibleDistritoLocal20}
            visibleDistritoLocal21={visibleDistritoLocal21}
            visibleDistritoLocal22={visibleDistritoLocal22}
            visibleDistritoLocal23={visibleDistritoLocal23}
            visibleDistritoLocal24={visibleDistritoLocal24}
            visibleDistritoLocal25={visibleDistritoLocal25}
            visibleDistritoLocal26={visibleDistritoLocal26}
            visibleOaxaca={visibleOaxaca}
            visiblePuebla={visiblePuebla}
            onToggleDistritoLocal01={onToggleDistritoLocal01}
            onToggleDistritoLocal02={onToggleDistritoLocal02}
            onToggleDistritoLocal05={onToggleDistritoLocal05}
            onToggleDistritoLocal06={onToggleDistritoLocal06}
            onToggleDistritoLocal07={onToggleDistritoLocal07}
            onToggleDistritoLocal08={onToggleDistritoLocal08}
            onToggleDistritoLocal09={onToggleDistritoLocal09}
            onToggleDistritoLocal10={onToggleDistritoLocal10}
            onToggleDistritoLocal11={onToggleDistritoLocal11}
            onToggleDistritoLocal12={onToggleDistritoLocal12}
            onToggleDistritoLocal13={onToggleDistritoLocal13}
            onToggleDistritoLocal14={onToggleDistritoLocal14}
            onToggleDistritoLocal15={onToggleDistritoLocal15}
            onToggleDistritoLocal16={onToggleDistritoLocal16}
            onToggleDistritoLocal17={onToggleDistritoLocal17}
            onToggleDistritoLocal18={onToggleDistritoLocal18}
            onToggleDistritoLocal19={onToggleDistritoLocal19}
            onToggleDistritoLocal20={onToggleDistritoLocal20}
            onToggleDistritoLocal21={onToggleDistritoLocal21}
            onToggleDistritoLocal22={onToggleDistritoLocal22}
            onToggleDistritoLocal23={onToggleDistritoLocal23}
            onToggleDistritoLocal24={onToggleDistritoLocal24}
            onToggleDistritoLocal25={onToggleDistritoLocal25}
            onToggleDistritoLocal26={onToggleDistritoLocal26}
            onToggleOaxaca={onToggleOaxaca}
            onTogglePuebla={onTogglePuebla}
            onClose={onCerrarPanel}
          />
        )}
      </Map>
    </div>
  );
}
