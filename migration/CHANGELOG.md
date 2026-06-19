# Changelog

All notable changes to the Next.js migration (`migration/`) are documented in this
file. Each entry compares the new App Router implementation against its
counterpart in the legacy Vite/vanilla-JS client (`client/`).

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Entries
are grouped by migration date (oldest work at the bottom, newest at the top).
Append new entries to the top as further sections are migrated.

## [Unreleased] — known gaps

Pages/routes that exist only as route placeholders or run on mock data and
still need real migration work:

- **Stories editor flow** — `stories/editor`, `stories/review`, and
  `stories/success` have no migrated implementation yet (the legacy
  `client/stories/editor`, `client/stories/review`, and `client/stories/success`
  pages — rich-text editor, pre-submit review, confirmation screen — have not
  been ported). The empty placeholder files that were scaffolded for these
  routes were removed on 2026-06-19 since no work had started on them; the
  routes will return 404 until rebuilt.
- **Lifestyle detail page** — `lifestyle/[slug]` has no migrated
  implementation. The legacy `client/lifestyle/detail` page has not been
  ported; `LifestyleCard` currently links to `/lifestyle/detail?id=...`,
  which doesn't resolve to anything in the migration. The empty placeholder
  file was removed on 2026-06-19 for the same reason as above.
- **NGO directory data** — `app/(public)/ngos/page.tsx` renders from the local
  mock fixture `data/ngos.ts`. The typed `fetchNgos()` call in
  `lib/ngos-api.ts` is implemented but commented out pending backend
  integration.
- **Resources detail route naming** — `app/(public)/resources/[slug]/page.tsx`
  takes a resource **ID**, not a real slug. The param name is a holdover from
  scaffolding and should eventually either be renamed to `[id]` or backed by
  real slugs.

---

## 2026-06-19 — Stories editor migration (#147)

### Added
- `app/(public)/stories/page.tsx`: stories landing page with search, tag
  filters (Therapy, Lifestyle changes, Peer support, Self-help strategies,
  Other), and pagination, replacing `client/stories/index.html`.
- `app/(public)/stories/[id]/page.tsx`: story detail page (clean dynamic
  route instead of the legacy query-param navigation), replacing
  `client/stories/detail`.
- `components/story/StoryCard.tsx` and `FilterButton` component extracted
  from the legacy monolithic page markup.
- `lib/api/story-api.ts` and `types/story.ts`: typed fetch/normalization
  layer for stories.
- `lib/richText.ts`: shared rich-text-to-safe-HTML utility used by the story
  detail page.

### Removed
- Imperative DOM builders and page-handler scripts from
  `client/js/pages` (story listing/detail rendering).

