# The Reading Salon

A private society for readers, codified as a long-form web app: a curated landing page, a members library, a debate hall, and a curator-contributed essay archive.

## Stack

- **Backend** — `backend/` — FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, Typer CLI, Docker + Postgres.
- **Frontend** — `frontend/` — Vite, React 19, React Router 7, TanStack Query, framer-motion, Tailwind 4.

## Phase 1 status

- Persistent data layer (`applications`, `users`, `essays`, `comments`) with Alembic migrations.
- Anonymous submission endpoint `POST /api/v1/applications` (persisted, returns sanitized DTO with ISO timestamp).
- Curator-only `GET /api/v1/applications` (paginated) and `GET /api/v1/applications/{id}`.
- `salon` Typer CLI (`salon -e <email> -n <name> -p <password>`) to bootstrap a curator user.
- Frontend wired with TanStack Query, `src/lib/api/client.ts`, `/api` dev proxy, `application form` posts through the typed client.

## Local quickstart

```sh
# Backend (Docker)
cd backend
docker compose up --build db migrate
docker compose run --rm api salon -e admin@example.org -n Admin -p 'Str0ng-Pwd!'
docker compose up api

# Frontend
cd ../frontend
npm install
npm run dev   # http://127.0.0.1:5173
```

The frontend's dev proxy forwards `/api` to `http://127.0.0.1:8000` (override via `VITE_API_PROXY_TARGET`).

## Tests

```sh
# Backend (hermetic SQLite-backed, 10 tests)
cd backend && pytest -q

# Frontend (TypeScript + build)
cd ../frontend && npx tsc -b --noEmit && npm run build
```

## Roadmap

Phase 2 — JWT-in-memory + refresh cookie auth, replacing the bootstrap seam.
Phase 4 — Curator CRUD for `books` and `debates` (deferred from Phase 1).
Phase 3 — Member-facing library and debate thread UI.
Phase 5 — Production polish (rate limits, MailHog email, audit logging).
