# Definition of Done — Frontend (ADITSYSTEM)

Aplica a **toda** tarea o PR que toque este repositorio (código, docs en repo, configs).

## Antes de cada commit

Ejecutar en la raíz del proyecto:

```bash
npm run format
```

Equivale a `prettier --write .` y corrige la mayoría de fallos de `format:check` (incluidos Markdown bajo `docs/`).

## Antes de abrir o actualizar un PR (mismo orden que CI)

```bash
npm run format
npm run lint
npm run format:check
npm test
npm run build
```

| Paso | Comando | Obligatorio |
| ---- | ------- | ----------- |
| Formatear | `npm run format` | Sí — **siempre**, aunque solo hayas editado documentación |
| Lint | `npm run lint` | Sí |
| Verificar formato | `npm run format:check` | Sí (CI falla si hay diff pendiente) |
| Tests | `npm test` | Sí |
| Build | `npm run build` | Sí |

## Checklist DoD (copiar en issues Multica frontend)

- [ ] `npm run format` ejecutado y cambios incluidos en el commit
- [ ] `npm run lint`, `npm run format:check`, `npm test`, `npm run build` en verde
- [ ] Rama actualizada con `origin/main` antes del PR
- [ ] PR hacia `main`; CI en verde
- [ ] Sin secretos ni `.env` versionados

## Notas

- Si CI falla solo en Prettier, casi siempre basta con `npm run format` y un commit adicional.
- Reglas ESLint (React Compiler / `react-hooks/*`) requieren cambios de código puntuales; no las corrige Prettier.
