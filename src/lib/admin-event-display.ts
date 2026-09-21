import type { Event } from "@/types/events";

const scheduleFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatAdminEventSchedule(startsAt: Date, endsAt: Date): string {
  const start = scheduleFormatter.format(startsAt);
  const end = scheduleFormatter.format(endsAt);
  return `${start} – ${end}`;
}

export function formatAdminEventCapacity(
  maximumCapacity: number | null,
): string {
  if (maximumCapacity == null) return "Sin cupo";
  return `${maximumCapacity} personas`;
}

export function adminEventRowSummary(event: Event): {
  schedule: string;
  capacity: string;
} {
  return {
    schedule: formatAdminEventSchedule(event.startsAt, event.endsAt),
    capacity: formatAdminEventCapacity(event.maximumCapacity),
  };
}
