// src/App.tsx
import { useEffect, useState } from "react";
import { Shield, Plus, Layers, CalendarPlus } from "lucide-react";
import { G, LUGARES_INICIALES } from "./components/ui/constants";
import type { Lugar, Evento } from "./components/ui/types";
import { ESTADO_EVENTO_CONFIG } from "./components/ui/types";
import { Sidebar } from "./components/ui/Sidebar";
import { MapaVista } from "./components/ui/MapaVista";
import { InfoBar } from "./components/ui/InfoBar";
import { FormularioNuevoLugar } from "./components/ui/FormularioNuevoLugar";
import { FormularioNuevoEvento } from "./components/FormularioNuevoEvento";

export default function App() {
  const [lugares, setLugares] = useState<Lugar[]>(LUGARES_INICIALES);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(
    null,
  );
  const [visibleOaxaca, setVisibleOaxaca] = useState(true);
  const [visibleDistritoLocal01, setvisibleDistritoLocal01] = useState(true);
  const [visibleDistritoLocal02, setvisibleDistritoLocal02] = useState(true);
  const [visibleDistritoLocal03, setvisibleDistritoLocal03] = useState(true);
  const [visibleDistritoLocal04, setvisibleDistritoLocal04] = useState(true);
  const [visibleDistritoLocal05, setvisibleDistritoLocal05] = useState(true);
  const [visibleDistritoLocal06, setvisibleDistritoLocal06] = useState(true);
  const [visibleDistritoLocal07, setvisibleDistritoLocal07] = useState(true);
  const [visibleDistritoLocal08, setvisibleDistritoLocal08] = useState(true);
  const [visibleDistritoLocal09, setvisibleDistritoLocal09] = useState(true);
  const [visibleDistritoLocal10, setvisibleDistritoLocal10] = useState(true);
  const [visibleDistritoLocal11, setvisibleDistritoLocal11] = useState(true);
  const [visibleDistritoLocal12, setvisibleDistritoLocal12] = useState(true);
  const [visibleDistritoLocal13, setvisibleDistritoLocal13] = useState(true);
  const [visibleDistritoLocal14, setvisibleDistritoLocal14] = useState(true);
  const [visibleDistritoLocal15, setvisibleDistritoLocal15] = useState(true);
  const [visibleDistritoLocal16, setvisibleDistritoLocal16] = useState(true);
  const [visibleDistritoLocal17, setvisibleDistritoLocal17] = useState(true);
  const [visibleDistritoLocal18, setvisibleDistritoLocal18] = useState(true);
  const [visibleDistritoLocal19, setvisibleDistritoLocal19] = useState(true);
  const [visibleDistritoLocal20, setvisibleDistritoLocal20] = useState(true);
  const [visibleDistritoLocal21, setvisibleDistritoLocal21] = useState(true);
  const [visibleDistritoLocal22, setvisibleDistritoLocal22] = useState(true);
  const [visibleDistritoLocal23, setvisibleDistritoLocal23] = useState(true);
  const [visibleDistritoLocal24, setvisibleDistritoLocal24] = useState(true);
  const [visibleDistritoLocal25, setvisibleDistritoLocal25] = useState(true);
  const [visibleDistritoLocal26, setvisibleDistritoLocal26] = useState(true);
  const [visiblePuebla, setVisiblePuebla] = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [eventoFormAbierto, setEventoFormAbierto] = useState(false);
  const [lugarEditar, setLugarEditar] = useState<Lugar | undefined>(undefined);
  const [eventoEditar, setEventoEditar] = useState<Evento | undefined>(
    undefined,
  );
  const [tick, setTick] = useState(0);

  const activo = lugares.find((l) => l.id === seleccionado);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}Z`;

  // ── Lugares ──
  const agregarLugar = (lugar: Lugar) => {
    setLugares((p) => [...p, lugar]);
    setSeleccionado(lugar.id);
  };
  const editarLugar = (lugar: Lugar) => {
    setLugares((p) => p.map((l) => (l.id === lugar.id ? lugar : l)));
    setSeleccionado(lugar.id);
  };
  const eliminarLugar = (id: number) => {
    setLugares((p) => p.filter((l) => l.id !== id));
    if (seleccionado === id) setSeleccionado(null);
  };
  const abrirEdicion = (lugar: Lugar) => {
    setLugarEditar(lugar);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setLugarEditar(undefined);
  };

  // ── Eventos independientes ──
  const agregarEvento = (ev: Evento) => {
    setEventos((p) => [...p, ev]);
    setEventoSeleccionado(ev.id);
    setSeleccionado(null);
  };
  const editarEvento = (ev: Evento) => {
    setEventos((p) => p.map((e) => (e.id === ev.id ? ev : e)));
    setEventoSeleccionado(ev.id);
  };
  const eliminarEvento = (id: number) => {
    setEventos((p) => p.filter((e) => e.id !== id));
    if (eventoSeleccionado === id) setEventoSeleccionado(null);
  };

  const abrirEdicionEvento = (ev: Evento) => {
    setEventoEditar(ev);
    setEventoFormAbierto(true);
  };
  const cerrarFormEvento = () => {
    setEventoFormAbierto(false);
    setEventoEditar(undefined);
  };

  // Contador de eventos activos
  const eventosActivos = eventos.filter((e) => e.estado === "ACTIVO").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: G.bg,
        fontFamily: "'Courier New', monospace",
        color: G.text,
      }}>
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: `1px solid ${G.border}`,
          padding: "0 24px",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: G.bgPanel,
          position: "relative",
          flexShrink: 0,
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

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Shield size={14} color={G.accent} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: G.textBright,
              letterSpacing: 3,
            }}>
            GOTHAM
          </span>
          <span style={{ fontSize: 10, color: G.textDim, letterSpacing: 1 }}>
            SISTEMA DE INTELIGENCIA GEOESPACIAL
          </span>
        </div>

        {/* Controles */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Indicador ACTIVO + timestamp */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginRight: 4,
            }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: G.accentGreen,
                boxShadow: `0 0 8px ${G.accentGreen}`,
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{ fontSize: 10, color: G.accentGreen, letterSpacing: 1 }}>
              ACTIVO
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              color: G.textDim,
              letterSpacing: 1,
              marginRight: 4,
            }}>
            {timestamp}
          </span>

          {/* Separador */}
          <div style={{ width: 1, height: 20, background: G.border }} />

          {/* Botón + NUEVO (lugar) */}
          <button
            onClick={() => {
              setLugarEditar(undefined);
              setFormularioAbierto(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: "#003322",
              border: `1px solid ${G.accentGreen}`,
              color: G.accentGreen,
              cursor: "pointer",
              fontSize: 10,
              letterSpacing: 1.5,
              fontFamily: "'Courier New', monospace",
            }}>
            <Plus size={11} /> NUEVO
          </button>

          {/* Botón + EVENTO (independiente) */}
          <button
            onClick={() => {
              setEventoEditar(undefined);
              setEventoFormAbierto(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: eventoFormAbierto ? "#1a0a2e" : "transparent",
              border: `1px solid #a855f7`,
              color: "#a855f7",
              cursor: "pointer",
              fontSize: 10,
              letterSpacing: 1.5,
              fontFamily: "'Courier New', monospace",
              position: "relative",
            }}>
            <CalendarPlus size={11} /> EVENTO
            {/* Badge contador eventos activos */}
            {eventosActivos > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: G.accentGreen,
                  color: G.bg,
                  fontSize: 8,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 6px ${G.accentGreen}`,
                }}>
                {eventosActivos}
              </span>
            )}
          </button>

          {/* Botón CAPAS */}
          <button
            onClick={() => setPanelAbierto(!panelAbierto)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: panelAbierto ? G.accentDim : "transparent",
              border: `1px solid ${panelAbierto ? G.accent : G.border}`,
              color: panelAbierto ? G.accent : G.textDim,
              cursor: "pointer",
              fontSize: 10,
              letterSpacing: 1.5,
              fontFamily: "'Courier New', monospace",
            }}>
            <Layers size={11} /> CAPAS
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          lugares={lugares}
          eventos={eventos}
          seleccionado={seleccionado}
          eventoSeleccionado={eventoSeleccionado}
          onSeleccionar={(id) => {
            setSeleccionado(id);
            setEventoSeleccionado(null);
          }}
          onSeleccionarEvento={(id) => {
            setEventoSeleccionado(id);
            setSeleccionado(null);
          }}
          onEliminar={eliminarLugar}
          onEliminarEvento={eliminarEvento}
          onAbrirFormulario={() => {
            setLugarEditar(undefined);
            setFormularioAbierto(true);
          }}
          onAbrirFormularioEvento={() => {
            setEventoEditar(undefined);
            setEventoFormAbierto(true);
          }}
          onEditarEvento={abrirEdicionEvento}
        />

        <div
          style={{
            flex: 1,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "hidden",
          }}>
          <MapaVista
            lugares={lugares}
            eventos={eventos}
            seleccionado={seleccionado}
            eventoSeleccionado={eventoSeleccionado}
            onSeleccionar={(id) => {
              setSeleccionado(id);
              setEventoSeleccionado(null);
            }}
            visibleOaxaca={visibleOaxaca}
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
            visiblePuebla={visiblePuebla}
            onToggleDistritoLocal01={() =>
              setvisibleDistritoLocal01(!visibleDistritoLocal01)
            }
            onToggleDistritoLocal02={() =>
              setvisibleDistritoLocal02(!visibleDistritoLocal02)
            }
            onToggleDistritoLocal03={() =>
              setvisibleDistritoLocal03(!visibleDistritoLocal03)
            }
            onToggleDistritoLocal04={() =>
              setvisibleDistritoLocal04(!visibleDistritoLocal04)
            }
            onToggleDistritoLocal05={() =>
              setvisibleDistritoLocal05(!visibleDistritoLocal05)
            }
            onToggleDistritoLocal06={() =>
              setvisibleDistritoLocal06(!visibleDistritoLocal06)
            }
            onToggleDistritoLocal07={() =>
              setvisibleDistritoLocal07(!visibleDistritoLocal07)
            }
            onToggleDistritoLocal08={() =>
              setvisibleDistritoLocal08(!visibleDistritoLocal08)
            }
            onToggleDistritoLocal09={() =>
              setvisibleDistritoLocal09(!visibleDistritoLocal09)
            }
            onToggleDistritoLocal10={() =>
              setvisibleDistritoLocal10(!visibleDistritoLocal10)
            }
            onToggleDistritoLocal11={() =>
              setvisibleDistritoLocal11(!visibleDistritoLocal11)
            }
            onToggleDistritoLocal12={() =>
              setvisibleDistritoLocal12(!visibleDistritoLocal12)
            }
            onToggleDistritoLocal13={() =>
              setvisibleDistritoLocal13(!visibleDistritoLocal13)
            }
            onToggleDistritoLocal14={() =>
              setvisibleDistritoLocal14(!visibleDistritoLocal14)
            }
            onToggleDistritoLocal15={() =>
              setvisibleDistritoLocal15(!visibleDistritoLocal15)
            }
            onToggleDistritoLocal16={() =>
              setvisibleDistritoLocal16(!visibleDistritoLocal16)
            }
            onToggleDistritoLocal17={() =>
              setvisibleDistritoLocal17(!visibleDistritoLocal17)
            }
            onToggleDistritoLocal18={() =>
              setvisibleDistritoLocal18(!visibleDistritoLocal18)
            }
            onToggleDistritoLocal19={() =>
              setvisibleDistritoLocal19(!visibleDistritoLocal19)
            }
            onToggleDistritoLocal20={() =>
              setvisibleDistritoLocal20(!visibleDistritoLocal20)
            }
            onToggleDistritoLocal21={() =>
              setvisibleDistritoLocal21(!visibleDistritoLocal21)
            }
            onToggleDistritoLocal22={() =>
              setvisibleDistritoLocal22(!visibleDistritoLocal22)
            }
            onToggleDistritoLocal23={() =>
              setvisibleDistritoLocal23(!visibleDistritoLocal23)
            }
            onToggleDistritoLocal24={() =>
              setvisibleDistritoLocal24(!visibleDistritoLocal24)
            }
            onToggleDistritoLocal25={() =>
              setvisibleDistritoLocal25(!visibleDistritoLocal25)
            }
            onToggleDistritoLocal26={() =>
              setvisibleDistritoLocal26(!visibleDistritoLocal26)
            }
            onToggleOaxaca={() => setVisibleOaxaca(!visibleOaxaca)}
            onTogglePuebla={() => setVisiblePuebla(!visiblePuebla)}
            panelAbierto={panelAbierto}
            onCerrarPanel={() => setPanelAbierto(false)}
            onEditarLugar={abrirEdicion}
            onEditarEvento={abrirEdicionEvento}
            onEliminarEvento={eliminarEvento}
          />
          <InfoBar activo={activo} />
        </div>
      </div>

      {/* ── Modal: nuevo/editar lugar ── */}
      {formularioAbierto && (
        <FormularioNuevoLugar
          onAgregar={agregarLugar}
          onClose={cerrarFormulario}
          lugarEditar={lugarEditar}
          onEditar={editarLugar}
        />
      )}

      {/* ── Modal: nuevo/editar evento ── */}
      {eventoFormAbierto && (
        <FormularioNuevoEvento
          onAgregar={agregarEvento}
          onClose={cerrarFormEvento}
          eventoEditar={eventoEditar}
          onEditar={editarEvento}
        />
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${G.bg}; }
        ::-webkit-scrollbar-thumb { background: ${G.border}; }
        input::placeholder { color: ${G.textDim}; opacity: 1; }
        input:focus, select:focus { border-color: ${G.accent} !important; }
      `}</style>
    </div>
  );
}
