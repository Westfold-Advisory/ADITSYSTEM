import assert from "node:assert/strict";
import test from "node:test";

import { DomainApi, mapPerson, mapPersonInput } from "./domain";
import { ApiClient } from "./http";

const person = {
  id: "person-1",
  rol: "COORDINADOR",
  parent_persona_id: "parent-1",
  nombre: "Ada",
  apellido_paterno: "Lovelace",
  apellido_materno: "Byron",
  telefono: "5550101",
  estatus: "ACTIVO",
  fecha_registro: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
} as const;

test("maps the final Persona schema and sends only documented write fields", () => {
  const mapped = mapPerson(person);
  assert.equal(mapped.role, "COORDINADOR");
  assert.equal(mapped.parentId, "parent-1");
  assert.deepEqual(
    mapPersonInput({ nombre: "Ada", apellidoPaterno: "Lovelace" }),
    { nombre: "Ada", apellido_paterno: "Lovelace" },
  );
});

test("registers a private document below its persona route", async () => {
  let request: Request | undefined;
  const api = new DomainApi(
    new ApiClient({
      getAccessToken: () => "token",
      fetchFn: async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            id: "doc-1",
            persona_id: "person-1",
            tipo: "CV",
            titulo: "CV",
            version: 1,
            mime_type: "application/pdf",
            size_bytes: 12,
            is_current: true,
            created_at: "2026-01-01T00:00:00Z",
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    }),
  );
  const doc = await api.registerDocument("person-1", {
    type: "CV",
    title: "CV",
    s3Key: "private/person-1/cv.pdf",
    mimeType: "application/pdf",
    sizeBytes: 12,
  });
  assert.equal(doc.personId, "person-1");
  assert.equal(request?.url.endsWith("/personas/person-1/documentos"), true);
  assert.equal(request?.headers.get("authorization"), "Bearer token");
});
