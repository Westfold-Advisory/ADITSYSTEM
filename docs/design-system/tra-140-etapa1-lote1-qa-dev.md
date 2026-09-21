# QA dev — Etapa 1 Lote 1 (PR #103) antes de merge

## Importante: qué hay hoy en dev compartido

El deploy a **aditsystem-dev** ocurre **solo al hacer push a `main`** (workflow `Deploy to S3`).

| Build                                                | Contenido aproximado                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Dev actual** (`main` ≈ #102)                       | Sidebar, ancho `admin-workspace`, drawer `PersonSummary`                     |
| **PR #103** (rama `feat/etapa1-lote1-admin-actions`) | + `AdminActionBar`, reglas de botones eventos, sin pills legacy en workspace |

Por tanto: en **https://aditsystem-dev.ervic.pro/** puedes validar **canvas + drawer (#101–102)**; los **botones homologados del lote 1 (#103)** no aparecen en dev hasta merge + deploy.

Para revisar **los tres puntos del PR #103 antes del merge**, usa **preview local** apuntando a la API de dev (abajo).

---

## Checklist PO (1440×900 recomendado)

### A. `/admin` — Eventos (solo con build #103)

- [ ] Sidebar izquierda: Personas · Mapa de cobertura · Eventos.
- [ ] Contenido usa casi todo el ancho (sin columna centrada ~960px).
- [ ] Cada tarjeta: **Editar** = outline.
- [ ] Cada tarjeta: **como mucho un** botón filled (`Publicar`, `Iniciar` o `Finalizar` según estado).
- [ ] `Cancelar` / `Despublicar` = outline; `Eliminar` = destructive (rojo).
- [ ] Header: acción **Crear evento** = outline (esquina superior).

### B. `/admin/personas` (dev actual ≈ #102; drawer acciones outline reforzado en #103)

- [ ] Subnav en sidebar: Listado · Árbol · Organigrama.
- [ ] **Listado u Organigrama** sin panel derecho hasta seleccionar fila/tarjeta.
- [ ] Al seleccionar: drawer con ✕, `PersonSummary`, tabs.
- [ ] Acciones (Registrar / Editar): **outline**, no pill azul legacy (#103).

### C. Ancho canvas — Personas, Mapa, Eventos

- [ ] **Personas** → organigrama o listado ocupa el área principal (mapa/chart no “flotando” en 960px).
- [ ] **Mapa de cobertura** → mapa + toolbar a ancho completo.
- [ ] **Eventos** → grid de tarjetas ancho completo.

---

## Preview local contra API dev (pre-merge #103)

Desde el repo, rama del PR:

```bash
git fetch origin
git checkout feat/etapa1-lote1-admin-actions
npm ci
VITE_API_BASE_URL=https://api.aditsystem-dev.ervic.pro/api/v1 npm run build
VITE_API_BASE_URL=https://api.aditsystem-dev.ervic.pro/api/v1 npx vite preview --host 127.0.0.1 --port 4173
```

1. Abre **http://127.0.0.1:4173/** (entrada `/`; rutas profundas pueden requerir navegación interna o `history` como en S3).
2. Inicia sesión con tu cuenta admin de dev.
3. Navega con el **sidebar** a Personas / Mapa / Eventos.
4. Recorre el checklist A–C.

Credenciales: las de tu entorno dev (no van en el repo).

---

## Después de tu OK

1. Merge **PR #103** → `main`.
2. Esperar job **Deploy to S3** en GitHub Actions.
3. Repetir checklist A–C en **https://aditsystem-dev.ervic.pro/** (misma sesión/API).

CI PR #103: https://github.com/Westfold-Advisory/ADITSYSTEM/pull/103
