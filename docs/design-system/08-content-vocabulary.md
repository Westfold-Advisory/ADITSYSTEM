# Content design — ADITSYSTEM (es-MX)

Guía de **tono, terminología y estilo** para interfaz. **Lote 1** implementa `src/content/admin-ui-es.ts` (Personas, mapa admin, ficha). **Lote 2 (TRA-146)** debe cumplir este contrato antes de merge.

---

## 1. Voz y tono

| Atributo | Sí                                       | No                                        |
| -------- | ---------------------------------------- | ----------------------------------------- |
| Registro | Institucional, claro, operativo          | Campaña, startup, exclamaciones           |
| Persona  | **Tú** ( segunda persona )               | «El usuario», «Usted» (salvo aviso legal) |
| Actitud  | Confianza por precisión y consecuencias  | Humor, emoji en UI admin, urgencia falsa  |
| Longitud | Una idea por frase; intros ≤ 2 oraciones | Párrafos largos, redundancia              |
| Permisos | «Según tu rol y alcance»                 | «El backend valida…», «403»               |

**Objetivo:** que la persona complete la tarea sin traducir jerga interna.

---

## 2. Estilo de redacción

### Acciones (botones, enlaces)

- **Verbo + objeto** cuando quepa: «Guardar cambios», «Dar de baja», «Cerrar ficha», «Registrar documento».
- **Cancelar** (no «Descartar» salvo formulario con borrador explícito).
- Evitar «Submit», «OK» solos, «Click aquí».

### Títulos y subtítulos de página

- **Subtítulo = tarea + primer paso**, como Lote 1:
  - Personas: consulta y administra según rol y alcance.
  - Mapa: ubicación en alcance + «Selecciona un punto… para ver la ficha».
- No repetir el H1; no metadatos técnicos.

### Estados de carga

- Formato: **`Cargando {recurso}…`** (ellipsis unicode `…`, no tres puntos ASCII).
- Ejemplos Lote 1: «Cargando estructura…», «Cargando ficha…», «Cargando mapa de cobertura…».
- Lote 2: «Cargando eventos…», «Cargando documentos…».

### Vacíos (empty states)

- **Qué falta** + **qué puede hacer** (opcional).
- Ejemplo Lote 1: «Ninguna persona coincide con los filtros actuales. Ajusta el rol o la búsqueda.»
- Evitar culpar al usuario («No ingresaste…») sin contexto.

### Errores (Lote 2)

- **Qué pasó** + **cómo recuperarse**; sin códigos HTTP, stack traces ni nombres de servicio.
- Plantilla: «No pudimos {acción}. {Instrucción concreta}.»
- Sesión: alinear con tono de Lote 1 (alcance/permiso, no «token inválido»).

### Confirmaciones destructivas

- Pregunta directa con **nombre de la entidad**.
- **Consecuencia** en segunda frase (baja lógica, irreversible, etc.).
- Reutilizar labels Lote 1: «Dar de baja», «Cancelar».

### Accesibilidad (texto visible y `aria-label`)

- Misma cadena que ve el usuario cuando sea posible.
- «Ficha» / «Cerrar ficha» (Lote 1); no «panel», «drawer», «modal» en copy visible.

---

## 3. Terminología obligatoria (alineada a Lote 1)

Usar **exactamente** estos términos salvo PO apruebe excepción documentada.

| Concepto              | Término UI                                                                        | No usar                                |
| --------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| Detalle de persona    | **Ficha**                                                                         | Panel, sidebar, detalle, profile       |
| Persona en mapa admin | **Punto en el mapa** / seleccionar en el mapa                                     | Pin                                    |
| Mapa admin            | **Mapa de cobertura**                                                             | Coverage map                           |
| Densidad / heat layer | **Mapa de concentración**                                                         | Heatmap, mapa de calor                 |
| Ámbito de datos       | **Tu alcance** / **alcance operativo**                                            | Subárbol, scope técnico                |
| Jerarquía             | **Estructura** (de personas)                                                      | Subárbol, nodos                        |
| Geofence              | **Geocerca**                                                                      | Layer, polígono (solo en copy usuario) |
| Baja                  | **Dar de baja** + explicar **baja lógica**                                        | Eliminar, borrar, delete               |
| ID sistema            | **Identificador** (solo si hace falta); preferir «se asignará automáticamente»    | Capturar identificador, UUID           |
| Roles                 | **Coord. general, Coordinador, Enlace, Amigo** (etiquetas existentes `roleLabel`) | Inventar sinónimos                     |
| Admin shell           | **Consola** / módulos **Personas**, **Mapa de cobertura**, **Eventos**            | Dashboard genérico                     |

