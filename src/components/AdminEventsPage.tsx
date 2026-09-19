import { useEffect, useMemo, useState, type FormEvent } from "react";

import { ADMIN_EVENT_ROLES, AuthApi, type LoginResponse } from "@/api/auth";
import { EventsApi } from "@/api/events";
import { ApiClient, ApiError } from "@/api/http";
import type { Event, EventInput } from "@/types/events";
import { FormularioNuevoEvento } from "./FormularioNuevoEvento";
import { DomainAdminPage } from "./DomainAdminPage";

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
        <label>
          Correo
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Contraseña
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="request-message error" role="alert">
            {error}
          </p>
        )}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
        </button>
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
    void api
      .listAdmin()
      .then(setEvents)
      .catch((requestError) => setError(errorMessage(requestError)));
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
          <button onClick={() => setEditing("new")}>Crear evento</button>
          <button onClick={() => setDomainView(true)}>
            Administrar perfiles
          </button>
          {error && (
            <p className="request-message error" role="alert">
              {error}
            </p>
          )}
          <section className="admin-events">
            {events.map((event) => (
              <article key={event.id}>
                <p>{event.status}</p>
                <h2>{event.name}</h2>
                <p>
                  {event.type} · {event.locationText}
                </p>
                <button onClick={() => setEditing(event)}>Editar</button>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
