---
type: Contracts
version: <sha-corto>
validated: 2026-10-05
update_when: when API contracts, env vars, or external dependencies change
scope:
  - src/api/
  - src/hooks/useChat.ts
  - vite.config.ts
  - .env.example
---

# Contracts - Library System AI Bot

## Consumed APIs (Backend)

### Chat / IA
- `POST /ai/chat` → `{ message: string, stream: boolean }` → Streaming response o `{ response: string, toolCalls: ToolCall[] }`
- `POST /ai/chat/stream` → Server-Sent Events para streaming
- `GET /ai/conversations` → `Conversation[]` (historial)
- `GET /ai/conversations/:id` → `Conversation` (detalle con mensajes)
- `DELETE /ai/conversations/:id` → void

### Books (Catálogo)
- `GET /books` → `Book[]` (filtros: search, category, available, page)
- `GET /books/:id` → `Book` (detalle con disponibilidad)
- `GET /books/search` → `Book[]` (búsqueda semántica para IA)

### Loans (Préstamos)
- `GET /loans/my` → `Loan[]` (préstamos del usuario actual)
- `GET /loans/:id` → `Loan` (detalle)
- `POST /loans/:id/renew` → `Loan` (renovar)
- `POST /loans/:id/reserve` → `Reservation` (reservar)

### Auth (si aplica)
- `POST /auth/login` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → `{ accessToken }`

## Environment Variables (Runtime via config.js)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | Base URL del API backend | `https://api.tudominio.com` |
| `VITE_APP_NAME` | ❌ | Nombre mostrado en UI | `Library Bot` |
| `VITE_POS_BASE_URL` | ❌ | URL del POS (para links cruzados) | `https://pos.tudominio.com` |

## External Dependencies
- **IA Provider**: OpenAI / Z.ai (solo backend)
- **Function Calling**: Tools definidos en backend (searchBooks, checkAvailability, getUserLoans, renewLoan, reserveBook)

## Build-time Variables (vite define)
```typescript
define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
}
```

## Compatibility Rules
- **Breaking changes**: Requiere coordinación con backend + admin + POS
- **Versioning**: API versionada en URL (`/api/v1/...`)
- **Deprecation**: 2 versiones mínimas soportadas
- **Streaming**: SSE para respuestas IA en tiempo real