### Glosario ampliado (Lote 2)

| Evitar                  | Preferir                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| Publicar / draft (EN)   | **Publicar** / **Borrador**                                            |
| Login / sign in         | **Iniciar sesión**                                                     |
| Logout                  | **Cerrar sesión**                                                      |
| Upload                  | **Subir** / **Registrar** (documentos)                                 |
| Failed / error genérico | «No pudimos…» + acción                                                 |
| Event (sustantivo UI)   | **Evento**                                                             |
| Capacity                | **Cupo** / **Capacidad** (mantener uno; revisar `EventCard` al migrar) |
| Workflow                | **Flujo** / **Estado del evento**                                      |

---

## 4. Arquitectura de archivos (Lote 2)

1. **Reutilizar** claves existentes en `admin-ui-es.ts`; no duplicar strings en componentes.
2. Añadir namespaces en el mismo archivo o split acordado:
   - `adminUiCopy.eventos.*`
   - `adminUiCopy.documentos.*`
   - `authUiCopy.*` → `src/content/auth-ui-es.ts` si el módulo crece.
   - `publicUiCopy.*` → `src/content/public-ui-es.ts` (mapa y eventos públicos).
3. **Prohibido** nuevo copy user-facing inline en TSX salvo prototipo acotado; migrar a módulo content antes del merge.

---

## 5. Lista negra (grep en CI/review)

No deben aparecer en strings user-facing (salvo comentarios de código):

`backend`, `frontend`, `API`, `endpoint`, `heatmap`, `pin`, `subárbol`, `submit`, `token`, `422`, `500`, `UUID`, `JSON`, `fetch`, `hook`

Excepciones: nombres de archivo en docs técnicas, no en UI.

---

## 6. Definition of Done — copy (Lote 2)

- [ ] Textos nuevos viven en `src/content/*-ui-es.ts`.
- [ ] Tabla antes/después en comentario **TRA-146** para sign-off PO.
- [ ] Sin términos de lista negra (revisión manual + test tipo `admin-ui-es.test.ts`).
- [ ] Misma acción = mismo verbo que Lote 1 (p. ej. «Dar de baja», «Cerrar ficha»).
- [ ] `npm run format:check`, lint, test, build.
- [ ] PR exclusivo → **`main`**.

---

## 7. Referencia Lote 1

Implementación: `src/content/admin-ui-es.ts`  
Tests de regresión: `src/content/admin-ui-es.test.ts`

## 8. Referencia Lote 2 (TRA-146)

Implementación: `adminUiCopy.eventos.*`, `adminUiCopy.documentos.*` en `src/content/admin-ui-es.ts`; `publicUiCopy.capas.*` en `src/content/public-ui-es.ts`.
Tests de regresión: `src/content/admin-ui-es.test.ts`, `src/content/public-ui-es.test.ts`, `src/content/content-blacklist.test.ts` (lista negra §5 sobre todos los módulos de copy).

Auditados sin cambios de copy (ya cumplían el contrato): `FormularioNuevoEvento`, `PersonChangePasswordForm`, `LoginPage`, `lib/auth-messages.ts`.
Corrección de datos (no solo copy): `UnauthorizedRoleScreen` mostraba el rol crudo del backend (`COORDINADOR_GENERAL`); ahora usa `roleLabel()`. `PersonDocumentsTab` mostraba el tipo MIME crudo (`application/pdf`); ahora usa `formatDocumentFormat()`.

## Roadmap

- **Lote 1:** Personas, mapa admin, ficha, formularios, baja (PR #118).
- **Lote 2 (TRA-146):** Eventos admin, documentos, login/sesión, mapa público, capas territoriales.
- **Lote 3:** Unificación de `auth-messages` y errores API.
