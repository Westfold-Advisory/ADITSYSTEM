import { useState, type FormEvent } from "react";

import { ApiError } from "@/api/http";
import type { Event, EventInput } from "@/types/events";

interface FormularioNuevoEventoProps {
  event?: Event;
  onCancel: () => void;
  onSubmit: (input: EventInput) => Promise<void>;
}

function toLocalDateTime(value: Date): string {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function initialForm(event?: Event) {
  return {
    type: event?.type ?? "",
    name: event?.name ?? "",
    description: event?.description ?? "",
    locationText: event?.locationText ?? "",
    mapUrl: event?.mapUrl ?? "",
    latitude: event ? String(event.coordinates.latitude) : "",
    longitude: event ? String(event.coordinates.longitude) : "",
    startsAt: event ? toLocalDateTime(event.startsAt) : "",
    endsAt: event ? toLocalDateTime(event.endsAt) : "",
    maximumCapacity: event?.maximumCapacity
      ? String(event.maximumCapacity)
      : "",
    requiresCheckin: event?.requiresCheckin ?? true,
    checkinRadiusMeters: event?.checkinRadiusMeters
      ? String(event.checkinRadiusMeters)
      : "100",
  };
}

function apiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const fieldMessage = Object.values(error.fields)[0]?.[0]?.message;
    return fieldMessage ?? error.message;
  }
  return error instanceof Error
    ? error.message
    : "No fue posible guardar el evento.";
}

export function FormularioNuevoEvento({
  event,
  onCancel,
  onSubmit,
}: FormularioNuevoEventoProps) {
  const [form, setForm] = useState(() => initialForm(event));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const maximumCapacity = form.maximumCapacity
      ? Number(form.maximumCapacity)
      : null;
    const checkinRadiusMeters = Number(form.checkinRadiusMeters);
    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);

    if (
      !form.type.trim() ||
      !form.name.trim() ||
      !form.description.trim() ||
      !form.locationText.trim()
    ) {
      setError("Completa los campos obligatorios.");
      return;
    }
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Ingresa coordenadas válidas.");
      return;
    }
    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
    if (
      maximumCapacity !== null &&
      (!Number.isInteger(maximumCapacity) || maximumCapacity <= 0)
    ) {
      setError("La capacidad máxima debe ser un entero mayor a cero.");
      return;
    }
    if (!Number.isInteger(checkinRadiusMeters) || checkinRadiusMeters <= 0) {
      setError("El radio de check-in debe ser un entero mayor a cero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: form.type.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        coordinates: { latitude, longitude },
        locationText: form.locationText.trim(),
        mapUrl: form.mapUrl.trim() || null,
        startsAt,
        endsAt,
        maximumCapacity,
        requiresCheckin: form.requiresCheckin,
        checkinRadiusMeters,
      });
    } catch (submitError) {
      setError(apiMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="event-form" onSubmit={submit} noValidate>
      <h2>{event ? "Actualizar evento" : "Nuevo evento"}</h2>
      <label>
        Tipo *
        <input
          required
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
        />
      </label>
      <label>
        Nombre *
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </label>
      <label>
        Descripción *
        <textarea
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <label>
        Ubicación *
        <input
          required
          value={form.locationText}
          onChange={(e) => set("locationText", e.target.value)}
        />
      </label>
      <label>
        URL del mapa
        <input
          type="url"
          value={form.mapUrl}
          onChange={(e) => set("mapUrl", e.target.value)}
        />
      </label>
      <div className="event-form-grid">
        <label>
          Latitud *
          <input
            required
            type="number"
            min="-90"
            max="90"
            step="any"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
          />
        </label>
        <label>
          Longitud *
          <input
            required
            type="number"
            min="-180"
            max="180"
            step="any"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
          />
        </label>
        <label>
          Inicio *
          <input
            required
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
          />
        </label>
        <label>
          Fin *
          <input
            required
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => set("endsAt", e.target.value)}
          />
        </label>
        <label>
          Capacidad máxima
          <input
            type="number"
            min="1"
            step="1"
            value={form.maximumCapacity}
            onChange={(e) => set("maximumCapacity", e.target.value)}
          />
        </label>
        <label>
          Radio de check-in (m) *
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.checkinRadiusMeters}
            onChange={(e) => set("checkinRadiusMeters", e.target.value)}
          />
        </label>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.requiresCheckin}
          onChange={(e) => set("requiresCheckin", e.target.checked)}
        />{" "}
        Requiere check-in
      </label>
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <div className="event-form-actions">
        <button type="button" disabled={isSubmitting} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : event
              ? "Guardar cambios"
              : "Crear evento"}
        </button>
      </div>
    </form>
  );
}
