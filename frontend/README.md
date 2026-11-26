# BARBIE — Frontend

Vite + React 19 + React Router 7 + framer-motion + Tailwind 4, with react-markdown
for article bodies. Static: no API layer, no environment variables, no backend.

## Prereqs

- Node.js 20+

## Setup

```sh
npm install
```

## Scripts

```sh
npm run dev      # Vite dev server on http://127.0.0.1:5173
npm run build    # TypeScript build + production bundle → dist/
npm run lint     # Oxlint
npm run preview  # Preview the production bundle
```

## Architecture

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Wraps the router in `EntranceGate` |
| `src/components/entrance/` | Book entrance: `EntranceGate` (sessionStorage memory, inert overlay) and `EntranceScreen` (seal press, cover opening, reveal, skip, reduced-motion path) |
| `src/components/layout/RootLayout.tsx` | Shell: skip link, header, page-turn `AnimatePresence`, footer |
| `src/components/layout/SiteHeader.tsx` | Primary navigation + mobile drawer |
| `src/components/layout/SiteFooter.tsx` | Section links, About, contact, colophon |
| `src/components/editorial/` | `EntryList`, `FeaturedEntry`, `Markdown`, `EmptyState`, `ReadingProgress` |
| `src/components/ui/` | `Seal` (mark), `Reveal` (scroll reveal) |
| `src/content/` | `site.ts`, `sections.ts`, `types.ts`, `entries/*`, and the `index.ts` selectors |
| `src/pages/` | `home`, `section`, `article`, `about`, `NotFoundPage` |
| `src/lib/` | `format.ts` (dates, reading time), `useDocumentTitle.ts` |
| `src/styles/global.css` | `@theme` tokens, typography, entrance/book styles, reduced-motion block |

## Content

Entries live in `src/content/entries/{essays,notes,creativeWork,library}.ts` and are
typed as `WritingEntry`. Arrays start empty — empty states are rendered until real
work is added. Nothing fictional is published by default.

Selectors in `src/content/index.ts` handle sorting (date descending), featured
selection, recent entries, and prev/next adjacency.

## Routes

```
/                     Home
/about                About (footer link)
/:section             Section index (essays, notes, creative-work, library)
/:section/:slug       Article page
*                     404
```
