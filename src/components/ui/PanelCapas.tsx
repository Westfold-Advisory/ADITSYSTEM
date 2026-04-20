// src/components/PanelCapas.tsx
import { Layers, X } from "lucide-react";
import { G } from "./constants";

interface PanelCapasProps {
  visibleOaxaca: boolean;
  visiblePuebla: boolean;
  onToggleOaxaca: () => void;
  onTogglePuebla: () => void;
  onClose: () => void;
}

export function PanelCapas({
  visibleOaxaca,
  visiblePuebla,
  onToggleOaxaca,
  onTogglePuebla,
  onClose,
}: PanelCapasProps) {
  const capas = [
    {
      label: "OAXACA",
      color: G.warn,
      visible: visibleOaxaca,
      toggle: onToggleOaxaca,
    },
    {
      label: "PUEBLA",
      color: G.accent,
      visible: visiblePuebla,
      toggle: onTogglePuebla,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 20,
        width: 220,
        background: G.bgPanel,
        border: `1px solid ${G.borderBright}`,
        boxShadow: `0 0 20px rgba(0,212,255,0.1)`,
        fontFamily: "'Courier New', monospace",
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${G.border}`,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={12} color={G.accent} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: G.accent,
              letterSpacing: 2,
            }}>
            CAPAS
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: G.textDim,
            padding: 0,
          }}>
          <X size={13} />
        </button>
      </div>

      <div
        style={{
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
        {capas.map(({ label, color, visible, toggle }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              border: `1px solid ${visible ? color + "44" : G.border}`,
              background: visible ? color + "0a" : "transparent",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: visible ? color : G.textDim,
                  boxShadow: visible ? `0 0 6px ${color}` : "none",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: visible ? color : G.textDim,
                  letterSpacing: 1.5,
                }}>
                {label}
              </span>
            </div>
            <button
              onClick={toggle}
              style={{
                width: 32,
                height: 16,
                border: `1px solid ${visible ? color : G.border}`,
                background: visible ? color + "33" : "transparent",
                cursor: "pointer",
                position: "relative",
                padding: 0,
              }}>
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: visible ? 16 : 2,
                  width: 10,
                  height: 10,
                  background: visible ? color : G.textDim,
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