### Not migrated in this pass
- Editor, review, and success steps of the submission flow (see
  [Unreleased](#unreleased--known-gaps)).

---

## 2026-06-19 — Crisis-handling component (#141)

### Added
- `app/(public)/crisis-handling/page.tsx` and `components/CrisisCards.tsx`,
  replacing the static skeleton in `client/crisis-handling/index.html` (which
  shipped an empty `#crisis-root` div populated by a separate script at
  runtime).
- `data/crisis-handling.ts`: typed crisis scenario data (9 scenarios across
  3 severity levels — critical, urgent, distress) with step-by-step guidance,
  replacing the legacy DOM-populated modal content.
- Accessible modal behavior: focus trap, Escape-to-close, return-focus-on-close.

### Changed
- Inline SVGs in the legacy markup replaced with `lucide-react` icon
  components.

### Removed
- `client/crisis-handling`'s separate modal-population script and
  `#crisis-modal` DOM scaffolding.

### Architectural decisions
- Crisis content is defined as static typed data rather than fetched, since
  it doesn't change per-user and ships with the bundle.

---

## 2026-06-19 — Lifestyle page migration (#145)

### Added
- `app/(public)/lifestyle/page.tsx`: search, category filters
  (All/Lifestyle/Medical), debounced search (350ms), and pagination,
  replacing `client/lifestyle/index.html`.
- `components/lifestyle/LifestyleCard.tsx` using `next/image`.
- `lib/api/lifestyle-api.ts` and `types/lifestyle.ts`: typed client with
  normalization for both legacy and modern API field names (`_id`/`id`,
  `description`/`desc`).

### Removed
- `client/js/pages/lifestyle-page.js` page handler.

### Not migrated in this pass
- The detail page (`client/lifestyle/detail`) was not ported in this PR (see
  [Unreleased](#unreleased--known-gaps)).

---

## 2026-06-18 — Resources section migration (#139)

### Added
- `app/(public)/resources/page.tsx` and `app/(public)/resources/[slug]/page.tsx`,
  replacing the static `client/resources/index.html` and
  `client/resources/detail/index.html`.
- `components/resources/{ResourceCard,ResourceDetailPage,RelatedResources,Renderers}.tsx`.
- `types/resource.ts`: discriminated-union content model (`ArticleBlock[]`,
  `InfographicContent`, `MythBustingContent`, `MediaContent`) covering all
  four resource content types.
- `lib/api/resources.ts`: typed `fetchResources`/`fetchResourceById` with
  response normalization, ported from `client/js/data/resources-api.js`.

### Changed
- The legacy renderer functions (`renderBlock`, `renderArticle`,
  `renderInfographic`, `renderMythBusting`) from
  `client/js/components/renderers.js` were ported to TypeScript as pure
  functions returning HTML strings, rendered via `dangerouslySetInnerHTML`
  in `ResourceDetailPage`. Block/icon mappings kept structurally identical
  to the legacy version.
- Pagination moved client-side: the migration fetches up to 200 resources
  and paginates in React state, rather than requesting one page at a time
  from the backend as the legacy client did.

### Removed
- DOM refs (`#resources-grid`, `#resource-hero`, `#related-root`) and manual
  pagination DOM construction.

### Fixed (2026-06-19, this session)
- `lib/api/resources.ts` defined its own incomplete `Resource` interface
  (missing `structured_content`, `file_url`, `media_format`) instead of
  using the complete one in `types/resource.ts`. `Renderers.tsx` referenced
  those missing fields, which `tsc` caught as type errors. Consolidated on a
  single `Resource` type (re-exported from `lib/api/resources.ts` for
  backward-compatible imports) and restored the field-normalization logic
  (`structured_content`/`structuredContent`, `file_url`/`source_url`,
  `media_format`) that existed in the legacy `normalizeResource` but had
  been dropped during migration. Also fixed `fetchResourceById`, which was
  returning the raw API response unnormalized.

### Known naming issue
- The dynamic segment is named `[slug]` but is actually a resource ID (see
  [Unreleased](#unreleased--known-gaps)).

---

## 2026-06-17 — Admin login & dashboard rebuild (#133)

### Added
- `app/(admin)/admin/login/page.tsx` and `app/(admin)/admin/dashboard/{layout,settings/page}.tsx`,
  replacing `client/admin/login/index.html` and the legacy admin dashboard
  shell.
- `components/admin/{AdminSidebar,AdminTopNav}.tsx`, extracted from the
  legacy monolithic dashboard markup/script.
- `app/api/admin/login/route.ts` and `app/api/admin/logout/route.ts`:
  server-side route handlers that proxy auth to the backend.

### Changed
- **Auth storage**: the legacy client stored the admin token only in
  `sessionStorage` after a client-side `fetch` to the auth endpoint. The
  migration's login route sets an `httpOnly`, `sameSite=lax` cookie
  (validated against JWT expiry) so `proxy.ts` middleware can gate
  `/admin/:path*` server-side, while also mirroring the token into
  `sessionStorage` via `lib/admin-session.ts` for client calls that need an
  `Authorization: Bearer` header. This is a deliberate hybrid: the cookie is
  the source of truth for route protection, the sessionStorage copy is only
  a convenience for client fetches.
- **CSS architecture**: legacy admin styles (`client/css/admin-login.css`,
  etc.) used loose, non-strict-BEM class names. The migration's
  `styles/admin-*.css` adopts explicit BEM naming
  (`.admin-login-form__field-group`, `.sidebar-nav__item--active`) to keep
  styles scoped as the dashboard grows.

### Removed
- Client-side-only auth flow (token kept solely in `sessionStorage`, no
  server-side route gating).

### Architectural decisions
- Route group `app/(admin)/` keeps admin routes logically separate without
  affecting the URL, letting `proxy.ts` middleware target
  `/admin/:path*` for auth gating in one place.
- Logout route clears the cookie unconditionally even if the best-effort
  backend logout call fails, so the user is never stuck "logged in" client-side.

---

## 2026-06-16 — API client consolidation

### Changed
- Moved `lib/clinics-api.ts` → `lib/api/clinics-api.ts` and
  `lib/resources.ts` → `lib/api/resources.ts` to group typed API clients
  under one directory.
- Added `lib/api/lifestyle-api.ts` and `types/lifestyle.ts`
  (`Tip`, `Lifestyle`, `LifestyleApiData`, `FetchLifestyleParams`,
  `Pagination`, response envelopes), making the lifestyle client fully typed
  ahead of the lifestyle page migration the following day.

---

## 2026-06-16 — NGO directory migration (#129)

### Added
- `app/(public)/ngos/page.tsx`, replacing `client/ngos/index.html` and its
  page handler in `client/js/pages`.
- `components/ngos/NgoCard.tsx` using `next/image` instead of a plain `<img>`,
  with `next.config.ts` remote patterns added for Unsplash/Cloudinary and
  adaptive quality levels.
- `lib/ngos-api.ts` and `types/ngo.ts`: typed client with a `normalizeNgo`
  function handling field variance (e.g. `focus_tags` vs. `focus_areas`).
- `data/ngos.ts`: typed mock fixture used while the real API call is
  disabled (see [Unreleased](#unreleased--known-gaps)).

### Changed
- Search/filter/pagination state moved from imperative DOM updates to React
  state and hooks.

---

## 2026-06-16 — Clinic finder migration (#127)

### Added
- `app/(public)/clinics/page.tsx`, replacing `client/clinics/index.html` and
  `client/js/pages` clinic handlers.
- `components/clinics/{ClinicCard,FilterSidebar,ClinicDetailsPanel}.tsx`
  extracted from the legacy monolithic page.
- `lib/api/clinics-api.ts` and `types/clinic.ts`: typed client with a
  `normalizeClinic` function.
- Debounced search (350ms), geolocation, list/map toggling, and a review
  submission flow in the details panel — all carried over from the legacy
  page.

### Changed
- **Leaflet packaging**: the legacy page loaded Leaflet 1.9.4 from a CDN
  (`unpkg.com/leaflet@1.9.4`) via `<script>`/`<link>` tags in
  `client/clinics/index.html`. The migration installs `leaflet` as an npm
  dependency (`migration/package.json`) and imports it directly, removing
  the runtime CDN dependency. Map behavior itself is unchanged.

---

## 2026-06-15 — Navbar, footer, and landing page migration (#123)

### Added
- `components/Navbar.tsx` (`"use client"`, dropdown/mobile-menu state via
  `useState`, active-route detection via `usePathname`) and `components/Footer.tsx`,
  replacing the legacy `renderNavbar`/`renderFooter` template-string
  functions and their manual DOM event delegation.
- `app/(public)/page.tsx`, porting `client/index.html`'s sections (hero,
  features, voices, contributors, FAQs, suggestion drawer) into the App
  Router, inheriting Navbar/Footer from the root layout. The Next.js starter
  `app/page.tsx` was removed to avoid a duplicate `/` route.
- `components/Features.tsx`, `components/Voices.tsx` (client-fetches the
  latest 3 media resources via `lib/api/resources.ts` with a static
  fallback if the request fails), `components/Contributors.tsx` (team
  carousel + profile modal), `components/Faqs.tsx` (accordion), and
  `components/SuggestDrawer.tsx` (floating FAB posting to
  `/api/v1/suggestions`).

### Removed
- FontAwesome CDN kit, replaced by `lucide-react` for tree-shakeable icons.
- jQuery-style modal class toggling and DOM-based carousel logic, replaced
  with React state.

---

## 2026-06-15 — Initial scaffold

### Added
- `migration/` app: Next.js 16, React 19, TypeScript, Tailwind v4.
- App Router public route skeleton for resources, stories, ngos, clinics,
  lifestyle, and crisis-handling.
- `lib/api.ts`: type-safe, SSR-safe HTTP client ported from
  `client/js/api.js`, used as the base for all later typed API modules
  (`lib/api/*`).

### Changed
- Root `package.json` bumped to `v2.0.0`. Workspace `dev`/`build` scripts now
  target `migration/`; `dev:legacy`/`build:legacy` were added to keep running
  the old `client/` during the transition.
