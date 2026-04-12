# DuneX — Smart Eco-Desert Camp Platform

## Overview

Full-stack pnpm workspace monorepo. Frontend (React/Vite) + Backend (Express API) for a smart desert glamping booking platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui (artifacts/dunex)
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Auth**: express-session + connect-pg-simple + bcrypt
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (backend), Vite (frontend)

## Authentication

- Login page: `/login`
- Dashboard protected at: `/dashboard` (redirects to `/login` if unauthenticated)
- Session-based auth via `express-session` + `connect-pg-simple` (sessions stored in PostgreSQL)
- Default admin created automatically on first startup:
  - **Username**: `admin`
  - **Password**: `dunex@2026`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild composite lib declarations
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/dunex run build` — build frontend for production

## Render Deployment

See `render.yaml` at the project root for configuration.

- **Build command**: `pnpm install && pnpm run typecheck:libs && pnpm --filter @workspace/dunex run build && pnpm --filter @workspace/api-server run build`
- **Start command**: `NODE_ENV=production node artifacts/api-server/dist/index.mjs`
- **Required env vars**:
  - `DATABASE_URL` — PostgreSQL connection string
  - `SESSION_SECRET` — random secure string (min 32 chars)
  - `PORT` — set automatically by Render

## Database Schema

Tables in `lib/db/src/schema/index.ts`:
- `accounts` — admin users with bcrypt passwords
- `reservations` — guest bookings
- `maintenance` — IoT alert tracking
- `reviews` — guest reviews
- `students` — student operator records
- `books` — library resources
- `system_settings` — key-value config

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
