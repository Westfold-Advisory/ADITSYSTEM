# Auditoría PII — formularios administrativos

**Issue:** TRA-115 · **Epic:** TRA-103 (privacidad / privacy-by-design)  
**Repo:** ADITSYSTEM (`main`, revisión: 2026-09-20)  
**Alcance:** Solo frontend — formularios admin identificados en código. **Sin** cambios de modelo de datos ni políticas de retención en backend.

## Resumen ejecutivo

Los formularios admin capturan **identificación directa** (nombre completo, teléfono), **credenciales** (login), **geolocalización de eventos** (lat/long, radio de check-in) y **metadata de documentos sensibles** (CV, identificación, fotografía). El frontend **alinea** la superficie de captura con el contrato API (`PersonInput`, `EventInput`, registro de documentos) y aplica **controles de acceso por rol y alcance jerárquico** antes de mostrar acciones; la autorización definitiva queda en el backend (`PersonaPolicy`).

Gaps principales para privacy-by-design en UI:

1. **Propósito / base legal:** ningún formulario admin (excepto login con enlace a aviso) explica _para qué_ se captura cada dato ni la finalidad del tratamiento.
2. **Minimización:** `PersonForm` exige apellido materno y teléfono con la misma obligatoriedad que el nombre, reflejando el backend pero sin criterio de negocio documentado en UI; documentos aceptan título libre que puede repetir PII del nombre de archivo.
3. **Acceso:** la matriz UI es coherente con capacidades, pero **no hay señales de confidencialidad** ni registro de quién vio qué (solo mensaje genérico de validación backend).
4. **Retención:** no hay copy ni flujos UI sobre plazos, baja lógica vs eliminación de documentos, ni exportación/supresión (fuera de scope backend, pero ausente en formularios).
5. **Accesibilidad / obligatoriedad:** convención mixta (`*` en eventos, `required` HTML en personas/login, hints “opcional” en documentos); el componente `Field` no marca visualmente campos obligatorios de forma uniforme.

## Formularios en alcance

| ID   | Componente / ruta                  | Archivo                                           | Auth / rol visible en UI                         |
| ---- | ---------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| F-01 | Login administrativo               | `src/components/LoginPage.tsx`                    | Pre-auth; `/login`, `/admin`                     |
| F-02 | Alta/edición persona (jerarquía)   | `src/components/admin/PersonForm.tsx`             | Autenticado; `DomainAdminPage` + alcance por rol |
| F-03 | Evento (crear/editar borrador)     | `src/components/FormularioNuevoEvento.tsx`        | `canManageEvents` (todos los roles autenticados) |
| F-04 | Metadata de documento              | `PersonDocumentsTab` → `DocumentRegistrationForm` | `canRegisterDocuments` (subárbol / ADMIN)        |
| F-05 | Filtro jerárquico (búsqueda local) | `src/components/admin/HierarchyTree.tsx`          | Misma sesión; filtra nombres en cliente          |

**Fuera del alcance explícito del issue pero relacionado:** `FormularioNuevoLugar.tsx` (mapa legacy, teléfono en UI) — no integrado al flujo admin principal auditado aquí; evaluar en issue de mapa/legacy.

## Taxonomía de sensibilidad (frontend)

| Nivel | Descripción                                    | Ejemplos en formularios                          |
| ----- | ---------------------------------------------- | ------------------------------------------------ |
| S1    | Credenciales / autenticación                   | Contraseña login                                 |
| S2    | Identificación directa de persona              | Nombre, apellidos, teléfono (`PersonForm`)       |
| S3    | Identificación indirecta / localización        | Coordenadas evento, radio check-in, URL mapa     |
| S4    | Datos biométricos / imagen (metadata)          | Tipo FOTO, mime, tamaño                          |
| S5    | Datos gubernamentales / laborales (documentos) | CV, IDENTIFICACION, título/descripción metadata  |
| S6    | Metadatos operativos                           | Tipo evento, capacidad, fechas, estado documento |

## Matriz campo → formulario → rol → sensibilidad

### F-01 — Login (`LoginPage.tsx`)

