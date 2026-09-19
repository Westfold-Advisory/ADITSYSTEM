import type { UUID } from "./events";

export const PERSON_STATUSES = ["ACTIVO", "INACTIVO", "BAJA"] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];

export const DOCUMENT_TYPES = ["CV", "FOTO", "IDENTIFICACION", "OTRO"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const ENTITY_TYPES = ["POLITICO", "LIDER", "INVITADO"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export interface PersonInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  perfilAcademico?: string | null;
  equipo?: string | null;
  enlace?: string | null;
  municipio?: string | null;
  distrito?: string | null;
  seccion?: string | null;
  direccion?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
  mapUrl?: string | null;
}

export interface Person extends PersonInput {
  id: UUID;
  status: string | null;
  cvUrl: string | null;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type Politico = Person;

export interface Lider extends Person {
  politicoId: UUID;
}

export interface Invitado extends Person {
  liderId: UUID;
  source: string | null;
  totalAttendances: number;
  lastEventAt: Date | null;
}

export interface Documento {
  id: UUID;
  entityType: EntityType;
  entityId: UUID;
  type: DocumentType;
  title: string;
  description: string | null;
  version: number;
  mimeType: string;
  sizeBytes: number;
  isCurrent: boolean;
  createdAt: Date;
}

export interface DocumentRegistrationInput {
  entityType: EntityType;
  entityId: UUID;
  type: DocumentType;
  title: string;
  description?: string | null;
  /** Private object key returned by the backend's upload workflow. */
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
}
