# Content design — consola admin (es-MX)

Principios alineados al brief institucional (lenguaje claro, español primero):

1. **Verbos para acciones:** «Guardar cambios», «Dar de baja», «Cerrar ficha».
2. **Sin jerga técnica al usuario:** evitar backend, pin, heatmap, subárbol, identificador manual.
3. **Consecuencias explícitas** en acciones sensibles (baja lógica, alcance).
4. **Consistencia:** misma acción = mismo verbo en Personas, mapa y formularios.

## Fuente de verdad (Lote 1)

`src/content/admin-ui-es.ts` — textos reutilizables de la consola admin.

## Glosario preferido

| Evitar                 | Preferir                              |
| ---------------------- | ------------------------------------- |
| Pin                    | Persona en el mapa / punto en el mapa |
| Heatmap                | Mapa de concentración                 |
| Backend valida…        | (omitir; hablar de rol y alcance)     |
| Subárbol               | Estructura de la persona seleccionada |
| Capturar identificador | El sistema asigna el identificador    |

## Roadmap copy (Senior Frontend)

- **Lote 1:** Personas, mapa admin, ficha, formularios persona, baja lógica (este PR).
- **Lote 2:** Eventos admin, documentos, login/ sesión, mapa público.
- **Lote 3:** Mensajes de error (`auth-messages`, API) unificados con tono institucional.
