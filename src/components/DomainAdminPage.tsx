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
import { capabilitiesFor } from "@/lib/capabilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import { Field } from "@/components/ui/Field";
import { directChildren } from "@/lib/hierarchy";
import {
  emptyPersonFilter,
  filterPersonList,
  isPersonFilterActive,
  type PersonFilter,
  type PersonStatusFilter,
} from "@/lib/person-filters";
import { PERSON_STATUSES, type Person, type PersonInput } from "@/types/domain";

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

function nameOf(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function roleLabel(role: Person["role"]): string {
  return role.toLowerCase().replaceAll("_", " ");
}

function PersonForm({
  role,
  parent,
  initialValues = empty,
  submitLabel = "Guardar",
  onSave,
  onCancel,
}: {
  role: Person["role"];
  parent: Person;
  initialValues?: PersonInput;
  submitLabel?: string;
  onSave: (input: PersonInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PersonInput>(initialValues);
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
    <form
      className="domain-form"
      onSubmit={submit}
      aria-label={`Registrar ${roleLabel(role)}`}
    >
      <div>
        <h2>
          {submitLabel === "Guardar" ? "Registrar" : "Editar"} {roleLabel(role)}
        </h2>
        <p className="form-intro">
          Se agregará bajo {nameOf(parent)}. No necesitas capturar un
          identificador.
        </p>
      </div>
      <div className="form-section">
        <p className="eyebrow">Tipo de registro</p>
        <span className="role-chip" data-role={role}>
          {roleLabel(role)}
        </span>
      </div>
      <p className="eyebrow">Datos personales</p>
      <div className="event-form-grid">
        <Field label="Nombre">
          <input
            required
            maxLength={120}
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
          />
        </Field>
        <Field label="Apellido paterno">
          <input
            required
            maxLength={120}
            value={values.apellidoPaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoPaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Apellido materno">
          <input
            required
            maxLength={120}
            value={values.apellidoMaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoMaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Teléfono">
          <input
            required
            maxLength={30}
            value={values.telefono}
            onChange={(e) => setValues({ ...values, telefono: e.target.value })}
          />
        </Field>
      </div>
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <div className="event-form-actions">
        <Button status={saving ? "loading" : "idle"} type="submit">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function TreeNode({
  person,
  selectedId,
  expanded,
  children,
  totalChildren,
  filterActive,
  loading,
  expandedById,
  childrenById,
  totalChildrenById,
  loadingNode,
  onSelect,
  onToggle,
}: {
  person: Person;
  selectedId: string | null;
  expanded: boolean;
  children: Person[] | undefined;
  totalChildren: number | undefined;
  filterActive: boolean;
  loading: boolean;
  expandedById: Record<string, boolean>;
  childrenById: Record<string, Person[]>;
  totalChildrenById: Record<string, Person[]>;
  loadingNode: string | null;
  onSelect: (person: Person) => void;
  onToggle: (person: Person) => void;
}) {
  const hasChildren = person.role !== "AMIGO";
  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selectedId === person.id}
    >
      <div className="tree-node">
        {hasChildren ? (
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`${expanded ? "Contraer" : "Expandir"} ${nameOf(person)}`}
            aria-expanded={expanded}
            status={loading ? "loading" : "idle"}
            onClick={() => onToggle(person)}
          >
            {expanded ? "−" : "+"}
          </Button>
        ) : (
          <span className="tree-spacer" aria-hidden="true" />
        )}
        <button className="tree-person" onClick={() => onSelect(person)}>
          {nameOf(person)} <small>{roleLabel(person.role)}</small>
        </button>
      </div>
      {expanded && (
        <ul role="group">
          {children?.map((child) => (
            <TreeNode
              key={child.id}
              person={child}
              selectedId={selectedId}
              expanded={Boolean(expandedById[child.id])}
              children={childrenById[child.id]}
              totalChildren={totalChildrenById[child.id]?.length}
              filterActive={filterActive}
              loading={loadingNode === child.id}
              expandedById={expandedById}
              childrenById={childrenById}
              totalChildrenById={totalChildrenById}
              loadingNode={loadingNode}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
          {!loading && children?.length === 0 && (
            <li className="tree-empty">
              {filterActive && (totalChildren ?? 0) > 0
                ? "Ningún descendiente coincide con el filtro."
                : "Sin descendientes."}
            </li>
          )}
        </ul>
      )}
    </li>
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
  const api = useMemo(
    () =>
      new DomainApi(
        new ApiClient({ getAccessToken: () => session.access_token }),
      ),
    [session.access_token],
  );
  const [self, setSelf] = useState<Person | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const [children, setChildren] = useState<Record<string, Person[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingNode, setLoadingNode] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Awaited<
    ReturnType<DomainApi["metrics"]>
  > | null>(null);
  const [scopedMap, setScopedMap] = useState<Awaited<
    ReturnType<DomainApi["scopedMap"]>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState<PersonFilter>(emptyPersonFilter);
  const filterActive = isPersonFilterActive(filter);
  const filteredChildren = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(children).map(([id, list]) => [
          id,
          filterPersonList(list, filter),
        ]),
      ),
    [children, filter],
  );
  const breadcrumb = useMemo(() => {
    if (!self || !selected) return [];
    const byId = new Map(
      [self, ...Object.values(children).flat()].map((person) => [
        person.id,
        person,
      ]),
    );
    const path: Person[] = [];
    for (
      let current: Person | undefined = selected;
      current;
      current = current.parentId ? byId.get(current.parentId) : undefined
    )
      path.unshift(current);
    return path.length ? path : [selected];
  }, [children, selected, self]);

  const loadChildren = useCallback(
    async (person: Person) => {
      setLoadingNode(person.id);
      setError(null);
      try {
        const descendants = await api.listDescendants(person.id);
        setChildren((current) => ({
          ...current,
          [person.id]: directChildren(descendants, person.id),
        }));
      } catch (reason) {
        setError(message(reason));
      } finally {
        setLoadingNode(null);
      }
    },
    [api],
  );
  const select = useCallback((person: Person) => {
    setSelected(person);
    setCreating(false);
    setEditing(false);
  }, []);
  const toggle = useCallback(
    (person: Person) => {
      const next = !expanded[person.id];
      setExpanded((current) => ({ ...current, [person.id]: next }));
      if (next && !children[person.id]) void loadChildren(person);
    },
    [children, expanded, loadChildren],
  );

  useEffect(() => {
    void (async () => {
      setError(null);
      try {
        const current = await api.getPerson(session.user.persona_id);
        setSelf(current);
        setSelected(current);
        setExpanded({ [current.id]: true });
        await loadChildren(current);
      } catch (reason) {
        setError(message(reason));
      }
    })();
  }, [api, loadChildren, session.user.persona_id]);
  useEffect(() => {
    if (!selected) return;
    void api
      .metrics(selected.id)
      .then(setMetrics)
      .catch((reason) => setError(message(reason)));
    void api
      .scopedMap(selected.id)
      .then(setScopedMap)
      .catch((reason) => setError(message(reason)));
  }, [api, selected]);

  const createChild = async (input: PersonInput) => {
    if (!selected || !capabilities.childRole) return;
    await api.createPerson(
      input,
      capabilities.childRole,
      capabilities.childRole === "COORDINADOR_GENERAL" ? null : selected.id,
    );
    setCreating(false);
    await loadChildren(selected);
    setExpanded((current) => ({ ...current, [selected.id]: true }));
  };
  const updatePerson = async (input: PersonInput) => {
    if (!selected) return;
    const updated = await api.updatePerson(selected.id, input);
    setSelected(updated);
    setChildren((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, items]) => [
          id,
          items.map((person) => (person.id === updated.id ? updated : person)),
        ]),
      ),
    );
    if (self?.id === updated.id) setSelf(updated);
    setEditing(false);
  };
  const canManageSelected = (person: Person) =>
    person.id === self?.id ||
    (capabilities.canCreateChild && person.role === capabilities.childRole);
  const remove = async () => {
    if (
      !selected ||
      selected.id === session.user.persona_id ||
      !window.confirm(
        `Dar de baja a ${nameOf(selected)}? Esta operación es una baja lógica.`,
      )
    )
      return;
    try {
      await api.deletePerson(selected.id);
      setChildren((current) =>
        Object.fromEntries(
          Object.entries(current).map(([id, items]) => [
            id,
            items.filter((item) => item.id !== selected.id),
          ]),
        ),
      );
      setSelected(self);
    } catch (reason) {
      setError(message(reason));
    }
  };

  if (!capabilities.canViewStructure)
    return (
      <main className="admin-page">
        <ErrorState message="Tu rol no tiene acceso a la estructura." />
      </main>
    );
  return (
    <main className="admin-page hierarchy-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">ADIT SYSTEM</p>
          <h1>Estructura de personas</h1>
          <p>
            {session.user.email} · alcance {roleLabel(session.user.rol)}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Eventos
        </Button>
      </header>
      <p className="request-message">
        Las acciones disponibles dependen de tu alcance. El backend valida rol y
        pertenencia en cada solicitud.
      </p>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => self && void loadChildren(self)}
        />
      )}
      {!self ? (
        <LoadingState label="Cargando estructura…" />
      ) : (
        <div className="hierarchy-layout">
          <section
            className="hierarchy-tree-panel"
            aria-labelledby="structure-title"
          >
            <h2 id="structure-title">Tu estructura</h2>
            <div className="tree-filter-bar">
              <Field label="Buscar por nombre">
                <input
                  type="search"
                  value={filter.text}
                  placeholder="Nombre o apellido"
                  onChange={(event) =>
                    setFilter((current) => ({
                      ...current,
                      text: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Estado">
                <select
                  value={filter.status}
                  onChange={(event) =>
                    setFilter((current) => ({
                      ...current,
                      status: event.target.value as PersonStatusFilter,
                    }))
                  }
                >
                  <option value="TODOS">Todos</option>
                  {PERSON_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </Field>
              {filterActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(emptyPersonFilter)}
                >
                  Limpiar filtro
                </Button>
              )}
            </div>
            <ul role="tree" aria-busy={loadingNode === self.id}>
              <TreeNode
                person={self}
                selectedId={selected?.id ?? null}
                expanded={Boolean(expanded[self.id])}
                children={filteredChildren[self.id]}
                totalChildren={children[self.id]?.length}
                filterActive={filterActive}
                loading={loadingNode === self.id}
                expandedById={expanded}
                childrenById={filteredChildren}
                totalChildrenById={children}
                loadingNode={loadingNode}
                onSelect={select}
                onToggle={toggle}
              />
            </ul>
          </section>
          <section aria-live="polite">
            {selected ? (
              <Card className="person-detail">
                <nav aria-label="Ruta de la persona" className="breadcrumbs">
                  {breadcrumb.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 && <span aria-hidden="true">› </span>}
                      {nameOf(person)}
                    </span>
                  ))}
                </nav>
                <p className="eyebrow">{selected.status}</p>
                <h2>{nameOf(selected)}</h2>
                <p>{selected.telefono}</p>
                <dl className="person-metrics">
                  <div>
                    <dt>Descendientes</dt>
                    <dd>{metrics?.descendants ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Coordinadores</dt>
                    <dd>{metrics?.coordinators ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Enlaces</dt>
                    <dd>{metrics?.links ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Amigos</dt>
                    <dd>{metrics?.friends ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Documentos</dt>
                    <dd>{metrics?.documents ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Eventos</dt>
                    <dd>{metrics?.createdEvents ?? "—"}</dd>
                  </div>
                </dl>
                <section
                  aria-labelledby="scoped-map-title"
                  className="scoped-map"
                >
                  <h3 id="scoped-map-title">Territorio en tu alcance</h3>
                  <p className="form-intro">
                    Geocercas asignadas a personas dentro del subárbol
                    seleccionado. No incluye coordenadas personales ni datos
                    fuera de tu scope.
                  </p>
                  {!scopedMap ? (
                    <LoadingState label="Cargando mapa scoped…" />
                  ) : scopedMap.people.every(
                      (person) => person.geofences.length === 0,
                    ) ? (
                    <EmptyState>
                      No hay geocercas asignadas en este alcance.
                    </EmptyState>
                  ) : (
                    <ul className="scoped-map-list">
                      {scopedMap.people
                        .filter((person) => person.geofences.length > 0)
                        .map((person) => (
                          <li key={person.personId}>
                            <strong>{nameOf(person)}</strong>{" "}
                            <span className="role-chip" data-role={person.role}>
                              {roleLabel(person.role)}
                            </span>
                            <ul>
                              {person.geofences.map((geofence) => (
                                <li key={`${person.personId}-${geofence.id}`}>
                                  {geofence.type}: {geofence.name}
                                  {geofence.code ? ` (${geofence.code})` : ""}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                    </ul>
                  )}
                </section>
                <div className="event-card-actions">
                  {capabilities.canCreateChild &&
                    selected.id === self.id &&
                    capabilities.childRole &&
                    selected.role !== "AMIGO" && (
                      <Button onClick={() => setCreating(true)}>
                        Registrar {roleLabel(capabilities.childRole)}
                      </Button>
                    )}
                  {canManageSelected(selected) && (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Editar datos
                    </Button>
                  )}
                  {selected.id !== session.user.persona_id &&
                    canManageSelected(selected) && (
                      <Button
                        variant="destructive"
                        onClick={() => void remove()}
                      >
                        Dar de baja
                      </Button>
                    )}
                </div>
              </Card>
            ) : (
              <EmptyState>Selecciona una persona de la estructura.</EmptyState>
            )}
            {creating && selected && capabilities.childRole && (
              <PersonForm
                role={capabilities.childRole}
                parent={selected}
                onSave={createChild}
                onCancel={() => setCreating(false)}
              />
            )}
            {editing && selected && (
              <PersonForm
                role={selected.role}
                parent={selected}
                initialValues={{
                  nombre: selected.nombre,
                  apellidoPaterno: selected.apellidoPaterno,
                  apellidoMaterno: selected.apellidoMaterno,
                  telefono: selected.telefono,
                }}
                submitLabel="Actualizar"
                onSave={updatePerson}
                onCancel={() => setEditing(false)}
              />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
