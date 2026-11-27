# Progress

## Project Transformation: The Reading Salon -> BARBIE

**Status:** Static V1 implemented and verified. Awaiting real content.

---

## Completed

### 2026-11-25 — Initial read-only audit

- [x] Mapped repository structure, stack, dependencies, styling, routes, pages, components, backend, database, and integrations.
- [x] Documented salon-specific content, imagery, terminology, and functionality.
- [x] Produced reuse/redesign matrix and transformation plan.
- [x] Comprehensive audit report delivered.

### 2026-11-25 — Approved specification

- Masthead: **BARBIE**
- Description: *a personal archive of thought, writing, and creative work*
- Navigation: Home · Essays · Notes · Creative Work · Library
- About: secondary footer link
- Architecture: static V1, structured content/Markdown, no database/auth/backend
- Visual direction: dark literary library, deep burgundy/black, warm ivory, antique gold
- Opening experience: interactive antique book entrance with seal and opening animation
- Internal navigation: subtle book-page transitions
- Reading experience: immersive ivory article pages with prev/next navigation

---

## Implementation Log

### Phase 1 — Foundation and design system

- [x] Verified Node/npm/network toolchain.
- [x] Replaced design tokens, typography, and global CSS (`@theme` tokens, Playfair Display / EB Garamond / Lora, dark palette, paper/entrance/book styles, reduced-motion block).
- [x] Created content architecture (`src/content/`: `types.ts`, `site.ts`, `sections.ts`, empty `entries/*`, selectors in `index.ts`).
- [x] Added Markdown rendering support (`react-markdown` + `remark-gfm`, `editorial/Markdown.tsx`, `prose-barbie` styles).

### Phase 2 — Entrance experience

- [x] Built `EntranceGate` with sessionStorage memory (`barbie:entered`).
- [x] Built interactive book entrance: seal press, cover opening, homepage reveal (`EntranceScreen.tsx`).
- [x] Added skip/fallback entry ("Enter without animation") and reduced-motion handling.
- [x] Added animation-failure safety: content stays mounted behind an `inert`, pointer-events-none overlay; body scroll lock cleaned up on unmount.

### Phase 3 — Homepage and navigation

- [x] Built BARBIE homepage: masthead, tagline, epigraph, selected writing, recent list, four-room section index, about teaser (`HomePage.tsx`).
- [x] Rebuilt header/footer navigation: five sections in header, About + contact in footer (`SiteHeader.tsx`, `SiteFooter.tsx`).
- [x] Added page-turn transitions between routes (`RootLayout` `AnimatePresence`, reduced-motion aware).
- [x] Added responsive mobile navigation drawer with `aria-expanded` / `aria-current`.

### Phase 4 — Content sections and reading experience

- [x] Built generic section index pages with empty states (`SectionPage.tsx` + `EmptyState` / `EntryList`).
- [x] Built article reading page: ivory paper, breadcrumb, dates, computed reading time, tags, prev/next adjacency, reading progress (`ArticlePage.tsx`).
- [x] Repurposed old history structure into About page (`AboutPage.tsx`, with a reserved empty state for the biographical note — no invented biography).
- [x] Added 404 page and per-route document metadata (`NotFoundPage.tsx`, `useDocumentTitle`, `index.html` OG/description/theme-color).

### Phase 5 — Cleanup and static architecture

- [x] Removed salon pages, auth, chat, library downloads, curator pages, and API clients.
- [x] Removed backend (`backend/`), `requirements.txt`, and backend deployment/CI configuration.
- [x] Rewrote README, deployment guide, and static Render config (`README.md`, `DEPLOY.md`, `render.yaml` static site + SPA rewrite).
- [x] Updated CI to a frontend-only lint + build job (`.github/workflows/ci.yml`).
- [x] Removed unused salon assets (`hero.png`, `icons.svg`, `react.svg`, `vite.svg`, `.env.example`); favicon replaced with the archive seal.

### Phase 6 — Verification

- [x] Dependencies installed and resolvable (`npm ls --depth=0` clean).
- [x] `npm run lint` passes (Oxlint).
- [x] `npm run build` passes (tsc -b + Vite production bundle).
- [x] Route smoke test against `npm run preview`: `/`, `/essays`, `/notes`, `/creative-work`, `/library`, `/about`, `/nope` all return 200 and serve `index.html` (SPA fallback confirmed).
- [x] Final progress update (this file).

### 2026-11-26 — Browser audit (headless Chromium)

- [x] Entrance: dialog shown, scroll lock, seal press animates cover (`matrix3d`), dismissal, sessionStorage memory, skip entry, reduced-motion path — all pass.
- [x] Homepage, header nav (5 items, `aria-current`), footer About link, 404, section empty states, page-turn transition — all pass.
- [x] Content entries verified with temporary fixtures (then removed): featured card, recent list, date-descending section order, piece count, article typography, computed reading time, Markdown (h2/blockquote/list), prev/next adjacency and navigation, reading-progress only on articles, per-route document title.
- [x] Mobile (390×844): entrance, hamburger, `aria-expanded`, 5-item menu, auto-close on navigate, no horizontal overflow on 6 routes, article layout.
- [x] Zero console/page errors across all runs.
- [x] **Bug fixed (only confirmed one):** on short viewports the fixed, `overflow: hidden` entrance clipped its content — the "Enter without animation" control was unreachable (844×390: content 755px, skip at y=693). `frontend/src/styles/global.css`: entrance now flex-centers with `margin-block: auto` and scrolls if needed; decorative backdrop layers pinned to the viewport so they no longer inflate the scroll area; a `max-height: 560px` rule scales the book so it fits without scrolling (title now measured to fit the cover frame at every tested size).
- [x] Re-verified after the fix: 35/35 entrance/nav/mobile checks, 18/18 entry-rendering checks, 18/18 viewport-edge checks; `npm run lint` and `npm run build` pass.

