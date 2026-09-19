# TRA-93 — impacto frontend del contrato jerárquico

## Alcance y fuente de verdad

Este informe es un diagnóstico sin cambios de pantallas, mocks ni cliente HTTP. Se contrastaron el frontend `origin/main`, el backend disponible con las migraciones TRA-87 (`000004` y `000005`) y el brief de producto del issue. El backend actual es una transición: su OpenAPI se genera en `/api/v1/openapi.json`, pero todavía no representa el contrato final solicitado. Por tanto, TRA-89 debe implementar sólo contra el OpenAPI publicado tras la entrega backend y no contra nombres inferidos de este documento.

La jerarquía de producto objetivo es `COORDINADOR_GENERAL → COORDINADOR → ENLACE → AMIGO`; `ADMIN` administra globalmente y no es padre implícito. `AMIGO` es una persona administrable y nunca una sesión ni un principal JWT.

## Inventario frontend actual

| Área | Implementación actual | Brecha frente al objetivo |
| --- | --- | --- |
| Rutas | Router manual en `src/App.tsx`: `/eventos`, `/mapa`, `/admin`; no hay rutas de detalle de persona ni árbol. | Añadir rutas protegidas jerárquicas y breadcrumbs sin separar aplicaciones. |
| Sesión/guards | `src/api/auth.ts` acepta `ADMIN`, `POLITICO`, `LIDER`, `INVITADO`; `AdminEventsPage` sólo deja eventos a `POLITICO`, `LIDER`, `ADMIN`. Sesión en `sessionStorage`; no hay guard de capacidad. | Reemplazar roles legacy y calcular capacidades desde el rol autenticado. AMIGO no integra este tipo ni el login. |
| Dominio | `src/types/domain.ts` y `src/api/domain.ts` modelan `Politico`, `Lider`, `Invitado`, entidades de documentos del mismo nombre y relaciones `politicoId`/`liderId`. | Unificar la vista en `Person`, `role`, `parentId` y enlaces descendientes; conservar DTO/adaptadores separados sólo si OpenAPI final lo exige. |
| Formulario | `PersonForm` local en `DomainAdminPage.tsx`, sólo cuatro datos obligatorios; pide UUID de padre manualmente. | Extraer formulario reutilizable con selector contextual de padre, campos de perfil, datos/documentos/foto/CV y errores por campo. |
| Navegación | Pestañas planas Políticos/Líderes/Invitados, sin editar, detalle, breadcrumbs ni dashboard scoped. | Árbol navegable, breadcrumb, detalle de persona y dashboard según scope. |
| Mocks/fixtures | `src/api/mock.ts`, pruebas y textos demo tienen `POLITICO`/`LIDER`. `components/ui/constants.ts` conserva textos de líder. | Retirarlos/migrarlos en el PR de implementación, después de congelar OpenAPI. |
| Mapa | `/mapa` es público: MapLibre muestra sólo eventos publicados y geocercas; no consume coordenadas de personas. | Mantenerlo así. Un mapa administrativo de personas debe requerir capacidad y endpoint con scope; debe tener alternativa de lista/tablas. |

El cliente `ApiClient` ya centraliza `VITE_API_BASE_URL`, JWT Bearer, errores FastAPI por campo y evita mutaciones idénticas simultáneas. Debe mantenerse; el cambio es de contratos/adaptadores y capacidades, no otro cliente HTTP.

## Estado backend y discrepancias bloqueantes

El estado actual usa cinco roles ingleses: `ADMIN`, `GENERAL_COORDINATOR`, `COORDINATOR`, `LINK`, `FRIEND`. Aunque las migraciones eliminaron `POLITICO`/`LIDER`/`INVITADO` del enum de `users`, las tablas/API siguen siendo `politicos`, `lider`, `invitados`, y `FRIEND` aún puede autenticarse (`UserCreate`, `User.invitado_id` y checks de eventos). Eso contradice el requisito de AMIGO no autenticable.

