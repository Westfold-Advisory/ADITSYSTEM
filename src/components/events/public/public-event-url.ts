import type { UUID } from "@/types/events";

const EVENT_QUERY_KEY = "evento";

export function readEventIdFromSearch(search: string): UUID | null {
  const value = new URLSearchParams(search).get(EVENT_QUERY_KEY);
  return value as UUID | null;
}

export function writeEventIdToSearch(search: string, id: UUID | null): string {
  const params = new URLSearchParams(search);
  if (id) {
    params.set(EVENT_QUERY_KEY, id);
  } else {
    params.delete(EVENT_QUERY_KEY);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function readPublicEventIdFromUrl(): UUID | null {
  return readEventIdFromSearch(window.location.search);
}

export function pushPublicEventDetailUrl(id: UUID): void {
  const nextSearch = writeEventIdToSearch(window.location.search, id);
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${nextSearch}`,
  );
}

export function clearPublicEventDetailUrl(): void {
  const nextSearch = writeEventIdToSearch(window.location.search, null);
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${nextSearch}`,
  );
}
