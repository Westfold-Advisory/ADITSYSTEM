import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, Search } from "lucide-react";

import type { LoginResponse } from "@/api/auth";
import { DomainApi } from "@/api/domain";
import {
  GeofencesApi,
  type Geofence,
  type GeofenceType,
} from "@/api/geofences";
import { ApiClient } from "@/api/http";
import { AdminNav } from "@/components/admin/AdminNav";
import { PersonForm } from "@/components/admin/PersonForm";
import { nameOf, roleLabel } from "@/components/admin/person-display";
import { UnauthorizedRoleScreen } from "@/components/UnauthorizedRoleScreen";
import { LoginPage } from "@/components/LoginPage";
import { PublicAppShell } from "@/components/PublicAppShell";
import { Capa } from "@/components/ui/Capa";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/button";
import { PanelCapas } from "@/components/ui/PanelCapas";
import { RoleChip } from "@/components/ui/RoleChip";
import {
  Map,
  MapClusterLayer,
  MapControls,
  MapHeatmapLayer,
} from "@/components/ui/map";
import { getInstitutionConfig } from "@/config/institution";
import {
  clearAdminSession,
  isAdminSessionExpired,
  persistAdminSession,
  readAdminSession,
  type AdminSession,
} from "@/lib/admin-session";
import {
  SESSION_EXPIRED_MESSAGE,
  requestFailureMessage,
} from "@/lib/auth-messages";
import { capabilitiesFor } from "@/lib/capabilities";
import { communityNeedOptions } from "@/lib/community-needs";
import {
  COVERAGE_ROLE_FILTERS,
  coverageRoleFilterLabel,
  filterCoveragePins,
  initialCoverageGeofenceVisibility,
  pinColorForRole,
  type CoverageRoleFilter,
} from "@/lib/coverage-map";
import type { CommunityNeed, CoverageMapPin, Person } from "@/types/domain";
import type { UUID } from "@/types/events";

import "./AdminCoverageMapPage.css";

function loadAdminSession(): {
  session: AdminSession | null;
  expiredNotice: string | null;
} {
  const stored = readAdminSession();
  if (!stored) return { session: null, expiredNotice: null };
  if (isAdminSessionExpired(stored)) {
    clearAdminSession();
    return { session: null, expiredNotice: SESSION_EXPIRED_MESSAGE };
  }
  return { session: stored, expiredNotice: null };
}

