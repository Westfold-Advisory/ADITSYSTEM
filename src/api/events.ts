import { ApiClient } from "./http";
import type {
  Event,
  EventInput,
  EventStatus,
  EventUpdateInput,
  UUID,
} from "@/types/events";

interface EventResponse {
  id: string;
  created_by: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  latitud: string | number;
  longitud: string | number;
  ubicacion_texto: string;
  url_mapa: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estatus: EventStatus;
  capacidad_maxima: number | null;
  requiere_checkin: boolean;
  checkin_abierto_desde: string | null;
  checkin_abierto_hasta: string | null;
  checkin_radio_metros: number | null;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

type EventPayload = Omit<
  EventResponse,
  "id" | "created_by" | "version" | "created_at" | "updated_at" | "deleted_at"
>;

function toUtcDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new TypeError("La fecha del evento debe ser válida.");
  return date.toISOString();
}

function toUtcDateOrNull(
  value: string | Date | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : toUtcDate(value);
}

function toDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new TypeError("La API devolvió una fecha inválida.");
  return date;
}

function toDateOrNull(value: string | null): Date | null {
  return value === null ? null : toDate(value);
}

export function mapEventResponse(response: EventResponse): Event {
  return {
    id: response.id as UUID,
    createdBy: response.created_by as UUID,
    type: response.tipo,
    name: response.nombre,
    description: response.descripcion,
    coordinates: {
      latitude: Number(response.latitud),
      longitude: Number(response.longitud),
    },
    locationText: response.ubicacion_texto,
    mapUrl: response.url_mapa,
    startsAt: toDate(response.fecha_inicio),
    endsAt: toDate(response.fecha_fin),
    status: response.estatus,
    maximumCapacity: response.capacidad_maxima,
    requiresCheckin: response.requiere_checkin,
    checkinOpensAt: toDateOrNull(response.checkin_abierto_desde),
    checkinClosesAt: toDateOrNull(response.checkin_abierto_hasta),
    checkinRadiusMeters: response.checkin_radio_metros,
    version: response.version,
    createdAt: toDate(response.created_at),
    updatedAt: toDate(response.updated_at),
    deletedAt: toDateOrNull(response.deleted_at),
  };
}

export function mapEventInput(
  input: EventInput | EventUpdateInput,
): Partial<EventPayload> {
  const payload: Record<string, unknown> = {};
  if (input.type !== undefined) payload.tipo = input.type;
  if (input.name !== undefined) payload.nombre = input.name;
  if (input.description !== undefined) payload.descripcion = input.description;
  if (input.coordinates !== undefined) {
    payload.latitud = input.coordinates.latitude;
    payload.longitud = input.coordinates.longitude;
  }
  if (input.locationText !== undefined)
    payload.ubicacion_texto = input.locationText;
  if (input.mapUrl !== undefined) payload.url_mapa = input.mapUrl;
  if (input.startsAt !== undefined)
    payload.fecha_inicio = toUtcDate(input.startsAt);
  if (input.endsAt !== undefined) payload.fecha_fin = toUtcDate(input.endsAt);
  if (input.maximumCapacity !== undefined)
    payload.capacidad_maxima = input.maximumCapacity;
  if (input.requiresCheckin !== undefined)
    payload.requiere_checkin = input.requiresCheckin;
  if (input.checkinOpensAt !== undefined)
    payload.checkin_abierto_desde = toUtcDateOrNull(input.checkinOpensAt);
  if (input.checkinClosesAt !== undefined)
    payload.checkin_abierto_hasta = toUtcDateOrNull(input.checkinClosesAt);
  if (input.checkinRadiusMeters !== undefined)
    payload.checkin_radio_metros = input.checkinRadiusMeters;
  return payload as Partial<EventPayload>;
}

export class EventsApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async listPublic(signal?: AbortSignal): Promise<Event[]> {
    const events = await this.client.request<EventResponse[]>(
      "/public/events",
      { signal },
    );
    return events.map(mapEventResponse);
  }

  async getPublic(id: UUID, signal?: AbortSignal): Promise<Event> {
    return mapEventResponse(
      await this.client.request<EventResponse>(`/public/events/${id}`, {
        signal,
      }),
    );
  }

  async listAdmin(signal?: AbortSignal): Promise<Event[]> {
    const events = await this.client.request<EventResponse[]>("/events", {
      access: "admin",
      signal,
    });
    return events.map(mapEventResponse);
  }

  async create(input: EventInput): Promise<Event> {
    return mapEventResponse(
      await this.client.request<EventResponse>("/events", {
        access: "admin",
        method: "POST",
        body: mapEventInput(input),
      }),
    );
  }

  async update(id: UUID, input: EventUpdateInput): Promise<Event> {
    return mapEventResponse(
      await this.client.request<EventResponse>(`/events/${id}`, {
        access: "admin",
        method: "PATCH",
        body: mapEventInput(input),
      }),
    );
  }

  async transition(
    id: UUID,
    action: "publish" | "unpublish" | "start" | "finish" | "cancel",
  ): Promise<Event> {
    return mapEventResponse(
      await this.client.request<EventResponse>(`/events/${id}/${action}`, {
        access: "admin",
        method: "POST",
      }),
    );
  }

  async remove(id: UUID): Promise<void> {
    await this.client.request<void>(`/events/${id}`, {
      access: "admin",
      method: "DELETE",
    });
  }
}
