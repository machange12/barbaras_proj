# The Reading Salon

The Reading Salon is a private reading-society web app with a React/Vite frontend and a FastAPI backend. The current product surface includes a polished public landing page, application submission flow, JWT-based curator login, protected application review endpoints, Postgres persistence, Alembic migrations, and Docker support for local backend development.

This README is written as a practical deployment-readiness guide: what exists, how to run it, and what to finish before calling it production-ready.

## Current Stack

- `frontend/` - Vite, React 19, React Router 7, TanStack Query, framer-motion, Tailwind 4, Oxlint.
- `backend/` - FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, Typer CLI, JWT auth, Postgres, Docker Compose.
- Database - Postgres in real environments; tests use SQLite unless live Postgres is explicitly enabled.
- Email - SMTP settings exist; local Docker includes MailHog.

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

## Local Verification

### Backend

```sh
cd backend
docker compose up --build db migrate
docker compose up api
```

Bootstrap or promote a curator:

```sh
docker compose run --rm api salon -e admin@example.org -n Admin -p "Str0ng-Pwd!"
```

Run backend tests and lint:

```sh
cd backend
pytest -q
ruff check .
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://127.0.0.1:5173`. The dev proxy forwards `/api` to `http://127.0.0.1:8000` by default; override that with `VITE_API_PROXY_TARGET` when needed.

Run frontend checks:

```sh
cd frontend
npm run lint
npm run build
```

## Deployment Direction

The fastest path to a near-production deployment is:

1. Deploy the backend as a Dockerized web service.
2. Use managed Postgres for the production database.
3. Deploy the frontend as a static Vite build.
4. Run Alembic migrations as a release step before the backend starts serving traffic.
5. Put both services behind HTTPS, with the frontend domain listed in backend CORS.

Good target combinations:

| Frontend | Backend | Database | Notes |
| --- | --- | --- | --- |
| Vercel | Render/Fly.io/Railway | Supabase/Neon/Render Postgres | Simple split deployment; easiest operational path. |
| Netlify | Render/Fly.io/Railway | Supabase/Neon/Render Postgres | Similar to Vercel; works well for static Vite. |
| Single VPS | Docker Compose/Nginx | Postgres container or managed Postgres | More control, more ops responsibility. |

For this codebase, the split static-frontend plus Docker-backend route is the cleanest first deployment.

## Production Environment Variables

Set these on the backend host:

```env
APP_NAME=The Reading Salon API
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
JWT_SECRET_KEY=<at-least-32-random-bytes>
JWT_ALGORITHM=HS256
JWT_ISSUER=the-reading-salon
JWT_AUDIENCE=the-reading-salon-clients
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_MINUTES=43200
BACKEND_CORS_ORIGINS=https://your-frontend-domain.example
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_FROM_ADDRESS=<verified-from-address>
SMTP_FROM_NAME=The Reading Salon
BCRYPT_ROUNDS=12
```

Set this on the frontend host:

```env
VITE_API_BASE_URL=https://your-backend-domain.example
```

Important notes:

- `JWT_SECRET_KEY` must be strong in production; the settings layer rejects short production secrets.
- `ENVIRONMENT=production` disables FastAPI docs, enables HTTPS redirects, sets secure refresh cookies, and adds stricter security headers.
- `BACKEND_CORS_ORIGINS` must exactly match the deployed frontend origin, without a trailing slash.
- If frontend and backend live on different domains, confirm refresh-cookie behavior in the browser. The current cookie uses `SameSite=lax`, `HttpOnly`, and `Secure` in production. Cross-site deployments may require a same-site subdomain strategy or explicit cookie-policy changes.

## Release Checklist

Before first deployment:

- Create production Postgres database.
- Configure backend environment variables.
- Configure frontend `VITE_API_BASE_URL`.
- Run `alembic upgrade head` against production.
- Create the first curator with the `salon` CLI against the production `DATABASE_URL`.
- Run `pytest -q` and `ruff check .` in `backend/`.
- Run `npm run lint` and `npm run build` in `frontend/`.
- Smoke test `GET /api/v1/health/ready`.
- Smoke test application submission from the deployed frontend.
- Smoke test curator login, token refresh, application list, and logout.

