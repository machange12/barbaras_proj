# The Reading Salon — Frontend

Vite + React 19 + React Router 7 + framer-motion + Tailwind 4, with TanStack Query for the API layer.

## Prereqs

- Node.js 20+
- Backend running (see `../backend/README.md`). The dev proxy in `vite.config.ts` forwards `/api` to `http://127.0.0.1:8000` by default (override via `VITE_API_PROXY_TARGET`).

## Setup

```sh
npm install
cp .env.local .env.local.bak 2>/dev/null || true
```

`.env.local` ships already populated with `VITE_API_BASE_URL=/api`. Drop it if you want the dev proxy to handle the network hop.

## Scripts

```sh
npm run dev      # Vite dev server on http://127.0.0.1:5173
npm run build    # TypeScript build + production bundle
npm run lint     # Oxlint
npm run preview  # Preview the production bundle
```

## API layer

- `src/lib/api/client.ts` — typed `fetch` wrapper with `ApiError`, AbortController timeout.
- `src/lib/api/config.ts` — `API_BASE_URL`, `apiUrl()` helper.
- `src/lib/api/applications.ts` — client API surface for the application form (submit, list, get).
- `src/lib/api/queryClient.ts` — TanStack Query client factory.
- `src/App.tsx` — wraps the app in `QueryClientProvider` and renders the React Query devtools in dev.

## Notable sections

| File | Purpose |
| --- | --- |
| `src/sections/landing/` | Composable sections of the landing page (hero, bookshelf, archive, debates, essays, events, application form) |
| `src/components/layout/SiteHeader.tsx` | Primary navigation, including mobile drawer |
| `src/pages/history/HistoryPage.tsx`, `src/pages/society/SalonDifferencePage.tsx` | Static curated pages |
| `src/features/application/useApplicationForm.ts` | Submission form hook: validation, abort, server-error mapping |
