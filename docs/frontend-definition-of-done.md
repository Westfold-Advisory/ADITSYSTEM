# Definition of Done — Frontend (ADITSYSTEM)

Antes de abrir o actualizar un PR hacia `main`, ejecutar en la raíz del repo (con dependencias instaladas):

```bash
npm run format
npm run lint
npm run format:check
npm test
npm run build
```

## Comandos

| Comando                | Qué valida                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `npm run format`       | Aplica Prettier (`prettier --write .`) — ejecutar antes del commit si hubo cambios de estilo. |
| `npm run format:check` | CI: falla si algún archivo no cumple Prettier.                                                |
| `npm run lint`         | ESLint (incl. reglas React Compiler / `react-hooks/*`).                                       |
| `npm test`             | Tests unitarios (`tsx --test`).                                                               |
| `npm run build`        | TypeScript + build Vite de producción.                                                        |

## Checklist DoD (tarea con cambios en `ADITSYSTEM`)

- [ ] Código alineado a convenciones existentes (Design System / tokens `--md-sys-*` en componentes nuevos).
- [ ] `npm run format` y `npm run lint` sin errores.
- [ ] `npm run format:check`, `npm test` y `npm run build` en verde (mismo orden que CI).
- [ ] PR desde rama actualizada con `main` (`git fetch origin main && git merge origin/main` o rebase, según acuerdo del equipo).
- [ ] Descripción del PR con plan de prueba manual si aplica.
- [ ] Sin secretos ni `.env` versionados.

## Notas

- Muchos fallos de lint/Prettier se corrigen solo con `npm run format` y pequeños ajustes de dependencias en `useCallback` / evitar `setState` síncrono en `useEffect` sin necesidad.
- Si CI falla en lint, reproducir localmente con `npm run lint` antes de reintentar el pipeline.
