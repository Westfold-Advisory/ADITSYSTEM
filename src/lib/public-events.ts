import type { Event } from "@/types/events";

const PUBLIC_VISIBILITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Un evento es visible públicamente si está publicado (sin límite de fecha),
 * en curso, o finalizado dentro de los últimos 7 días. Borradores y eventos
 * cancelados nunca son públicos.
 */
export function isPublicEvent(event: Event, now: Date = new Date()): boolean {
  if (event.status === "PUBLICADO") return true;
  if (event.status === "EN_CURSO" || event.status === "FINALIZADO") {
    return (
      now.getTime() - event.endsAt.getTime() <= PUBLIC_VISIBILITY_WINDOW_MS
    );
  }
  return false;
}
