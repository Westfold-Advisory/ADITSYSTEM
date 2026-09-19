import { useState, useCallback } from "react";
import { Layers, Menu, X, PanelLeftClose, PanelLeft } from "lucide-react";

import { Sidebar } from "@/components/ui/Sidebar";
import { MapaVista } from "@/components/ui/MapaVista";
import { InfoBar } from "@/components/ui/InfoBar";
import { FormularioNuevoLugar } from "@/components/ui/FormularioNuevoLugar";
import { FormularioNuevoEvento } from "@/components/FormularioNuevoEvento";
import { LUGARES_INICIALES } from "@/components/ui/constants";
import type { Lugar, Evento } from "@/components/ui/types";
import type { EventInput } from "@/types/events";
import { cn } from "@/lib/utils";

/* ─── Layer visibility state ─────────────────────────────────────────────── */
type LayersState = {
  oaxaca: boolean;
  puebla: boolean;
  dl01: boolean;
  dl02: boolean;
  dl05: boolean;
  dl06: boolean;
  dl07: boolean;
  dl08: boolean;
  dl09: boolean;
  dl10: boolean;
  dl11: boolean;
  dl12: boolean;
  dl13: boolean;
  dl14: boolean;
  dl15: boolean;
  dl16: boolean;
  dl17: boolean;
  dl18: boolean;
  dl19: boolean;
  dl20: boolean;
  dl21: boolean;
  dl22: boolean;
  dl23: boolean;
  dl24: boolean;
  dl25: boolean;
  dl26: boolean;
};

const ALL_HIDDEN: LayersState = {
  oaxaca: false,
  puebla: false,
  dl01: false,
  dl02: false,
  dl05: false,
  dl06: false,
  dl07: false,
  dl08: false,
  dl09: false,
  dl10: false,
  dl11: false,
  dl12: false,
  dl13: false,
  dl14: false,
  dl15: false,
  dl16: false,
  dl17: false,
  dl18: false,
  dl19: false,
  dl20: false,
  dl21: false,
  dl22: false,
  dl23: false,
  dl24: false,
  dl25: false,
  dl26: false,
};

