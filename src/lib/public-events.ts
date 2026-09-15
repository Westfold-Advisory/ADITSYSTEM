import type { Event } from "@/types/events";

export function isPublishedEvent(event: Event): boolean {
  return event.status === "PUBLICADO";
}
