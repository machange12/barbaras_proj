# Deployment Guide — BARBIE

BARBIE is a static site. There is no backend, no database, and no server-side
environment variables: the build produces `frontend/dist`, and that folder is the
whole deployment.

---

## Option A — Render Static Site (blueprint included)

`render.yaml` at the repo root already describes the service:

| Field | Value |
| --- | --- |
| Type | Web service with `runtime: static` |
| Build command | `cd frontend && npm ci && npm run build` |
| Publish directory | `./frontend/dist` |
| SPA rewrite | `/*` → `/index.html` |

Steps:

1. Push the repository to GitHub.
2. On [Render](https://render.com), create a **Blueprint** and connect the repo.
3. Render reads `render.yaml` and creates the static site `barbie-archive`.
4. First deploy builds and publishes `frontend/dist`. Deep links such as
   `/essays` resolve through the rewrite rule.

No environment variables need to be set.

---

## Option B — Vercel

```sh
cd frontend
npx vercel --prod
```

`frontend/vercel.json` already contains the required SPA rewrite:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

No environment variables are required.

---

## Option C — Netlify / GitHub Pages / any static host

```sh
cd frontend
npm ci
npm run build
```

Publish `frontend/dist` and add a single rewrite so the client router can handle
deep links:

| Host | Rule |
| --- | --- |
| Netlify | `/*  /index.html  200` in `public/_redirects` or the dashboard |
| Vercel | see `frontend/vercel.json` |
| Render | see `render.yaml` |
| GitHub Pages | use a 404 page that serves `index.html`, or a hash router |

---

## Smoke Test

- [ ] `/` shows the book entrance; the seal opens it and the homepage appears
- [ ] Revisiting in the same tab skips the entrance (session memory)
- [ ] "Enter without animation" reaches the homepage immediately
- [ ] `/essays`, `/notes`, `/creative-work`, `/library` each render their empty state
- [ ] Header navigation switches sections; the mobile menu opens and closes
- [ ] Footer links to `/about`
- [ ] A deep link (e.g. `/essays`) returns `index.html`, not a 404
- [ ] An unknown path (e.g. `/nope`) renders the 404 page
- [ ] Browser back/forward moves between pages without losing the entrance state
- [ ] With reduced motion enabled, the entrance and page turns become simple fades

---

## Removing The Old Salon Deployment

The previous FastAPI backend, Render Postgres database, and Render API service are
no longer part of this project. On Render, delete any leftover `reading-salon-api`
and `reading-salon-db` services from the old Blueprint. On Vercel, remove the
`VITE_API_BASE_URL` variable — nothing reads it anymore.
