import type { Feature, FeatureCollection, Geometry } from "geojson";
import { ApiClient } from "./http";

export const GEOFENCE_TYPES = ["ESTADO", "MUNICIPIO", "DISTRITO"] as const;
export type GeofenceType = (typeof GEOFENCE_TYPES)[number];

export interface Geofence {
  id: string;
  type: GeofenceType;
  name: string;
  code: string | null;
  parentCode: string | null;
  source: string;
  version: number;
  active: boolean;
  geometry: Geometry | null;
}

interface GeofenceResponse {
  id: string; tipo: GeofenceType; nombre: string; codigo: string | null;
  codigo_padre: string | null; fuente: string; version: number; vigente: boolean;
  geometry_simplified?: Geometry | null; geometry?: Geometry | null;
}

export function mapGeofence(response: GeofenceResponse): Geofence {
  return { id: response.id, type: response.tipo, name: response.nombre,
    code: response.codigo, parentCode: response.codigo_padre, source: response.fuente,
    version: response.version, active: response.vigente,
    geometry: response.geometry_simplified ?? response.geometry ?? null };
}

export function toGeofenceFeatureCollection(items: Geofence[]): FeatureCollection {
  const features: Feature[] = items.flatMap((item) => item.geometry ? [{
    type: "Feature", geometry: item.geometry,
    properties: { id: item.id, type: item.type, name: item.name, code: item.code, version: item.version },
  }] : []);
  return { type: "FeatureCollection", features };
}

export class GeofencesApi {
  private readonly client: ApiClient;
  constructor(client = new ApiClient()) { this.client = client; }

  async list(): Promise<Geofence[]> {
    return (await this.client.request<GeofenceResponse[]>("/geocercas?page_size=200")).map(mapGeofence);
  }

  async contains(latitude: number, longitude: number): Promise<Geofence[]> {
    const query = new URLSearchParams({ latitud: String(latitude), longitud: String(longitude) });
    return (await this.client.request<GeofenceResponse[]>(`/geocercas/contains?${query}`)).map(mapGeofence);
  }
}
