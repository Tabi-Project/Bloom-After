This is the Bloom After frontend — a [Next.js](https://nextjs.org) (App Router) rewrite of the original `/client` (HTML/CSS/vanilla JS) app. See the root [README.md](../README.md) for the project overview and the "Frontend Migration to Next.js" changelog entry for context.

## Getting Started

From the repo root:

```bash
npm install --prefix migration
npm run dev
```

Or from this directory directly:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The backend API (in `/server`) must be running separately — see the root README for setup.

## Structure

- `app/` — routes (App Router). Public pages and the `(admin)` route group for the admin dashboard, content manager, and moderation tools.
- `components/` — shared and feature-specific React components.
- `lib/` — API clients (`lib/api/`) and framework-agnostic helpers.
- `types/` — shared TypeScript types, generally mirroring backend response shapes.
- `styles/` — CSS, ported from `/client` where a page has an equivalent there.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Geist and Inter.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
