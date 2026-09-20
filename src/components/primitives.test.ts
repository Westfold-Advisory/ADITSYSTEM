import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Alert } from "./ui/Alert";
import { LoadingState } from "./ui/AsyncState";
import { Button } from "./ui/button";
import { Field } from "./ui/Field";
import { HierarchyTree, HierarchyTreeNode } from "./ui/HierarchyTree";
import { MetricGrid } from "./ui/MetricGrid";
import { RoleChip } from "./ui/RoleChip";
import type { Person } from "@/types/domain";
import {
  EventDetailSkeleton,
  EventFormSkeleton,
  EventListSkeleton,
  MapControlsSkeleton,
  ResultsPanelSkeleton,
} from "./ui/Skeleton";

test("critical primitives expose semantic states and accessible labels", () => {
  const field = renderToStaticMarkup(
    createElement(
      Field,
      { label: "Correo", error: "Formato inválido" },
      createElement("input", { type: "email" }),
    ),
  );
  assert.match(field, /<label for="_R_0_">Correo<\/label>/);
  assert.match(field, /aria-invalid="true"/);
  assert.match(field, /aria-describedby="_R_0_-error"/);

  const error = renderToStaticMarkup(
    createElement(Alert, { tone: "error" }, "Intenta de nuevo."),
  );
  assert.match(error, /role="alert"/);
});

test("button lifecycle preserves its label and only disables the pending action", () => {
  const button = renderToStaticMarkup(
    createElement(
      Button,
      { variant: "destructive", status: "loading" },
      "Eliminar",
    ),
  );
  assert.match(button, /disabled=""/);
  assert.match(button, /aria-busy="true"/);
  assert.match(button, /Eliminar/);
  assert.match(button, /Acción en progreso/);
  assert.match(button, /focus-visible/);

  const loading = renderToStaticMarkup(
    createElement(LoadingState, { label: "Guardando…" }),
  );
  assert.match(loading, /role="status"/);
  assert.match(loading, /Guardando/);
  assert.match(loading, /ui-skeleton-results/);
});

test("motion tokens and feedback do not force animation for reduced motion", () => {
  const tokens = readFileSync(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  const primitives = readFileSync(
    new URL("../styles/primitives.css", import.meta.url),
    "utf8",
  );
  assert.match(tokens, /prefers-reduced-motion: reduce/);
  assert.match(tokens, /--md-sys-motion-fast: 0ms/);
  assert.match(primitives, /\.ui-button-progress/);
  assert.doesNotMatch(
    primitives.match(/\.ui-button-progress\s*\{[^}]*\}/)?.[0] ?? "",
    /animation:/,
  );
});

test("admin structure components expose tree semantics and role labels", () => {
  const chip = renderToStaticMarkup(createElement(RoleChip, { role: "AMIGO" }));
  assert.match(chip, /ui-role-chip/);
  assert.match(chip, /data-role="AMIGO"/);
  assert.match(chip, /amigo/);

  const metrics = renderToStaticMarkup(
    createElement(MetricGrid, {
      items: [{ label: "Eventos", value: 3 }],
      columns: 2,
    }),
  );
  assert.match(metrics, /ui-metric-grid/);
  assert.match(metrics, /data-columns="2"/);
  assert.match(metrics, /<dt>Eventos<\/dt>/);

  const person = {
    id: "00000000-0000-4000-8000-000000000001",
    role: "ENLACE",
    nombre: "Ana",
    apellidoPaterno: "López",
    apellidoMaterno: "Ruiz",
    telefono: "555",
    parentId: null,
    status: "ACTIVO",
    registeredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies Person;

  const tree = renderToStaticMarkup(
    createElement(
      HierarchyTree,
      { busy: true },
      createElement(HierarchyTreeNode, {
        person,
        selectedId: person.id,
        expanded: false,
        children: [],
        totalChildren: 0,
        filterActive: false,
        loading: false,
        expandedById: {},
        childrenById: {},
        totalChildrenById: {},
        loadingNode: null,
        onSelect: () => {},
        onToggle: () => {},
      }),
    ),
  );
  assert.match(tree, /role="tree"/);
  assert.match(tree, /aria-busy="true"/);
  assert.match(tree, /role="treeitem"/);
  assert.match(tree, /ui-hierarchy-tree-person/);
});

test("admin component styles avoid legacy hierarchy and metric classes in App.css", () => {
  const appStyles = readFileSync(
    new URL("../App.css", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(appStyles, /\.person-metrics\b/);
  assert.doesNotMatch(appStyles, /\.role-chip\b/);
  assert.doesNotMatch(appStyles, /\.tree-filter-bar\b/);
  assert.doesNotMatch(appStyles, /\.tree-person\b/);
});

test("skeleton primitives reserve content geometry without misleading text", () => {
  const skeletons = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(EventListSkeleton),
      createElement(ResultsPanelSkeleton),
      createElement(EventDetailSkeleton),
      createElement(EventFormSkeleton),
      createElement(MapControlsSkeleton),
    ),
  );
  assert.match(skeletons, /ui-skeleton-card/);
  assert.match(skeletons, /ui-skeleton-form/);
  assert.match(skeletons, /ui-skeleton-map-controls/);
  assert.doesNotMatch(skeletons, /Cargando|evento|resultado/i);
});
