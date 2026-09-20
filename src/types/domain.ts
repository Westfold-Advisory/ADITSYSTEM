import type { UUID } from "./events";

export const PERSON_ROLES = [
  "ADMIN",
  "COORDINADOR_GENERAL",
  "COORDINADOR",
  "ENLACE",
  "AMIGO",
] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];
export type AuthenticatedRole = Exclude<PersonRole, "AMIGO">;

export const PERSON_STATUSES = ["ACTIVO", "INACTIVO", "BAJA"] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];
export const DOCUMENT_TYPES = ["CV", "FOTO", "IDENTIFICACION", "OTRO"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const GEOFENCE_TYPES = ["ESTADO", "MUNICIPIO", "DISTRITO"] as const;
export type GeofenceType = (typeof GEOFENCE_TYPES)[number];

export interface PersonInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
}

export interface Person extends PersonInput {
  id: UUID;
  role: PersonRole;
  parentId: UUID | null;
  status: PersonStatus;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonMetrics {
  descendants: number;
  coordinators: number;
  links: number;
  friends: number;
  documents: number;
  createdEvents: number;
  invitations: number;
  attendances: number;
}

export interface ScopedMapPerson {
  personId: UUID;
  role: PersonRole;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  geofences: Geofence[];
}

export interface ScopedMap {
  rootPersonId: UUID;
  people: ScopedMapPerson[];
}

export interface Documento {
  id: UUID;
  personId: UUID;
  type: DocumentType;
  title: string;
  version: number;
  mimeType: string;
  sizeBytes: number;
  isCurrent: boolean;
  createdAt: Date;
}

/** The object key is private storage metadata, never a browser URL. */
export interface DocumentRegistrationInput {
  type: DocumentType;
  title: string;
  description?: string | null;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Geofence {
  id: UUID;
  type: GeofenceType;
  name: string;
  code: string | null;
  parentCode: string | null;
  source: string;
  version: number;
  current: boolean;
}
