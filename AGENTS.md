---
type: Repository
app: librarysystem-ai-bot
archetype: frontend
version: <sha-corto>
validated: 2026-10-05
update_when: when repo identity, reading order, or maintenance rules change
---

# AGENTS.md - Library System AI Bot

## Identity
Chatbot IA para consultas de catálogo, préstamos y disponibilidad en biblioteca escolar. Interfaz conversacional para estudiantes y docentes.
Consumidores: estudiantes, docentes, bibliotecarios (via web).
No hace: gestión administrativa (eso es Admin), punto de venta (eso es POS).

## How to use this repository
Read these guides in order:
1. [overview.md](docs/agent/overview.md) — purpose and capability map.
2. [architecture.md](docs/agent/architecture.md) — layout and request/data flow.
3. [contracts.md](docs/agent/contracts.md) — exposed and consumed interfaces.
4. [runbook.md](docs/agent/runbook.md) — commands and Definition of Done.
5. [traps.md](docs/agent/traps.md) — non-obvious behavior.

## Maintenance rule
When code changes, update the relevant guide in the same PR. Record new,
non-obvious gotchas in traps.md. Review consumers before breaking a contract.