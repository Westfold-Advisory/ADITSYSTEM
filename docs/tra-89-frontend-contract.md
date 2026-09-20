# TRA-89 — matriz de contrato frontend

Fuente: OpenAPI publicado por backend en `origin/main` (rutas `/api/v1/auth/*` y `/api/v1/personas/*`). El cliente conserva `ApiClient`: URL configurable con `VITE_API_BASE_URL`, Bearer uniforme, errores FastAPI 422 por campo y prevención de envíos duplicados.

| Formulario/UI        | Tipo frontend                                      | Endpoint                                                 | DTO / entidad                             | Validación o regla                                                                               |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Inicio de sesión     | `email`, `password`                                | `POST /auth/login`                                       | `UserLogin` → `TokenResponse`             | Cuenta vinculada a Persona; `AMIGO` no tiene credenciales                                        |
| Sesión actual        | `AuthenticatedUser`                                | `GET /auth/me`                                           | `AuthUserRead`                            | JWT Bearer; `rol` es `ADMIN`, `COORDINADOR_GENERAL`, `COORDINADOR` o `ENLACE`                    |
| Alta persona         | `PersonInput`, `PersonRole`, `parentId` contextual | `POST /personas`                                         | `PersonaCreate` → `Persona`               | Nombre/apellidos 1–120, teléfono 1–30; padre requerido por jerarquía; UI no solicita UUID manual |
| Perfil/descendientes | `Person`                                           | `GET /personas/{id}`, `GET /personas/{id}/descendientes` | `PersonaRead`                             | Backend aplica RBAC y ownership del árbol                                                        |
| Actualizar/baja      | `Partial<PersonInput>`, `PersonStatus`             | `PATCH` / `DELETE /personas/{id}`                        | `PersonaUpdate`                           | DELETE es baja lógica; no se permite la baja propia                                              |
| Métricas scoped      | `PersonMetrics`                                    | `GET /personas/{id}/metricas`                            | `PersonaMetricas`                         | Sólo la persona o sus descendientes autorizados                                                  |
| Documento/CV/foto    | `DocumentRegistrationInput`, `Documento`           | `GET/POST /personas/{id}/documentos`                     | `PersonaDocumentoCreate`, `DocumentoList` | `CV`, `FOTO`, `IDENTIFICACION`, `OTRO`; `s3_key` es metadata privada, no URL pública             |
| Geografía scoped     | `Geofence`                                         | `GET/POST/DELETE /personas/{id}/geocercas`               | `GeocercaRead`, `PersonaGeocercaCreate`   | UUID de geocerca procede de una selección autorizada; no se expone ubicación personal            |

## Capabilities de interfaz

| Sesión              | Alta contextual          | Alcance de UI                                               |
| ------------------- | ------------------------ | ----------------------------------------------------------- |
| ADMIN               | Coordinador General raíz | Estructura y eventos; el backend conserva la decisión final |
| COORDINADOR_GENERAL | Coordinador propio       | Su subárbol y eventos                                       |
| COORDINADOR         | Enlace propio            | Su subárbol y eventos                                       |
| ENLACE              | Amigo propio             | Su subárbol y eventos                                       |
| AMIGO               | No aplica                | Sin sesión, guard ni ruta administrativa                    |

La UI sólo oculta affordances; no filtra ni autoriza datos. Cada request protegido se valida otra vez en `PersonaPolicy` del backend.