| Campo UI   | Envío API  | Obligatorio UI                | Roles que ven el formulario             | Sensibilidad | Notas                                                                     |
| ---------- | ---------- | ----------------------------- | --------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| Correo     | `email`    | Sí (`required`, `type=email`) | Cualquier visitante en ruta login/admin | S2 (cuenta)  | Persiste en `LoginResponse.user.email` en sessionStorage vía sesión admin |
| Contraseña | `password` | Sí                            | Idem                                    | S1           | No se persiste en storage; solo tránsito POST                             |

**Sesión post-login (`admin-session.ts`):** `sessionStorage` guarda JWT + objeto `user` (id, email, persona_id, rol). Retención client-side ligada a `expires_in_seconds` + `logged_in_at`.

### F-02 — PersonForm (`PersonForm.tsx`)

| Campo UI         | API (`mapPersonInput`) | Obligatorio UI | Quién puede abrir el formulario (UI)                                                                       | Sensibilidad |
| ---------------- | ---------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| Nombre           | `nombre`               | Sí             | Crear: solo en nodo `self` con `childRole`; editar: `canManageSelected` (self o hijo directo del rol hijo) | S2           |
| Apellido paterno | `apellido_paterno`     | Sí             | Idem                                                                                                       | S2           |
| Apellido materno | `apellido_materno`     | Sí             | Idem                                                                                                       | S2           |
| Teléfono         | `telefono`             | Sí             | Idem                                                                                                       | S2           |

**Visualización sin formulario:** pestaña Persona muestra teléfono y estado a cualquier usuario con acceso al detalle en su árbol; pestaña Territorio lista nombres + geocercas de personas en alcance (`ScopedMap`).

**Backend (referencia, sin modificar):** `PersonaCreate` exige los cuatro campos (`schemas/persona.py`).

### F-03 — FormularioNuevoEvento

| Campo UI           | `EventInput`          | Obligatorio UI   | Rol (UI)          | Sensibilidad                                      |
| ------------------ | --------------------- | ---------------- | ----------------- | ------------------------------------------------- |
| Tipo               | `type`                | Sí (*)           | `canManageEvents` | S6                                                |
| Nombre             | `name`                | Sí (*)           | Idem              | S6                                                |
| Descripción        | `description`         | Sí (*)           | Idem              | S6 (puede contener PII si el operador la escribe) |
| Ubicación (texto)  | `locationText`        | Sí (*)           | Idem              | S3                                                |
| URL mapa           | `mapUrl`              | No (hint)        | Idem              | S3                                                |
| Latitud / Longitud | `coordinates`         | Sí (*)           | Idem              | S3                                                |
| Inicio / Fin       | `startsAt` / `endsAt` | Sí (*)           | Idem              | S6                                                |
| Capacidad máxima   | `maximumCapacity`     | No               | Idem              | S6                                                |
| Radio check-in (m) | `checkinRadiusMeters` | Sí (default 100) | Idem              | S3                                                |
| Requiere check-in  | `requiresCheckin`     | Checkbox         | Idem              | S6                                                |

**Exposición pública:** eventos **publicados** muestran ubicación y coordenadas en superficies públicas (ver `docs/design-system/public-surfaces-audit.md`); el formulario admin no advierte que lat/long pasarán a vista pública al publicar.

### F-04 — DocumentRegistrationForm

| Campo UI          | API body           | Obligatorio UI       | Rol (UI)               | Sensibilidad                                                  |
| ----------------- | ------------------ | -------------------- | ---------------------- | ------------------------------------------------------------- |
| Tipo              | `tipo`             | Select (default)     | `canRegisterDocuments` | S4–S5                                                         |
| Título            | `titulo`           | Sí                   | Idem                   | S5 (texto libre)                                              |
| Archivo           | (local) → metadata | Sí                   | Idem                   | S4–S5                                                         |
| Descripción       | `descripcion`      | No (label explícito) | Idem                   | S5                                                            |
| (generado) s3_key | `s3_key`           | —                    | Idem                   | S6 (ruta incluye `personId`, tipo; nombre archivo sanitizado) |

**Nota:** el binario **no** se sube aún; solo metadata. El nombre original del archivo influye en `s3_key` (`buildPrivateObjectKey`) — riesgo de PII en clave de almacenamiento si el operador usa nombres descriptivos.

