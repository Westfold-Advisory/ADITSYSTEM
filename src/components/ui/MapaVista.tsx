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
  onTogglePuebla,
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

  /* Shared popup container style */
  const popupCardStyle: React.CSSProperties = {
    background: "var(--cyber-surface-2)",
    border: "1px solid var(--cyber-border)",
    fontFamily: "var(--font-mono, 'Courier New', monospace)",
  };

  return (
    <div
      className="relative flex-1 overflow-hidden border"
      style={{
        borderColor: "var(--cyber-border-subtle)",
        boxShadow: "inset 0 0 40px oklch(0 0 0 / 0.8)",
      }}
    >
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

        {/* ── Lugar markers ─────────────────────────────────────────── */}
        {lugares.map((lugar) => (
          <MapMarker
            key={lugar.id}
            longitude={lugar.coords[0]}
            latitude={lugar.coords[1]}
          >
            <MarkerContent>
              <button
                type="button"
                onClick={() => onSeleccionar(lugar.id)}
                aria-label={`Seleccionar ${lugar.nombre}`}
                className="size-3.5 border-2 cursor-pointer focus-visible:outline focus-visible:outline-2"
                style={{
                  borderColor: "var(--cyber-cyan)",
                  background:
                    seleccionado === lugar.id
                      ? "var(--cyber-cyan)"
                      : "var(--cyber-cyan-dim)",
                  transform: "rotate(45deg)",
                  boxShadow: "0 0 10px var(--cyber-cyan)",
                  outlineColor: "var(--cyber-cyan)",
                  transitionProperty: "background",
                  transitionDuration: "var(--cyber-duration-fast)",
                }}
              />
              <MarkerLabel position="bottom">
                <span
                  className="font-mono text-[9px] tracking-wide"
                  style={{
                    color: "var(--cyber-cyan)",
                    textShadow: "0 0 8px var(--cyber-cyan)",
                  }}
                >
                  {lugar.label}
                </span>
              </MarkerLabel>
            </MarkerContent>

            {/* Lugar popup */}
            <MarkerPopup className="p-0">
              <div style={{ width: 265, ...popupCardStyle }}>
                {/* Hero image */}
                <div
                  className="relative h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${lugar.image})` }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 50%, var(--cyber-surface-2) 100%)",
                    }}
                  />
                  <span
                    className="absolute top-2 left-2 font-mono text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 border"
                    style={{
                      background: "oklch(0.10 0.03 220 / 0.85)",
                      borderColor: "var(--cyber-cyan)",
                      color: "var(--cyber-cyan)",
                    }}
                  >
                    {lugar.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditarLugar(lugar)}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 border font-mono text-[9px] tracking-wide focus-visible:outline focus-visible:outline-2"
                    style={{
                      background: "oklch(0.10 0.03 220 / 0.85)",
                      borderColor: "var(--cyber-orange)",
                      color: "var(--cyber-orange)",
                      outlineColor: "var(--cyber-cyan)",
                    }}
                  >
                    <Edit2 size={9} /> Editar
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5 px-3 py-2.5">
                  <p
                    className="text-xs font-bold"
                    style={{ color: "var(--cyber-text-bright)" }}
                  >
                    {lugar.nombre}
                  </p>

                  <div className="flex items-center gap-1">
                    <Star
                      size={10}
                      fill="#ffaa00"
                      color="#ffaa00"
                      aria-hidden="true"
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--cyber-text-bright)" }}
                    >
                      {lugar.rating}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--cyber-text-secondary)" }}
                    >
                      ({lugar.reviews.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock
                      size={10}
                      aria-hidden="true"
                      style={{ color: "var(--cyber-text-secondary)" }}
                    />
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--cyber-text-secondary)" }}
                    >
                      {lugar.hours}
                    </span>
                  </div>

                  {/* Linked event */}
                  {lugar.evento &&
                    (() => {
                      const cfg = ESTADO_EVENTO_CONFIG[lugar.evento.estado];
                      return (
                        <div
                          className="flex flex-col gap-1 p-2 border rounded"
                          style={{
                            background: cfg.color + "0d",
                            borderColor: cfg.color + "44",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 rounded-full shrink-0"
                              style={{
                                background: cfg.color,
                                boxShadow: cfg.glow,
                              }}
                            />
                            <span
                              className="font-mono text-[9px] font-bold tracking-wide flex-1"
                              style={{ color: cfg.color }}
                            >
                              {lugar.evento.nombre || "EVENTO"}
                            </span>
                            <span
                              className="font-mono text-[8px] border px-1"
                              style={{
                                color: cfg.color,
                                borderColor: cfg.color + "55",
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          {lugar.evento.descripcion && (
                            <p
                              className="text-[9px] pl-3"
                              style={{ color: "var(--cyber-text-secondary)" }}
                            >
                              {lugar.evento.descripcion}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                  {/* CV link */}
                  {lugar.cvUrl && (
                    <a
                      href={lugar.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1.5 border font-mono text-[9px] tracking-wide no-underline focus-visible:outline focus-visible:outline-2"
                      style={{
                        background: "oklch(0 0.01 220 / 0.5)",
                        borderColor: "var(--cyber-cyan)",
                        color: "var(--cyber-cyan)",
                        outlineColor: "var(--cyber-cyan)",
                      }}
                    >
                      <FileText size={9} aria-hidden="true" />
                      Ver CV / portafolio
                      <ExternalLink
                        size={8}
                        className="ml-auto"
                        aria-hidden="true"
                      />
                    </a>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-1.5 mt-1">
                    {lugar.celular ? (
                      <>
                        <a
                          href={`https://wa.me/${lugar.celular}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border font-mono text-[9px] no-underline focus-visible:outline focus-visible:outline-2"
                          style={{
                            background: "#003a1a",
                            borderColor: "#25D366",
                            color: "#25D366",
                            outlineColor: "var(--cyber-cyan)",
                          }}
                        >
                          <MessageCircle size={9} aria-hidden="true" /> WhatsApp
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.coords[1]},${lugar.coords[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Navegar"
                          aria-label="Navegar a ubicación"
                          className="flex items-center px-2 py-1.5 border no-underline focus-visible:outline focus-visible:outline-2"
                          style={{
                            background: "var(--cyber-cyan-dim)",
                            borderColor: "var(--cyber-cyan)",
                            color: "var(--cyber-cyan)",
                            outlineColor: "var(--cyber-cyan)",
                          }}
                        >
                          <Navigation size={9} aria-hidden="true" />
                        </a>
                      </>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.coords[1]},${lugar.coords[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border font-mono text-[9px] no-underline focus-visible:outline focus-visible:outline-2"
                        style={{
                          background: "var(--cyber-cyan-dim)",
                          borderColor: "var(--cyber-cyan)",
                          color: "var(--cyber-cyan)",
                          outlineColor: "var(--cyber-cyan)",
                        }}
                      >
                        <Navigation size={9} aria-hidden="true" /> Navegar
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lugar.coords[1]},${lugar.coords[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Ver en Google Maps"
                      aria-label="Ver en Google Maps"
                      className="flex items-center px-2 py-1.5 border no-underline focus-visible:outline focus-visible:outline-2"
                      style={{
                        borderColor: "var(--cyber-border-subtle)",
                        color: "var(--cyber-text-secondary)",
                        outlineColor: "var(--cyber-cyan)",
                      }}
                    >
                      <ExternalLink size={9} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}

        {/* ── Evento markers ────────────────────────────────────────── */}
        {eventos
          .filter((ev) => ev.coords)
          .map((ev) => {
            const cfg = ESTADO_EVENTO_CONFIG[ev.estado];
            const [eLng, eLat] = ev.coords!;
            const esSel = eventoSeleccionado === ev.id;
            return (
              <MapMarker key={`ev-${ev.id}`} longitude={eLng} latitude={eLat}>
                <MarkerContent>
                  <button
                    type="button"
                    aria-label={`Evento: ${ev.nombre}`}
                    className="border-2 cursor-pointer focus-visible:outline focus-visible:outline-2"
                    style={{
                      width: esSel ? 14 : 10,
                      height: esSel ? 14 : 10,
                      borderColor: cfg.color,
                      background: esSel ? cfg.color : cfg.color + "55",
                      transform: "rotate(45deg)",
                      boxShadow: esSel ? `0 0 16px ${cfg.color}` : cfg.glow,
                      outlineColor: "var(--cyber-cyan)",
                      transitionProperty:
                        "width, height, background, box-shadow",
                      transitionDuration: "var(--cyber-duration-fast)",
                    }}
                  />
                  <MarkerLabel position="bottom">
                    <span
                      className="font-mono text-[8px] tracking-wide"
                      style={{ color: cfg.color, textShadow: cfg.glow }}
                    >
                      {ev.nombre?.slice(0, 10) || "EVT"}
                    </span>
                  </MarkerLabel>
                </MarkerContent>

                {/* Evento popup */}
                <MarkerPopup className="p-0">
                  <div
                    style={{
                      width: 240,
                      ...popupCardStyle,
                      borderColor: cfg.color + "55",
                      boxShadow: `0 0 16px ${cfg.color}22`,
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b"
                      style={{
                        background: cfg.color + "0d",
                        borderColor: cfg.color + "33",
                      }}
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          background: cfg.color,
                          boxShadow: cfg.glow,
                          animation:
                            ev.estado === "ACTIVO"
                              ? "pulse 2s infinite"
                              : "none",
                        }}
                      />
                      <span
                        className="font-mono text-[10px] font-bold tracking-wide flex-1 min-w-0 truncate"
                        style={{ color: cfg.color }}
                      >
                        {ev.nombre || "EVENTO"}
                      </span>
                      <span
                        className="font-mono text-[8px] border px-1.5 py-0.5 shrink-0"
                        style={{
                          color: cfg.color,
                          borderColor: cfg.color + "55",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-1.5 px-3 py-2">
                      {ev.descripcion && (
                        <p
                          className="text-[9px]"
                          style={{ color: "var(--cyber-text)" }}
                        >
                          {ev.descripcion}
                        </p>
                      )}
                      <p
                        className="font-mono text-[9px]"
                        style={{ color: "var(--cyber-text-secondary)" }}
                      >
                        Inicio:{" "}
                        <span style={{ color: "var(--cyber-text)" }}>
                          {new Date(ev.fechaInicio).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </p>
                      {ev.fechaFin && (
                        <p
                          className="font-mono text-[9px]"
                          style={{ color: "var(--cyber-text-secondary)" }}
                        >
                          Fin:{" "}
                          <span style={{ color: "var(--cyber-text)" }}>
                            {new Date(ev.fechaFin).toLocaleString("es-MX", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </p>
                      )}
                      {ev.notas && (
                        <p
                          className="text-[9px] px-1.5 py-1 border"
                          style={{
                            color: "var(--cyber-text-secondary)",
                            background: "var(--cyber-bg)",
                            borderColor: "var(--cyber-border-subtle)",
                          }}
                        >
                          {ev.notas}
                        </p>
                      )}
                      <p
                        className="font-mono text-[8px]"
                        style={{ color: "var(--cyber-text-secondary)" }}
                      >
                        {eLat.toFixed(4)}° N &nbsp; {Math.abs(eLng).toFixed(4)}°
                        W
                      </p>

                      {/* Actions */}
                      <div className="flex gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => onEditarEvento(ev)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 border font-mono text-[9px] tracking-wide focus-visible:outline focus-visible:outline-2"
                          style={{
                            background: cfg.color + "18",
                            borderColor: cfg.color + "55",
                            color: cfg.color,
                            outlineColor: "var(--cyber-cyan)",
                          }}
                        >
                          <Edit2 size={9} aria-hidden="true" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminarEvento(ev.id)}
                          aria-label="Eliminar evento"
                          className="flex items-center px-2 py-1.5 border focus-visible:outline focus-visible:outline-2"
                          style={{
                            borderColor: "var(--cyber-error)",
                            color: "var(--cyber-error)",
                            outlineColor: "var(--cyber-cyan)",
                          }}
                        >
                          <Trash2 size={9} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}

        {/* ── Layer panel ───────────────────────────────────────────── */}
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
