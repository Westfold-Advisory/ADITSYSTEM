// src/types.ts

export interface Lugar {
  id: number;
  nombre: string;
  label: string;
  category: string;
  coords: [number, number];
  info: string;
  rating: string;
  reviews: number;
  hours: string;
  image: string; // URL externa o base64
  cvUrl?: string; // URL de CV / currículum (opcional)
  celular?: string; // Número WhatsApp sin + ni espacios (opcional)
  evento?: Evento; // Evento vinculado al lugar (opcional)
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

export type EstadoEvento = "ACTIVO" | "EN_ACCION" | "PASANDO";

export interface Evento {
  id: number;
  category: "Evento";
  nombre: string;
  descripcion: string;
  estado: EstadoEvento;
  fechaInicio: string;
  fechaFin?: string;
  notas?: string;
  coords?: [number, number]; // [lng, lat] — posición propia en el mapa
}

/** Color y etiqueta según estado del evento */
export const ESTADO_EVENTO_CONFIG: Record<
  EstadoEvento,
  { color: string; label: string; glow: string }
> = {
  ACTIVO: { color: "#00ff88", label: "ACTIVO", glow: "0 0 8px #00ff88" },
  EN_ACCION: { color: "#ffaa00", label: "EN ACCIÓN", glow: "0 0 8px #ffaa00" },
  PASANDO: { color: "#ff3355", label: "PASANDO", glow: "0 0 8px #ff3355" },
};
