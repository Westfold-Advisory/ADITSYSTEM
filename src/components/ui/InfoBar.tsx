import { Radio } from "lucide-react";
import type { Lugar } from "./types";

interface InfoBarProps {
  activo: Lugar | undefined;
}

export function InfoBar({ activo }: InfoBarProps) {
  if (activo) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
        style={{
          background: "var(--cyber-surface-2)",
          borderColor: "var(--cyber-border)",
          boxShadow: "var(--cyber-shadow-sm)",
        }}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="font-mono text-[10px] tracking-[0.15em] uppercase"
            style={{ color: "var(--cyber-text-secondary)" }}
          >
            Líder activo
          </span>
          <p
            className="font-bold text-sm tracking-wide truncate"
            style={{ color: "var(--cyber-text-bright)" }}
          >
            {activo.nombre}
          </p>
          <p className="text-[10px]" style={{ color: "var(--cyber-text-secondary)" }}>
            Sección:{" "}
            <span className="font-semibold" style={{ color: "var(--cyber-cyan)" }}>
              {activo.info}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 ml-4">
          <div className="text-right">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.15em] block"
              style={{ color: "var(--cyber-text-secondary)" }}
            >
              Municipio
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--cyber-cyan)" }}>
              {activo.category}
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.15em] block"
              style={{ color: "var(--cyber-text-secondary)" }}
            >
              Coordenadas
            </span>
            <span
              className="font-mono text-sm tracking-wide"
              style={{ color: "var(--cyber-cyan)" }}
            >
              {activo.coords[1].toFixed(4)}° N&nbsp;&nbsp;
              {Math.abs(activo.coords[0]).toFixed(4)}° W
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 shrink-0 border-b"
      style={{
        background: "var(--cyber-surface-1)",
        borderColor: "var(--cyber-border-subtle)",
      }}
    >
      <Radio
        size={11}
        aria-hidden="true"
        style={{ color: "var(--cyber-text-secondary)" }}
      />
      <p
        className="font-mono text-[10px] tracking-[0.12em] uppercase"
        style={{ color: "var(--cyber-text-secondary)" }}
      >
        Seleccione un objetivo en el mapa o en el panel lateral
      </p>
    </div>
  );
}
