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

test("createPerson sends TRA-137 credential fields", async () => {
  let body: Record<string, unknown> | undefined;
  const api = new DomainApi(
    new ApiClient({
      getAccessToken: () => "token",
      fetchFn: async (_input, init) => {
        body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(JSON.stringify(person), {
          headers: { "content-type": "application/json" },
        });
      },
    }),
  );
  await api.createPerson(
    {
      nombre: "Ada",
      apellidoPaterno: "Lovelace",
      apellidoMaterno: "Byron",
      telefono: "5550101",
      email: "ada@example.com",
      password: "12345678",
    },
    "ENLACE",
    "parent-1",
  );
  assert.equal(body?.email, "ada@example.com");
  assert.equal(body?.password, "12345678");
  assert.equal(body?.rol, "ENLACE");
});

test("getDocumentDownloadUrl uses descarga route", async () => {
  let request: Request | undefined;
  const api = new DomainApi(
    new ApiClient({
      getAccessToken: () => "token",
      fetchFn: async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({
            url: "https://signed.example/cv.pdf",
            expires_at: "2026-01-01T00:05:00Z",
            file_name: "Currículum",
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    }),
  );
  const result = await api.getDocumentDownloadUrl("person-1", "doc-1");
  assert.equal(result.url, "https://signed.example/cv.pdf");
  assert.equal(result.fileName, "Currículum");
  assert.match(
    request?.url ?? "",
    /\/personas\/person-1\/documentos\/doc-1\/descarga$/,
  );
});

test("changePersonPassword uses credenciales route", async () => {
  let request: Request | undefined;
  const api = new DomainApi(
    new ApiClient({
      getAccessToken: () => "token",
      fetchFn: async (input, init) => {
        request = new Request(input, init);
        return new Response(null, { status: 204 });
      },
    }),
  );
  await api.changePersonPassword("person-1", "12345678");
  assert.match(
    request?.url ?? "",
    /\/personas\/person-1\/credenciales\/contrasena$/,
  );
  assert.equal(request?.method, "PUT");
});
