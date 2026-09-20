import { useEffect, useMemo, useState } from "react";

import type { LoginResponse } from "@/api/auth";
import { EventsApi } from "@/api/events";
import { ApiClient, ApiError } from "@/api/http";
import type { Event, EventInput } from "@/types/events";
import { getInstitutionConfig } from "@/config/institution";
import {
  clearAdminSession,
  persistAdminSession,
  readAdminSession,
} from "@/lib/admin-session";
import { capabilitiesFor } from "@/lib/capabilities";
import { FormularioNuevoEvento } from "./FormularioNuevoEvento";
import { DomainAdminPage } from "./DomainAdminPage";
import { LoginPage } from "./LoginPage";
import { PublicAppShell } from "./PublicAppShell";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { EmptyState, ErrorState, LoadingState } from "./ui/AsyncState";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

const statusLabels: Record<Event["status"], string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

type EventAction =
  "publish" | "unpublish" | "start" | "finish" | "cancel" | "delete";

function actionsFor(
  event: Event,
): Array<{ action: EventAction; label: string; sensitive?: boolean }> {
  switch (event.status) {
    case "BORRADOR":
      return [
        { action: "publish", label: "Publicar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
        { action: "delete", label: "Eliminar", sensitive: true },
      ];
    case "PUBLICADO":
      return [
        { action: "unpublish", label: "Despublicar", sensitive: true },
        { action: "start", label: "Iniciar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
      ];
    case "EN_CURSO":
      return [
        { action: "finish", label: "Finalizar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
      ];
    case "CANCELADO":
      return [{ action: "delete", label: "Eliminar", sensitive: true }];
    case "FINALIZADO":
      return [];
  }
}

export function AdminEventsPage() {
  const institution = getInstitutionConfig();
  const [session, setSession] = useState<LoginResponse | null>(() =>
    readAdminSession(),
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [editing, setEditing] = useState<Event | null | "new">(null);
  const [domainView, setDomainView] = useState(false);
  const api = useMemo(
    () =>
      new EventsApi(
        new ApiClient({ getAccessToken: () => session?.access_token }),
      ),
    [session?.access_token],
  );
  const canManage = session
    ? capabilitiesFor(session.user.rol).canManageEvents
    : false;

  useEffect(() => {
    if (!session || !canManage) return;
    void Promise.resolve().then(() => {
      setIsLoading(true);
      setError(null);
      return api
        .listAdmin()
        .then(setEvents)
        .catch((requestError) => setError(errorMessage(requestError)))
        .finally(() => setIsLoading(false));
    });
  }, [api, canManage, session]);

  const login = (nextSession: LoginResponse) => {
    persistAdminSession(nextSession);
    setSession(nextSession);
  };
  const logout = () => {
    clearAdminSession();
    setSession(null);
    setEvents([]);
  };
  const save = async (input: EventInput) => {
    const saved =
      editing === "new"
        ? await api.create(input)
        : await api.update((editing as Event).id, input);
    setEvents((current) =>
      editing === "new"
        ? [saved, ...current]
        : current.map((item) => (item.id === saved.id ? saved : item)),
    );
    setEditing(null);
  };
  const runAction = async (event: Event, action: EventAction) => {
    const confirmation =
      action === "delete"
        ? `Eliminar el evento “${event.name}”? Esta es una baja lógica y solo se permite para borradores o cancelados.`
        : action === "cancel"
          ? `Cancelar el evento “${event.name}”? Esta acción cambia su estado y deja de estar disponible públicamente.`
          : action === "unpublish"
            ? `Despublicar el evento “${event.name}”? Volverá a borrador y dejará de verse públicamente.`
            : null;
    if (confirmation && !window.confirm(confirmation)) return;
    setActiveAction(`${event.id}:${action}`);
    setError(null);
    try {
      if (action === "delete") {
        await api.remove(event.id);
        setEvents((current) => current.filter((item) => item.id !== event.id));
      } else {
        const saved = await api.transition(event.id, action);
        setEvents((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setActiveAction(null);
    }
  };

  if (!session) {
    return (
      <PublicAppShell brandLabel={institution.productName}>
        <LoginPage onLogin={login} />
      </PublicAppShell>
    );
  }
  if (!canManage)
    return (
      <main className="admin-page">
        <section className="request-message error">
          <h1>Acceso no autorizado</h1>
          <p>Tu rol no tiene permiso para administrar eventos.</p>
          <button onClick={logout}>Cerrar sesión</button>
        </section>
      </main>
    );

  if (domainView)
    return (
      <DomainAdminPage session={session} onBack={() => setDomainView(false)} />
    );

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">ADIT SYSTEM</p>
          <h1>Administración de eventos</h1>
          <p>
            {session.user.email} · {session.user.rol}
          </p>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      {editing ? (
        <FormularioNuevoEvento
          event={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      ) : (
        <>
          <Button onClick={() => setEditing("new")}>Crear evento</Button>
          <Button variant="outline" onClick={() => setDomainView(true)}>
            Administrar perfiles
          </Button>
          {error && (
            <p className="request-message error" role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <LoadingState label="Cargando eventos…" />
          ) : error ? (
            <ErrorState message={error} />
          ) : events.length === 0 ? (
            <EmptyState>
              No hay eventos administrativos todavía. Crea un borrador para
              comenzar.
            </EmptyState>
          ) : (
            <section className="admin-events" aria-live="polite">
              {events.map((event) => (
                <Card key={event.id} className="admin-event-card">
                  <div
                    className={`event-status event-status--${event.status.toLowerCase()}`}
                  >
                    {statusLabels[event.status]}
                  </div>
                  <h2>{event.name}</h2>
                  <p>
                    {event.type} · {event.locationText}
                  </p>
                  <div className="event-card-actions">
                    <Button variant="outline" onClick={() => setEditing(event)}>
                      Editar
                    </Button>
                    {actionsFor(event).map(({ action, label, sensitive }) => {
                      const busy = activeAction === `${event.id}:${action}`;
                      return (
                        <Button
                          key={action}
                          variant={sensitive ? "destructive" : "secondary"}
                          status={busy ? "loading" : "idle"}
                          onClick={() => void runAction(event, action)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
