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

### Environment variables

| Variable                 | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `PORT`                   | API port (default `3000`)                                        |
| `FRONTEND_ORIGIN`        | Allowed CORS origin (default `http://localhost:5173`)            |
| `DATABASE_URL`           | PostgreSQL connection string                                     |
| `JWT_SECRET`             | Token signing secret, at least 32 characters (required)          |
| `JWT_EXPIRES_IN_SECONDS` | Token lifetime (default 7 days)                                  |
| `ADMIN_EMAIL`            | Admin account created by `npm run db:seed` (optional)            |
| `ADMIN_PASSWORD`         | Password for that admin account (optional)                       |

The API refuses to start if the configuration is invalid.

### Authentication API

| Method | Path               | Auth   | Description                                  |
| ------ | ------------------ | ------ | -------------------------------------------- |
| POST   | `/api/auth/signup` | public | Create a user account; returns `{ token, user }` |
| POST   | `/api/auth/signin` | public | Sign in; returns `{ token, user }`           |
| GET    | `/api/auth/me`     | Bearer | The signed-in user, `{ user }`               |

Send the token as `Authorization: Bearer <token>`. Passwords are hashed with
bcrypt; the role is read from the database on every request, so the token alone
never grants admin access. Errors always look like
`{ "error": { "message": "...", "details": { "field": ["..."] } } }`.

### Categories and expenses API

All routes below need `Authorization: Bearer <token>`.

| Method | Path                         | Who   | Description                                              |
| ------ | ---------------------------- | ----- | -------------------------------------------------------- |
| GET    | `/api/categories`            | user  | All categories, `[{ id, name }]`                         |
| GET    | `/api/expenses`              | user  | Your expenses, filtered, sorted, and paginated           |
| GET    | `/api/expenses/:id`          | owner | One expense                                              |
| POST   | `/api/expenses`              | user  | Create an expense (201)                                  |
| PUT    | `/api/expenses/:id`          | owner | Replace an expense's fields                              |
| DELETE | `/api/expenses/:id`          | owner | Delete an expense (204)                                  |
| GET    | `/api/admin/categories`      | admin | Categories with `expenseCount`                           |
| POST   | `/api/admin/categories`      | admin | Create a category (201)                                  |
| PATCH  | `/api/admin/categories/:id`  | admin | Rename a category                                        |
| DELETE | `/api/admin/categories/:id`  | admin | Delete; its expenses move to `Uncategorized` (one transaction) |

`GET /api/expenses` query parameters (all optional): `search` (title, description,
notes, or category name), `categoryId`, `paymentMethod` (`cash`, `card`,
`mobile_money`, `bank_transfer`), `startDate` / `endDate` (`YYYY-MM-DD`,
inclusive), `minAmount` / `maxAmount`, `sortBy` (`date` or `amount`),
`sortDirection` (`asc` or `desc`), `page`, and `pageSize` (max 100). The response is
`{ items, page, pageSize, total, totalPages }`.

Expenses always belong to the signed-in user: another user's expense answers `404`,
never its contents. Amounts are fixed-precision decimals sent as strings such as
`"9000.50"`. `Uncategorized` can be neither renamed nor deleted.

### Budgets, summary, and insights API

| Method | Path                           | Who   | Description                                           |
| ------ | ------------------------------ | ----- | ----------------------------------------------------- |
| GET    | `/api/budgets/:year/:month`    | user  | Your budget for that month (404 if none is set)       |
| PUT    | `/api/budgets/:year/:month`    | user  | Create or update it with `{ "amount": "600000" }`     |
| GET    | `/api/summary?year=&month=`    | user  | Month totals, budget status, category breakdown, highest and recent expenses |
| GET    | `/api/admin/insights`          | admin | Platform totals, top and bottom categories, recent expenses and users |

Budget status follows the spent share of the budget: under 80% is `within`, from 80%
up to (not including) 100% is `approaching`, and 100% or more is `over`. The summary's
`percentSpent` is rounded down, and `remaining` is negative once the budget is
exceeded. Money is compared in integer cents.

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
