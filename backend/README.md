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
migrations will be added after the local PostgreSQL role and database are
configured.