function toggle(key: keyof LayersState) {
  return (prev: LayersState): LayersState => ({ ...prev, [key]: !prev[key] });
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export function MapPage() {
  /* Lugares */
  const [lugares, setLugares] = useState<Lugar[]>(LUGARES_INICIALES);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  /* Eventos */
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(
    null,
  );

  /* Forms */
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [formularioEventoAbierto, setFormularioEventoAbierto] = useState(false);
  const [lugarEditar, setLugarEditar] = useState<Lugar | undefined>();
  const [eventoEditar, setEventoEditar] = useState<Evento | undefined>();

  /* Panel layers */
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);

  /* Layers */
  const [layers, setLayers] = useState<LayersState>(ALL_HIDDEN);

  /* Sidebar + mobile drawer */
  const [sidebarVisible, setSidebarVisible] = useState(true);

  /* ── Lugar handlers ─── */
  const handleAgregar = useCallback((lugar: Lugar) => {
    setLugares((prev) => [...prev, lugar]);
  }, []);

  const handleEditar = useCallback((lugar: Lugar) => {
    setLugares((prev) => prev.map((l) => (l.id === lugar.id ? lugar : l)));
  }, []);

  const handleEliminar = useCallback((id: number) => {
    setLugares((prev) => prev.filter((l) => l.id !== id));
    setSeleccionado((prev) => (prev === id ? null : prev));
  }, []);

  const handleEditarLugar = useCallback((lugar: Lugar) => {
    setLugarEditar(lugar);
    setFormularioAbierto(true);
  }, []);

  /* ── Evento handlers ─── */
  const handleAgregarEvento = useCallback(
    (input: EventInput) => {
      const eventData: Omit<Evento, "id"> = {
        category: "Evento",
        nombre: input.name,
        descripcion: input.description,
        estado: "ACTIVO",
        fechaInicio: new Date(input.startsAt).toISOString(),
        fechaFin: new Date(input.endsAt).toISOString(),
        notas: input.locationText,
        coords: [input.coordinates.longitude, input.coordinates.latitude],
      };

      if (eventoEditar) {
        setEventos((prev) =>
          prev.map((event) =>
            event.id === eventoEditar.id
              ? { ...eventData, id: eventoEditar.id }
              : event,
          ),
        );
      } else {
        const nuevo: Evento = {
          id: Date.now(),
          ...eventData,
        };
        setEventos((prev) => [...prev, nuevo]);
      }
      setFormularioEventoAbierto(false);
      setEventoEditar(undefined);
      return Promise.resolve();
    },
    [eventoEditar],
  );

  const handleEliminarEvento = useCallback((id: number) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
    setEventoSeleccionado((prev) => (prev === id ? null : prev));
  }, []);

  const handleEditarEvento = useCallback((evento: Evento) => {
    setEventoEditar(evento);
    setFormularioEventoAbierto(true);
  }, []);

  const activoLugar = lugares.find((l) => l.id === seleccionado);

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{ background: "var(--cyber-bg)", color: "var(--cyber-text)" }}
    >
      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
        style={{
          background: "var(--cyber-surface-1)",
          borderColor: "var(--cyber-border-subtle)",
          boxShadow: "var(--cyber-shadow-sm)",
        }}
      >
        {/* Brand + sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarVisible((v) => !v)}
            aria-label={sidebarVisible ? "Ocultar panel" : "Mostrar panel"}
            aria-expanded={sidebarVisible}
            className="p-1.5 rounded transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
            style={{
              outlineColor: "var(--cyber-cyan)",
              color: "var(--cyber-text-secondary)",
            }}
          >
            {sidebarVisible ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeft size={16} />
            )}
          </button>

          <span
            className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--cyber-cyan)" }}
          >
            ADIT SYSTEM
          </span>
        </div>

        {/* Layer toggle */}
        <button
          type="button"
          onClick={() => setPanelCapasAbierto((v) => !v)}
          aria-label={panelCapasAbierto ? "Cerrar capas" : "Abrir capas"}
          aria-expanded={panelCapasAbierto}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono tracking-widest uppercase border transition-colors",
            "focus-visible:outline focus-visible:outline-2",
          )}
          style={{
            outlineColor: "var(--cyber-cyan)",
            borderColor: panelCapasAbierto
              ? "var(--cyber-cyan)"
              : "var(--cyber-border-subtle)",
            background: panelCapasAbierto
              ? "var(--cyber-cyan-dim)"
              : "transparent",
            color: panelCapasAbierto
              ? "var(--cyber-cyan)"
              : "var(--cyber-text-secondary)",
          }}
        >
          <Layers size={13} />
          <span className="hidden sm:inline">Capas</span>
        </button>
      </header>

      {/* ── Info bar ────────────────────────────────────────────────────── */}
      <InfoBar activo={activoLugar} />

      {/* ── Main body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile when sidebarVisible=false */}
        <div
          className={cn(
            "shrink-0 transition-all overflow-hidden",
            "w-64 sm:w-60",
            sidebarVisible ? "flex" : "hidden sm:hidden",
          )}
          style={{ transitionDuration: "var(--cyber-duration-normal)" }}
          aria-hidden={!sidebarVisible}
        >
          <Sidebar
            lugares={lugares}
            eventos={eventos}
            seleccionado={seleccionado}
            eventoSeleccionado={eventoSeleccionado}
            onSeleccionar={setSeleccionado}
            onSeleccionarEvento={setEventoSeleccionado}
            onEliminar={handleEliminar}
            onEliminarEvento={handleEliminarEvento}
            onAbrirFormulario={() => {
              setLugarEditar(undefined);
              setFormularioAbierto(true);
            }}
            onAbrirFormularioEvento={() => {
              setEventoEditar(undefined);
              setFormularioEventoAbierto(true);
            }}
            onEditarEvento={handleEditarEvento}
          />
        </div>

        {/* Map — fills remaining space */}
        <main className="flex flex-col flex-1 relative overflow-hidden cyber-corners">
          <MapaVista
            lugares={lugares}
            eventos={eventos}
            seleccionado={seleccionado}
            eventoSeleccionado={eventoSeleccionado}
            onSeleccionar={setSeleccionado}
            visibleOaxaca={layers.oaxaca}
            visiblePuebla={layers.puebla}
            visibleDistritoLocal01={layers.dl01}
            visibleDistritoLocal02={layers.dl02}
            visibleDistritoLocal05={layers.dl05}
            visibleDistritoLocal06={layers.dl06}
            visibleDistritoLocal07={layers.dl07}
            visibleDistritoLocal08={layers.dl08}
            visibleDistritoLocal09={layers.dl09}
            visibleDistritoLocal10={layers.dl10}
            visibleDistritoLocal11={layers.dl11}
            visibleDistritoLocal12={layers.dl12}
            visibleDistritoLocal13={layers.dl13}
            visibleDistritoLocal14={layers.dl14}
            visibleDistritoLocal15={layers.dl15}
            visibleDistritoLocal16={layers.dl16}
            visibleDistritoLocal17={layers.dl17}
            visibleDistritoLocal18={layers.dl18}
            visibleDistritoLocal19={layers.dl19}
            visibleDistritoLocal20={layers.dl20}
            visibleDistritoLocal21={layers.dl21}
            visibleDistritoLocal22={layers.dl22}
            visibleDistritoLocal23={layers.dl23}
            visibleDistritoLocal24={layers.dl24}
            visibleDistritoLocal25={layers.dl25}
            visibleDistritoLocal26={layers.dl26}
            onToggleOaxaca={() => setLayers(toggle("oaxaca"))}
            onTogglePuebla={() => setLayers(toggle("puebla"))}
            onToggleDistritoLocal01={() => setLayers(toggle("dl01"))}
            onToggleDistritoLocal02={() => setLayers(toggle("dl02"))}
            onToggleDistritoLocal05={() => setLayers(toggle("dl05"))}
            onToggleDistritoLocal06={() => setLayers(toggle("dl06"))}
            onToggleDistritoLocal07={() => setLayers(toggle("dl07"))}
            onToggleDistritoLocal08={() => setLayers(toggle("dl08"))}
            onToggleDistritoLocal09={() => setLayers(toggle("dl09"))}
            onToggleDistritoLocal10={() => setLayers(toggle("dl10"))}
            onToggleDistritoLocal11={() => setLayers(toggle("dl11"))}
            onToggleDistritoLocal12={() => setLayers(toggle("dl12"))}
            onToggleDistritoLocal13={() => setLayers(toggle("dl13"))}
            onToggleDistritoLocal14={() => setLayers(toggle("dl14"))}
            onToggleDistritoLocal15={() => setLayers(toggle("dl15"))}
            onToggleDistritoLocal16={() => setLayers(toggle("dl16"))}
            onToggleDistritoLocal17={() => setLayers(toggle("dl17"))}
            onToggleDistritoLocal18={() => setLayers(toggle("dl18"))}
            onToggleDistritoLocal19={() => setLayers(toggle("dl19"))}
            onToggleDistritoLocal20={() => setLayers(toggle("dl20"))}
            onToggleDistritoLocal21={() => setLayers(toggle("dl21"))}
            onToggleDistritoLocal22={() => setLayers(toggle("dl22"))}
            onToggleDistritoLocal23={() => setLayers(toggle("dl23"))}
            onToggleDistritoLocal24={() => setLayers(toggle("dl24"))}
            onToggleDistritoLocal25={() => setLayers(toggle("dl25"))}
            onToggleDistritoLocal26={() => setLayers(toggle("dl26"))}
            panelAbierto={panelCapasAbierto}
            onCerrarPanel={() => setPanelCapasAbierto(false)}
            onEditarLugar={handleEditarLugar}
            onEditarEvento={handleEditarEvento}
            onEliminarEvento={handleEliminarEvento}
          />

          {/* Mobile sidebar overlay toggle */}
          {!sidebarVisible && (
            <button
              type="button"
              onClick={() => setSidebarVisible(true)}
              aria-label="Abrir panel lateral"
              className={cn(
                "absolute bottom-20 left-3 z-20 sm:hidden",
                "flex items-center gap-1.5 px-3 py-2 rounded border text-xs font-mono",
                "transition-colors focus-visible:outline focus-visible:outline-2",
              )}
              style={{
                background: "var(--cyber-surface-1)",
                borderColor: "var(--cyber-border)",
                color: "var(--cyber-text-secondary)",
                outlineColor: "var(--cyber-cyan)",
              }}
            >
              <Menu size={13} />
              Panel
            </button>
          )}
        </main>
      </div>

      {/* ── Formulario lugar ─────────────────────────────────────────────── */}
      {formularioAbierto && (
        <FormularioNuevoLugar
          onAgregar={handleAgregar}
          onClose={() => {
            setFormularioAbierto(false);
            setLugarEditar(undefined);
          }}
          lugarEditar={lugarEditar}
          onEditar={handleEditar}
        />
      )}

      {/* ── Formulario evento ────────────────────────────────────────────── */}
      {formularioEventoAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 0.75)" }}
        >
          <div
            className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded border p-6"
            style={{
              background: "var(--cyber-surface-1)",
              borderColor: "var(--cyber-border)",
              boxShadow: "var(--cyber-shadow-lg)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-mono text-xs font-bold tracking-[0.2em] uppercase"
                style={{ color: "var(--cyber-cyan)" }}
              >
                {eventoEditar ? "Editar evento" : "Nuevo evento"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setFormularioEventoAbierto(false);
                  setEventoEditar(undefined);
                }}
                aria-label="Cerrar formulario"
                className="p-1 rounded hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
                style={{
                  color: "var(--cyber-text-secondary)",
                  outlineColor: "var(--cyber-cyan)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <FormularioNuevoEvento
              onCancel={() => {
                setFormularioEventoAbierto(false);
                setEventoEditar(undefined);
              }}
              onSubmit={handleAgregarEvento}
            />
          </div>
        </div>
      )}
    </div>
  );
}