Además, la jerarquía persistida sólo cubre dos niveles: `politicos.tipo` y `parent_politico_id` representan General Coordinator → Coordinator; `lider.politico_id` representa Enlace y `invitados.lider_id` representa Amigo. El servicio no permite a un Coordinador General listar/administrar todos sus descendientes; el listado de amigos para `COORDINATOR` puede devolver todos si no recibe `lider_id`; y la autorización de actualización de amigo concede a cualquier `COORDINATOR` sin comprobar ownership. Son bloqueadores backend: el frontend no debe intentar imponer esa seguridad por filtrado de UI.

## Matriz contrato: actual, objetivo y dependencia OpenAPI

| Concepto/campo frontend | Estado actual API/DB | Contrato objetivo para TRA-89 | Dependencia backend/OpenAPI |
| --- | --- | --- | --- |
| ID de persona | UUID en tres recursos; `politicos.id`, `lider.id`, `invitados.id`. | `Person.id: UUID`, estable en rutas y relaciones. | Definir si se migra a tabla persona única o se conserva adaptador; publicar schemas. |
| Rol | UI legacy; API enum inglés, con `FRIEND`. | `ADMIN`, `COORDINADOR_GENERAL`, `COORDINADOR`, `ENLACE`; AMIGO sólo como tipo de persona. | Enum final y representación de `me`. Confirmar valores canónicos (producto español vs API inglés). |
| Padre/ownership | `parent_politico_id`, `politico_id`, `lider_id`; nombres y recursos distintos. | `parent_id` (o relaciones explícitas equivalentes) y `children`/árbol scoped. No UUID manual como UX primaria. | Endpoints de árbol, detalle y selector de padres autorizados; reglas anti-ciclo. |
| Datos personales | Nombres, apellidos, teléfono obligatorios; perfil, equipo, enlace, municipio, distrito, sección, dirección, lat/lon opcionales. Fechas `datetime`. | Un `PersonForm` reutilizable; los mismos campos base para los cuatro roles y AMIGO. | Confirmar campos obligatorios por operación y si `enlace` textual queda obsoleto frente a relación. |
| Estado/baja | `estatus` (`ACTIVO/INACTIVO/BAJA`), `deleted_at`; DELETE realiza baja lógica. | Mostrar baja lógica como tal; no llamar “eliminar” salvo endpoint físico explícito. | Política para descendientes y restauración; código de error y visibilidad de bajas. |
| Foto | `url_imagen` en perfiles y `FOTO` en documentos; duplicación. | Una fuente canónica (foto actual + metadata/versionado si aplica). | Flujo de upload (presigned URL o multipart), lectura autorizada y URL temporal; nunca `s3_key` desde UI sin autorización. |
| Documentos/CV | `/documentos` registra metadata con `entity_type` legacy y `s3_key`; CV también `url_cv`. No upload binario. | Documentos 0..N y CV versionable para toda persona; lista, alta, baja y descarga autorizada. | Entidad `PERSON`, operación upload/finalize y URL de descarga; decidir si CV es tipo de documento y retirar `url_cv`. |
| Timestamps/auditoría | `created_at`, `updated_at`, `deleted_at`, `fecha_registro`; documento tiene `subido_por`. | ISO-8601 UTC; UI formatea localmente y separa registro/auditoría. | Confirmar campos auditables (creador, modificador) y exposición por rol. |
| Geolocalización | `latitud`/`longitud` Decimal, rango -90..90/-180..180; `url_mapa` en dos recursos. Geocercas públicas. | Captura opcional con consentimiento/precisión; sólo mostrar en vistas autorizadas y scope filtrado. | Endpoint de personas/mapa con autorización, precisión/redondeo y política de retención. No reutilizar endpoint público de eventos. |
| Dashboard | No endpoint ni pantalla. | Conteos/alertas consolidados dentro del árbol del actor; ADMIN global. | `GET /dashboard` o métricas scoped, sin agregados de otra estructura. |

### Endpoints actuales que TRA-89 no debe tomar como contrato final

`/politicos`, `/lideres`, `/invitados`, `/admin/users`, `/documentos` y `/auth/register` son rutas transicionales. Las respuestas de lista son reducidas, mientras detalle tiene más campos. Actualmente no existe endpoint de árbol, dashboard scoped, selector de padre, carga de binario, foto canónica, descarga autorizada ni mapa de personas con scope. `GET /geocercas` y `GET /geocercas/contains` no requieren principal, por lo que sólo sirven a la capa territorial pública.

