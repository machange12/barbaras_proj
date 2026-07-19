# The Reading Salon

The Reading Salon is a private reading-society web app with a React/Vite frontend and a FastAPI backend. The current product surface includes a polished public landing page, application submission flow, JWT-based curator login, protected application review endpoints, Postgres persistence, Alembic migrations, and Docker support for local backend development.

---

## Deployment Status (July 2026)

### Live Services

| Service | Host | URL / Identifier | Status |
| --- | --- | --- | --- |
| Frontend | Vercel | `the-reading-salon.vercel.app` | ✅ Deployed |
| Backend API | Render | `reading-salon-api.onrender.com` | ✅ Running |
| Database | Render Postgres | `reading-salon-db` (PostgreSQL 18) | ✅ Available |

### What Is Working

- Health check: `GET /api/v1/health/ready` returns `{"status":"ok"}`
- Database migrations ran clean (`0001_initial` + `0002_refresh_tokens`)
- First curator account created (`curator@yourdomain.com`)
- Login API confirmed working via direct POST — returns JWT access token
- Frontend deployed and hitting the correct backend URL

### Blocking Issue: Login From Frontend

The frontend login returns "Invalid email or password" despite the API working correctly when called directly. Root cause is a CORS preflight failure — the `OPTIONS` request to `/api/v1/auth/login` returns `400 Bad Request`.

**Cause:** The frontend is being served from a Vercel preview URL (`the-reading-salon-an9239zb5-...vercel.app`) which is not in the backend's `BACKEND_CORS_ORIGINS` allowlist.

**Fix needed:**

1. Go to Render → `reading-salon-api` → Environment
2. Update `BACKEND_CORS_ORIGINS` to include both the production and preview URLs:

```json
["https://the-reading-salon.vercel.app","https://the-reading-salon-an9239zb5-matewmachange-8463s-projects.vercel.app"]
```

3. Redeploy the API
4. Investigate why `https://the-reading-salon.vercel.app/login` returns 404 — the production frontend may not have the `/login` route built or the Vercel production deployment may be stale

---

## Known Fixes Applied During This Deployment

### 1. psycopg v3 Driver Mismatch

`alembic/env.py` was using the `postgresql://` scheme which tries to load `psycopg2`. Fixed by rewriting the URL to `postgresql+psycopg://` in `get_database_url()`.

### 2. Enum Duplicate Error on Migration

SQLAlchemy's `sa.Enum` with `create_type=False` does not suppress enum creation during `op.create_table` when using psycopg3. Fixed by switching to `sqlalchemy.dialects.postgresql.ENUM` which correctly respects `create_type=False`.

### 3. Orphaned Enum Types in DB

Previous failed migration attempts left `user_role` and `application_status` enum types in the DB without the corresponding tables. Fixed by adding DROP statements to the Dockerfile CMD before running `alembic upgrade head`.

### 4. `BACKEND_CORS_ORIGINS` Format

Render rejected a plain string value for this field. Must be a JSON array:

```json
["https://your-frontend.vercel.app"]
```

---

## Current Stack

- `frontend/` — Vite, React 19, React Router 7, TanStack Query, framer-motion, Tailwind 4, Oxlint
- `backend/` — FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, Typer CLI, JWT auth, Postgres, Docker
- Database — Postgres 18 on Render; tests use SQLite unless live Postgres is explicitly enabled
- Email — SMTP settings exist; local Docker includes MailHog; not yet configured in production

## Current API Surface

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health/live` | none | Process liveness |
| `GET` | `/api/v1/health/ready` | none | Database readiness |
| `POST` | `/api/v1/applications` | none | Submit a membership application |
| `GET` | `/api/v1/applications` | curator bearer token | Paginated application review |
| `GET` | `/api/v1/applications/{id}` | curator bearer token | Single application review |
| `POST` | `/api/v1/auth/login` | none | Issue access token and refresh cookie |
| `POST` | `/api/v1/auth/refresh` | refresh token/cookie | Rotate refresh token and issue a new access token |
| `POST` | `/api/v1/auth/logout` | optional bearer token | Revoke refresh token/cookie |
| `GET` | `/api/v1/auth/me` | bearer token | Current user profile |

---

## Remaining Work Before Production-Ready

### Immediate (blocking curator access)

- [ ] Fix CORS — add all Vercel URLs to `BACKEND_CORS_ORIGINS` on Render
- [ ] Fix production frontend 404 on `/login` — redeploy Vercel or check router config

### Short Term

- [ ] Rate limiting on `/applications` and `/auth/login`
- [ ] Email notifications on new applications (needs SMTP credentials)
- [ ] Curator note/status update endpoint and UI controls
- [ ] Structured logging and error tracking
- [ ] 404 and error boundary pages

### Infrastructure Cleanup

- [ ] Remove orphaned-enum DROP commands from Dockerfile CMD once confirmed stable
- [ ] Change DB credentials (external URL was exposed during debugging)
- [ ] Add uptime monitor on `/api/v1/health/ready`
- [ ] Confirm DB backups are enabled on Render

---

## Environment Variables

| Variable | Where | Value |
| --- | --- | --- |
| `BACKEND_CORS_ORIGINS` | Render | `["https://the-reading-salon.vercel.app"]` |
| `VITE_API_BASE_URL` | Vercel | `https://reading-salon-api.onrender.com` |
| `JWT_SECRET_KEY` | Render | auto-generated (32+ bytes) |
| `DATABASE_URL` | Render | auto-wired from `reading-salon-db` |
| `SMTP_HOST` | Render | not yet configured |
| `SMTP_FROM_ADDRESS` | Render | not yet configured |

---

## Repo References

- Backend details: `backend/README.md`
- Frontend details: `frontend/README.md`
- Backend settings: `backend/app/core/config.py`
- API router: `backend/app/api/v1/`
- Frontend API client: `frontend/src/lib/api/`
- Local backend compose: `backend/docker-compose.yml`
- Render blueprint: `render.yaml`
