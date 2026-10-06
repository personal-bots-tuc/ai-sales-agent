---
type: Traps
version: <sha-corto>
validated: 2026-10-05
update_when: when new non-obvious behavior is confirmed
---

# Traps - Library System AI Bot

## Runtime Config (CRÍTICO)
**Problema**: `VITE_*` variables se inyectan en build-time por Vite, pero Railway inyecta variables en runtime.
**Solución**: Usamos `config.template.js` + `entrypoint.sh` + `envsubst` para generar `config.js` en runtime.
**Evidencia**: `index.html` carga `<script src="/config.js">` ANTES de `<script type="module" src="/src/main.tsx">`.
**App accede**: `window.__ENV__.VITE_API_BASE_URL` (NO `import.meta.env.VITE_API_BASE_URL` en producción).

## Docker Multi-stage
**Problema**: `npm ci` en builder instala devDependencies, pero runtime usa nginx (no node).
**Solución**: Builder compila → copia `dist/` a nginx. No hay node en runtime.
**Verificación**: `docker exec <container> which node` → not found.

## Healthcheck
**Problema**: `wget /` siempre 200 (sirve index.html), aunque app falle en JS.
**Solución**: Endpoint real `/health` servido por nginx (location = /health → return 200 JSON).
**Verificación**: `curl /health` → `{"status":"ok"}` independiente de React.

## SPA Routing + Nginx
**Problema**: Refresh en `/chat/history` → 404 si nginx no tiene fallback.
**Solución**: `try_files $uri $uri/ /index.html;` en location /.
**Verificación**: `docker run` → refresh en ruta profunda → 200 OK.

## Proxy Dev vs Prod
**Problema**: En dev, `/api` proxy a localhost:3000. En prod, NO hay proxy (nginx sirve estáticos, API en otro dominio).
**Solución**: `vite.config.ts` proxy solo en `mode !== 'production'`.
**Verificación**: Build production → no hay proxy config en dist.

## Streaming IA (SSE)
**Problema**: Respuestas IA pueden tardar >30s, timeout de nginx/proxy.
**Solución**: Backend usa Server-Sent Events (SSE) para streaming incremental.
**Configuración nginx**: `proxy_read_timeout 300s;` en backend (no en frontend).
**Verificación**: Chat muestra respuesta token por token.

## Offline Queue
**Problema**: Usuario sin conexión pierde mensajes.
**Solución**: Cola en localStorage + sync automático al reconectar.
**Evidencia**: `useOnlineStatus` hook + `offlineQueue` en localStorage.

## Tailwind 4 + Vite
**Problema**: Tailwind 4 usa `@import "tailwindcss"` en CSS, no `tailwind.config.js`.
**Solución**: `@tailwindcss/vite` plugin + `@import "tailwindcss"` en `index.css`.
**Evidencia**: `vite.config.ts` plugin + `src/index.css`.

## React 19 + StrictMode
**Problema**: StrictMode monta/desmonta doble en dev → efectos secundarios dobles.
**Solución**: Cleanup functions en useEffect + `AbortController` en fetches.
**Evidencia**: `useChat.ts` usa AbortController para cancelar requests.

## Husky + Commit Message
**Problema**: Commits sin ticket no trazables.
**Solución**: `.husky/commit-msg` valida formato `[TICKET-123]-descripcion`.
**Excepción**: Merge commits y reverts permitidos (validar en regex).

## Migración pnpm → npm
**Problema**: Lockfile pnpm incompatible con Railway/Docker cache.
**Solución**: Eliminar `pnpm-lock.yaml`, usar `package-lock.json` npm.
**Verificación**: `npm ci` en Docker builder funciona correctamente.