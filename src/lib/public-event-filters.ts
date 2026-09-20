import type { Event, UUID } from "@/types/events";
import { isPublishedEvent } from "./public-events";

export type PublicEventDateFilter = "all" | "today" | "week";

export type PublicEventFilters = {
  search: string;
  type: string;
  date: PublicEventDateFilter;
};

export const emptyPublicEventFilters: PublicEventFilters = {
  search: "",
  type: "all",
  date: "all",
};

const EVENT_QUERY_KEY = "evento";

export function isPublicEventFilterActive(
  filters: PublicEventFilters,
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.type !== "all" ||
    filters.date !== "all"
  );
}

export function parsePublicEventFilters(search: string): PublicEventFilters {
  const params = new URLSearchParams(search);
  const rawDate = params.get("fecha");
  const date: PublicEventDateFilter =
    rawDate === "today" || rawDate === "week" ? rawDate : "all";
  const type = params.get("tipo")?.trim();
  return {
    search: params.get("q") ?? "",
    type: type && type.length > 0 ? type : "all",
    date,
  };
}

export function applyPublicEventFiltersToParams(
  params: URLSearchParams,
  filters: PublicEventFilters,
): void {
  const search = filters.search.trim();
  if (search) {
    params.set("q", search);
  } else {
    params.delete("q");
  }
  if (filters.type !== "all") {
    params.set("tipo", filters.type);
  } else {
    params.delete("tipo");
  }
  if (filters.date !== "all") {
    params.set("fecha", filters.date);
  } else {
    params.delete("fecha");
  }
}

export function buildPublicEventQueryString(options: {
  filters: PublicEventFilters;
  eventId?: UUID | null;
  baseSearch?: string;
}): string {
  const params = new URLSearchParams(options.baseSearch ?? "");
  applyPublicEventFiltersToParams(params, options.filters);
  if (options.eventId) {
    params.set(EVENT_QUERY_KEY, options.eventId);
  } else if (options.eventId === null) {
    params.delete(EVENT_QUERY_KEY);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function publicEventsListHref(filters: PublicEventFilters): string {
  return `/eventos${buildPublicEventQueryString({ filters, eventId: null })}`;
}

export function publicEventsDetailHref(
  eventId: UUID,
  filters: PublicEventFilters,
): string {
  return `/eventos${buildPublicEventQueryString({ filters, eventId })}`;
}

export function publicMapHref(
  filters: PublicEventFilters,
  eventId?: UUID | null,
): string {
  return `/mapa${buildPublicEventQueryString({ filters, eventId: eventId ?? null })}`;
}

export function readPublicMapEventIdFromSearch(search: string): UUID | null {
  const value = new URLSearchParams(search).get(EVENT_QUERY_KEY);
  return value as UUID | null;
}

export function filterPublicEvents(
  events: Event[],
  filters: PublicEventFilters & { now: Date },
): Event[] {
  const search = filters.search.trim().toLocaleLowerCase();
  const startOfToday = new Date(filters.now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return events.filter((event) => {
    const matchesText =
      !search ||
      `${event.name} ${event.type} ${event.locationText} ${event.description}`
        .toLocaleLowerCase()
        .includes(search);
    const matchesType = filters.type === "all" || event.type === filters.type;
    const matchesDate =
      filters.date === "all" ||
      (filters.date === "today"
        ? event.startsAt >= startOfToday &&
          event.startsAt < new Date(startOfToday.getTime() + 86_400_000)
        : event.startsAt >= startOfToday && event.startsAt < endOfWeek);
    return isPublishedEvent(event) && matchesText && matchesType && matchesDate;
  });
}
