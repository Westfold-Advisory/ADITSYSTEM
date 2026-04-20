import { useEffect, useState } from "react";
import { Shield, Plus, Layers } from "lucide-react";
import { G, LUGARES_INICIALES } from "./components/ui/constants";
import type { Lugar } from "./components/uitypes";
import { Sidebar } from "./components/ui/Sidebar";
import { MapaVista } from "./components/ui/MapaVista";
import { InfoBar } from "./components/ui/InfoBar";
import { FormularioNuevoLugar } from "./components/ui/FormularioNuevoLugar";

// --- Componente Auxiliar para la animación ---
const TypewriterText = ({
  text,
  speed = 100,
  style,
}: {
  text: string;
  speed?: number;
  style?: React.CSSProperties;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <span style={style}>{displayedText}</span>;
};

export default function App() {
  const [lugares, setLugares] = useState<Lugar[]>(LUGARES_INICIALES);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [visibleOaxaca, setVisibleOaxaca] = useState(true);
  const [visiblePuebla, setVisiblePuebla] = useState(true);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [lugarEditar, setLugarEditar] = useState<Lugar | undefined>(undefined);
  const [tick, setTick] = useState(0);

  const activo = lugares.find((l) => l.id === seleccionado);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}Z`;

  const agregarLugar = (lugar: Lugar) => {
    setLugares((prev) => [...prev, lugar]);
    setSeleccionado(lugar.id);
  };

  const editarLugar = (lugar: Lugar) => {
    setLugares((prev) => prev.map((l) => (l.id === lugar.id ? lugar : l)));
    setSeleccionado(lugar.id);
  };

  const eliminarLugar = (id: number) => {
    setLugares((prev) => prev.filter((l) => l.id !== id));
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Shield size={14} color={G.accent} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: G.textBright,
              letterSpacing: 3,
            }}>
            MARCO AURELIO
          </span>
          {/* Implementación de la animación aquí */}
          <TypewriterText
            text="MÉXICO ARMENTISTA"
            speed={120}
            style={{
              fontSize: 12,
              color: "#ff0505e6",
              letterSpacing: 1,
              minWidth: "200px", // Evita saltos de layout mientras se escribe
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
          <span style={{ fontSize: 10, color: G.textDim, letterSpacing: 1 }}>
            {timestamp}
          </span>
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
          seleccionado={seleccionado}
          onSeleccionar={setSeleccionado}
          onEliminar={eliminarLugar}
          onAbrirFormulario={() => {
            setLugarEditar(undefined);
            setFormularioAbierto(true);
          }}
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
            seleccionado={seleccionado}
            onSeleccionar={setSeleccionado}
            visibleOaxaca={visibleOaxaca}
            visiblePuebla={visiblePuebla}
            onToggleOaxaca={() => setVisibleOaxaca(!visibleOaxaca)}
            onTogglePuebla={() => setVisiblePuebla(!visiblePuebla)}
            panelAbierto={panelAbierto}
            onCerrarPanel={() => setPanelAbierto(false)}
            onEditarLugar={abrirEdicion}
          />
          <InfoBar activo={activo} />
        </div>
      </div>

      {/* ── Formulario nuevo / editar ── */}
      {formularioAbierto && (
        <FormularioNuevoLugar
          onAgregar={agregarLugar}
          onClose={cerrarFormulario}
          lugarEditar={lugarEditar}
          onEditar={editarLugar}
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
