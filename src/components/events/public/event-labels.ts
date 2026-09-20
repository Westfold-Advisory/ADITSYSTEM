import type { EventStatus } from "@/types/events";

export const eventStatusLabels: Record<EventStatus, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export function eventStatusSlug(status: EventStatus): string {
  return status.toLowerCase();
}
