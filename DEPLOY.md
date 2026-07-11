# Deployment Guide - The Reading Salon

## Fastest Path: Render Backend And DB + Vercel Frontend

### 1. Push To GitHub

```bash
git add -A
git commit -m "feat: curator dashboard, CI, render deploy config"
git push origin main
```

### 2. Deploy Backend And DB On Render

1. Go to https://render.com, create a new Blueprint, and connect your repo.
2. Render reads `render.yaml` and creates:
   - `reading-salon-db` (free Postgres)
   - `reading-salon-api` (Docker web service)
3. After the first deploy, set the manual environment variables in the Render dashboard:
   - `BACKEND_CORS_ORIGINS`: your Vercel URL, for example `https://reading-salon.vercel.app`
   - `SMTP_HOST` and `SMTP_FROM_ADDRESS`: if you want email notifications

### 3. Create The First Curator

In the Render dashboard, open `reading-salon-api` and then Shell:

```bash
salon -e curator@yourdomain.com -n "Barbara" -p "StrongPassword123!"
```

### 4. Deploy Frontend On Vercel

```bash
cd frontend
npx vercel --prod
```

Set this environment variable in the Vercel dashboard:

```text
VITE_API_BASE_URL = https://reading-salon-api.onrender.com
```

### 5. Smoke Test

- [ ] `GET https://reading-salon-api.onrender.com/api/v1/health/ready` returns `{"status":"ok"}`
- [ ] Submit an application from the public landing page
- [ ] Sign in at `/login` with the curator account
- [ ] Navigate to `/curator` and see the application list
- [ ] Click `Review` on the submitted application

## Environment Variables

| Variable | Where | Value |
|---|---|---|
| `BACKEND_CORS_ORIGINS` | Render | `https://your-frontend.vercel.app` |
| `VITE_API_BASE_URL` | Vercel | `https://reading-salon-api.onrender.com` |
| `SMTP_HOST` | Render | your SMTP provider |
| `SMTP_FROM_ADDRESS` | Render | verified sender address |

All other backend environment variables are auto-generated or set in `render.yaml`.

## What Was Added In This Deployment Pass

### Frontend

- `src/pages/curator/CuratorDashboard.tsx`: application list with status filter
- `src/pages/curator/ApplicationDetail.tsx`: full application detail view
- `src/app/AppRouter.tsx`: `/curator` route now loads `CuratorDashboard`
- `src/lib/api/applications.ts`: `list` and `get` now send the `Authorization` header

### Infrastructure

- `render.yaml`: Render blueprint for backend Docker service, frontend static service, and Postgres
- `.github/workflows/ci.yml`: CI on every push/PR with pytest, ruff, npm lint, and build
- `backend/Dockerfile`: runs `alembic upgrade head` before uvicorn starts

## Still To Do

- Rate limiting on `/applications` and `/auth/login`
- Email notifications on new applications once SMTP credentials are ready
- Curator note/status update endpoint and UI controls
- Structured logging
- Error tracking
- 404 and error boundary pages
