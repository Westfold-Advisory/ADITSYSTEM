import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPrivateObjectKey,
  currentDocumentOfType,
  documentTypeLabel,
} from "./document-display";
import type { Documento } from "@/types/domain";

test("documentTypeLabel returns Spanish labels", () => {
  assert.equal(documentTypeLabel("CV"), "Currículum");
  assert.equal(documentTypeLabel("FOTO"), "Fotografía");
});

test("buildPrivateObjectKey never exposes user-facing paths with unsafe characters", () => {
  const key = buildPrivateObjectKey("person-1", "CV", "mi cv (1).pdf");
  assert.match(key, /^personas\/person-1\/cv\/[0-9a-f-]+\/mi_cv__1_.pdf$/);
  assert.doesNotMatch(key, /[() ]/);
});

test("currentDocumentOfType picks the current version", () => {
  const docs: Documento[] = [
    {
      id: "1",
      personId: "p",
      type: "FOTO",
      title: "Anterior",
      version: 1,
      mimeType: "image/jpeg",
      sizeBytes: 100,
      isCurrent: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      personId: "p",
      type: "FOTO",
      title: "Actual",
      version: 2,
      mimeType: "image/jpeg",
      sizeBytes: 200,
      isCurrent: true,
      createdAt: new Date(),
    },
  ];
  assert.equal(currentDocumentOfType(docs, "FOTO")?.title, "Actual");
});
