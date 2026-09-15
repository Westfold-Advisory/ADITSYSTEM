export type UUID = string;

export const EVENT_STATUSES = [
  "BORRADOR",
  "PUBLICADO",
  "EN_CURSO",
  "FINALIZADO",
  "CANCELADO",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface EventCoordinates {
  latitude: number;
  longitude: number;
}

export interface Event {
  id: UUID;
  createdBy: UUID;
  type: string;
  name: string;
  description: string;
  coordinates: EventCoordinates;
  locationText: string;
  mapUrl: string | null;
  startsAt: Date;
  endsAt: Date;
  status: EventStatus;
  maximumCapacity: number | null;
  requiresCheckin: boolean;
  checkinOpensAt: Date | null;
  checkinClosesAt: Date | null;
  checkinRadiusMeters: number | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EventInput {
  type: string;
  name: string;
  description: string;
  coordinates: EventCoordinates;
  locationText: string;
  mapUrl?: string | null;
  startsAt: Date | string;
  endsAt: Date | string;
  status?: EventStatus;
  maximumCapacity?: number | null;
  requiresCheckin?: boolean;
  checkinOpensAt?: Date | string | null;
  checkinClosesAt?: Date | string | null;
  checkinRadiusMeters?: number | null;
}

export type EventUpdateInput = Partial<EventInput>;
