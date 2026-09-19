/** Local-only demo API. Enabled with VITE_USE_MOCK_API=true. */
const now = "2026-09-19T12:00:00.000Z";
const headers = { "content-type": "application/json" };

const event = {
  id: "e0000000-0000-4000-8000-000000000001",
  created_by: "a0000000-0000-4000-8000-000000000001",
  tipo: "Reunión vecinal",
  nombre: "Foro comunitario de movilidad",
  descripcion: "Conversación abierta sobre prioridades de la colonia.",
  latitud: 19.4326,
  longitud: -99.1332,
  ubicacion_texto: "Centro comunitario",
  url_mapa: null,
  fecha_inicio: "2026-10-01T18:00:00.000Z",
  fecha_fin: "2026-10-01T20:00:00.000Z",
  estatus: "PUBLICADO",
  capacidad_maxima: 100,
  requiere_checkin: false,
  checkin_abierto_desde: null,
  checkin_abierto_hasta: null,
  checkin_radio_metros: null,
  version: 1,
  created_at: now,
  updated_at: now,
  deleted_at: null,
};

const person = (id: string, nombre: string, paterno: string, extra = {}) => ({
  id,
  nombre,
  apellido_paterno: paterno,
  apellido_materno: "Demo",
  telefono: "555 010 0000",
  perfil_academico: "Perfil de demostración",
  equipo: "Equipo territorial",
  enlace: null,
  municipio: "Ciudad de México",
  distrito: "Distrito 1",
  seccion: "0001",
  direccion: "Dirección de demostración",
  latitud: 19.4326,
  longitud: -99.1332,
  url_imagen: null,
  url_cv: null,
  url_mapa: null,
  estatus: "ACTIVO",
  fecha_registro: now,
  created_at: now,
  updated_at: now,
  deleted_at: null,
  ...extra,
});

const politicos = [
  person("p0000000-0000-4000-8000-000000000001", "Andrea", "Ramírez"),
];
const lideres = [
  person("l0000000-0000-4000-8000-000000000001", "Luis", "Santos", {
    politico_id: politicos[0].id,
  }),
];
const invitados = [
  person("i0000000-0000-4000-8000-000000000001", "María", "Torres", {
    lider_id: lideres[0].id,
    fuente_registro: "DEMO",
    asistencias_totales: 2,
    ultimo_evento: now,
  }),
];
const events = [event];

function json(data: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers,
  });
}

async function body(init?: RequestInit): Promise<Record<string, unknown>> {
  return init?.body
    ? (JSON.parse(String(init.body)) as Record<string, unknown>)
    : {};
}

function notFound() {
  return json({ detail: "Recurso de demostración no encontrado." }, 404);
}

export async function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(String(input));
  const path = url.pathname.replace(/^.*\/api\/v1/, "");
  const method = (init?.method ?? "GET").toUpperCase();
  if (path === "/auth/login" && method === "POST") {
    const payload = await body(init);
    if (payload.email !== "demo@adit.local" || payload.password !== "demo12345")
      return json(
        { detail: "Usa las credenciales de demostración indicadas." },
        401,
      );
    return json({
      access_token: "demo-token",
      token_type: "bearer",
      expires_in_seconds: 3600,
      user: {
        id: "a0000000-0000-4000-8000-000000000001",
        email: "demo@adit.local",
        full_name: "Administradora Demo",
        role: "ADMIN",
        politico_id: null,
        lider_id: null,
        invitado_id: null,
      },
    });
  }
  if (path === "/public/events" && method === "GET")
    return json(events.filter((item) => item.estatus === "PUBLICADO"));
  if (path.startsWith("/public/events/") && method === "GET")
    return json(
      events.find((item) => item.id === path.split("/").at(-1)) ?? notFound(),
    );
  if (path === "/events" && method === "GET") return json(events);
  if (path === "/politicos" && method === "GET") return json(politicos);
  if (path === "/lideres" && method === "GET") return json(lideres);
  if (path === "/invitados" && method === "GET") return json(invitados);
  if (path === "/documentos" && method === "GET") return json([]);
  if (method === "DELETE") return json(null, 204);
  if (method === "POST" || method === "PATCH")
    return json(
      {
        ...person(`demo-${Date.now()}`, "Registro", "Demo"),
        ...(await body(init)),
      },
      201,
    );
  return notFound();
}
