# Avrit Web

**Where profession meets opportunity.** The React app for Avrit, an AI-powered, multi-company hiring platform.

[![CI](https://github.com/Aareen098/avrit-frontend/actions/workflows/<ci-file>.yml/badge.svg)](https://github.com/Aareen098/avrit-frontend/actions)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

**Live:** https://avrit.co.in · Backend repo: https://github.com/Aareen098/avrit-backend

| Careers page | Company dashboard |
|---|---|
| ![Careers](docs/careers.png) | ![Dashboard](docs/dashboard.png) |

| Pipeline | Platform admin |
|---|---|
| ![Pipeline](docs/pipeline.png) | ![Admin](docs/platform.png) |

## Features
- **Public careers pages:** browse and search open jobs without signing in, and apply with a CV.
- **Recruiter workspace:** pipeline board, candidate profiles, AI match scores, interview scheduling.
- **Insights dashboard:** charts for stages, applications over time, experience, skills and top matches (ECharts).
- **Plan and usage view** for each company, with email, AI and storage usage.
- **Platform admin area** for the owner: companies, plans, invoices, broadcasts.
- **Notifications** and Google sign-in.

## Tech stack
React, Vite, React Query (caching, refetch, invalidation), Tailwind CSS, ECharts. Deployed on Vercel.

## Performance notes
- One dashboard request instead of many (server-side summary).
- React Query prefetching and cache invalidation so counts update after actions.
- Backend and database placed close together (Singapore + Mumbai) for low latency.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend URL ending in `/api`, e.g. `http://localhost:8080/api` |
| `VITE_USE_MOCK` | `false` for the real backend (must be exactly `false` in production) |

## Build
`npm run build` creates the `dist/` folder. Every push runs the CI workflow (install, lint, build).

## Author
**Aareen Anand**: MCA, Lovely Professional University · [GitHub](https://github.com/Aareen098)