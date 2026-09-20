# Definition of Done — Frontend (ADITSYSTEM)

Aplica a **toda** tarea o PR que toque este repositorio (código, documentación en repo, configs).

## Antes de cada commit

```bash
npm run format
```

Equivale a `prettier --write .` (también en Markdown bajo `docs/`). Incluir los archivos formateados en el mismo commit.

## Antes de abrir o actualizar un PR (mismo orden que CI)

```bash
npm run format
npm run lint
npm run format:check
npm test
npm run build
```

## Comandos

| Comando                | Qué valida                                             |
| ---------------------- | ------------------------------------------------------ |
| `npm run format`       | Aplica Prettier — **obligatorio antes de cada commit** |
| `npm run format:check` | CI: falla si algún archivo no cumple Prettier          |
| `npm run lint`         | ESLint (incl. reglas React Compiler / `react-hooks/*`) |
| `npm test`             | Tests unitarios (`tsx --test`)                         |
| `npm run build`        | TypeScript + build Vite de producción                  |

## Checklist DoD (copiar en issues Multica frontend)

- [ ] `npm run format` ejecutado y cambios incluidos en el commit
- [ ] Código alineado a convenciones existentes (Design System / tokens `--md-sys-*` en componentes nuevos)
- [ ] `npm run lint`, `npm run format:check`, `npm test`, `npm run build` en verde
- [ ] Rama actualizada con `origin/main` antes del PR
- [ ] PR hacia `main`; CI en verde; plan de prueba manual en descripción si aplica
- [ ] Sin secretos ni `.env` versionados

## Notas

- Si CI falla solo en Prettier, casi siempre basta con `npm run format` y un commit adicional.
- Muchos fallos de lint se corrigen con pequeños ajustes (p. ej. deps en `useCallback`, evitar `setState` síncrono en `useEffect`); Prettier no los corrige.
