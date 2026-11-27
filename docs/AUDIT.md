# Phase 0 — Discovery Audit

**Project:** BARBIE — a personal archive of thought, writing, and creative work
**Audit date:** 2026-11-27
**Scope:** Read-only inspection of the repository prior to the "Library Redesign" rebuild.
**No code was changed to produce this document.**

---

## 1. Summary of what exists today

A single static single-page application lives in `frontend/`. There is **no backend**, no
database, no auth, no API client, no environment variables and no paid services. The git
history contains an older FastAPI/salon codebase, but it was removed before the current
`(initial commit)` snapshot; **only the frontend remains on disk.**

The site today is a conventional, well-built literary SPA: a book-cover entrance, a
homepage, four section index pages, an article reading page, an About page and a 404.

**The single most important discovery:** all four content arrays are **empty**.

```
frontend/src/content/entries/essays.ts         → export const essays: readonly WritingEntry[] = [];
frontend/src/content/entries/notes.ts           → export const notes: readonly WritingEntry[] = [];
frontend/src/content/entries/creativeWork.ts   → export const creativeWork: readonly WritingEntry[] = [];
frontend/src/content/entries/library.ts        → export const library: readonly WritingEntry[] = [];
```

There is therefore **no authored content to migrate**: no essays, notes, works, books,
fragments, ideas, quotations, dates, biographies or reflections exist anywhere in the
repository. The only authored copy in the whole site is chrome copy (`src/content/site.ts`,
`src/content/sections.ts`, the About page prose, the 404 prose and the empty states).
The About page explicitly reserves a labelled placeholder for a biography and states that
none has been invented.

Consequence for §8 (content model): the migration is *schema migration*, not *content
migration*. We build the new typed content layer, provide adapters so the old
`WritingEntry` shape still loads, keep the existing `entries/*.ts` files as-is, and every
piece of new content arrives as author-supplied data. Nothing will be fabricated.

---

## 2. Architecture and toolchain

