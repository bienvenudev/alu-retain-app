# Retain backend

The Retain backend is a TypeScript API built with Node.js and Express. It will
provide authentication, expense, budget, category, and dashboard endpoints
backed by PostgreSQL.

## Getting started

```bash
npm install
npm run dev
```

The API health check is available at `GET /api/health`. Copy `.env.example` to
`.env` to configure the local port, frontend origin, and PostgreSQL connection.

Prisma is used for PostgreSQL access. Run `npm run db:validate` to validate the
schema and `npm run db:generate` to generate the typed client. Database
migrations are created with `prisma migrate dev` (the database role needs the
`CREATEDB` privilege so Prisma can manage its own shadow database) and applied
in production with `prisma migrate deploy`.
