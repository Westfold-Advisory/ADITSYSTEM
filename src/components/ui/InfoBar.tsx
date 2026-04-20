// src/components/InfoBar.tsx
import { Radio } from "lucide-react";
import { G } from "./constants";
import type { Lugar } from "./types";

interface InfoBarProps {
  activo: Lugar | undefined;
}

export function InfoBar({ activo }: InfoBarProps) {
  if (activo) {
    return (
      <div
        style={{
          border: `1px solid ${G.borderBright}`,
          padding: "10px 16px",
          background: G.bgCard,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 0 15px rgba(0, 213, 255, 0.08)`,
          flexShrink: 0,
        }}>
        <div>
          <span style={{ fontSize: 9, color: G.textDim, letterSpacing: 2 }}>
            INFORMACION LIDER ACTIVO
          </span>

          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: G.textBright,
              margin: "2px 0",
              letterSpacing: 2,
            }}>
            {activo.nombre}
          </p>

          <p style={{ fontSize: 9, color: G.textDim, letterSpacing: 2 }}>
            Sección:
          </p>
          <p style={{ fontSize: 13, color: G.accent }}>{activo.info}</p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontSize: 9,
                color: G.textDim,
                letterSpacing: 2,
                display: "block",
              }}>
              MUNICIPIO
            </span>
            <span style={{ fontSize: 13, color: G.accent }}>
              {activo.category}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: 9,
                color: G.textDim,
                letterSpacing: 2,
                display: "block",
              }}>
              COORDENADAS
            </span>
            <span style={{ fontSize: 13, color: G.accent, letterSpacing: 1 }}>
              {activo.coords[1].toFixed(4)}° N &nbsp;{" "}
              {Math.abs(activo.coords[0]).toFixed(4)}° W
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${G.border}`,
        padding: "10px 16px",
        background: G.bgPanel,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
      <Radio size={11} color={G.textDim} />
      <span style={{ fontSize: 10, color: G.textDim, letterSpacing: 1.5 }}>
        SELECCIONE UN OBJETIVO EN EL MAPA O EN EL PANEL LATERAL
      </span>
    </div>
  );
}