| Concern | Finding |
| --- | --- |
| Framework | React **19.2.7** (function components, hooks, `StrictMode`) |
| Language | TypeScript **6.0.3**, `strict`-adjacent flags in `tsconfig.app.json` (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`) |
| Build tool | Vite **8.1.4** with `@vitejs/plugin-react` 6 and `@tailwindcss/vite` 4; build script is `tsc -b && vite build` |
| Package manager | **npm** (`package-lock.json` present, `npm ls --depth=0` clean); Node 24.22.2 / npm 11.19.1 locally, CI pins Node 20 |
| Routing | **react-router-dom 7.18.1** via `createBrowserRouter` + `RouterProvider` (data router, browser history) |
| Styling | **Tailwind CSS 4.3.2** in CSS-first mode: one `@theme { … }` token block in `src/styles/global.css`, plus a large hand-written CSS layer (`.entrance`, `.book`, `.prose-barbie`, `.seal`, …) |
| State management | None. Local `useState` + `framer-motion` motion values + `sessionStorage` (entrance memory). No Redux/Zustand/Context store |
| Animation | **framer-motion 12.42.2** (`AnimatePresence`, `useReducedMotion`, `useScroll`, `useSpring`, `whileInView`); CSS transitions/keyframes for the rest |
| Icons | **lucide-react 1.24.0** |
| Markdown | **react-markdown 10.1.0** + **remark-gfm 4.0.1** |
| Linting | **oxlint 1.73.0**, config in `frontend/.oxlintrc.json` (plugins: react, typescript, oxc) |
| Testing | **None.** No test runner, no test files, no `test` script |
| CI | `.github/workflows/ci.yml` — `npm ci` → `npm run lint` → `npm run build` on Node 20, for `main`/`master` pushes and PRs |
| Deployment | Static. `render.yaml` (Render static site, publish `frontend/dist`, `/* → /index.html` rewrite) and `frontend/vercel.json` (same rewrite). `DEPLOY.md` documents Render/Vercel/Netlify/ GH Pages |
| Analytics / trackers | **None** |
| Environment variables | **None** |

---

## 3. File and asset inventory

50 tracked files; 55 files on disk excluding `node_modules` and `.git`.

### 3.1 Entry points and shell

| File | Lines | Role |
| --- | ---: | --- |
| `frontend/index.html` | 39 | Meta description, OG tags, `theme-color #120c0b`, favicon, `noscript` fallback |
| `frontend/src/main.tsx` | 10 | `createRoot` + StrictMode, imports `global.css` |
| `frontend/src/App.tsx` | 10 | `EntranceGate` wraps `AppRouter` |
| `frontend/src/app/AppRouter.tsx` | 25 | Route table |
| `frontend/public/favicon.svg` | 15 | Seal mark, burgundy + gold |
| `frontend/src/assets/images/old-library.jpg` | 183 kB | Entrance backdrop photograph (the only raster asset) |

### 3.2 Pages

| File | Lines | Route | Role |
| --- | ---: | --- | --- |
| `pages/home/HomePage.tsx` | 157 | `/` | Masthead, tagline, epigraph, featured entry, recent list, four-section index, About teaser |
| `pages/section/SectionPage.tsx` | 71 | `/:section` | Breadcrumb, section title/description, piece count, `EntryList` or `EmptyState` |
| `pages/article/ArticlePage.tsx` | 151 | `/:section/:slug` | Ivory paper reading page: breadcrumb, header, `Markdown` body, computed reading time, tags, prev/next, `ReadingProgress` |
| `pages/about/AboutPage.tsx` | 136 | `/about` | Archive purpose, reserved biography placeholder, section links, colophon, correspondence |
| `pages/NotFoundPage.tsx` | 42 | `*` | 404 with links home and to all sections |

### 3.3 Components

| File | Lines | Reuse potential |
| --- | ---: | --- |
| `components/entrance/EntranceGate.tsx` | 63 | **High** — session memory (`barbie:entered`), body scroll lock, `inert`/`pointer-events-none` overlay so a failed animation can never trap the reader. Keep the pattern verbatim |
| `components/entrance/EntranceScreen.tsx` | 183 | **Low** — a *small centred* single-hinge book. The new spec demands a full-screen two-panel cover. Supersede |
| `components/layout/RootLayout.tsx` | 61 | **Medium** — skip link, hash-scroll handling, `AnimatePresence` route transition, `aria` id wiring. Becomes the room shell |
| `components/layout/SiteHeader.tsx` | 110 | **Medium** — nav with `aria-current`, mobile drawer with `aria-expanded`. Becomes room chrome |
| `components/layout/SiteFooter.tsx` | 77 | **Medium** — section links, About, mailto, colophon |
| `components/editorial/EntryList.tsx` | 52 | **High** — index rows with date/reading-time/tags |
| `components/editorial/FeaturedEntry.tsx` | 34 | **High** — featured item card |
| `components/editorial/EmptyState.tsx` | 36 | **High** — two tones (`dark`/`paper`); exactly the "clearly marked placeholder" mechanism the brief requires |
| `components/editorial/Markdown.tsx` | 32 | **High** — GFM renderer with external-link safety and lazy images |
| `components/editorial/ReadingProgress.tsx` | 12 | **Medium** — fixed 2 px bar driven by `useScroll`/`useSpring`. Extends to "thin gilt bar + percent" |
| `components/ui/Seal.tsx` | 10 | **High as a mark**, **low as the entrance seal** — currently a CSS circle with a `B`; the new entrance needs an ornate SVG seal with highlights, depth, crack and pulse |
| `components/ui/Reveal.tsx` | 30 | **High** — scroll reveal, reduced-motion aware |

### 3.4 Content layer

| File | Lines | Role |
| --- | ---: | --- |
| `content/types.ts` | 23 | `SectionSlug`, `WritingEntry` (slug, title, section, date, summary?, tags?, featured?, readingTime?, body), `Section` |
| `content/site.ts` | 8 | masthead, tagline, epigraph, description, contact email |
| `content/sections.ts` | 56 | The four sections with kicker, description and empty-state copy; `getSection`, `isSectionSlug` |
| `content/entries/{essays,notes,creativeWork,library}.ts` | 3 each | **Empty arrays** |
| `content/index.ts` | 60 | Selectors: `getEntriesBySection`, `getEntry`, `getRecentEntries`, `getFeaturedEntry`, `getAdjacentEntries` (date-descending) |

### 3.5 Lib

| File | Lines | Role |
| --- | ---: | --- |
| `lib/format.ts` | 36 | `formatDate` (en-GB), `countWords`, `getReadingTime` (~220 wpm, returns `undefined` at 0 words) |
| `lib/useDocumentTitle.ts` | 21 | Sets `document.title` and upserts `<meta name="description">` |

### 3.6 Styles

`frontend/src/styles/global.css` — **887 lines**, the only stylesheet.

- Line 1: `@import url('https://fonts.googleapis.com/css2?family=EB+Garamond…Playfair+Display…Lora…')`
- Line 2: `@import 'tailwindcss';`
- Lines 4–21: `@theme` block — the existing design-token set
- Lines 23–144: reset, body gradient, `.kicker`, `.paper-texture`, `.page-viewport`/`.page-shell` (perspective), `.reading-progress`
- Lines 146–182: `.article-page`, `.empty-state`
- Lines 184–203: `.entry-row` hover choreography
- Lines 205–253: `.seal` mark
- Lines 255–702: the whole entrance book (`.entrance`, `.book`, `.book__cover`, `.book__seal`, `.book__spine`, …)
- Lines 704–838: `.prose-barbie` reading typography
- Lines 840–887: small-screen, short-viewport and `prefers-reduced-motion` blocks

### 3.7 Existing design tokens

```
--color-void: #100a0c        --color-ivory: #f3e9d7       --color-ink: #241a18
--color-night: #170d10       --color-parchment: #e7d7ba   --color-ink-soft: #4a3b34
--color-oxblood: #2e0f16     --color-gold: #c9a45f        --color-muted: #b6a78d
--color-wine: #4a1622        --color-gold-soft: #b08a4c
--color-burgundy: #6b2130    --color-gold-dim: #8a6a35
--font-display: 'Playfair Display'  --font-body: 'EB Garamond'  --font-ui: 'Lora'
```

**Gap vs. the new identity:** there is no pink / dusty rose, no deep blue (midnight, ink),
no crimson (distinct from `wine`), no antique-gold emphasis scale per room, and **burgundy
is applied globally** through the body gradient and the entrance. The brief's requirement —
"burgundy must no longer dominate every page" — is not currently satisfied.

**Gap vs. self-hosting rule:** fonts are fetched from `fonts.googleapis.com` at runtime.
That is a third-party request, not self-hosted, and violates the brief's §9 requirement.

### 3.8 Fonts actually referenced

| Family | Weights used | Role |
| --- | --- | --- |
| Playfair Display | 400–700, italic | display serif (titles) |
| EB Garamond | 400–700, italic | body serif |
| Lora | 400–500, italic | UI / metadata ("small caps or mono" role today) |

All three are served from the Google Fonts CDN in a single `@import url(...)` with
`&display=swap` appended. No `@font-face` block, no local woff2 file and no preconnect
hint exist anywhere in the repo.

---

## 4. How content is stored

**Hard-coded TypeScript data.** Not Markdown files, not a CMS, not a database.

- Each piece is a `WritingEntry` object literal in one of four `entries/*.ts` arrays.
- `body` is a **Markdown string** rendered client-side by `react-markdown` + `remark-gfm`.
- `slug` uniqueness is a convention only — nothing validates it today.
- `section` is a literal that must match `SectionSlug`.
- There is no `id`, no `related`, no `ideas`, no `status`, no `marginalia`, no
  `references`, no `type` discriminator — all required by §8.
- Nothing validates references because there are no references yet.

---

## 5. Existing functionality that must survive

Regression baseline — every item below was verified working at the end of the previous
implementation round and must still work when Stage 1 lands.

| # | Behaviour | Where it lives |
| --- | --- | --- |
| 1 | Entrance shows **once per session**, then is skipped on return visits | `EntranceGate.tsx` (`sessionStorage['barbie:entered']`, safe on storage failure) |
| 2 | "Enter without animation" skip path always available | `EntranceScreen.tsx` → `.entrance__skip` |
| 3 | `prefers-reduced-motion` collapses entrance and route transitions to short fades | `EntranceScreen`, `RootLayout`, CSS `@media (prefers-reduced-motion: reduce)` |
| 4 | Content stays mounted behind an `inert`, `pointer-events-none` overlay so a failed animation can never trap the reader | `EntranceGate.tsx` |
| 5 | Body scroll lock while the entrance is up, restored on unmount | `EntranceGate.tsx` |
| 6 | Skip-to-content link (visible on focus) | `RootLayout.tsx` |
| 7 | Header nav with `aria-current="page"` and an underline indicator | `SiteHeader.tsx` |
| 8 | Mobile drawer with `aria-expanded`/`aria-controls`, auto-closes on navigation | `SiteHeader.tsx` |
| 9 | Route transition animation between pages | `RootLayout.tsx` `AnimatePresence` |
| 10 | Hash-scroll to `#id` on navigation, plus scroll-to-top on pathname change | `RootLayout.tsx` |
| 11 | Section index with piece count, empty states, breadcrumb | `SectionPage.tsx` |
| 12 | Article page: ivory paper, GFM markdown, computed reading time, tags, prev/next adjacency, reading progress bar | `ArticlePage.tsx` + `ReadingProgress` |
| 13 | Per-route `document.title` and `<meta name="description">` | `useDocumentTitle.ts` |
| 14 | 404 page for unknown paths | `NotFoundPage.tsx` |
| 15 | Featured entry + recent list + section index on the homepage | `HomePage.tsx` |
| 16 | Footer: section links, About, `mailto:` contact, colophon | `SiteFooter.tsx` |
| 17 | Gold `:focus-visible` outline on every interactive element | `global.css` |
| 18 | `noscript` message | `index.html` |
| 19 | SPA rewrites on Render and Vercel | `render.yaml`, `frontend/vercel.json` |
| 20 | CI lint + build | `.github/workflows/ci.yml` |
| 21 | OG tags, description, theme-color, favicon | `index.html`, `public/favicon.svg` |

**Verified during this audit:**

| Check | Result |
| --- | --- |
| `npm ls --depth=0` | clean, 16 top-level packages, no peer warnings |
| `npm run lint` (oxlint) | **PASS**, no findings |
| `npm run build` (`tsc -b` + vite build) | **PASS** in 2.09 s |
| `npm run preview` + route smoke test | `/`, `/essays`, `/notes`, `/creative-work`, `/library`, `/about`, `/nope` → all **200**, SPA fallback confirmed |
| Playwright availability | `playwright` 1.65.1 resolvable via npx cache; `~/.cache/ms-playwright/` has `chromium-1255` and `chromium_headless_shell-1255` → **browser testing is possible** |
| Test runner | **none installed** |
| Network (fonts) | reachable during audit (`fonts.googleapis.com` → HTTP 200) — but must not be depended on at runtime |

---

## 6. Baseline bundle sizes

Production build as of this audit (single chunk, no code splitting):

| Asset | Raw | gzip |
| --- | ---: | ---: |
| `dist/assets/index-00_KKLHI.js` | **620.14 kB** | **193.26 kB** |
| `dist/assets/index-B9Jnwi57.css` | 39.36 kB | 8.63 kB |
| `dist/assets/old-library-_Gr5wsRW.jpg` | 183.49 kB | — |
| `dist/index.html` | 1.47 kB | 0.68 kB |
| **Total** | **844.5 kB** | **~202 kB** |

Vite already warns: *"Some chunks are larger than 500 kB."* The whole app — every page,
framer-motion, react-markdown, lucide — is one chunk. §9 requires per-room code splitting
and lazy-loading of the graph, audio and particles; the after-size must be reported.

Rough attribution: framer-motion + react-markdown + remark-gfm + lucide-react dominate.

---

## 7. Route mapping: current → target

### 7.1 URLs

The brief requires every room to have a real URL, working back/forward, deep links and
refresh restore — all of which react-router already provides. The open decision is whether
to keep the current slugs or adopt room names.

**Assumption taken (flagged as Q1 below):** keep the four existing slugs as canonical so
nothing breaks, and add the room names as *aliases* that redirect. Add the two new rooms
under new slugs.

| Current URL | Target room | New URL | Disposition |
| --- | --- | --- | --- |
| `/` | **Foyer** — grand entry hall, lamplight, index as book spines | `/` | rewrite |
| `/essays` | **Reading Chamber** — essays, deep blue + ivory, lamp pool | `/essays` (alias `/reading-chamber`) | rewrite |
| `/notes` | **Observation Room** — notes/reflections, night window, deep blue + dusty rose | `/notes` (alias `/observation-room`) | rewrite |
| `/creative-work` | **Theatre** — stories/poetry, curtains, spotlight, black + crimson + gold | `/creative-work` (alias `/theatre`) | rewrite |
| `/library` | **Library / Reading Room** — books read, shelves, ladder, brass lamps | `/library` | rewrite |
| — | **Cabinet of Curiosities** — drawers, glass cases, handwritten labels | `/cabinet` (Q2: confirm slug) | **new** |
| — | **Unfinished Archive** — drafting table, pinned/torn pages, crimson corrections | `/unfinished` (Q2: confirm slug) | **new** |
| `/about` | **About** — intimate study, supplied biography only | `/about` | reuse + restyle |
| `/:section/:slug` | Reading view for an essay/note/work/book/fragment/curiosity | `/:room/:slug` | rewrite as full-screen overlay **with its own URL** |
| `*` | 404 | `*` | reuse + restyle |

Also required and currently absent: `Intellectual Genealogy` and `Index of Ideas`.
They are **features inside rooms, not rooms** (§5), so they get overlay/panel URLs rather
than top-level rooms — Q3.

### 7.2 Components

| Existing | Target | Disposition | Why |
| --- | --- | --- | --- |
| `App.tsx` | `App.tsx` | **reuse** (edit) | Already the correct composition root |
| `app/AppRouter.tsx` | room router + history-direction context | **rewrite** | Needs room slugs, aliases, deep links, `state.direction` for turn direction, lazy chunks |
| `components/entrance/EntranceGate.tsx` | entrance gate (session, inert overlay, skip, replay) | **reuse + extend** | Pattern is correct and tested; add replay + reduced-motion crossfade + sound toggle wiring |
| `components/entrance/EntranceScreen.tsx` | full-screen two-panel cover + ornate seal | **rewrite → superseded file moved to `frontend/legacy/`** | Current design is a small centred book with a single left hinge; the brief mandates edge-to-edge cover, centre spine, two panels hinging outward |
| `components/layout/RootLayout.tsx` | room shell: chrome, page-turn engine host, `aria-live` region | **rewrite** | `AnimatePresence` slide is explicitly excluded ("no reliance on … basic fades") |
| `components/layout/SiteHeader.tsx` | room chrome: index button, sound toggle, motion toggle, current-room label | **rewrite** | Global nav bar conflicts with "each room is a full-screen environment" |
| `components/layout/SiteFooter.tsx` | colophon panel reachable from Foyer/About | **reuse + restyle** | Content is good; placement changes |
| `components/editorial/EntryList.tsx` | room index list / Index of Ideas results | **reuse + restyle** | Data-agnostic already |
| `components/editorial/FeaturedEntry.tsx` | Foyer "selected writing" | **reuse + restyle** | |
| `components/editorial/EmptyState.tsx` | room empty states and every `TODO: author to supply` block | **reuse** | `tone="paper"` already exists — exactly the placeholder mechanism needed |
| `components/editorial/Markdown.tsx` | reading-view body renderer | **reuse** | GFM + link safety + lazy images |
| `components/editorial/ReadingProgress.tsx` | reading-view gilt progress bar + percent | **reuse + extend** | Needs a percent readout and to measure the reading surface, not `window` |
| `components/ui/Seal.tsx` | brand mark (header, footer, favicon) | **reuse + extend** | Keep the CSS mark; add a separate ornate SVG seal for the entrance |
| `components/ui/Reveal.tsx` | generic reveal | **reuse** | Already reduced-motion aware |
| `lib/format.ts` | dates + reading time | **reuse + extend** | Reading time must gate on "only if computed from real content" — already does |
| `lib/useDocumentTitle.ts` | per-room titles/descriptions | **reuse** | |
| `pages/home/HomePage.tsx` | **Foyer** | **rewrite** | Needs book-spine index, lamplight, not a marketing hero |
| `pages/section/SectionPage.tsx` | room index (inside each room's reading surface) | **rewrite** | Becomes a component inside the room, not a page shell |
| `pages/article/ArticlePage.tsx` | full-screen **reading view** overlay | **rewrite** | Must expand from the item's position, close back into the room, restore focus, have its own URL |
| `pages/about/AboutPage.tsx` | **About** room | **reuse + restyle** | Content (incl. reserved biography placeholder) preserved verbatim |
| `pages/NotFoundPage.tsx` | 404 | **reuse + restyle** | |
| `content/types.ts` | §8 content model (9 types, shared fields, relationships) | **extend** (keep `WritingEntry` as a legacy alias) | |
| `content/sections.ts` | **room registry** (palette, lighting, ambient motion, order) | **extend** | Rooms are "data-driven from the content model" |
| `content/site.ts` | site chrome copy | **reuse** | Masthead, tagline, epigraph, contact |
| `content/entries/*.ts` | keep exactly as-is | **reuse** | Empty; the migration script writes alongside, never over them |
| `content/index.ts` | selectors + build-time reference validation | **extend** | §8 requires validation of `related[]`/`ideas[]` and duplicate-slug warnings |
| `styles/global.css` | split into `tokens.css` + room stylesheets | **rewrite (original kept, marked deprecated)** | 887 lines in one file does not scale to eight rooms |
| `assets/images/old-library.jpg` | keep (entrance texture / Foyer depth) | **reuse** | Only raster asset; should be re-compressed |
| `public/favicon.svg` | keep | **reuse** | |
| `index.html` | keep OG/meta, add per-room descriptions + font preloads | **reuse + extend** | |
| `render.yaml`, `frontend/vercel.json` | unchanged | **reuse** | |

**Nothing will be deleted.** Superseded files move to `frontend/legacy/` (outside `src/`,
so neither `tsc -b` nor Vite touches them) and are listed in the stage report.

---

## 8. New requirements — what does not exist at all

Everything in these lists is green-field. Nothing in the current codebase covers it.

1. **Full-screen entrance**: edge-to-edge BARBIE lettering, gilt foil/emboss, ornate SVG
   seal with pulse + hint, seal *crack*, two-panel cover hinging from a centre spine with
   visible thickness and page block, light sweep, replay link. (Current: small centred
   book, single left hinge, no crack, no replay.)
2. **Page-turn navigation engine**: segmented/bent page, layered paper, moving
   shadow/highlight tied to angle, pointer drag with momentum, corner peel, arrow/PageUp/
   PageDown keys, TOC multi-turn, direction derived from history.
3. **Eight rooms** with distinct palettes, lighting, ambient motion and decoration.
4. **Design token system** — one file, room-level palette pairings, WCAG AA verified.
5. **Self-hosted fonts** with system fallbacks and `font-display: swap`.
6. **Content model §8** with 9 types, typed relationships, build-time validation,
   `docs/CONTENT_MODEL.md`.
7. **Interactive features**: Intellectual Genealogy (force graph, pan/zoom/drag/filter,
   list alternative), Index of Ideas (search, alphabetical + thematic), Red Thread
   (`stroke-dashoffset`), Marginalia, Cabinet drawers/objects, Unfinished Archive cards,
   Books Read shelf with filters.
8. **Sound**: Web Audio effects, persistent accessible toggle, default OFF,
   `localStorage` with safe fallback, never before a gesture, `docs/AUDIO_CREDITS.md`.
9. **Reduced-motion**: both `prefers-reduced-motion` *and* an in-app toggle.
10. **No-3D fallback** and no-Canvas/Web-Audio fallbacks.
11. **Performance**: per-room code splitting, lazy graph/audio/particles, bundle report.
12. **Accessibility upgrades**: focus trap + focus restoration in reading views,
    `aria-live` navigation announcements, 44 px targets, gold focus rings everywhere,
    text alternatives for the graph.
13. **Tests**: content validation, router/history logic, sound-preference persistence.
14. **Docs**: `AUDIT.md` (this file), `CONTENT_MODEL.md`, `AUDIO_CREDITS.md`,
    `TEST_CHECKLIST.md`, final report.

---

## 9. Risks and unknowns

| # | Risk | Impact | Mitigation |
| --- | --- | --- | --- |
| R1 | **No content exists.** Every room will be an empty shell. | The redesign can be judged only on chrome, not on real reading. | Build the rooms against the empty-state/placeholder path from day one; label every gap `TODO: author to supply`. Never fabricate. |
| R2 | Fonts come from the Google CDN | Violates the self-hosting rule; offline/CSP fragility | Download the woff2 subsets into `frontend/public/fonts/` in Stage 1, add `@font-face` + `font-display: swap` + system fallbacks, drop the `@import` |
| R3 | 620 kB single chunk | Fails the "report bundle size before and after" and "code-split per room" requirements | `React.lazy` per room; measure and report at every stage |
| R4 | framer-motion is heavy but already a dependency | Removing it risks regressing tested behaviour (entrance, reveals, progress) | Keep it for Stage 1–2 (reuse rule); revisit in Stage 4 with numbers |
| R5 | `render.yaml` declares `branch: main`, the repo branch is **`master`** | Auto-deploy may never trigger | Fix or confirm during Stage 4 (pre-existing bug, not introduced by us) |
| R6 | No test runner anywhere | §11 requires added tests | Add a dev-only runner; needs approval (Q4) |
| R7 | 3D page turns on low-end devices / in headless CI | Jank or outright failure | Feature-detect `transform-style: preserve-3d` + `supports`, `prefers-reduced-motion`, and a low-power mode; Playwright checks only the fallbacks deterministically |
| R8 | `aria-modal` dialog with no focus trap in the current entrance | Screen-reader users can tab out of the overlay | Add a focus trap + restore in Stage 1 |
| R9 | Eight full-screen rooms × 4 breakpoints × portrait/landscape = ~64 layouts | Effort explosion | Room layouts are data-driven from the registry; share one room frame |
| R10 | Oxlint runs on the whole repo, so a `frontend/legacy/` folder would be linted and could fail CI | Build breaks | `ignorePatterns` **is** supported by the installed oxlint 1.73 (confirmed against `node_modules/oxlint/configuration_schema.json`) — add `legacy/**` to `frontend/.oxlintrc.json` |
| R11 | Content validation must run "on build or load" | Silent broken links otherwise | Prefer a load-time validator in dev + a `node` script wired into `npm run build`; a test-runner dependency would be optional |
| R12 | `html { scroll-behavior: smooth }` is global | Conflicts with "no scroll hijacking" and reduced motion | Scope it; the reduced-motion block already neutralises it |
| R13 | `old-library.jpg` is 183 kB and only used at low opacity | LCP/weight waste | Re-compress or replace with CSS/SVG texture in Stage 1 |
| R14 | CI uses Node 20, local is Node 24 | Type/lint drift | Keep CI green locally with `npm ci` + both scripts |

**Unknowns that do not block Stage 1** (stated assumptions, per the brief):

- A1: Existing four section slugs stay canonical; room names become aliases.
- A2: The Genealogy and Index of Ideas are overlays/panels with their own URLs, not
  additional rooms — the brief lists them under "Interactive features", not "Rooms".
- A3: Reading views live at `/:room/:slug` (matching today's `/:section/:slug`) so every
  existing deep link keeps working.
- A4: All texture/lighting/ornament is CSS + inline SVG (`feTurbulence`, gradients) — no
  new image assets.
- A5: The `section` field on `WritingEntry` is preserved as a legacy field; the new model
  adds `type` and `room` and an adapter maps the old one.
- A6: "Reading time only if computed from real content" is already satisfied by
  `getReadingTime` returning `undefined` at zero words.

---

## 10. Questions for approval (none block Stage 1)

| # | Question | Recommended default |
| --- | --- | --- |
| Q1 | **Room URLs:** keep `/essays`, `/notes`, `/creative-work`, `/library` canonical with room-name aliases, or rename canonically (`/reading-chamber`, …) and redirect the old ones? | Keep old canonical + add aliases → zero breakage, and matches rule 2 |
| Q2 | **New room slugs:** `/cabinet` and `/unfinished`? Alternatives: `/curiosities`, `/archive` | `/cabinet` and `/unfinished` |
| Q3 | **Genealogy / Index of Ideas placement:** overlay panels with URLs (`/genealogy`, `/index-of-ideas`) reachable from every room, or full rooms? | Overlay panels with their own URLs (they are features, and they must highlight *across* rooms) |
| Q4 | **New dependency — test runner.** §11 requires tests for content validation, router/history and sound persistence, but there is no runner. Adding **vitest** (+ `jsdom`/`happy-dom`) is a dev-only dependency. Alternative: a zero-dependency `node --test` script suite (Node 24 has a built-in test runner and can import compiled TS via `tsx`… which is itself a dependency). | Add **vitest** as devDependencies only; justify in §4 of the final report |
| Q5 | **Fonts:** vendor woff2 files into `frontend/public/fonts/` (no new dependency, manual subsetting) vs. `@fontsource/*` npm packages? | Vendor files — no new runtime dependency, full control, works offline |
| Q6 | **framer-motion:** keep (existing, tested) or replace with CSS/WAAPI to cut bundle? | Keep for now; measure in Stage 4 and decide with numbers |
| Q7 | **Sound sources:** synthesise effects with the Web Audio API (zero files, zero licensing risk) vs. source CC0 audio files? | Synthesise in-app; still document every source in `docs/AUDIO_CREDITS.md` as "generated, public domain" |

---

## 11. Stage 1 scope (for reference — will not start without approval)

1. Design tokens + typography + layout shell (`tokens.css`, self-hosted fonts, room frame).
2. Full-screen entrance: cover, ornate seal, crack, two-panel opening, skip, replay,
   reduced-motion crossfade, once-per-session, focus trap.
3. Room router: real URLs, aliases, history direction, deep links, per-room titles.
4. Page-turn engine: click, drag/swipe with momentum, keyboard, TOC, reduced-motion and
   no-3D fallbacks.
5. Sound foundation: Web Audio graph, persistent toggle, default OFF, safe `localStorage`.
6. Reading-view open/close shell with focus restoration and URL.

Estimated file movement at Stage 1: `frontend/src/components/entrance/EntranceScreen.tsx`
and the entrance block of `styles/global.css` superseded → `frontend/legacy/`; everything
else modified in place.

---

*End of Phase 0. Awaiting approval before Stage 1.*
