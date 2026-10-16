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
schema and `npm run db:generate` to generate the typed client.

### Database setup

Two PostgreSQL roles are used: `retain_migrator` owns the `retain` database and
the tables and runs migrations, and `retain_app` is the least-privileged role the
running API should use.

```bash
npx prisma migrate deploy   # apply migrations (with DATABASE_URL = retain_migrator)
npm run db:seed             # create the "Uncategorized" category
psql "$DATABASE_URL" -f prisma/app-role-grants.sql   # once: let retain_app read/write
```

Point `DATABASE_URL` at `retain_migrator` to migrate and seed, and at `retain_app`
when running the API.

### Creating new migrations

`prisma migrate dev` needs a shadow database, and `retain_migrator` is not allowed
to create databases. The simplest fix is to allow it once, as a superuser:

```sql
ALTER ROLE retain_migrator CREATEDB;
```

Then `npx prisma migrate dev --name <change>` works normally. (The first migration
was generated with `prisma migrate diff --from-empty --to-schema-datamodel` and
applied with `prisma migrate deploy`, which do not need a shadow database.)
