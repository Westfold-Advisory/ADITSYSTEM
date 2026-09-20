import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient, ApiError } from "@/api/http";
import { capabilitiesFor } from "@/lib/capabilities";
import type { LoginResponse } from "@/api/auth";
import type { Person, PersonInput } from "@/types/domain";

const empty: PersonInput = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
};

function message(error: unknown): string {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

function PersonForm({
  label,
  onSave,
}: {
  label: string;
  onSave: (input: PersonInput) => Promise<void>;
}) {
  const [values, setValues] = useState<PersonInput>(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      setValues(empty);
    } catch (reason) {
      setError(message(reason));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="domain-form" onSubmit={submit}>
      <h2>Registrar {label}</h2>
      <label>
        Nombre
        <input
          required
          maxLength={120}
          value={values.nombre}
          onChange={(e) => setValues({ ...values, nombre: e.target.value })}
        />
      </label>
      <label>
        Apellido paterno
        <input
          required
          maxLength={120}
          value={values.apellidoPaterno}
          onChange={(e) =>
            setValues({ ...values, apellidoPaterno: e.target.value })
          }
        />
      </label>
      <label>
        Apellido materno
        <input
          required
          maxLength={120}
          value={values.apellidoMaterno}
          onChange={(e) =>
            setValues({ ...values, apellidoMaterno: e.target.value })
          }
        />
      </label>
      <label>
        Teléfono
        <input
          required
          maxLength={30}
          value={values.telefono}
          onChange={(e) => setValues({ ...values, telefono: e.target.value })}
        />
      </label>
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <button disabled={saving} type="submit">
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

export function DomainAdminPage({
  session,
  onBack,
}: {
  session: LoginResponse;
  onBack: () => void;
}) {
  const capabilities = capabilitiesFor(session.user.rol);
  const [self, setSelf] = useState<Person | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useMemo(
    () =>
      new DomainApi(
        new ApiClient({ getAccessToken: () => session.access_token }),
      ),
    [session.access_token],
  );
  const load = useCallback(async () => {
    setError(null);
    try {
      const current = await api.getPerson(session.user.persona_id);
      setSelf(current);
      setSelected((item) => item ?? current);
      setPeople([current, ...(await api.listDescendants(current.id))]);
    } catch (reason) {
      setError(message(reason));
    }
  }, [api, session.user.persona_id, setSelected]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  const parent = selected ?? self;
  const createChild = async (input: PersonInput) => {
    if (!capabilities.childRole || !parent) return;
    await api.createPerson(
      input,
      capabilities.childRole,
      capabilities.childRole === "COORDINADOR_GENERAL" ? null : parent.id,
    );
    await load();
  };
  const remove = async (person: Person) => {
    if (!window.confirm("Esta acción realiza una baja lógica. ¿Continuar?"))
      return;
    try {
      await api.deletePerson(person.id);
      setSelected(self);
      await load();
    } catch (reason) {
      setError(message(reason));
    }
  };
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">ADIT SYSTEM</p>
          <h1>Estructura de personas</h1>
          <p>
            {session.user.email} · {session.user.rol}
          </p>
        </div>
        <button onClick={onBack}>Volver a eventos</button>
      </header>
      <p className="request-message">
        Los controles son ayudas de interfaz; el backend valida rol, ownership y
        jerarquía en cada solicitud.
      </p>
      {capabilities.canCreateChild && capabilities.childRole && (
        <PersonForm
          label={capabilities.childRole.toLowerCase().replaceAll("_", " ")}
          onSave={createChild}
        />
      )}
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <section className="admin-events" aria-busy={!self} aria-live="polite">
        {people.map((person) => (
          <article key={person.id}>
            <p>
              {person.role} · {person.status}
            </p>
            <h2>
              {person.nombre} {person.apellidoPaterno} {person.apellidoMaterno}
            </h2>
            <p>{person.telefono}</p>
            <button onClick={() => setSelected(person)}>
              {selected?.id === person.id
                ? "Contexto actual"
                : "Usar como contexto"}
            </button>
            {person.id !== session.user.persona_id && (
              <button onClick={() => void remove(person)}>Dar de baja</button>
            )}
          </article>
        ))}
        {!error && self && people.length === 0 && (
          <p>No hay registros en tu alcance.</p>
        )}
      </section>
    </main>
  );
}