After deployment:

- Point DNS to the frontend and backend hosts.
- Verify HTTPS on both domains.
- Verify CORS from the production frontend.
- Verify refresh cookies are marked `HttpOnly`, `Secure`, and available to the auth flow.
- Confirm backend logs are available and retained.
- Confirm database backups are enabled.
- Confirm uptime checks hit `/api/v1/health/ready`.

## Work Needed To Be Close To Deployment

### 1. Add a production migration command

The backend Dockerfile can run the API, and Docker Compose has a local `migrate` service. For hosted deployment, define a release command such as:

```sh
alembic upgrade head
```

Most hosts support a release/predeploy command. If the chosen host does not, add a small migration job or documented one-shot command.

### 2. Decide the auth domain strategy

The backend currently sets the refresh token as an `HttpOnly` cookie. That is good, but cookie behavior depends on whether frontend and backend are same-site.

Recommended first deployment:

- Frontend: `https://reading-salon.example.com`
- Backend: `https://api.reading-salon.example.com`

This keeps the app easier to reason about than unrelated domains. Then test login, refresh, and logout in the deployed browser environment.

### 3. Add frontend auth review screens

The backend exposes protected application-review endpoints, and the frontend has login/auth scaffolding. To make the product operational for curators, finish the curator-facing UI:

- Login page wired to `POST /api/v1/auth/login`.
- Auth context that stores access tokens in memory and refreshes through the cookie endpoint.
- Protected application list route.
- Application detail route.
- Empty, loading, error, and expired-session states.

### 4. Add production email behavior

SMTP settings exist, but application flows should be checked for real notification needs before launch:

- Decide whether new applications email curators.
- Decide whether applicants receive confirmation emails.
- Add provider credentials for Postmark, Resend, SendGrid, SES, or similar.
- Keep MailHog for local testing only.

### 5. Add operational guardrails

Minimum useful production guardrails:

- Request rate limiting on public application and auth endpoints.
- Structured backend logging.
- Error tracking for frontend and backend.
- Database backups and restore test.
- A simple uptime monitor for `/api/v1/health/ready`.
- Clear retention policy for application data.

### 6. Harden forms and content

Before making the site public:

- Confirm frontend form validation matches backend validation.
- Add spam protection to public application submission.
- Add privacy copy for submitted application data.
- Review all static content, links, images, and mobile layouts.
- Add 404 and generic error pages if they are missing.

### 7. Add CI

Add a CI workflow that runs on pull requests:

```sh
cd backend && pytest -q && ruff check .
cd frontend && npm ci && npm run lint && npm run build
```

This is the main thing that prevents deployment drift once the app is hosted.

## Suggested Deployment Runbook

1. Pick target hosts and create projects.
2. Create managed Postgres.
3. Add production backend env vars.
4. Deploy backend Docker image from `backend/Dockerfile`.
5. Run `alembic upgrade head`.
6. Create the first curator:

```sh
DATABASE_URL="postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require" \
JWT_SECRET_KEY="<same-production-secret>" \
ENVIRONMENT=production \
salon -e admin@example.org -n Admin -p "replace-with-a-real-password"
```

7. Add production frontend env var `VITE_API_BASE_URL`.
8. Build and deploy the frontend:

```sh
cd frontend
npm ci
npm run build
```

9. Set `BACKEND_CORS_ORIGINS` to the deployed frontend URL.
10. Smoke test application submission and curator login end to end.

## Repo References

- Backend details: `backend/README.md`
- Frontend details: `frontend/README.md`
- Backend settings: `backend/app/core/config.py`
- API router: `backend/app/api/v1/`
- Frontend API client: `frontend/src/lib/api/`
- Local backend compose: `backend/docker-compose.yml`