export function AdminCoverageMapPage() {
  const institution = getInstitutionConfig();
  const [loginNotice, setLoginNotice] = useState<string | null>(() => {
    return loadAdminSession().expiredNotice;
  });
  const [session, setSession] = useState<LoginResponse | null>(() => {
    return loadAdminSession().session;
  });
  const handleUnauthorized = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(SESSION_EXPIRED_MESSAGE);
  }, []);
  const api = useMemo(
    () =>
      new DomainApi(
        new ApiClient({
          getAccessToken: () => session?.access_token,
          onUnauthorized: handleUnauthorized,
        }),
      ),
    [handleUnauthorized, session?.access_token],
  );
  const geofencesApi = useMemo(
    () =>
      new GeofencesApi(
        new ApiClient({
          getAccessToken: () => session?.access_token,
          onUnauthorized: handleUnauthorized,
        }),
      ),
    [handleUnauthorized, session?.access_token],
  );
  const capabilities = session
    ? capabilitiesFor(session.user.rol)
    : capabilitiesFor("ENLACE");

  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [pins, setPins] = useState<CoverageMapPin[]>([]);
  const [heatmap, setHeatmap] = useState<
    GeoJSON.FeatureCollection<GeoJSON.Point, { intensity: number }>
  >({ type: "FeatureCollection", features: [] });
  const [roleFilter, setRoleFilter] = useState<CoverageRoleFilter>("ALL");
  const [search, setSearch] = useState("");
  const [needFilter, setNeedFilter] = useState<CommunityNeed | "ALL">("ALL");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [geofencesLoading, setGeofencesLoading] = useState(true);
  const [geofencesError, setGeofencesError] = useState<string | null>(null);
  const [geofenceVisibility, setGeofenceVisibility] = useState(
    initialCoverageGeofenceVisibility,
  );
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(
    null,
  );
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false);
  const capasTriggerRef = useRef<HTMLButtonElement>(null);
  const [pointGeofences] = useState<Geofence[]>([]);
  const [pointLookup] = useState({
    loading: false,
    error: null as string | null,
  });

  const [selectedPinId, setSelectedPinId] = useState<UUID | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [parentPerson, setParentPerson] = useState<Person | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const filteredPins = useMemo(
    () => filterCoveragePins(pins, roleFilter, search),
    [pins, roleFilter, search],
  );

  const pinFeatures = useMemo<
    GeoJSON.FeatureCollection<GeoJSON.Point, { id: UUID; role: string }>
  >(
    () => ({
      type: "FeatureCollection",
      features: filteredPins.map((pin) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [pin.longitude, pin.latitude],
        },
        properties: { id: pin.personId, role: pin.role },
      })),
    }),
    [filteredPins],
  );

  useEffect(() => {
    if (!session?.user.persona_id) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      setCoverageLoading(true);
      setCoverageError(null);
      return api
        .coverageMap(session.user.persona_id, {
          signal: controller.signal,
          need: needFilter === "ALL" ? null : needFilter,
        })
        .then((result) => {
          setPins(result.pins);
          setHeatmap({
            type: "FeatureCollection",
            features: result.heatmap.map((cell) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [cell.longitude, cell.latitude],
              },
              properties: { intensity: cell.intensity },
            })),
          });
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setCoverageError(requestFailureMessage(error));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setCoverageLoading(false);
        });
    });
    return () => controller.abort();
  }, [api, needFilter, reloadToken, session?.user.persona_id]);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      setGeofencesLoading(true);
      return geofencesApi
        .list()
        .then(setGeofences)
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setGeofencesError(
              error instanceof Error
                ? error.message
                : "No fue posible cargar las capas territoriales.",
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setGeofencesLoading(false);
        });
    });
    return () => controller.abort();
  }, [geofencesApi, session]);

  useEffect(() => {
    if (!selectedPinId || !session) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      setDetailLoading(true);
      return api
        .getPerson(selectedPinId, { signal: controller.signal })
        .then(async (person) => {
          setSelectedPerson(person);
          if (person.parentId) {
            const parent = await api.getPerson(person.parentId, {
              signal: controller.signal,
            });
            setParentPerson(parent);
          } else {
            setParentPerson(person);
          }
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setCoverageError(requestFailureMessage(error));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setDetailLoading(false);
        });
    });
    return () => controller.abort();
  }, [api, selectedPinId, session]);

  const login = (nextSession: LoginResponse) => {
    persistAdminSession(nextSession);
    setLoginNotice(null);
    setSession(nextSession);
  };
  const logout = () => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(null);
  };

  if (!session) {
    return (
      <PublicAppShell>
        <LoginPage initialNotice={loginNotice} onLogin={login} />
      </PublicAppShell>
    );
  }
  if (!capabilities.canViewStructure) {
    return (
      <UnauthorizedRoleScreen roleLabel={session.user.rol} onSignOut={logout} />
    );
  }

  const selectedPin = filteredPins.find(
    (pin) => pin.personId === selectedPinId,
  );

  return (
    <main className="admin-page coverage-map-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">{institution.productName}</p>
          <h1>Mapa de cobertura</h1>
          <p>
            {session.user.email} · alcance {roleLabel(session.user.rol)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AdminNav />
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section
        className="coverage-map-toolbar flex flex-wrap items-center gap-2"
        aria-label="Filtros del mapa"
      >
        <label className="flex items-center gap-2">
          <Search size={16} aria-hidden />
          <span className="sr-only">Buscar persona</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
            className="min-h-10 rounded border px-3"
          />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Rol">
          {COVERAGE_ROLE_FILTERS.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={roleFilter === filter ? "default" : "outline"}
              onClick={() => setRoleFilter(filter)}
            >
              {coverageRoleFilterLabel[filter]}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          Necesidad (heatmap)
          <select
            value={needFilter}
            onChange={(event) =>
              setNeedFilter(event.target.value as CommunityNeed | "ALL")
            }
            className="min-h-10 rounded border px-2"
          >
            <option value="ALL">Todas</option>
            {communityNeedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant={showHeatmap ? "default" : "outline"}
          size="sm"
          onClick={() => setShowHeatmap((current) => !current)}
        >
          {showHeatmap ? "Ocultar" : "Mostrar"} mapa de calor
        </Button>
        <Button
          ref={capasTriggerRef}
          variant="outline"
          size="sm"
          onClick={() => setPanelCapasAbierto(true)}
        >
          <Layers size={14} aria-hidden />
          Capas territoriales
        </Button>
      </section>

      {coverageError && (
        <ErrorState
          message={coverageError}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      )}

      <div className="coverage-map-layout grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="coverage-map-stage">
          {coverageLoading ? (
            <LoadingState label="Cargando cobertura…" />
          ) : coverageError ? null : (
            <>
              {filteredPins.length === 0 && (
                <p className="coverage-map-empty-banner" role="status">
                  {pins.length === 0
                    ? "No hay personas con ubicación en tu alcance. Puedes activar capas territoriales y el mapa de calor."
                    : "Ningún pin coincide con los filtros actuales. Ajusta rol o búsqueda."}
                </p>
              )}
              <Map
                className="absolute inset-0 h-full w-full"
                theme="dark"
                keyboard={false}
                viewport={{
                  center: [-98.2, 19.04] as [number, number],
                  zoom: 8,
                }}
              >
                <MapControls position="bottom-right" />
                <Capa
                  items={geofences}
                  visible={geofenceVisibility}
                  selectedId={selectedGeofenceId}
                  onSelect={setSelectedGeofenceId}
                />
                {showHeatmap && heatmap.features.length > 0 && (
                  <MapHeatmapLayer data={heatmap} visible={showHeatmap} />
                )}
                {pinFeatures.features.length > 0 && (
                  <MapClusterLayer
                    data={pinFeatures}
                    clusterMaxZoom={12}
                    clusterRadius={40}
                    pointColor="var(--md-sys-color-primary)"
                    onPointClick={(feature) => {
                      setEditing(false);
                      setSelectedPinId(feature.properties.id);
                    }}
                  />
                )}
                {panelCapasAbierto && (
                  <PanelCapas
                    items={geofences}
                    visible={geofenceVisibility}
                    selectedId={selectedGeofenceId}
                    loading={geofencesLoading}
                    error={geofencesError}
                    pointGeofences={pointGeofences}
                    pointLookup={pointLookup}
                    onToggle={(type: GeofenceType) =>
                      setGeofenceVisibility((current) => ({
                        ...current,
                        [type]: !current[type],
                      }))
                    }
                    onSelect={setSelectedGeofenceId}
                    onClose={() => setPanelCapasAbierto(false)}
                    returnFocusRef={capasTriggerRef}
                  />
                )}
              </Map>
            </>
          )}
        </div>

        <aside className="coverage-map-detail border p-4" aria-live="polite">
          {!selectedPinId || !selectedPin ? (
            <p className="text-sm text-muted-foreground">
              Selecciona un pin en el mapa para ver detalle o editar la persona.
            </p>
          ) : detailLoading || !selectedPerson ? (
            <LoadingState label="Cargando persona…" />
          ) : (
            <>
              <RoleChip role={selectedPerson.role} />
              <h2 className="text-lg font-semibold">
                {nameOf(selectedPerson)}
              </h2>
              <p className="text-sm">{roleLabel(selectedPerson.role)}</p>
              <p className="text-sm">
                {selectedPin.latitude.toFixed(5)},{" "}
                {selectedPin.longitude.toFixed(5)}
              </p>
              <div
                className="mt-2 h-3 w-3 rounded-full"
                style={{ background: pinColorForRole(selectedPerson.role) }}
                aria-hidden
              />
              {!editing ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Editar persona
                </Button>
              ) : parentPerson ? (
                <PersonForm
                  role={selectedPerson.role}
                  parent={parentPerson}
                  initialValues={{
                    nombre: selectedPerson.nombre,
                    apellidoPaterno: selectedPerson.apellidoPaterno,
                    apellidoMaterno: selectedPerson.apellidoMaterno,
                    telefono: selectedPerson.telefono,
                  }}
                  submitLabel="Guardar cambios"
                  onCancel={() => setEditing(false)}
                  onSave={async (input) => {
                    await api.updatePerson(selectedPerson.id, input);
                    setEditing(false);
                    setReloadToken((value) => value + 1);
                  }}
                />
              ) : null}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
