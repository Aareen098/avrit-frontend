# Avrit: AI-powered hiring platform (frontend)

Multi-company applicant tracking system with AI CV screening and a recruiter chat assistant.

**Live demo:** https://www.avrit.co.in/ (use the one-click demo buttons on the login page)
**Backend repo:** https://github.com/Aareen098/avrit-backend

> The backend runs on a free plan and sleeps when unused. The first request can take up to a minute.

## Features
- Multiple companies on one platform; each only sees its own data
- Jobs, applications, candidate pipeline (drag and drop), interviews, settings
- Public careers page per company (`/c/<company-slug>`) with CV upload
- AI CV screening: score, summary and reasons
- AI assistant: ask questions about your candidates in plain English
- Semantic candidate search over CV text
- Roles: Admin, Recruiter, Hiring Manager, Candidate

## Tech
React, Vite, Tailwind CSS, React Query, React Hook Form + Zod, Zustand, deployed on Vercel.

## Run locally
```bash
npm install
cp .env.example .env   # set VITE_API_URL and VITE_USE_MOCK
npm run dev
```
`VITE_USE_MOCK=true` runs with fake data and no backend.

## Screenshots
![Dashboard](<docs/Screenshot (260).png>)
![Pipeline](<docs/Screenshot (261).png>)
![Ai Analyze](<docs/Screenshot (262).png>)
![Ai Assistant](<docs/Screenshot (263).png>)