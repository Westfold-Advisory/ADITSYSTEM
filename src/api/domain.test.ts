import assert from "node:assert/strict";
import test from "node:test";

import { DomainApi, mapPerson, mapPersonInput } from "./domain";
import { ApiClient } from "./http";

const person = {
  id: "person-1",
  nombre: "Ada",
  apellido_paterno: "Lovelace",
  apellido_materno: "Byron",
  telefono: "5550101",
  perfil_academico: null,
  equipo: null,
  enlace: null,
  municipio: null,
  distrito: null,
  seccion: null,
  direccion: null,
  latitud: "19.43",
  longitud: "-99.13",
  url_imagen: null,
  url_cv: null,
  estatus: "ACTIVO",
  fecha_registro: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  deleted_at: null,
};

test("maps person fields to the approved Spanish API contract", () => {
  const mapped = mapPerson(person);
  assert.equal(mapped.apellidoPaterno, "Lovelace");
  assert.equal(mapped.latitude, 19.43);
  assert.equal(mapped.cvUrl, null);
  assert.deepEqual(
    mapPersonInput({ nombre: "Ada", apellidoPaterno: "Lovelace" }),
    {
      nombre: "Ada",
      apellido_paterno: "Lovelace",
    },
  );
});

test("document registration never exposes a public file URL", async () => {
  let request: Request | undefined;
  const client = new ApiClient({
    getAccessToken: () => "token",
    fetchFn: async (input, init) => {
      request = new Request(input, init);
      return new Response(
        JSON.stringify({
          id: "doc-1",
          entity_type: "POLITICO",
          entity_id: "person-1",
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
  });
  const doc = await new DomainApi(client).registerDocument({
    entityType: "POLITICO",
    entityId: "person-1",
    type: "CV",
    title: "CV",
    s3Key: "private/person-1/cv.pdf",
    mimeType: "application/pdf",
    sizeBytes: 12,
  });
  assert.equal(doc.title, "CV");
  assert.equal(request?.headers.get("authorization"), "Bearer token");
  assert.deepEqual(await request?.json(), {
    entity_type: "POLITICO",
    entity_id: "person-1",
    tipo: "CV",
    titulo: "CV",
    s3_key: "private/person-1/cv.pdf",
    mime_type: "application/pdf",
    size_bytes: 12,
  });
});
