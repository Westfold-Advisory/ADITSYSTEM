import { useEffect, useMemo, useState, type FormEvent } from "react";

import { ADMIN_EVENT_ROLES, AuthApi, type LoginResponse } from "@/api/auth";
import { EventsApi } from "@/api/events";
import { ApiClient, ApiError } from "@/api/http";
import type { Event, EventInput } from "@/types/events";
import { FormularioNuevoEvento } from "./FormularioNuevoEvento";
import { DomainAdminPage } from "./DomainAdminPage";
import { Button } from "./ui/button";
import { Field } from "./ui/Field";
import { Card } from "./ui/Card";
import { EmptyState, ErrorState, LoadingState } from "./ui/AsyncState";

const sessionKey = "adit.admin.session";

function readSession(): LoginResponse | null {
  try {
    const value = sessionStorage.getItem(sessionKey);
    return value ? (JSON.parse(value) as LoginResponse) : null;
  } catch {
    return null;
  }
}

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

function Login({ onLogin }: { onLogin: (session: LoginResponse) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      onLogin(await new AuthApi(new ApiClient()).login(email, password));
    } catch (loginError) {
      setError(errorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <form className="login-form" onSubmit={submit}>
        <p className="eyebrow">ADIT SYSTEM</p>
        <h1>Acceso administrativo</h1>
        {import.meta.env.VITE_USE_MOCK_API === "true" && (
          <p className="request-message">
            Demo: admin <code>demo@adit.local</code>, político{" "}
            <code>politico@adit.local</code> o líder{" "}
            <code>lider@adit.local</code>. Contraseña: <code>demo12345</code>
          </p>
        )}
        <Field label="Correo">
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Contraseña">
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="request-message error" role="alert">
            {error}
          </p>
        )}
        <Button status={isSubmitting ? "loading" : "idle"} type="submit">
          Iniciar sesión
        </Button>
      </form>
    </main>
  );
}

export function AdminEventsPage() {
  const [session, setSession] = useState<LoginResponse | null>(() =>
    readSession(),
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
    ? ADMIN_EVENT_ROLES.includes(
        session.user.role as (typeof ADMIN_EVENT_ROLES)[number],
      )
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
    sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
    setSession(nextSession);
  };
  const logout = () => {
    sessionStorage.removeItem(sessionKey);
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

  if (!session) return <Login onLogin={login} />;
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
            {session.user.full_name} · {session.user.role}
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
