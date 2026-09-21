import { useCallback, useMemo, useState } from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { HierarchyMasterDetail } from "@/components/admin/HierarchyMasterDetail";
import { HierarchyTreePanel } from "@/components/admin/HierarchyTree";
import { PersonDetailPanel } from "@/components/admin/PersonDetailPanel";
import { apiErrorMessage } from "@/components/admin/person-display";
import { capabilitiesFor } from "@/lib/capabilities";
import { canRegisterDocuments } from "@/lib/document-access";
import type { PersonCreateOption } from "@/lib/person-provisioning";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { useHierarchyScope } from "@/hooks/useHierarchyScope";
import {
  emptyPersonFilter,
  filterPersonList,
  isPersonFilterActive,
  type PersonFilter,
} from "@/lib/person-filters";
import type { Person, PersonInput, PersonProvisionInput } from "@/types/domain";

export function DomainAdminPage({ session }: { session: LoginResponse }) {
  const capabilities = capabilitiesFor(session.user.rol);
  const api = useMemo(
    () =>
      new DomainApi(
        new ApiClient({ getAccessToken: () => session.access_token }),
      ),
    [session.access_token],
  );
  const {
    self,
    selected,
    select: selectPerson,
    childrenById: children,
    expanded,
    loadingNode,
    metrics,
    scopedMap,
    error,
    setError,
    refreshDescendants,
    toggle,
    expandNode,
    applyPersonUpdate,
    removePersonFromTree,
    resetSelectionToRoot,
  } = useHierarchyScope(api, session.user.persona_id);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
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

  const select = useCallback(
    (person: Person) => {
      selectPerson(person);
      setCreating(false);
      setEditing(false);
      setChangingPassword(false);
      setTreeSheetOpen(false);
    },
    [
      selectPerson,
      setCreating,
      setEditing,
      setChangingPassword,
      setTreeSheetOpen,
    ],
  );

  const createChild = async (
    input: PersonProvisionInput,
    option: PersonCreateOption,
  ) => {
    if (!selected) return;
    const parentForRefresh = option.parentPerson ?? selected;
    await api.createPerson(input, option.role, option.parentId);
    setCreating(false);
    await refreshDescendants(parentForRefresh);
    if (option.parentId) expandNode(option.parentId);
    else if (self) expandNode(self.id);
  };

  const updatePerson = async (input: PersonInput) => {
    if (!selected) return;
    const updated = await api.updatePerson(selected.id, input);
    applyPersonUpdate(updated);
    setEditing(false);
  };

  const changePassword = async (newPassword: string) => {
    if (!selected) return;
    await api.changePersonPassword(selected.id, newPassword);
    setChangingPassword(false);
  };

  const canManageSelected = (person: Person) =>
    person.id === self?.id ||
    (capabilities.canCreateChild && person.role === capabilities.childRole);

  const knownPersons = useMemo(() => {
    if (!self) return new Map<string, Person>();
    return new Map(
      [self, ...Object.values(children).flat()].map((person) => [
        person.id,
        person,
      ]),
    );
  }, [children, self]);
  const canRegisterDocumentsForSelected =
    self && selected
      ? canRegisterDocuments(
          session.user.rol,
          capabilities,
          self,
          selected,
          knownPersons,
        )
      : false;
  const remove = async () => {
    if (
      !selected ||
      selected.id === session.user.persona_id ||
      !window.confirm(
        `Dar de baja a ${selected.nombre}? Esta operación es una baja lógica.`,
      )
    )
      return;
    try {
      await api.deletePerson(selected.id);
      removePersonFromTree(selected.id);
      resetSelectionToRoot();
    } catch (reason) {
      setError(apiErrorMessage(reason));
    }
  };

  if (!capabilities.canViewStructure)
    return (
      <main className="admin-page">
        <ErrorState message="Tu rol no tiene acceso a la estructura." />
      </main>
    );

  const treePanel = self && (
    <HierarchyTreePanel
      self={self}
      selectedId={selected?.id ?? null}
      filter={filter}
      filterActive={filterActive}
      filteredChildren={filteredChildren}
      children={children}
      expanded={expanded}
      loadingNode={loadingNode}
      onFilterChange={setFilter}
      onClearFilter={() => setFilter(emptyPersonFilter)}
      onSelect={select}
      onToggle={toggle}
    />
  );

  return (
    <>
      <p className="request-message">
        Las acciones disponibles dependen de tu alcance. El backend valida rol y
        pertenencia en cada solicitud.
      </p>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => self && void refreshDescendants(self)}
        />
      )}
      {!self ? (
        <LoadingState label="Cargando estructura…" />
      ) : (
        <HierarchyMasterDetail
          treePanel={treePanel}
          hasSelection={Boolean(selected)}
          treeSheetOpen={treeSheetOpen}
          onOpenTreeSheet={() => setTreeSheetOpen(true)}
          onCloseTreeSheet={() => setTreeSheetOpen(false)}
          detailPanel={
            selected ? (
              <PersonDetailPanel
                selected={selected}
                breadcrumb={breadcrumb}
                metrics={metrics}
                scopedMap={scopedMap}
                api={api}
                actorRole={session.user.rol}
                sessionPersonId={session.user.persona_id}
                canManageSelected={canManageSelected}
                canRegisterDocuments={canRegisterDocumentsForSelected}
                creating={creating}
                editing={editing}
                changingPassword={changingPassword}
                onNavigateBreadcrumb={select}
                onStartCreate={() => {
                  setCreating(true);
                  setEditing(false);
                  setChangingPassword(false);
                }}
                onStartEdit={() => {
                  setEditing(true);
                  setCreating(false);
                  setChangingPassword(false);
                }}
                onStartChangePassword={() => {
                  setChangingPassword(true);
                  setCreating(false);
                  setEditing(false);
                }}
                onCancelForm={() => {
                  setCreating(false);
                  setEditing(false);
                  setChangingPassword(false);
                }}
                onCreate={createChild}
                onUpdate={updatePerson}
                onChangePassword={changePassword}
                onRemove={() => void remove()}
              />
            ) : null
          }
        />
      )}
    </>
  );
}
