import type {
  PublicEventDateFilter,
  PublicEventFilters,
} from "./public-event-filters";
import { filterPublicEvents } from "./public-event-filters";

export type MapEventFilters = PublicEventFilters & { now: Date };

export type { PublicEventDateFilter };

export function filterMapEvents(
  events: Parameters<typeof filterPublicEvents>[0],
  filters: MapEventFilters,
) {
  return filterPublicEvents(events, filters);
}
