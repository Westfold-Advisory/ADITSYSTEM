import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { HierarchyMasterDetail } from "@/components/admin/HierarchyMasterDetail";
import { HierarchyTreePanel } from "@/components/admin/HierarchyTree";
import { PersonDetailPanel } from "@/components/admin/PersonDetailPanel";
import { PersonDirectoryTable } from "@/components/admin/PersonDirectoryTable";
import { PersonOrgChartView } from "@/components/admin/PersonOrgChartView";
import {
  PersonasViewNav,
  type PersonasStructureView,
} from "@/components/admin/PersonasViewNav";
import { AdminWorkspaceShell } from "@/components/admin/AdminWorkspaceShell";
import { apiErrorMessage, nameOf } from "@/components/admin/person-display";
import { adminUiCopy } from "@/content/admin-ui-es";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { capabilitiesFor } from "@/lib/capabilities";
import { canRegisterDocuments } from "@/lib/document-access";
import {
  buildKnownPersonsForDocumentAccess,
  buildPersonBreadcrumb,
  canManagePerson,
} from "@/lib/person-detail-context";
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
import { adminUserDisplayName } from "@/lib/admin-user-display";
import { collectPeopleInScope } from "@/lib/person-scope";
import type { Person, PersonInput, PersonProvisionInput } from "@/types/domain";

export function DomainAdminPage({
  session,
  onSignOut,
  pageHeader,
}: {
  session: LoginResponse;
  onSignOut: () => void;
  pageHeader?: ReactNode;
}) {
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
  const [structureView, setStructureView] = useState<PersonasStructureView>(
    () => (isAdmin ? "listado" : "arbol"),
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
  const [filter, setFilter] = useState<PersonFilter>(emptyPersonFilter);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  const drawerReturnFocusRef = useRef<HTMLElement | null>(null);
  const filterActive = isPersonFilterActive(filter);
  const filteredChildren = useMemo(
    () => (self ? filterChildMapForTree(self, children, filter) : children),
    [children, filter, self],
  );
  const peopleInScope = useMemo(
    () => (self ? collectPeopleInScope(self, children) : []),
    [children, self],
  );

  const treeKnownById = useMemo(() => {
    if (!self) return new Map<string, Person>();
    return new Map(
      [self, ...Object.values(children).flat()].map((person) => [
        person.id,
        person,
      ]),
    );
  }, [children, self]);

  const breadcrumb = useMemo(() => {
    if (!selected) return [];
    return buildPersonBreadcrumb(selected, treeKnownById);
  }, [selected, treeKnownById]);

  const select = useCallback(
    (person: Person) => {
      if (document.activeElement instanceof HTMLElement) {
        drawerReturnFocusRef.current = document.activeElement;
      }
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

  const changeStructureView = useCallback(
    (next: PersonasStructureView) => {
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
    },
    [applyTreeFilter, dismissAltDetail, filter, resetSelectionToRoot, self],
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
    canManagePerson(person, self, capabilities);

  const canRegisterDocumentsForSelected =
    self && selected
      ? canRegisterDocuments(
          session.user.rol,
          capabilities,
          self,
          selected,
          buildKnownPersonsForDocumentAccess(self, selected, []),
        )
      : false;
  const requestRemove = () => {
    if (!selected || selected.id === session.user.persona_id) return;
    setRemoveConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!selected || selected.id === session.user.persona_id) {
      setRemoveConfirmOpen(false);
      return;
    }
    setRemoveBusy(true);
    try {
      await api.deletePerson(selected.id);
      removePersonFromTree(selected.id);
      if (structureView === "arbol") {
        resetSelectionToRoot();
      } else {
        clearSelection();
      }
      setRemoveConfirmOpen(false);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setRemoveBusy(false);
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
      onRemove={requestRemove}
    />
  ) : null;

  const personasContent = (
    <>
      <p className="request-message">{adminUiCopy.personas.scopeNotice}</p>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => self && void refreshDescendants(self)}
        />
      )}
      {!self ? (
        <LoadingState label={adminUiCopy.personas.loadingStructure} />
      ) : (
        <>
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
                <Drawer
                  open
                  onDismiss={dismissAltDetail}
                  ariaLabel="Detalle de la persona seleccionada"
                  returnFocusRef={drawerReturnFocusRef}
                  className="hierarchy-detail-section"
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
                    onRemove={requestRemove}
                    onDismiss={dismissAltDetail}
                  />
                </Drawer>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <AdminWorkspaceShell
      header={pageHeader}
      subNav={
        <PersonasViewNav value={structureView} onChange={changeStructureView} />
      }
      userDisplayName={adminUserDisplayName(session.user.email, self)}
      userEmail={session.user.email}
      userRole={session.user.rol}
      onSignOut={onSignOut}
    >
      {personasContent}
      <ConfirmDialog
        open={removeConfirmOpen && Boolean(selected)}
        title={adminUiCopy.destructive.removePersonTitle}
        description={
          selected ? (
            <>
              <p>
                {adminUiCopy.destructive.removePersonConfirm(nameOf(selected))}
              </p>
              <p>{adminUiCopy.destructive.removePersonConsequence}</p>
            </>
          ) : null
        }
        confirmLabel={adminUiCopy.destructive.confirmLabel}
        cancelLabel={adminUiCopy.destructive.cancelLabel}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveConfirmOpen(false)}
        busy={removeBusy}
      />
    </AdminWorkspaceShell>
  );
}
