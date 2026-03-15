# WorkForce Manager

A workforce and project management application built with SvelteKit 2, Svelte 5, and Tailwind CSS v4.

## Features

- **Worker Management** — Track workers with contact details, notes, and project assignments
- **Project Tracking** — Manage projects with status tracking, budgets, and team assignments
- **Client Management** — Organize clients with company profiles and linked projects
- **Dashboard** — Overview of workers, active projects, and clients at a glance
- **Dark/Light Theme** — Automatic theme based on system preferences
- **Mobile Responsive** — Sidebar collapses to mobile-friendly navigation

## Tech Stack

- **Frontend:** SvelteKit 2 + Svelte 5 (runes syntax)
- **Styling:** Tailwind CSS v4
- **Database:** better-sqlite3 (structured for easy Supabase migration)
- **Deployment:** Vercel (Node.js 22.x runtime)
- **Language:** TypeScript

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and auto-creates the database with seed data on first run.

## Database

SQLite database stored at `./data/app.db`. The service layer in `src/lib/server/db/` is structured with clean interfaces to enable easy migration to Supabase or other backends.

## API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/workers` | GET, POST | List/create workers |
| `/api/workers/[id]` | GET, PUT, DELETE | Get/update/delete worker |
| `/api/projects` | GET, POST | List/create projects |
| `/api/projects/[id]` | GET, PUT, DELETE | Get/update/delete project |
| `/api/projects/[id]/workers` | GET, POST, DELETE | Manage project team |
| `/api/clients` | GET, POST | List/create clients |
| `/api/clients/[id]` | GET, PUT, DELETE | Get/update/delete client |

## Deployment

Configured for Vercel with `@sveltejs/adapter-vercel` using Node.js 22.x runtime.
