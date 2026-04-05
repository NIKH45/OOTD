# OOTD Monorepo

Project is organized into two primary folders for clarity:

- `ootd-backend` -> Node.js + Express + Prisma + PostgreSQL API
- `ootd-frontend` -> Frontend workspace
  - `ootd-frontend/mobile` -> Expo mobile app
  - `ootd-frontend/web` -> Next.js web auth app (`/signup`, `/login`, `/home`)

## Quick Start

1. Install root dependencies:
   `npm install`
2. Install backend dependencies:
   `npm install --prefix ootd-backend`
3. Install Expo frontend dependencies:
   `npm install --prefix ootd-frontend/mobile`
4. Install Next web frontend dependencies:
   `npm install --prefix ootd-frontend/web`

## Run Commands

- Run backend + Next web: `npm run dev`
- Reset stuck dev servers and restart clean: `npm run dev:reset`
- Run backend + Expo web: `npm run dev:full-expo`
- Run backend only: `npm run dev:backend`
- Run Next web only: `npm run dev:web`
- Run Expo only: `npm run dev:frontend`

## Backend Environment (`ootd-backend/.env`)

- `DATABASE_URL="postgresql://..."`
- `JWT_SECRET="your-secret"`
- `JWT_EXPIRES_IN="7d"`
- `PORT=3001`
- `LOG_LEVEL=debug`
- `CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"`

## Web API Target

Next web app calls backend auth endpoints directly from `ootd-frontend/web/services/api.js`.
Default API target is set for local development.

- Default backend target: `http://localhost:3001/api`
- Optional override: set `NEXT_PUBLIC_API_BASE_URL` in `ootd-frontend/web/.env.local`

## Feature Notes And Prompts

- Backend notes: `ootd-backend/notes`
- Mobile notes/prompts: `ootd-frontend/mobile/notes`, `ootd-frontend/mobile/prompts`
- Web notes/prompts: `ootd-frontend/web/notes`, `ootd-frontend/web/prompts`
