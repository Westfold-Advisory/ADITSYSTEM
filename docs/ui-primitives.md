# Primitives UI

Los primitives de `src/components/ui` usan los tokens cyber definidos por TRA-73 y no cambian el contrato de API.

- `Button`: `default` para la acción principal; `outline` y `secondary` para acciones no destructivas; `destructive` sólo para acciones irreversibles. Cuando una acción espera red, usar `disabled` y `aria-busy` para impedir envíos duplicados.
- `Field`: recibe una etiqueta visible y conecta ayuda o error con el control mediante `aria-describedby`; acepta `input`, `textarea` o `select` como único hijo.
- `Card`: superficie de contenido con borde, radio y elevación consistentes.
- `AppBar` y `Navigation`: encabezado y navegación semántica, con adaptación a pantallas angostas.
- `Alert`: usa `tone="error"` para errores bloqueantes (`role="alert"`) y los demás tonos para feedback no intrusivo.
- `LoadingState`, `EmptyState` y `ErrorState`: reservan espacio estable para carga, ausencia de datos y fallo recuperable.
- `Dialog`: diálogo modal nativo; se cierra con Escape o su acción de cierre. El disparador debe conservar el foco al cerrarlo.

Todos los controles dependen del foco visible global y de la escala de contraste de los tokens. Las animaciones se desactivan con `prefers-reduced-motion`.
