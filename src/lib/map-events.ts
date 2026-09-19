import type { Event } from "@/types/events";
import { isPublishedEvent } from "./public-events";

export type MapEventFilters = {
  search: string;
  type: string;
  date: "all" | "today" | "week";
  now: Date;
};

export function filterMapEvents(
  events: Event[],
  filters: MapEventFilters,
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
