# Acciones en consola admin (Etapa 1)

**Alcance:** rutas `/admin`, `/admin/mapa`, `/admin/personas` dentro de `.admin-workspace`.  
**Componente base:** `@/components/ui/button` (`data-slot="button"`, variantes CVA).  
**Tokens:** `--md-sys-*` únicamente; no estilos nativos `.admin-page > button` en workspace.

## Jerarquía

| Nivel       | Variante DS   | Cuándo                                                                   | Máximo por bloque |
| ----------- | ------------- | ------------------------------------------------------------------------ | ----------------- |
| Primaria    | `default`     | Avance principal del flujo (publicar, iniciar, finalizar, guardar envío) | **1**             |
| Secundaria  | `outline`     | Editar, registrar, cancelar flujo, filtros toggles                       | N                 |
| Terciaria   | `ghost`       | Cerrar drawer, icon-only con `aria-label`                                | N                 |
| Destructiva | `destructive` | Baja / eliminar irreversible (con confirmación)                          | 1 visible         |

## Reglas

1. No competir primarias: si hay «Guardar», el resto en `outline` o `ghost`.
2. En tarjetas de listado (eventos), una sola `default` por tarjeta (la acción de progreso de estado).
3. Agrupar con `AdminActionBar` (`admin-action-bar`), no márgenes ad hoc entre botones.
4. Loading: `status="loading"` + `aria-busy`; no segundo clic.
5. Copy (ES): **Crear evento**, **Guardar cambios**, **Registrar…**, **Dar de baja**, **Eliminar** (solo eventos borrador/cancelado).

## Anti-patrones

- Botón nativo `<button>` sin DS en admin (salvo nav sidebar / organigrama tarjeta).
- Varios `default` filled en la misma fila.
- `#174681` u otros hex fuera de tokens.

## Referencia

Auditoría: [`Product-UI-UX-Modernization-Audit.md`](./Product-UI-UX-Modernization-Audit.md).
