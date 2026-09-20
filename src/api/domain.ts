import { ApiClient } from "./http";
import type {
  DocumentRegistrationInput,
  Documento,
  Geofence,
  Person,
  PersonInput,
  PersonMetrics,
  PersonRole,
  PersonStatus,
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
  documentos: number;
  eventos_creados: number;
  invitaciones: number;
  asistencias: number;
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
  async getPerson(id: UUID): Promise<Person> {
    return mapPerson(
      await this.client.request<PersonResponse>(`/personas/${id}`, {
        access: "authenticated",
      }),
    );
  }
  async listDescendants(id: UUID): Promise<Person[]> {
    return (
      await this.client.request<PersonResponse[]>(
        `/personas/${id}/descendientes`,
        { access: "authenticated" },
      )
    ).map(mapPerson);
  }
  async createPerson(
    input: PersonInput,
    role: PersonRole,
    parentId: UUID | null,
  ): Promise<Person> {
    return mapPerson(
      await this.client.request<PersonResponse>("/personas", {
        access: "authenticated",
        method: "POST",
        body: {
          ...mapPersonInput(input),
          rol: role,
          parent_persona_id: parentId,
        },
      }),
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
  async metrics(id: UUID): Promise<PersonMetrics> {
    const result = await this.client.request<MetricsResponse>(
      `/personas/${id}/metricas`,
      { access: "authenticated" },
    );
    return {
      descendants: result.descendientes,
      documents: result.documentos,
      createdEvents: result.eventos_creados,
      invitations: result.invitaciones,
      attendances: result.asistencias,
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
