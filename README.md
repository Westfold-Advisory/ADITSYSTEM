# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## CI/CD

El repositorio usa GitHub Actions para validar pull requests hacia `main` y desplegar a S3 cuando se integra a `main`.

### Estrategia de ramas

- Crear ramas `feature/*` para cada cambio.
- Abrir pull request hacia `main`.
- Proteger `main` en GitHub con pull request obligatorio, checks requeridos y sin push directo.

### Checks requeridos

El workflow `.github/workflows/ci.yml` ejecuta:

- Gitleaks CLI para detectar secretos expuestos sin depender de licencia comercial del action.
- `npm run format:check` con Prettier.
- `npm run lint` con ESLint.
- `npm test` con `node:test` y `tsx`.
- `npm audit --audit-level=high` para dependencias vulnerables.
- Build de produccion con `npm run build`.
- Semgrep como SAST ligero en PRs y `main`, sin bloquear el deploy S3 si GitHub Code Scanning no esta disponible.

### Deploy a S3

El job `Deploy to S3` corre solo en `push` a `main`, despues de que los jobs `Quality gates` y `Semgrep SAST` pasan. Publica exactamente el artefacto `dist/` generado y validado por `Quality gates`; no recompila durante el despliegue. El workflow falla si el artefacto no contiene `dist/index.html` y ejecuta:

```sh
aws s3 sync ./dist s3://$S3_BUCKET --delete
```

Configurar en GitHub:

| Nombre              | Tipo     | Uso                                                     |
| ------------------- | -------- | ------------------------------------------------------- |
| `AWS_ROLE_ARN`      | Variable | ARN del rol IAM asumido por OIDC para publicar el sitio |
| `S3_BUCKET`         | Variable | Bucket S3 destino                                       |
| `AWS_REGION`        | Variable | Region AWS; si no se define usa `mx-central-1`          |
| `VITE_API_BASE_URL` | Variable | URL pública de la API incluida durante el build         |

Configurar estas variables como variables del repositorio: el build de calidad se reutiliza literalmente en el deploy. El job de despliegue usa el GitHub Environment `production`, porque es el subject actualmente confiado por el rol OIDC creado por Terraform para el ambiente AWS de desarrollo. Ninguno de estos valores debe contener credenciales: Vite expone `VITE_API_BASE_URL` al navegador. El rol IAM debe limitarse a `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` y `s3:DeleteObject` sobre el bucket de frontend.

### Actualizacion de dependencias

Dependabot esta configurado en `.github/dependabot.yml` para crear PRs semanales de npm y GitHub Actions. Revisar esos PRs con el mismo flujo de checks antes de integrarlos.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# ADIT SYSTEM

## Desarrollo local

Configure `VITE_API_BASE_URL` con la URL del backend. La interfaz no incluye una API simulada: autenticación, roles y ownership se resuelven exclusivamente contra el contrato publicado por el backend.
