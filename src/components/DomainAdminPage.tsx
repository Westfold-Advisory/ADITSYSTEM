import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs } from "radix-ui";

import { DomainApi } from "@/api/domain";
import { ApiClient } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { HierarchyMasterDetail } from "@/components/admin/HierarchyMasterDetail";
import { HierarchyTreePanel } from "@/components/admin/HierarchyTree";
import { PersonDetailPanel } from "@/components/admin/PersonDetailPanel";
import { PersonDirectoryTable } from "@/components/admin/PersonDirectoryTable";
import { PersonOrgChartView } from "@/components/admin/PersonOrgChartView";
import { apiErrorMessage } from "@/components/admin/person-display";
import { capabilitiesFor } from "@/lib/capabilities";
import { canRegisterDocuments } from "@/lib/document-access";
import type { PersonCreateOption } from "@/lib/person-provisioning";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { useHierarchyScope } from "@/hooks/useHierarchyScope";
import {
  ancestorIdsToExpandForFilter,
  emptyPersonFilter,
  filterChildMapForTree,
  filterTreeSelectionTarget,
  isPersonFilterActive,
  type PersonFilter,
} from "@/lib/person-filters";
import { collectPeopleInScope } from "@/lib/person-scope";
import type { Person, PersonInput, PersonProvisionInput } from "@/types/domain";

type StructureView = "arbol" | "listado" | "organigrama";

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
    clearSelection,
  } = useHierarchyScope(api, session.user.persona_id);
  const isAdmin = session.user.rol === "ADMIN";
  const [structureView, setStructureView] = useState<StructureView>(() =>
    isAdmin ? "listado" : "arbol",
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
  const [filter, setFilter] = useState<PersonFilter>(emptyPersonFilter);
  const filterActive = isPersonFilterActive(filter);
  const filteredChildren = useMemo(
    () => (self ? filterChildMapForTree(self, children, filter) : children),
    [children, filter, self],
  );
  const peopleInScope = useMemo(
    () => (self ? collectPeopleInScope(self, children) : []),
    [children, self],
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

  const dismissAltDetail = useCallback(() => {
    clearSelection();
    setCreating(false);
    setEditing(false);
    setChangingPassword(false);
  }, [clearSelection, setCreating, setEditing, setChangingPassword]);

  const altDetailOpen =
    (structureView === "listado" || structureView === "organigrama") &&
    Boolean(selected);

  const applyTreeFilter = useCallback(
    (next: PersonFilter) => {
      if (!self) return;
      for (const ancestorId of ancestorIdsToExpandForFilter(
        self,
        children,
        next,
      )) {
        expandNode(ancestorId);
      }
      const target = filterTreeSelectionTarget(self, children, next, selected);
      if (target && target.id !== selected?.id) {
        select(target);
      }
    },
    [children, expandNode, select, selected, self],
  );

  const handleFilterChange = useCallback(
    (next: PersonFilter) => {
      setFilter(next);
      if (structureView === "arbol") {
        applyTreeFilter(next);
      }
    },
    [applyTreeFilter, structureView, setFilter],
  );

  useEffect(() => {
    if (!self || !filterActive || structureView !== "arbol") return;
    for (const ancestorId of ancestorIdsToExpandForFilter(
      self,
      children,
      filter,
    )) {
      expandNode(ancestorId);
    }
  }, [children, expandNode, filter, filterActive, self, structureView]);

  useEffect(() => {
    if (!self) return;
    if (structureView === "listado" || structureView === "organigrama") {
      clearSelection();
    }
  }, [clearSelection, self, structureView]);

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
      onFilterChange={handleFilterChange}
      onClearFilter={() => handleFilterChange(emptyPersonFilter)}
      onSelect={select}
      onToggle={toggle}
      hideRoot={isAdmin}
    />
  );

  const detailPanel = selected ? (
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
  ) : null;

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
        <>
          <Tabs.Root
            className="hierarchy-tabs hierarchy-view-tabs"
            value={structureView}
            onValueChange={(value) => {
              const next = value as StructureView;
              setStructureView(next);
              if (next === "listado" || next === "organigrama") {
                dismissAltDetail();
              }
              if (next === "arbol") {
                if (self) resetSelectionToRoot();
                if (isPersonFilterActive(filter)) {
                  applyTreeFilter(filter);
                }
              }
            }}
          >
            <Tabs.List aria-label="Formato de personas">
              <Tabs.Trigger value="listado">Listado</Tabs.Trigger>
              <Tabs.Trigger value="arbol">Árbol y detalle</Tabs.Trigger>
              <Tabs.Trigger value="organigrama">Organigrama</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {structureView === "arbol" ? (
            <HierarchyMasterDetail
              treePanel={treePanel}
              hasSelection={Boolean(selected)}
              treeSheetOpen={treeSheetOpen}
              onOpenTreeSheet={() => setTreeSheetOpen(true)}
              onCloseTreeSheet={() => setTreeSheetOpen(false)}
              detailPanel={detailPanel}
            />
          ) : (
            <div
              className={`hierarchy-alt-layout hierarchy-alt-layout--${structureView}${altDetailOpen ? " hierarchy-alt-layout--detail-open" : ""}`}
            >
              <div className="hierarchy-alt-primary">
                {structureView === "listado" ? (
                  <PersonDirectoryTable
                    actor={self}
                    people={peopleInScope}
                    selectedId={selected?.id ?? null}
                    filter={filter}
                    onFilterChange={setFilter}
                    onClearFilter={() => setFilter(emptyPersonFilter)}
                    onSelect={select}
                  />
                ) : (
                  <PersonOrgChartView
                    root={self}
                    childrenById={children}
                    selectedId={selected?.id ?? null}
                    onSelect={select}
                  />
                )}
              </div>
              {altDetailOpen && selected ? (
                <section
                  className="hierarchy-detail-section hierarchy-detail-drawer"
                  aria-live="polite"
                  aria-label="Detalle de la persona seleccionada"
                >
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
                    onDismiss={dismissAltDetail}
                  />
                </section>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
