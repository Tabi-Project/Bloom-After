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

- **Live Site:** [Bloom After](https://the-bloom-after.netlify.app/)
- **Contribution Guidelines:** [View Document](https://docs.google.com/document/d/1R9hX7qCAkG74NZYodpto4FgRB0dEhsgsqK5hv-kHwKg/edit?usp=drive_link)
- **Team Members' Articles:** [View Document](https://docs.google.com/document/d/14iJZ-iyf5wIm2u7zc0hasp7aiVDBjOdZ/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)
- **Design Documentation:** [View Document](https://docs.google.com/document/d/1deaFgJFJI_zZz3UXreUOLGGY7J-mTIt7/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)
- **Technical Requirements Document (TRD):** [View Document](https://docs.google.com/document/d/1--xeDsOoyEhdnOGzZkKjKSW462ESHBWs/edit?usp=drive_link&ouid=110794638747214718388&rtpof=true&sd=true)

---

## System Architecture

Bloom After follows a layered architecture.

| Layer | Responsibility |
|------|---------------|
| Frontend | HTML, CSS, and modular JavaScript UI |
| Backend API | Node.js + Express API handling business logic |
| Database | PostgreSQL via Supabase |
| CMS | Strapi for editorial content management |
| File Storage | Cloudinary or Supabase Storage |

**Flow**

User → Frontend → Backend API → Database → JSON Response

The frontend is hosted on **Netlify**, while the backend API runs on **Render or Railway**.

---

## Technology Stack

### Frontend
- HTML
- CSS (mobile-first responsive design)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- Supabase (PostgreSQL)

### Additional Services
- Strapi CMS
- Cloudinary (media storage)
- Leaflet.js + OpenStreetMap (maps)
- Browser Geolocation API

---

## Repository Structure

```
/bloom-after
  /client          # frontend
  /server          # backend API
  /scripts         # seed scripts and helpers
  README.md
  CONTRIBUTING.md
```

### Frontend Structure

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

Install backend dependencies:

```bash
cd server
npm install
```

Run the development server:

```bash
npm run dev
```

### Environment Variables

Create a .env file using .env.example as a template.

Required variables include:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRAPI_URL=
PORT=
```

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