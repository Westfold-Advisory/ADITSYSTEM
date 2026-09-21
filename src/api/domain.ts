import { ApiClient } from "./http";
import type {
  CommunityNeed,
  CoverageMap,
  DocumentRegistrationInput,
  Documento,
  Geofence,
  Person,
  PersonInput,
  PersonProvisionInput,
  PersonMetrics,
  PersonRole,
  PersonStatus,
  ScopedMap,
} from "@/types/domain";
import type { UUID } from "@/types/events";

interface PersonResponse {
  id: UUID;
  rol: PersonRole;
  parent_persona_id: UUID | null;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  estatus: PersonStatus;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
}
interface DocumentResponse {
  id: UUID;
  persona_id: UUID;
  tipo: Documento["type"];
  titulo: string;
  version: number;
  mime_type: string;
  size_bytes: number;
  is_current: boolean;
  created_at: string;
}
interface MetricsResponse {
  descendientes: number;
  coordinadores: number;
  enlaces: number;
  amigos: number;
  documentos: number;
  eventos_creados: number;
  invitaciones: number;
  asistencias: number;
}
interface ScopedMapPersonResponse {
  persona_id: UUID;
  rol: PersonRole;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  geocercas: GeofenceResponse[];
}
interface ScopedMapResponse {
  root_persona_id: UUID;
  personas: ScopedMapPersonResponse[];
}
interface GeofenceResponse {
  id: UUID;
  tipo: Geofence["type"];
  nombre: string;
  codigo: string | null;
  codigo_padre: string | null;
  fuente: string;
  version: number;
  vigente: boolean;
}
interface CoveragePinResponse {
  persona_id: UUID;
  rol: PersonRole;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  latitud: string;
  longitud: string;
}
interface CoverageHeatmapResponse {
  latitud: string;
  longitud: string;
  necesidad: CommunityNeed;
  intensidad: number;
}
interface CoverageMapResponse {
  root_persona_id: UUID;
  pines: CoveragePinResponse[];
  heatmap: CoverageHeatmapResponse[];
}

export function mapPerson(response: PersonResponse): Person {
  return {
    id: response.id,
    role: response.rol,
    parentId: response.parent_persona_id,
    nombre: response.nombre,
    apellidoPaterno: response.apellido_paterno,
    apellidoMaterno: response.apellido_materno,
    telefono: response.telefono,
    status: response.estatus,
    registeredAt: new Date(response.fecha_registro),
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
  };
}

export interface DomainReadOptions {
  signal?: AbortSignal;
}