### F-05 — Filtro jerárquico

| Campo UI       | Persistencia                | Rol                        | Sensibilidad                      |
| -------------- | --------------------------- | -------------------------- | --------------------------------- |
| Texto búsqueda | Solo estado React (cliente) | Autenticado con estructura | S2 (busca sobre nombres cargados) |
| Estatus        | Idem                        | Idem                       | S6                                |

## Hallazgos por dimensión

### Minimización de datos (DATA MINIMIZATION)

| ID   | Sev.   | Evidencia                                                                              | Impacto                                                                        | Recomendación                                                                                                                       |
| ---- | ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| DM-1 | MEDIUM | `PersonForm.tsx` L88–105: apellido materno y teléfono `required`                       | Captura uniforme para todos los roles hijo (incl. AMIGO) sin diferenciación UI | **P2:** Documentar con PO si AMIGO requiere teléfono; si no, negociar relajación backend + UI opcional por rol                      |
| DM-2 | MEDIUM | `FormularioNuevoEvento`: lat/long obligatorias aunque exista `locationText` + `mapUrl` | Precisión geográfica siempre capturada                                         | **P2:** Evaluar modo “solo texto” para borradores internos; mantener coordenadas obligatorias solo si check-in/publicación lo exige |
| DM-3 | LOW    | `DocumentRegistrationForm`: título obligatorio además de tipo archivo                  | Duplicación con nombre de archivo                                              | **P2:** Sugerir título derivado del tipo + versión; editable con advertencia                                                        |
| DM-4 | HIGH   | Evento publicado: coordenadas desde admin → público sin paso de revisión en formulario | Exposición de ubicación precisa                                                | **P1:** Copy en formulario al publicar (workflow admin, no solo form): “La ubicación será visible públicamente”                     |

### Propósito del tratamiento (PURPOSE)

| ID   | Sev.   | Evidencia                                                                      | Impacto                                           | Recomendación                                                                                                                   |
| ---- | ------ | ------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| PU-1 | HIGH   | `PersonForm` intro solo explica jerarquía, no finalidad de teléfono/documentos | Operadores capturan sin contexto LFPDPPP-oriented | **P1:** Bloques `form-intro` por sección: finalidad (“contacto operativo”, “integración estructura”) + enlace aviso integral    |
| PU-2 | MEDIUM | Login tiene enlaces privacidad; PersonForm / eventos / documentos no           | Inconsistencia de transparencia                   | **P1:** Pie compacto reutilizable (`InstitutionConfig`) en formularios admin                                                    |
| PU-3 | MEDIUM | `PersonDocumentsTab` L127–129 explica flujo técnico S3, no finalidad CV/ID     | Metadata sensible sin marco legal                 | **P1:** Texto por tipo documento (FOTO vs IDENTIFICACION vs CV) con finalidad y conservación orientativa (placeholder PO/legal) |

### Control de acceso (ACCESS)

| ID   | Sev.   | Evidencia                                                                          | Impacto                                            | Recomendación                                                                                     |
| ---- | ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-1 | OK     | `canManageSelected`, `canRegisterDocuments`, `capabilitiesFor`                     | UI alineada con política esperada                  | Mantener; no sustituir mensajes de error API                                                      |
| AC-2 | MEDIUM | Teléfono visible en pestaña Persona para cualquier rol con acceso al nodo          | Exposición horizontal dentro del árbol             | **P2:** PO define si teléfono es solo para ENLACE+ ; en UI enmascarar o restringir pestaña        |
| AC-3 | LOW    | Header admin muestra email sesión (`DomainAdminPage` L187, `AdminEventsPage` L205) | Identificación del operador en pantalla compartida | **P2:** Preferir nombre persona + rol; email en menú usuario                                      |
| AC-4 | MEDIUM | JWT + PII usuario en `sessionStorage` (`admin-session.ts`)                         | Riesgo XSS → exfiltración token + email            | **P1:** Documentar threat model; evaluar httpOnly cookie (backend) en issue de seguridad separado |

### Retención y ciclo de vida (RETENTION) — solo observaciones UI

