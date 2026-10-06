---
type: Overview
version: <sha-corto>
validated: 2026-10-05
update_when: when purpose, capabilities, or ownership change
scope:
  - src/pages/chat
  - src/components
  - src/hooks
  - src/api
---

# Overview - Library System AI Bot

## Purpose
Chatbot IA para consultas de catálogo, préstamos, disponibilidad y renovaciones en biblioteca escolar. Interfaz conversacional accesible para estudiantes, docentes y bibliotecarios.

## Capabilities
- **Chat conversacional**: Interfaz tipo WhatsApp/Telegram para consultas naturales
- **Catálogo**: Búsqueda de libros por título, autor, ISBN, categoría
- **Préstamos**: Consultar préstamos activos, historial, renovaciones
- **Disponibilidad**: Ver stock en tiempo real, reservar libros
- **Notificaciones**: Alertas de vencimiento, libros disponibles
- **Offline/Online**: Estados de conexión, cola de mensajes offline
- **Multi-idioma**: Soporte español/inglés (futuro)

## Users
- **Estudiantes**: Consultan catálogo, préstamos, disponibilidad
- **Docentes**: Consultas académicas, reservas para clase
- **Bibliotecarios**: Monitoreo de consultas, estadísticas de uso
- **Sistema**: Consume API backend + IA (OpenAI/Z.ai)

## Tech Stack
- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 + React Router 7
- Vitest + React Testing Library
- ESLint (flat config) + Prettier + Husky
- Docker multi-stage (node:22 → nginx:alpine)
- Railway deployment (auto-deploy on push)

## Code Map
```
src/
├── pages/
│   └── chat/          # Página principal de chat
│       ├── components/   # UI components (MessageList, Input, Header, etc.)
│       └── hooks/        # Lógica de chat (useChat, useMessages, etc.)
├── components/        # Shared UI (Loading, Offline, Error states)
├── hooks/             # Shared hooks (useAuth si aplica)
├── api/               # Axios client + endpoints (chat, books, loans)
├── test/              # Vitest setup + utils
└── main.tsx           # Entry point
```

## Ownership
- Team: Personal Bots TUC
- Maintainer: @ariel