export function mapPersonInput(
  input: Partial<PersonInput>,
): Record<string, string> {
  const fields = {
    nombre: input.nombre,
    apellido_paterno: input.apellidoPaterno,
    apellido_materno: input.apellidoMaterno,
    telefono: input.telefono,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
}

export class DomainApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }
  async getPerson(id: UUID, options?: DomainReadOptions): Promise<Person> {
    return mapPerson(
      await this.client.request<PersonResponse>(`/personas/${id}`, {
        access: "authenticated",
        signal: options?.signal,
      }),
    );
  }
  async listDescendants(
    id: UUID,
    options?: DomainReadOptions,
  ): Promise<Person[]> {
    return (
      await this.client.request<PersonResponse[]>(
        `/personas/${id}/descendientes`,
        { access: "authenticated", signal: options?.signal },
      )
    ).map(mapPerson);
  }
  async createPerson(
    input: PersonProvisionInput,
    role: PersonRole,
    parentId: UUID | null,
  ): Promise<Person> {
    const body: Record<string, unknown> = {
      ...mapPersonInput(input),
      rol: role,
      parent_persona_id: parentId,
    };
    if (input.email !== undefined) body.email = input.email;
    if (input.password !== undefined) body.password = input.password;
    return mapPerson(
      await this.client.request<PersonResponse>("/personas", {
        access: "authenticated",
        method: "POST",
        body,
      }),
    );
  }
  changePersonPassword(personaId: UUID, newPassword: string): Promise<void> {
    return this.client.request(
      `/personas/${personaId}/credenciales/contrasena`,
      {
        access: "authenticated",
        method: "PUT",
        body: { new_password: newPassword },
      },
    );
  }
  async updatePerson(
    id: UUID,
    input: Partial<PersonInput> & { status?: PersonStatus },
  ): Promise<Person> {
    return mapPerson(
      await this.client.request<PersonResponse>(`/personas/${id}`, {
        access: "authenticated",
        method: "PATCH",
        body: { ...mapPersonInput(input), estatus: input.status },
      }),
    );
  }
  deletePerson(id: UUID): Promise<void> {
    return this.client.request(`/personas/${id}`, {
      access: "authenticated",
      method: "DELETE",
    });
  }
  async metrics(id: UUID, options?: DomainReadOptions): Promise<PersonMetrics> {
    const result = await this.client.request<MetricsResponse>(
      `/personas/${id}/metricas`,
      { access: "authenticated", signal: options?.signal },
    );
    return {
      descendants: result.descendientes,
      coordinators: result.coordinadores,
      links: result.enlaces,
      friends: result.amigos,
      documents: result.documentos,
      createdEvents: result.eventos_creados,
      invitations: result.invitaciones,
      attendances: result.asistencias,
    };
  }
  async coverageMap(
    id: UUID,
    options?: DomainReadOptions & {
      gridPrecision?: number;
      need?: CommunityNeed | null;
    },
  ): Promise<CoverageMap> {
    const query = new URLSearchParams();
    if (options?.gridPrecision != null) {
      query.set("grid_precision", String(options.gridPrecision));
    }
    if (options?.need) {
      query.set("necesidad", options.need);
    }
    const suffix = query.size ? `?${query}` : "";
    const result = await this.client.request<CoverageMapResponse>(
      `/personas/${id}/mapa/cobertura${suffix}`,
      { access: "authenticated", signal: options?.signal },
    );
    return {
      rootPersonId: result.root_persona_id,
      pins: result.pines.map((pin) => ({
        personId: pin.persona_id,
        role: pin.rol,
        nombre: pin.nombre,
        apellidoPaterno: pin.apellido_paterno,
        apellidoMaterno: pin.apellido_materno,
        latitude: Number(pin.latitud),
        longitude: Number(pin.longitud),
      })),
      heatmap: result.heatmap.map((cell) => ({
        latitude: Number(cell.latitud),
        longitude: Number(cell.longitud),
        need: cell.necesidad,
        intensity: cell.intensidad,
      })),
    };
  }
  async scopedMap(id: UUID, options?: DomainReadOptions): Promise<ScopedMap> {
    const result = await this.client.request<ScopedMapResponse>(
      `/personas/${id}/mapa`,
      { access: "authenticated", signal: options?.signal },
    );
    return {
      rootPersonId: result.root_persona_id,
      people: result.personas.map((person) => ({
        personId: person.persona_id,
        role: person.rol,
        nombre: person.nombre,
        apellidoPaterno: person.apellido_paterno,
        apellidoMaterno: person.apellido_materno,
        geofences: person.geocercas.map((item) => ({
          id: item.id,
          type: item.tipo,
          name: item.nombre,
          code: item.codigo,
          parentCode: item.codigo_padre,
          source: item.fuente,
          version: item.version,
          current: item.vigente,
        })),
      })),
    };
  }
  async listDocuments(id: UUID): Promise<Documento[]> {
    return (
      await this.client.request<DocumentResponse[]>(
        `/personas/${id}/documentos`,
        { access: "authenticated" },
      )
    ).map((item) => ({
      id: item.id,
      personId: item.persona_id,
      type: item.tipo,
      title: item.titulo,
      version: item.version,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
      isCurrent: item.is_current,
      createdAt: new Date(item.created_at),
    }));
  }
  async registerDocument(
    id: UUID,
    input: DocumentRegistrationInput,
  ): Promise<Documento> {
    const item = await this.client.request<DocumentResponse>(
      `/personas/${id}/documentos`,
      {
        access: "authenticated",
        method: "POST",
        body: {
          tipo: input.type,
          titulo: input.title,
          descripcion: input.description,
          s3_key: input.s3Key,
          mime_type: input.mimeType,
          size_bytes: input.sizeBytes,
        },
      },
    );
    return {
      id: item.id,
      personId: item.persona_id,
      type: item.tipo,
      title: item.titulo,
      version: item.version,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
      isCurrent: item.is_current,
      createdAt: new Date(item.created_at),
    };
  }
  async listGeofences(id: UUID): Promise<Geofence[]> {
    return (
      await this.client.request<GeofenceResponse[]>(
        `/personas/${id}/geocercas`,
        { access: "authenticated" },
      )
    ).map((item) => ({
      id: item.id,
      type: item.tipo,
      name: item.nombre,
      code: item.codigo,
      parentCode: item.codigo_padre,
      source: item.fuente,
      version: item.version,
      current: item.vigente,
    }));
  }
  async assignGeofence(personId: UUID, geofenceId: UUID): Promise<Geofence> {
    const item = await this.client.request<GeofenceResponse>(
      `/personas/${personId}/geocercas`,
      {
        access: "authenticated",
        method: "POST",
        body: { geocerca_id: geofenceId },
      },
    );
    return {
      id: item.id,
      type: item.tipo,
      name: item.nombre,
      code: item.codigo,
      parentCode: item.codigo_padre,
      source: item.fuente,
      version: item.version,
      current: item.vigente,
    };
  }
  unassignGeofence(personId: UUID, geofenceId: UUID): Promise<void> {
    return this.client.request(
      `/personas/${personId}/geocercas/${geofenceId}`,
      { access: "authenticated", method: "DELETE" },
    );
  }
}
