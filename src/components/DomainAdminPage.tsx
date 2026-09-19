import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient, ApiError } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import type { Invitado, Lider, PersonInput, Politico } from "@/types/domain";

type View = "politicos" | "lideres" | "invitados";
type Item = Politico | Lider | Invitado;
const empty = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
};

function message(error: unknown) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

function PersonForm({
  view,
  onSave,
}: {
  view: View;
  onSave: (input: PersonInput, parentId?: string) => Promise<void>;
}) {
  const [values, setValues] = useState(empty);
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const label = view === "lideres" ? "ID del político" : "ID del líder";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(values, view === "politicos" ? undefined : parentId);
      setValues(empty);
      setParentId("");
    } catch (reason) {
      setError(message(reason));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="domain-form" onSubmit={submit}>
      <h2>Registrar {view.slice(0, -1)}</h2>
      {view !== "politicos" && (
        <label>
          {label}
          <input
            required
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="UUID autorizado"
          />
        </label>
      )}
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
  const [view, setView] = useState<View>("politicos");
  const [items, setItems] = useState<Item[]>([]);
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
      setItems(
        view === "politicos"
          ? await api.listPoliticos()
          : view === "lideres"
            ? await api.listLideres()
            : await api.listInvitados(),
      );
    } catch (reason) {
      setError(message(reason));
    }
  }, [api, view]);
  // This effect fetches remote state after a view/token change; state updates occur after the request settles.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  const save = async (input: PersonInput, parentId?: string) => {
    const registeredAt = new Date();
    if (view === "politicos")
      await api.createPolitico({ ...input, registeredAt });
    else if (view === "lideres")
      await api.createLider(parentId!, { ...input, registeredAt });
    else await api.createInvitado(parentId!, { ...input, registeredAt });
    await load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Esta acción realiza una baja lógica. ¿Continuar?"))
      return;
    try {
      if (view === "politicos") await api.deletePolitico(id);
      else if (view === "lideres") await api.deleteLider(id);
      else await api.deleteInvitado(id);
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
          <h1>Perfiles y contactos</h1>
          <p>
            {session.user.full_name} · {session.user.role}
          </p>
        </div>
        <button onClick={onBack}>Volver a eventos</button>
      </header>
      <nav className="domain-tabs" aria-label="Módulos de dominio">
        {(["politicos", "lideres", "invitados"] as View[]).map((item) => (
          <button
            className={view === item ? "active" : ""}
            key={item}
            onClick={() => setView(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <PersonForm view={view} onSave={save} />
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <section className="admin-events" aria-live="polite">
        {items.map((item) => (
          <article key={item.id}>
            <p>{item.status ?? "SIN ESTATUS"}</p>
            <h2>
              {item.nombre} {item.apellidoPaterno} {item.apellidoMaterno}
            </h2>
            <p>
              {item.telefono} · {item.municipio ?? "Sin municipio"}
            </p>
            <button onClick={() => void remove(item.id)}>Dar de baja</button>
          </article>
        ))}
        {!error && items.length === 0 && (
          <p>No hay registros disponibles para este perfil.</p>
        )}
      </section>
    </main>
  );
}
