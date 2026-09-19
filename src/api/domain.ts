import { ApiClient } from "./http";
import type {
  DocumentRegistrationInput,
  Documento,
  DocumentType,
  EntityType,
  Invitado,
  Lider,
  Person,
  PersonInput,
  PersonStatus,
  Politico,
} from "@/types/domain";
import type { UUID } from "@/types/events";

interface PersonResponse {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  perfil_academico: string | null;
  equipo: string | null;
  enlace: string | null;
  municipio: string | null;
  distrito: string | null;
  seccion: string | null;
  direccion: string | null;
  latitud: string | number | null;
  longitud: string | number | null;
  url_imagen: string | null;
  url_cv: string | null;
  url_mapa?: string | null;
  estatus: string | null;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
interface LiderResponse extends PersonResponse {
  politico_id: string;
}
interface InvitadoResponse extends PersonResponse {
  lider_id: string;
  fuente_registro: string | null;
  asistencias_totales: number;
  ultimo_evento: string | null;
}
interface DocumentoResponse {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  tipo: DocumentType;
  titulo: string;
  descripcion?: string | null;
  version: number;
  mime_type: string;
  size_bytes: number;
  is_current: boolean;
  created_at: string;
}

const nullable = (value: string | null | undefined) => value ?? null;
const dateOrNull = (value: string | null) => (value ? new Date(value) : null);
const toNumberOrNull = (value: string | number | null) =>
  value === null ? null : Number(value);

export function mapPerson(response: PersonResponse): Person {
  return {
    id: response.id,
    nombre: response.nombre,
    apellidoPaterno: response.apellido_paterno,
    apellidoMaterno: response.apellido_materno,
    telefono: response.telefono,
    perfilAcademico: nullable(response.perfil_academico),
    equipo: nullable(response.equipo),
    enlace: nullable(response.enlace),
    municipio: nullable(response.municipio),
    distrito: nullable(response.distrito),
    seccion: nullable(response.seccion),
    direccion: nullable(response.direccion),
    latitude: toNumberOrNull(response.latitud),
    longitude: toNumberOrNull(response.longitud),
    imageUrl: nullable(response.url_imagen),
    mapUrl: nullable(response.url_mapa),
    cvUrl: nullable(response.url_cv),
    status: response.estatus,
    registeredAt: new Date(response.fecha_registro),
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
    deletedAt: dateOrNull(response.deleted_at),
  };
}

export function mapPersonInput(
  input: Partial<PersonInput>,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    nombre: input.nombre,
    apellido_paterno: input.apellidoPaterno,
    apellido_materno: input.apellidoMaterno,
    telefono: input.telefono,
    perfil_academico: input.perfilAcademico,
    equipo: input.equipo,
    enlace: input.enlace,
    municipio: input.municipio,
    distrito: input.distrito,
    seccion: input.seccion,
    direccion: input.direccion,
    latitud: input.latitude,
    longitud: input.longitude,
    url_imagen: input.imageUrl,
    url_mapa: input.mapUrl,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
}

export class DomainApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async listPoliticos(): Promise<Politico[]> {
    return (
      await this.client.request<PersonResponse[]>("/politicos", {
        access: "admin",
      })
    ).map(mapPerson);
  }
  async getPolitico(id: UUID): Promise<Politico> {
    return mapPerson(
      await this.client.request<PersonResponse>(`/politicos/${id}`, {
        access: "admin",
      }),
    );
  }
  async createPolitico(
    input: PersonInput & { registeredAt: Date | string },
  ): Promise<Politico> {
    return mapPerson(
      await this.client.request<PersonResponse>("/politicos", {
        access: "admin",
        method: "POST",
        body: {
          ...mapPersonInput(input),
          fecha_registro: new Date(input.registeredAt).toISOString(),
        },
      }),
    );
  }
  async updatePolitico(
    id: UUID,
    input: Partial<PersonInput> & { status?: PersonStatus },
  ): Promise<Politico> {
    return mapPerson(
      await this.client.request<PersonResponse>(`/politicos/${id}`, {
        access: "admin",
        method: "PATCH",
        body: { ...mapPersonInput(input), estatus: input.status },
      }),
    );
  }
  deletePolitico(id: UUID): Promise<void> {
    return this.client.request(`/politicos/${id}`, {
      access: "admin",
      method: "DELETE",
    });
  }
  async listLideres(politicoId?: UUID): Promise<Lider[]> {
    const query = politicoId
      ? `?politico_id=${encodeURIComponent(politicoId)}`
      : "";
    return (
      await this.client.request<LiderResponse[]>(`/lideres${query}`, {
        access: "admin",
      })
    ).map((item) => ({ ...mapPerson(item), politicoId: item.politico_id }));
  }
  async createLider(
    politicoId: UUID,
    input: PersonInput & { registeredAt: Date | string },
  ): Promise<Lider> {
    const response = await this.client.request<LiderResponse>("/lideres", {
      access: "admin",
      method: "POST",
      body: {
        ...mapPersonInput(input),
        politico_id: politicoId,
        fecha_registro: new Date(input.registeredAt).toISOString(),
      },
    });
    return { ...mapPerson(response), politicoId: response.politico_id };
  }
  async updateLider(
    id: UUID,
    input: Partial<PersonInput> & { status?: PersonStatus },
  ): Promise<Lider> {
    const response = await this.client.request<LiderResponse>(
      `/lideres/${id}`,
      {
        access: "admin",
        method: "PATCH",
        body: { ...mapPersonInput(input), estatus: input.status },
      },
    );
    return { ...mapPerson(response), politicoId: response.politico_id };
  }
  deleteLider(id: UUID): Promise<void> {
    return this.client.request(`/lideres/${id}`, {
      access: "admin",
      method: "DELETE",
    });
  }
  async listInvitados(liderId?: UUID): Promise<Invitado[]> {
    const query = liderId ? `?lider_id=${encodeURIComponent(liderId)}` : "";
    return (
      await this.client.request<InvitadoResponse[]>(`/invitados${query}`, {
        access: "admin",
      })
    ).map((item) => ({
      ...mapPerson(item),
      liderId: item.lider_id,
      source: item.fuente_registro,
      totalAttendances: item.asistencias_totales,
      lastEventAt: dateOrNull(item.ultimo_evento),
    }));
  }
  async createInvitado(
    liderId: UUID,
    input: PersonInput & {
      registeredAt: Date | string;
      status?: string | null;
      source?: string | null;
    },
  ): Promise<Invitado> {
    const response = await this.client.request<InvitadoResponse>("/invitados", {
      access: "admin",
      method: "POST",
      body: {
        ...mapPersonInput(input),
        lider_id: liderId,
        estatus: input.status,
        fuente_registro: input.source,
        fecha_registro: new Date(input.registeredAt).toISOString(),
      },
    });
    return {
      ...mapPerson(response),
      liderId: response.lider_id,
      source: response.fuente_registro,
      totalAttendances: response.asistencias_totales,
      lastEventAt: dateOrNull(response.ultimo_evento),
    };
  }
  async updateInvitado(
    id: UUID,
    input: Partial<PersonInput> & { status?: string },
  ): Promise<Invitado> {
    const response = await this.client.request<InvitadoResponse>(
      `/invitados/${id}`,
      {
        access: "admin",
        method: "PATCH",
        body: { ...mapPersonInput(input), estatus: input.status },
      },
    );
    return {
      ...mapPerson(response),
      liderId: response.lider_id,
      source: response.fuente_registro,
      totalAttendances: response.asistencias_totales,
      lastEventAt: dateOrNull(response.ultimo_evento),
    };
  }
  deleteInvitado(id: UUID): Promise<void> {
    return this.client.request(`/invitados/${id}`, {
      access: "admin",
      method: "DELETE",
    });
  }
  async listDocuments(
    entityType: EntityType,
    entityId: UUID,
    type?: DocumentType,
  ): Promise<Documento[]> {
    const query = new URLSearchParams({
      entity_type: entityType,
      entity_id: entityId,
    });
    if (type) query.set("tipo", type);
    return (
      await this.client.request<DocumentoResponse[]>(`/documentos?${query}`, {
        access: "admin",
      })
    ).map((item) => ({
      id: item.id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      type: item.tipo,
      title: item.titulo,
      description: item.descripcion ?? null,
      version: item.version,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
      isCurrent: item.is_current,
      createdAt: new Date(item.created_at),
    }));
  }
  async registerDocument(input: DocumentRegistrationInput): Promise<Documento> {
    const item = await this.client.request<DocumentoResponse>("/documentos", {
      access: "admin",
      method: "POST",
      body: {
        entity_type: input.entityType,
        entity_id: input.entityId,
        tipo: input.type,
        titulo: input.title,
        descripcion: input.description,
        s3_key: input.s3Key,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
      },
    });
    return {
      id: item.id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      type: item.tipo,
      title: item.titulo,
      description: item.descripcion ?? null,
      version: item.version,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
      isCurrent: item.is_current,
      createdAt: new Date(item.created_at),
    };
  }
  deleteDocument(id: UUID): Promise<void> {
    return this.client.request(`/documentos/${id}`, {
      access: "admin",
      method: "DELETE",
    });
  }
}
