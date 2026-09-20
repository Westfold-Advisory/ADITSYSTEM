import type { UUID } from "@/types/events";
import {
  buildPublicEventQueryString,
  emptyPublicEventFilters,
  parsePublicEventFilters,
} from "@/lib/public-event-filters";

const EVENT_QUERY_KEY = "evento";

export function readEventIdFromSearch(search: string): UUID | null {
  const value = new URLSearchParams(search).get(EVENT_QUERY_KEY);
  return value as UUID | null;
}

export function writeEventIdToSearch(search: string, id: UUID | null): string {
  const filters = parsePublicEventFilters(search);
  return buildPublicEventQueryString({
    filters,
    eventId: id,
    baseSearch: search,
  });
}

export function readPublicEventIdFromUrl(): UUID | null {
  return readEventIdFromSearch(window.location.search);
}

export function pushPublicEventDetailUrl(id: UUID): void {
  const filters = parsePublicEventFilters(window.location.search);
  const nextSearch = buildPublicEventQueryString({
    filters,
    eventId: id,
    baseSearch: window.location.search,
  });
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${nextSearch}`,
  );
}

export function clearPublicEventDetailUrl(): void {
  const filters = parsePublicEventFilters(window.location.search);
  const nextSearch = buildPublicEventQueryString({
    filters,
    eventId: null,
    baseSearch: window.location.search,
  });
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${nextSearch}`,
  );
}

export { emptyPublicEventFilters, parsePublicEventFilters };