| ID   | Sev.   | Evidencia                                                                                | Impacto                                           | Recomendación                                                                                                                       |
| ---- | ------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RE-1 | HIGH   | Baja persona: `confirm` menciona baja lógica; documentos/versiones sin copy de retención | Operador no entiende qué persiste                 | **P1:** En pestaña Documentos, explicar versionado + que baja persona no borra automáticamente archivos (validar con backend/legal) |
| RE-2 | MEDIUM | Historial documentos muestra metadata indefinida en UI                                   | Sin indicador de archivado/expiración             | **P2:** Cuando backend exponga fechas/estado, mostrar en lista                                                                      |
| RE-3 | LOW    | Login session expiry client-side (`isAdminSessionExpired`)                               | Token puede invalidarse antes/después en servidor | **P2:** Ya manejado con 401; documentar en aviso sesión                                                                             |

### Accesibilidad y obligatoriedad (criterio issue)

| ID     | Sev.   | Evidencia                                                              | Impacto                                        | Recomendación                                                                             |
| ------ | ------ | ---------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A11Y-1 | MEDIUM | `Field` no distingue visualmente obligatorio vs opcional (`Field.tsx`) | Solo `required` nativo o `*` manual en eventos | **P1:** Extender `Field` con `required` prop → `(obligatorio)` en label + `aria-required` |
| A11Y-2 | LOW    | `PersonForm` / login: obligatoriedad solo vía HTML5                    | Inconsistente con eventos (`*`)                | **P2:** Unificar convención DS                                                            |

## Recomendaciones priorizadas

### P1 (antes de ampliar captura de PII o integraciones)

1. **PU-1 + PU-2:** Textos de finalidad + enlace aviso en `PersonForm`, `FormularioNuevoEvento`, `DocumentRegistrationForm`.
2. **DM-4:** Advertencia de publicación de ubicación (en transición publicar + intro formulario evento).
3. **PU-3:** Finalidad por tipo de documento en registro metadata.
4. **RE-1:** Copy de ciclo de vida (baja persona vs documentos).
5. **A11Y-1:** API `Field` para campos obligatorios accesibles y visibles.
6. **AC-4:** Registrar decisión de almacenamiento de sesión (issue seguridad; sin cambio en TRA-115 backend).

### P2 (mejora incremental)

1. **DM-1 / DM-2:** Revisión minimización con PO (teléfono / coordenadas).
2. **AC-2 / AC-3:** Restricción o enmascaramiento teléfono; reducir email en header.
3. **DM-3 / RE-2 / A11Y-2:** UX metadata documentos y convenciones obligatorios.

## Decisiones derivadas de evidencia (no requieren PO)

| Decisión                               | Recomendación                       | Evidencia                            |
| -------------------------------------- | ----------------------------------- | ------------------------------------ |
| Inventario formularios admin del issue | F-01–F-05 cubiertos                 | Rutas y componentes listados arriba  |
| Matriz alineada con API                | Sí para personas/eventos/documentos | `domain.ts`, `FormularioNuevoEvento` |
| Autorización UI ≠ autorización real    | Mantener disclaimer actual          | `DomainAdminPage` L194–196           |

## Preguntas abiertas (requieren PO / legal)

1. ¿Teléfono es obligatorio para **AMIGO** y para todos los niveles jerárquicos?
2. ¿Apellido materno es requisito operativo o puede opcionalizarse?
3. ¿Qué campos de evento publicado son públicos (¿siempre lat/long)?
4. Plazos de conservación de CV, identificación y fotografía tras baja lógica de persona.
5. ¿Quién puede ver teléfono completo vs parcial dentro del árbol?
6. Texto definitivo de finalidad por categoría de dato para bloques `form-intro`.

## Definition of Done — TRA-115

- [x] Informe en repo (`docs/design-system/tra-115-pii-forms-audit.md`)
- [x] Cubre formularios admin identificados
- [x] Recomendaciones P1/P2
- [ ] Revisión PO/legal (pendiente)
- [ ] PR a `main` con `npm run format` (pendiente integración)

## Referencias

- `docs/design-system/public-surfaces-audit.md` (PII login, privacidad)
- `docs/design-system/tra-111-auth-session.md`
- `docs/legal/privacy-notice-versioning.md`
- Backend personas: `aditsystem-backend/src/aditsystem_backend/schemas/persona.py`