### Stage 1 — Redesign foundations (in progress, 2026-11-27)

- [x] **Audit assumptions accepted** (`docs/AUDIT.md`): canonical legacy slugs
  kept (`/essays`, `/notes`, `/creative-work`, `/library`, `/about`) with the
  new room names as aliases (`/reading-chamber`, `/observation-room`,
  `/theatre`); reading views at `/:room/:slug`; `vitest` justified as a
  dev-only addition; self-hosted woff2 fonts.
- [x] **Room registry** — `src/content/rooms.ts`: eight rooms (Foyer, Reading
  Chamber, Observation Room, Theatre, Library, Cabinet of Curiosities,
  Unfinished Business, About) with canonical paths, aliases, section binding,
  palette accents, empty-state copy marked `TODO: author to supply`, plus the
  pure helpers the router, room index, page-turn distance and document titles
  all read from.
- [x] **Design tokens** — `src/styles/tokens.css` (palette, per-room accents,
  type stacks, easing/duration tokens, shell measure, `--reading-scale`) and
  `@theme` aliases in `global.css` so every existing utility class name still
  resolves. Shell never page-scrolls: `html, body { height: 100%; overflow: hidden }`.
- [x] **Self-hosted fonts** — 12 deduplicated variable-font faces (500 KB) in
  `public/fonts/` with `font-display: swap`; Google Fonts import removed.
- [x] **Preferences** — `src/lib/prefs.ts`: safe storage with in-memory
  fallback, sound / motion / text-size store via `useSyncExternalStore`,
  `useReducedMotionPref`, `useDocumentPrefs` (writes `html[data-motion]`,
  `html[data-hidden]`, `--reading-scale`) now mounted in `App.tsx`.
- [x] **Sound** — `src/lib/sound.ts`: Web Audio synthesised effects, default
  OFF, no `AudioContext` before a user gesture, silent no-op when unavailable.
  Credits in `docs/AUDIO_CREDITS.md`.
- [x] **Entrance** — new `EntranceCover.tsx` + `OrnateSeal.tsx`: full-viewport
  leather cover split into two hinged panels, gilt-foil `BARBIE` wordmark,
  ornate SVG wax seal that cracks into four quarters, page-block glimpse,
  skip ("Enter without animation"), Escape, focus trap, sessionStorage
  memory, reduced-motion crossfade. Verified frame-by-frame in Chromium at
  80/300/550/800/1050/1300/1480 ms plus mobile (390×844) and
  `prefers-reduced-motion: reduce`; zero console errors; shell fits the
  viewport exactly (800/800) with no page scroll.
- [x] **Stylesheets** — `shell.css` (100dvh shell, chrome, footer, aria-live,
  room frame), `entrance.css`, `pageturn.css`, `reading.css`, `rooms.css`
  (room accents, room index) all imported from `global.css`.
- [x] Superseded `EntranceScreen.tsx` moved to `frontend/legacy/` (source
  preserved; no longer part of the bundle).
- [x] `npm run lint` and `npm run build` pass; bundle unchanged at
  620.14 kB / 193.26 kB gzip (baseline for the Stage 4 bundle report).
- [ ] Remaining Stage 1: room router + aliases, page-turn engine, reading
  view overlay, shell chrome, sound/motion toggles, room components.


---

## Remaining Work

- [ ] **Publish real content.** All four `src/content/entries/*.ts` arrays are intentionally empty; every section shows a labelled empty state. Add only original work.
- [ ] Optional authoring polish: featured flag, summaries, tags, and reading-time overrides per entry.
- [ ] Optional: route-level code splitting to quiet the 620 kB bundle warning (single-page app, acceptable for V1).
- [ ] Optional: trim legacy backend entries from the root `.gitignore`.

---

## Constraints In Effect

- Exclusively original work; no invented articles, biographies, testimonials, or placeholder intellectual content.
- Clearly identified empty states where content has not been added.
- No paid services, databases, authentication, or complex backend infrastructure.
- Preserve reusable code and assets; do not rebuild working components unnecessarily.
- Respect reduced motion and provide an animation-failure escape hatch.

---

## Decision Log

| Date | Decision | Status |
| --- | --- | --- |
| 2026-11-25 | Audit performed read-only | Done |
| 2026-11-25 | Masthead: BARBIE | Approved |
| 2026-11-25 | Static V1 with structured Markdown content | Approved |
| 2026-11-25 | Five-section navigation + About in footer | Approved |
| 2026-11-25 | Book entrance + page-turn transitions | Approved |
| 2026-11-26 | Backend, auth, and salon surfaces removed; static-only deploy | Done |
| 2026-11-26 | Render blueprint switched to static site with SPA rewrite | Done |
