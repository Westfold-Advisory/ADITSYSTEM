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
export const GEOFENCE_TYPES = [
  "ESTADO",
  "MUNICIPIO",
  "DISTRITO",
  "SECCION",
  "DISTRITO_LOCAL",
  "DISTRITO_FEDERAL",
] as const;
export type GeofenceType = (typeof GEOFENCE_TYPES)[number];

export const COMMUNITY_NEEDS = [
  "INSEGURIDAD",
  "FALTA_ALUMBRADO_PUBLICO",
  "CALLES_MAL_ESTADO",
  "FALTA_AGUA_POTABLE",
  "PROBLEMAS_DRENAJE",
  "RECOLECCION_BASURA_DEFICIENTE",
  "FALTA_LIMPIEZA",
  "FALTA_TRANSPORTE_PUBLICO",
  "FALTA_PARQUES_ESPACIOS_RECREATIVOS",
  "VENTA_CONSUMO_DROGAS",
  "FALTA_ATENCION_MEDICA_CERCANA",
  "FALTA_APOYOS_SOCIALES",
  "FALTA_EMPLEO",
  "FALTA_ATENCION_ADULTOS_MAYORES",
  "FALTA_ATENCION_JOVENES",
] as const;
export type CommunityNeed = (typeof COMMUNITY_NEEDS)[number];

export interface CoverageMapPin {
  personId: UUID;
  role: PersonRole;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  latitude: number;
  longitude: number;
}

export interface CoverageHeatmapCell {
  latitude: number;
  longitude: number;
  need: CommunityNeed;
  intensity: number;
}

export interface CoverageMap {
  rootPersonId: UUID;
  pins: CoverageMapPin[];
  heatmap: CoverageHeatmapCell[];
}

export interface PersonInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
}

export interface PersonProvisionInput extends PersonInput {
  email?: string;
  password?: string;
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

export interface DocumentUploadInput {
  type: DocumentType;
  title: string;
  description?: string | null;
  file: File;
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
