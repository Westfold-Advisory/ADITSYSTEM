## Explorador de mapa

Accesibilidad (WCAG 2.2 AA, lista sin puntero, gaps MapLibre): [`design-system/tra-110-public-map-a11y-audit.md`](design-system/tra-110-public-map-a11y-audit.md).

Los controles se operan por acción explícita: zoom, ubicación actual, orientación, pantalla completa, restablecer vista y cambiar mapa base. Los puntos se agrupan a zoom bajo; al seleccionar un punto se enfoca el evento y se conserva la lista como alternativa no visual.

En móvil, el mapa conserva el lienzo completo y el explorador es una ficha inferior: cerrada cuando se oculta, lista sin selección y detalle al seleccionar un evento. Las capas territoriales son independientes y comienzan desactivadas para evitar ruido visual y trabajo de renderizado innecesario.
