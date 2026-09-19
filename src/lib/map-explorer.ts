import type { GeofenceType } from "@/api/geofences";

export type MobileMapSheetState = "closed" | "list" | "detail";

/** Territorial layers are opt-in so a dense map remains readable on first load. */
export const initialGeofenceVisibility: Record<GeofenceType, boolean> = {
  ESTADO: false,
  MUNICIPIO: false,
  DISTRITO: false,
};

export function getMobileMapSheetState(
  explorerVisible: boolean,
  selectedEventId: string | null,
): MobileMapSheetState {
  if (!explorerVisible) return "closed";
  return selectedEventId ? "detail" : "list";
}
