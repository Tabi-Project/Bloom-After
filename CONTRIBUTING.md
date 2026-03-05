# Contributing to Bloom After 🌸

Bloom After is a Postpartum Depression Support & Care Platform  
Built as part of the Tabî Project | TEE Foundation  
International Women's Day Initiative — March 2026  

We welcome contributors who align with our mission of compassionate, clinically responsible maternal mental health support.

---

## Our Mission

Bloom After provides:

- Clinically grounded postpartum depression information  
- Verified Nigerian-first care directories  
- Moderated community experiences  
- A calm, accessible, stigma-free interface  

Every contribution must reflect empathy, safety, and responsibility.

---

# Tech Stack

## Frontend
- Vanilla HTML  
- CSS (mobile-first, responsive)  
- Modular JavaScript  

## Backend
- Node.js + Express  
- Supabase (PostgreSQL, Auth, Storage)  
- JWT middleware for admin routes  

## Search
- Supabase Full-Text Search  

## Maps
- Browser Geolocation API  
- Leaflet.js  

## Hosting
- Netlify (Frontend)  
- Railway or Render (Backend)  

---

# How to Contribute

1. Fork & Clone

Fork the repository, then clone your version:

```bash
git clone https://github.com/YOUR-USERNAME/Bloom-After.git
```

2. Create a Branch
Always branch from dev:

```bash
git checkout -b feature/clinic-filtering
```

Branch Naming Conventions
- feature/...
- fix/...
- docs/...
- refactor/...
- design/...

3. Follow the Project Structure

```
/client
  /assets
   /images
  /css
    base.css
  /js
    index.js
  /pages
    index.html
    ```

/server
  /config
    superbase.js
  /controllers
    auth.js
  /middleware
    getCurrentUser.js
  /models
    user.js
  /routes
    auth.js
  /utils
    slug.js
  app.js
  server.js
  
### Guidelines

- Keep JavaScript modular
- Avoid inline scripts
- Maintain clean semantic HTML

---

## Contribution Areas by Role

### UI/UX Designers

Design contributions are critical for Bloom After’s emotional tone.

#### You Can Contribute By

- Designing mobile-first wireframes
- Improving typography and spacing
- Accessibility improvements (WCAG 2.1 AA)
- Reducing cognitive load (1 primary action per screen)
- Creating reusable UI components
- Designing calm, supportive iconography
- UX flow optimization for vulnerable users
- Offline-aware UX patterns

#### Design Guidelines

- Avoid alarming reds
- Minimum **16px** body text
- High contrast for readability
- Simple layouts
- No clutter
- No social comparison metrics

#### Deliverables

- Figma wireframes
- Component documentation
- UX improvement proposals (submitted as design PRs)

---

### Frontend Developers (HTML/CSS/JS)

You can contribute by building:

- Resource hub (search + filter UI)
- Clinic finder (cards + filter + map integration)
- Specialist profile layouts
- Story submission forms
- Admin dashboard interface
- Accessibility improvements
- Performance optimization

#### Requirements

- Mobile-first approach
- No framework dependency
- Clean semantic HTML
- Modular JavaScript
- Lighthouse score target: **85+**
- No horizontal scrolling on Android devices

---

### Backend Developers

You can contribute by improving:

- RESTful API routes
- Supabase schema design
- Full-text search optimization
- Geolocation queries
- Admin JWT middleware
- Moderation queue logic
- Rate limiting
- Input validation
- Secure data storage

#### Key Areas

- Clinic submission review system
- Specialist onboarding approval workflow
- Community story moderation queue
- Search ranking logic
- Basic analytics endpoints

#### Security Requirements

- No plaintext sensitive data storage
- Validate all inputs
- Sanitize content before publishing
- Enforce role-based route protection

---

### Content & Clinical Contributors

We welcome:

- Mental health professionals
- Maternal health advocates
- Medical reviewers
- NGO researchers

#### You May Contribute

- Clinically reviewed educational content
- Nigeria-specific maternal health data
- NGO listings verification
- Research citation validation
### All Medical Content Must

- Be evidence-based
- Include source references
- Avoid diagnostic claims
- Include disclaimers

---

## Admin Roles Overview

Roles include:

- Super Admin
- Content Editor
- Moderator

Contributors should **not modify role logic without approval**.

---

## Pull Request Guidelines

When submitting a PR:

- Clearly describe the feature or fix
- Reference the relevant PRD section
- Include screenshots (for UI changes)
- Keep PR focused (no unrelated changes)
- Ensure no console errors

---

## Ethical Requirements

Bloom After handles sensitive maternal mental health content.

We do **not allow**:

- Medical misinformation
- Stigmatizing language
- Public unmoderated comments
- Data harvesting
- Unverified clinic listings

All contributors must respect **privacy and safety standards**.

---

## Before Submitting

Please confirm:

- No console errors
- Responsive layout works at **360px width**
- Acceptable Lighthouse performance score
- Accessibility basics covered
- No broken links

---

## Why This Matters

Bloom After exists to support women during one of the most vulnerable periods of their lives.

Contribute thoughtfully.  
Build responsibly.  
Design with care.