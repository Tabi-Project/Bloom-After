# Bloom After 🌸

Bloom After is a postpartum depression support and care platform designed to provide Nigerian mothers and caregivers with trusted information, verified care directories, and moderated community experiences.

This project is being developed as part of the Tabî Project by the TEE Foundation for International Women’s Day 2026.

The platform prioritizes safety, empathy, accessibility, and responsible maternal mental health support.

---

## Mission

Bloom After aims to:

- Provide clinically grounded postpartum depression information
- Help mothers find verified clinics and specialists
- Share moderated community recovery stories
- Maintain a calm, accessible, stigma-free digital experience

All contributions must reflect empathy, safety, and clinical responsibility.

---

## Platform Features

Bloom After includes:

- Educational Resource Hub
- Clinic Finder with map view
- Specialist Directory
- Community Stories Library
- NGO Support Directory
- Media and Podcast Directory
- Admin Moderation Dashboard

The platform is designed to be mobile-first and accessible on low-end Android devices, ensuring accessibility across Nigeria.

---

## Important Links

- **Live Site:** [Bloom After](https://bloom-after-59wn.vercel.app/)
- **Contribution Guidelines:** [View Document](https://docs.google.com/document/d/1R9hX7qCAkG74NZYodpto4FgRB0dEhsgsqK5hv-kHwKg/edit?usp=drive_link)
- **Team Members' Articles:** [View Document](https://docs.google.com/document/d/14iJZ-iyf5wIm2u7zc0hasp7aiVDBjOdZ/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)
- **Design Documentation:** [View Document](https://docs.google.com/document/d/1deaFgJFJI_zZz3UXreUOLGGY7J-mTIt7/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)
- **Technical Requirements Document (TRD):** [View Document](https://docs.google.com/document/d/1--xeDsOoyEhdnOGzZkKjKSW462ESHBWs/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)

---

## System Architecture

Bloom After follows a layered architecture.

| Layer | Responsibility |
|------|---------------|
| Frontend | Next.js (App Router) + React + TypeScript UI |
| Backend API | Node.js + Express API handling business logic |
| Database | MongoDB via Mongoose |
| File Storage | Cloudinary |

**Flow**

User → Frontend → Backend API → Database → JSON Response

The frontend is hosted on **Netlify**, while the backend API runs on **Render or Railway**.

---

## Changelog

### Frontend Migration to Next.js — ongoing, started 2026

**Changed by:** The Bloom After team

**What Changed:**
The frontend is being rebuilt page by page in `/migration` using Next.js
(App Router), React, and TypeScript, replacing the original HTML/CSS/vanilla
JavaScript frontend in `/client`. The admin dashboard and content management
screens (content list + content editor) have been ported so far, alongside
several public-facing pages. `/client` remains in the repo as a working
reference until the migration is complete.

**Why It Changed:**
The vanilla JS frontend had grown hard to maintain as a single shared
component/data layer across many hand-wired pages. Next.js gives the project
typed components, a shared layout system, and a clearer separation between
API clients (`lib/api/`), framework-agnostic helpers (`lib/`), and types
(`types/`).

**Impact on Other Components:**
Root-level `npm run dev` / `npm run build` now point at `/migration` by
default; the legacy equivalents are available as `npm run dev:legacy` /
`npm run build:legacy`. No backend changes were required — the new frontend
talks to the same Express API in `/server`.

---

### PRD Update — 10th March, 2026

**Changed by:** Nanji Lakan  

**What Changed:**  
- The Resource Hub now groups additional content types, including curated media resources.  
- The Clinic Finder now incorporates specialist profiles within the same directory.  
- Crisis Support and Helpline Access was introduced as a dedicated feature.  
- Platform Capabilities (search and location services) were separated from core features.  
- The Admin and Moderation section was expanded to better describe moderation workflows and content management responsibilities.  

**Why It Changed:**  
The intention is to make the PRD clearer, more logically structured, and better aligned with how the MVP will function. These updates are highlighted in yellow in the document titled *Bloom After PRD 2.0* on Drive.  

**Impact on Other Components:**  
The Resource Hub now has a dedicated media section to make up for removing the media.

---

## Technology Stack

### Frontend
- [Next.js](https://nextjs.org) (App Router)
- React + TypeScript
- CSS (mobile-first responsive design)

> The original frontend (`/client`) was plain HTML, CSS, and vanilla JavaScript.
> It's kept for reference during the migration but is no longer where new
> frontend work happens — see [Repository Structure](#repository-structure).

### Backend
- Node.js
- Express.js

### Database
- MongoDB (via Mongoose)

### Additional Services
- Cloudinary (media storage)
- Leaflet.js + OpenStreetMap (maps)
- Browser Geolocation API
- Resend (transactional email — admin invites, moderation notifications)

---

## Repository Structure

```
/bloom-after
  /migration       # frontend (Next.js, active development)
  /client          # legacy frontend (HTML/CSS/vanilla JS, kept for reference)
  /server          # backend API
  /scripts         # seed scripts and helpers
  README.md
  CONTRIBUTING.md
```

### Frontend Structure

```
/migration
  /app             # routes (App Router) — public + (admin) route groups
  /components      # shared and feature React components
  /lib             # API clients and framework-agnostic helpers
  /types           # shared TypeScript types
  /styles          # CSS, ported 1:1 from /client where applicable
```

The legacy `/client` frontend follows its own structure:

```
/client
  /assets
  /css
  /js
  /pages
```

### Backend Structure

```
/server
  /routes
  /controllers
  /middleware
  /models
  /utils
  /config
  app.js
  server.js
```

---

## Development Workflow

Branching strategy:

| Branch | Purpose |
|------|------|
prod | Production-ready code |
dev | Integration branch |
feature/* | Feature development |
fix/* | Bug fixes |

All pull requests must target **dev**.

The **Engineering Lead** reviews and approves merges from **dev → prod**.

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Tabi-Project/Bloom-After.git
```

Navigate into the project:

```bash
cd bloom-after
```

Install dependencies for the frontend and backend:

```bash
cd migration && npm install && cd ..
cd server && npm install && cd ..
```

Run the backend API:

```bash
npm run dev:server
```

Run the frontend (Next.js, from the repo root):

```bash
npm run dev
```

This opens the app at [http://localhost:3000](http://localhost:3000).

The legacy frontend under `/client` is still runnable via `npm run dev:legacy`
/ `npm run build:legacy` while the migration to Next.js is completed page by page.

### Environment Variables

Create a `.env` file inside `/server` with the variables it actually reads:

```
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
APP_BASE_URL=
CORS_ALLOWED_ORIGINS=
SUPPORT_EMAIL=
```

`MONGO_URI`, `JWT_SECRET`, and the `CLOUDINARY_*` keys are required for the
API and uploads to work; the rest have sane defaults and are only needed to
override behavior (allowed CORS origins, the base URL used in moderation
emails, etc.) — see `server/server.js` and `server/utils/` for exactly how
each one is used.

## Contributing

We welcome contributors who align with Bloom After’s mission of responsible maternal mental health support.

Please read the contribution guide before submitting changes.

See:

[CONTRIBUTING.md](CONTRIBUTING.md)

for:

- contribution workflow
- coding standards
- branch naming
- pull request requirements

### Ethical Commitment

Bloom After handles sensitive maternal mental health content.

All contributions must:

- Avoid medical misinformation
- Use respectful and non-stigmatizing language
- Protect user privacy
- Follow clinical responsibility standards

The platform does not allow unmoderated medical advice or unsafe content.

### License

This project is released under the license provided in the repository.

### Acknowledgements

Bloom After is developed under the Tabî Project – TEE Foundation as part of the International Women’s Day 2026 initiative.

The goal is to improve maternal mental health awareness, access to care, and support systems across Nigeria.


---
