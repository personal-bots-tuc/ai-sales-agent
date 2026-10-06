---
type: Architecture
version: <sha-corto>
validated: 2026-10-05
update_when: when folder layout, layers, entrypoints, or critical flows change
scope:
  - src
  - vite.config.ts
  - Dockerfile
  - nginx.conf.template
  - entrypoint.sh
---

# Architecture - Library System AI Bot

## Layer Structure
```
src/
├── pages/
│   └── chat/          # Main chat page + sub-components
├── components/        # Shared presentational components
├── hooks/             # Shared logic hooks (state, effects)
├── api/               # API client + endpoint wrappers
├── test/              # Test utilities + setup
└── main.tsx           # App bootstrap
```

## Entry Points
- **Development**: `vite` (port 5175, proxy /api → localhost:3000)
- **Production**: `nginx` (port 5175, serves `dist/`, SPA fallback)
- **Docker Build**: `npm run build` → `dist/` → nginx static serve

## Critical Flows

### 1. Bootstrap
```
main.tsx → BrowserRouter → App → ChatPage
```

### 2. Chat Flow
```
ChatPage → useChat → useMessages → API /ai/chat → Backend IA (OpenAI/Z.ai)
                    ↓
              useTools → Function calling (searchBooks, checkAvailability, etc.)
                    ↓
              Streaming response → UI update incremental
```

### 3. Offline/Online Handling
```
useOnlineStatus → window.navigator.onLine + events
              → Offline queue (localStorage) → Sync on reconnect
```

## Data Flow
```
User Message → Hook (useChat) → API Client (axios) → Backend (Express) → IA Service
                                    ↓
                              Streaming/Response → Hook State → UI Update
```

## Deployment Architecture
```
GitHub Push → GitHub Actions (lint, test, build, push GHCR)
                    ↓
              Railway Auto-deploy (detecta imagen nueva)
                    ↓
              Docker: entrypoint.sh → envsubst config.js + nginx.conf
                    ↓
              nginx:80 → SPA + /health + /config.js
                    ↓
              Railway Proxy → Custom Domain (bot.tudominio.com)
```

## Security Boundaries
- **Frontend**: Solo variables `VITE_*` públicas (API URL)
- **Secrets**: IA API keys, JWT, DB → SOLO en backend
- **CORS**: Backend permite origins de frontend (prod + staging + *.railway.app)
- **Rate limiting**: Backend maneja rate limiting por IP/user