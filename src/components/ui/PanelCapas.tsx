import { Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelCapasProps {
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
  onClose: () => void;
}

export function PanelCapas({
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
  onToggleOaxaca,
  onTogglePuebla,
  onClose,
}: PanelCapasProps) {
  const capas = [
    {
      label: "Distrito Local 1",
      color: "#FF4DFF",
      visible: visibleDistritoLocal01,
      toggle: onToggleDistritoLocal01,
    },
    {
      label: "Distrito Local 2",
      color: "#6A5CFF",
      visible: visibleDistritoLocal02,
      toggle: onToggleDistritoLocal02,
    },
    {
      label: "Distrito Local 3",
      color: "#4DEBFF",
      visible: visiblePuebla,
      toggle: onTogglePuebla,
    },
    {
      label: "Distrito Local 4",
      color: "#39FF5A",
      visible: visibleOaxaca,
      toggle: onToggleOaxaca,
    },
    {
      label: "Distrito Local 5",
      color: "#FFFF33",
      visible: visibleDistritoLocal05,
      toggle: onToggleDistritoLocal05,
    },
    {
      label: "Distrito Local 6",
      color: "#33B5FF",
      visible: visibleDistritoLocal06,
      toggle: onToggleDistritoLocal06,
    },
    {
      label: "Distrito Local 7",
      color: "#EFFF00",
      visible: visibleDistritoLocal07,
      toggle: onToggleDistritoLocal07,
    },
    {
      label: "Distrito Local 8",
      color: "#FF6B6B",
      visible: visibleDistritoLocal08,
      toggle: onToggleDistritoLocal08,
    },
    {
      label: "Distrito Local 9",
      color: "#A8FF00",
      visible: visibleDistritoLocal09,
      toggle: onToggleDistritoLocal09,
    },
    {
      label: "Distrito Local 10",
      color: "#E5FF4D",
      visible: visibleDistritoLocal10,
      toggle: onToggleDistritoLocal10,
    },
    {
      label: "Distrito Local 11",
      color: "#B266FF",
      visible: visibleDistritoLocal11,
      toggle: onToggleDistritoLocal11,
    },
    {
      label: "Distrito Local 12",
      color: "#FF8A33",
      visible: visibleDistritoLocal12,
      toggle: onToggleDistritoLocal12,
    },
    {
      label: "Distrito Local 13",
      color: "#FFD166",
      visible: visibleDistritoLocal13,
      toggle: onToggleDistritoLocal13,
    },
    {
      label: "Distrito Local 14",
      color: "#5B7CFF",
      visible: visibleDistritoLocal14,
      toggle: onToggleDistritoLocal14,
    },
    {
      label: "Distrito Local 15",
      color: "#4DFF88",
      visible: visibleDistritoLocal15,
      toggle: onToggleDistritoLocal15,
    },
    {
      label: "Distrito Local 16",
      color: "#FFB347",
      visible: visibleDistritoLocal16,
      toggle: onToggleDistritoLocal16,
    },
    {
      label: "Distrito Local 17",
      color: "#5EC8FF",
      visible: visibleDistritoLocal17,
      toggle: onToggleDistritoLocal17,
    },
    {
      label: "Distrito Local 18",
      color: "#4DFFF3",
      visible: visibleDistritoLocal18,
      toggle: onToggleDistritoLocal18,
    },
    {
      label: "Distrito Local 19",
      color: "#FF5FA2",
      visible: visibleDistritoLocal19,
      toggle: onToggleDistritoLocal19,
    },
    {
      label: "Distrito Local 20",
      color: "#33FF99",
      visible: visibleDistritoLocal20,
      toggle: onToggleDistritoLocal20,
    },
    {
      label: "Distrito Local 21",
      color: "#FF66F7",
      visible: visibleDistritoLocal21,
      toggle: onToggleDistritoLocal21,
    },
    {
      label: "Distrito Local 22",
      color: "#33FFF5",
      visible: visibleDistritoLocal22,
      toggle: onToggleDistritoLocal22,
    },
    {
      label: "Distrito Local 23",
      color: "#CFFF3D",
      visible: visibleDistritoLocal23,
      toggle: onToggleDistritoLocal23,
    },
    {
      label: "Distrito Local 24",
      color: "#9B7BFF",
      visible: visibleDistritoLocal24,
      toggle: onToggleDistritoLocal24,
    },
    {
      label: "Distrito Local 25",
      color: "#FF66CC",
      visible: visibleDistritoLocal25,
      toggle: onToggleDistritoLocal25,
    },
    {
      label: "Distrito Local 26",
      color: "#FFE84D",
      visible: visibleDistritoLocal26,
      toggle: onToggleDistritoLocal26,
    },
  ];

  return (
    <div
      role="dialog"
      aria-label="Panel de capas"
      className="absolute top-3 right-3 z-20 w-56 max-h-[600px] flex flex-col rounded border overflow-hidden"
      style={{
        background: "var(--cyber-surface-1)",
        borderColor: "var(--cyber-border)",
        boxShadow: "var(--cyber-shadow-md)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ borderColor: "var(--cyber-border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Layers
            size={12}
            aria-hidden="true"
            style={{ color: "var(--cyber-cyan)" }}
          />
          <span
            className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--cyber-cyan)" }}
          >
            Capas
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de capas"
          className="p-1 rounded hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
          style={{
            color: "var(--cyber-text-secondary)",
            outlineColor: "var(--cyber-cyan)",
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Layer list */}
      <div className="flex flex-col gap-1.5 p-2 overflow-y-auto">
        {capas.map(({ label, color, visible, toggle }) => (
          <div
            key={label}
            className="flex items-center justify-between px-2 py-1.5 rounded border"
            style={{
              borderColor: visible
                ? color + "44"
                : "var(--cyber-border-subtle)",
              background: visible ? color + "0a" : "transparent",
              transitionProperty: "background, border-color",
              transitionDuration: "var(--cyber-duration-fast)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{
                  background: visible ? color : "var(--cyber-text-secondary)",
                  boxShadow: visible ? `0 0 6px ${color}` : "none",
                }}
              />
              <span
                className="font-mono text-[9px] font-semibold tracking-wide uppercase truncate"
                style={{
                  color: visible ? color : "var(--cyber-text-secondary)",
                }}
              >
                {label}
              </span>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label}`}
              onClick={toggle}
              className={cn(
                "relative w-8 h-4 border rounded-sm shrink-0 ml-2",
                "focus-visible:outline focus-visible:outline-2",
              )}
              style={{
                borderColor: visible ? color : "var(--cyber-border-subtle)",
                background: visible ? color + "33" : "transparent",
                outlineColor: "var(--cyber-cyan)",
                transitionProperty: "background, border-color",
                transitionDuration: "var(--cyber-duration-fast)",
              }}
            >
              <span
                className="absolute top-[2px] size-2.5 rounded-sm"
                style={{
                  left: visible ? "calc(100% - 12px)" : "2px",
                  background: visible ? color : "var(--cyber-text-secondary)",
                  transitionProperty: "left, background",
                  transitionDuration: "var(--cyber-duration-fast)",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
