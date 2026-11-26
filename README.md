# BARBIE

**A personal archive of thought, writing, and creative work.**

BARBIE is a static literary archive: a React + Vite single-page app with structured,
Markdown-backed content and no backend, database, authentication, or paid services.

---

## What It Is

An interactive antique-book entrance opens into a dark, library-toned archive with
five destinations:

| Route | Page |
| --- | --- |
| `/` | Home — masthead, selected writing, section index |
| `/essays` | Essays section index |
| `/notes` | Notes section index |
| `/creative-work` | Creative Work section index |
| `/library` | Library section index |
| `/:section/:slug` | Article reading page (ivory paper, prev/next) |
| `/about` | About (secondary footer link) |
| `*` | 404 |

Navigation: **Home · Essays · Notes · Creative Work · Library**, with **About** as a
secondary footer link.

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **React Router 7** (client-side routing, SPA rewrite on deploy)
- **Tailwind CSS 4** via `@tailwindcss/vite`, with a design-token `@theme` block
- **framer-motion** for the book entrance and page-turn transitions
- **react-markdown** + **remark-gfm** for article bodies
- **Oxlint** for linting

No API client, no state server, no environment variables are required.

---

## Repository Layout

```
frontend/
  index.html               Document metadata, favicon, noscript fallback
  public/favicon.svg       Archive seal mark
  src/
    App.tsx                Entrance gate wraps the router
    app/AppRouter.tsx      Route table
    components/
      entrance/            EntranceGate (sessionStorage) + EntranceScreen (book)
      layout/              RootLayout, SiteHeader, SiteFooter
      editorial/           EntryList, FeaturedEntry, Markdown, EmptyState, ReadingProgress
      ui/                  Seal, Reveal
    content/
      site.ts              Masthead, tagline, epigraph, contact
      sections.ts          The four sections + empty-state copy
      types.ts             WritingEntry / Section types
      entries/*.ts         Content arrays (currently empty — see below)
      index.ts             Selectors: getEntry, getRecentEntries, getAdjacentEntries…
    pages/                 home, section, article, about, NotFoundPage
    lib/                   formatDate, getReadingTime, useDocumentTitle
    styles/global.css      Design tokens, typography, book/entrance styles
.github/workflows/ci.yml   Lint + production build
render.yaml                Render static-site blueprint (SPA rewrite)
DEPLOY.md                  Deployment guide
progress.md                Transformation log and remaining work
```

---

## Content Status

The content arrays in `frontend/src/content/entries/` are **intentionally empty**.
No articles, biographies, testimonials, or other placeholder intellectual content has
been invented. Every empty section renders a clearly labelled empty state.

### Adding a piece

Append an object to the matching file in `src/content/entries/`:

```ts
export const essays: readonly WritingEntry[] = [
  {
    slug: 'on-slow-reading',
    title: 'On Slow Reading',
    section: 'essays',
    date: '2026-11-25',
    summary: 'Optional standfirst shown under the title.',
    tags: ['attention'],
    featured: true,          // optional: shows on the homepage
    body: '# Markdown body…',
  },
];
```

`slug` must be unique within its section. Reading time is computed from the body
(~220 wpm) unless `readingTime` is supplied. Prev/next links follow date order within
the section. The section index, homepage, and 404 counts update automatically.

---

## Development

```sh
cd frontend
npm install
npm run dev      # http://127.0.0.1:5173
npm run lint     # Oxlint
npm run build    # tsc -b + vite build → dist/
npm run preview  # serve the production bundle
```

Node.js 20+ is required.

---

## Deployment

See [DEPLOY.md](DEPLOY.md). In short: Render static site publishing
`frontend/dist` with an SPA rewrite of `/*` → `/index.html`, or any static host
(Vercel, Netlify, GitHub Pages) with the same rewrite rule.

---

## Accessibility & Motion

- Skip-to-content link, `aria-current` navigation, labelled dialogs and controls.
- `prefers-reduced-motion` collapses the entrance, page turns, and reveals to short
  fades (or nothing).
- The entrance always offers **Enter without animation**, and content stays mounted
  behind an inert overlay so a failed or skipped animation can never trap the reader.
