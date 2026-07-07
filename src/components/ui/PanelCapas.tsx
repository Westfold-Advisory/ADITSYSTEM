// src/components/PanelCapas.tsx
import { Layers, X } from "lucide-react";
import { G } from "./constants";

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
      label: "DISTRITO LOCAL 1",
      color: "#FF4DFF",
      visible: visibleDistritoLocal01,
      toggle: onToggleDistritoLocal01,
    },
    {
      label: "DISTRITO LOCAL 2",
      color: "#6A5CFF",
      visible: visibleDistritoLocal02,
      toggle: onToggleDistritoLocal02,
    },
    {
      label: "DISTRITO LOCAL 3",
      color: "#4DEBFF",
      visible: visiblePuebla,
      toggle: onTogglePuebla,
    },
    {
      label: "DISTRITO LOCAL 4",
      color: "#39FF5A",
      visible: visibleOaxaca,
      toggle: onToggleOaxaca,
    },
    {
      label: "DISTRITO LOCAL 5",
      color: "#FFFF33",
      visible: visibleDistritoLocal05,
      toggle: onToggleDistritoLocal05,
    },
    {
      label: "DISTRITO LOCAL 6",
      color: "#33B5FF",
      visible: visibleDistritoLocal06,
      toggle: onToggleDistritoLocal06,
    },
    {
      label: "DISTRITO LOCAL 7",
      color: "#EFFF00",
      visible: visibleDistritoLocal07,
      toggle: onToggleDistritoLocal07,
    },
    {
      label: "DISTRITO LOCAL 8",
      color: "#FF6B6B",
      visible: visibleDistritoLocal08,
      toggle: onToggleDistritoLocal08,
    },
    {
      label: "DISTRITO LOCAL 9",
      color: "#A8FF00",
      visible: visibleDistritoLocal09,
      toggle: onToggleDistritoLocal09,
    },
    {
      label: "DISTRITO LOCAL 10",
      color: "#E5FF4D",
      visible: visibleDistritoLocal10,
      toggle: onToggleDistritoLocal10,
    },
    {
      label: "DISTRITO LOCAL 11",
      color: "#B266FF",
      visible: visibleDistritoLocal11,
      toggle: onToggleDistritoLocal11,
    },
    {
      label: "DISTRITO LOCAL 12",
      color: "#FF8A33",
      visible: visibleDistritoLocal12,
      toggle: onToggleDistritoLocal12,
    },
    {
      label: "DISTRITO LOCAL 13",
      color: "#FFD166",
      visible: visibleDistritoLocal13,
      toggle: onToggleDistritoLocal13,
    },
    {
      label: "DISTRITO LOCAL 14",
      color: "#5B7CFF",
      visible: visibleDistritoLocal14,
      toggle: onToggleDistritoLocal14,
    },
    {
      label: "DISTRITO LOCAL 15",
      color: "#4DFF88",
      visible: visibleDistritoLocal15,
      toggle: onToggleDistritoLocal15,
    },
    {
      label: "DISTRITO LOCAL 16",
      color: "#FFB347",
      visible: visibleDistritoLocal16,
      toggle: onToggleDistritoLocal16,
    },
    {
      label: "DISTRITO LOCAL 17",
      color: "#5EC8FF",
      visible: visibleDistritoLocal17,
      toggle: onToggleDistritoLocal17,
    },
    {
      label: "DISTRITO LOCAL 18",
      color: "#4DFFF3",
      visible: visibleDistritoLocal18,
      toggle: onToggleDistritoLocal18,
    },
    {
      label: "DISTRITO LOCAL 19",
      color: "#FF5FA2",
      visible: visibleDistritoLocal19,
      toggle: onToggleDistritoLocal19,
    },
    {
      label: "DISTRITO LOCAL 20",
      color: "#33FF99",
      visible: visibleDistritoLocal20,
      toggle: onToggleDistritoLocal20,
    },
    {
      label: "DISTRITO LOCAL 21",
      color: "#FF66F7",
      visible: visibleDistritoLocal21,
      toggle: onToggleDistritoLocal21,
    },
    {
      label: "DISTRITO LOCAL 22",
      color: "#33FFF5",
      visible: visibleDistritoLocal22,
      toggle: onToggleDistritoLocal22,
    },
    {
      label: "DISTRITO LOCAL 23",
      color: "#CFFF3D",
      visible: visibleDistritoLocal23,
      toggle: onToggleDistritoLocal23,
    },
    {
      label: "DISTRITO LOCAL 24",
      color: "#9B7BFF",
      visible: visibleDistritoLocal24,
      toggle: onToggleDistritoLocal24,
    },
    {
      label: "DISTRITO LOCAL 25",
      color: "#FF66CC",
      visible: visibleDistritoLocal25,
      toggle: onToggleDistritoLocal25,
    },
    {
      label: "DISTRITO LOCAL 26",
      color: "#FFE84D",
      visible: visibleDistritoLocal26,
      toggle: onToggleDistritoLocal26,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 25,
        width: 250,

        maxHeight: "650px", // IMPORTANTE
        overflowY: "auto",

        background: G.bgPanel,
        border: `1px solid ${G.borderBright}`,
        boxShadow: `0 0 20px rgba(0,212,255,0.1)`,
        fontFamily: "'Courier New', monospace",
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          overflowY: "auto",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${G.border}`,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowY: "auto",
          }}>
          <Layers size={12} color={G.accent} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: G.accent,
              letterSpacing: 2,
              overflowY: "auto",
            }}>
            CAPAS
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            overflowY: "auto",
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
          overflowY: "auto",

          gap: 8,
        }}>
        {capas.map(({ label, color, visible, toggle }) => (
          <div
            key={label}
            style={{
              display: "flex",
              overflowY: "auto",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              border: `1px solid ${visible ? color + "44" : G.border}`,
              background: visible ? color + "0a" : "transparent",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflowY: "auto",
              }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  overflowY: "auto",

                  borderRadius: "50%",
                  background: visible ? color : G.textDim,
                  boxShadow: visible ? `0 0 6px ${color}` : "none",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  overflowY: "auto",
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
                overflowY: "auto",
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
