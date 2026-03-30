# OOTD Backend

Backend API for OOTD built with:
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

## Quick Start

1. Install dependencies:
   `npm install`
2. Configure environment:
   copy `.env.example` to `.env` and update values.
3. Generate Prisma client:
   `npm run prisma:generate`
4. Run migrations:
   `npx prisma migrate dev`
5. Start development server:
   `npm run dev`

## add below in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ootd?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
LOG_LEVEL=debug