## Diseño frontend propuesto

Una sola aplicación y un solo árbol de rutas:

```text
/admin                         dashboard scoped
/admin/personas/:id            detalle, perfil, documentos y auditoría visible
/admin/personas/:id/nueva/:rol formulario con padre fijado por contexto
/admin/estructura/:id          árbol y descendientes paginados
```

`/admin` resuelve `me` y aplica una tabla declarativa de capacidades; las rutas y botones hacen guard, pero el backend sigue siendo la autoridad. Capacidades mínimas:

| Rol | Alcance y acciones UI |
| --- | --- |
| ADMIN | Dashboard global, árbol completo, crear/editar/baja y documentos/foto/CV de toda persona. |
| COORDINADOR_GENERAL | Su subárbol; crear/editar Coordinadores de su estructura; lectura de Enlaces/Amigos y métricas scoped. |
| COORDINADOR | Su subárbol; crear/editar Enlaces propios; lectura de sus Amigos y métricas scoped. |
| ENLACE | Su perfil; crear/editar/baja Amigos propios; documentos, CV y foto permitidos por backend. |
| AMIGO | No hay sesión, guard, menú ni ruta de login. Sólo aparece como registro bajo un Enlace. |

El árbol debe cargar sólo el nodo expandido, anunciar estado de carga con `aria-busy`, usar `role=tree`/`treeitem` y botones de expandir accesibles. Cada detalle muestra breadcrumb `Coordinador General › Coordinador › Enlace › Amigo`, con los ancestros suministrados por el backend (no reconstruidos a partir de listas parciales). Para usuarios que no usan el árbol, proveer tabla/lista jerárquica, búsqueda dentro de scope y filtros; es también la alternativa accesible al mapa.

El dashboard muestra únicamente agregados devueltos por backend para el scope actual: descendientes por rol, activos/inactivos y pendientes documentales, sin coordenadas ni nombres fuera del scope. Si se aprueba mapa administrativo, se renderiza sólo tras autorización, con marcador redondeado o geocerca según política de precisión, leyenda/tabla equivalente y sin mezclar datos de personas con `/mapa` público.

## Secuencia de implementación y Definition of Ready

1. **Backend/OpenAPI (bloqueante):** entregar enum final, eliminación de login AMIGO, relaciones/ownership de cuatro niveles, endpoints scoped de árbol/detalle/dashboard, y flujos de archivos. Pruebas negativas de cross-scope incluidas.
2. **Contrato:** publicar OpenAPI versionado y ejemplos de éxito/401/403/404/422. Congelar naming de rol, persona, padre y documento antes de modificar mocks.
3. **Frontend TRA-89:** sustituir tipos/adaptadores y fixtures, crear capability matrix y guards, luego rutas/árbol/formulario/detalle. Reusar `ApiClient`; no modificar el contrato desde frontend.
4. **Integración:** pruebas de roles y accesibilidad; probar que AMIGO no puede iniciar sesión ni acceder a rutas administrativas, y que cada petición no expone descendientes fuera del scope.

## Preguntas para Product Owner

1. ¿Los literales externos canónicos serán los españoles del brief (`COORDINADOR_GENERAL`, `ENLACE`, `AMIGO`) o los ingleses de la transición? Deben fijarse para OpenAPI, UI y JWT.
2. ¿ADMIN tiene perfil/persona completo o sólo identidad administrativa? Si es persona, ¿dónde queda dentro de la estructura sin convertirlo en padre de todos?
3. ¿Qué campos personales son obligatorios para cada alta y puede un campo `enlace` textual eliminarse en favor de la relación?
4. ¿CV es un documento de tipo `CV` versionado (recomendado) y foto un documento/tipo especial, o se requieren URLs separadas?
5. ¿La ubicación exacta de personas está aprobada para mapa administrativo? Definir audiencia, precisión, retención y consentimiento; por defecto no se muestra.
6. ¿Qué significa “eliminar” para personas con descendientes: sólo baja lógica, baja en cascada, bloqueo o reasignación?
