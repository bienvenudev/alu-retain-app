# Retain backend

The Retain backend is a REST API built with Node.js, Express 5, and TypeScript. It
stores data in PostgreSQL through Prisma and handles authentication, expenses,
categories, budgets, monthly summaries, and admin insights. It enforces
authentication, ownership, and admin access itself, independent of the frontend.

## Getting started

You need Node.js 22 and PostgreSQL.

### 1. Create the database and roles

Two PostgreSQL roles are used: `retain_migrator` owns the database and tables and
runs migrations, and `retain_app` is the least-privileged role the running API uses.
As a superuser (`psql -U postgres`):

```sql
CREATE ROLE retain_migrator LOGIN PASSWORD 'choose-a-password';
CREATE ROLE retain_app LOGIN PASSWORD 'choose-another-password';
CREATE DATABASE retain OWNER retain_migrator;
GRANT CONNECT ON DATABASE retain TO retain_app;
```

### 2. Configure the environment

```bash
npm install
cp .env.example .env     # then fill in the values below
```

#### Environment variables

| Variable                 | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `PORT`                   | API port (default `3000`)                                        |
| `FRONTEND_ORIGIN`        | Allowed CORS origin (default `http://localhost:5173`)            |
| `DATABASE_URL`           | PostgreSQL connection string                                     |
| `JWT_SECRET`             | Token signing secret, at least 32 characters (required)          |
| `JWT_EXPIRES_IN_SECONDS` | Token lifetime (default 7 days)                                  |
| `ADMIN_EMAIL`            | Admin account created by `npm run db:seed` (optional)            |
| `ADMIN_PASSWORD`         | Password for that admin account (optional)                       |
| `DEMO_EMAIL`             | Demo user created by `npm run db:seed` with sample data (optional) |
| `DEMO_PASSWORD`          | Password for the demo user (optional)                            |

The API refuses to start if the configuration is invalid.

### 3. Migrate, seed, and run

Point `DATABASE_URL` at `retain_migrator` for this step:

```bash
npx prisma migrate deploy                            # create the tables
npm run db:seed                                      # categories, admin, and optional demo user
psql "$DATABASE_URL" -f prisma/app-role-grants.sql   # once: let retain_app read and write
```

Then point `DATABASE_URL` at `retain_app` and start the API:

```bash
npm run dev      # http://localhost:3000, restarts on changes
npm run build    # compile to dist/
npm start        # run the compiled build
```

`GET /api/health` answers `{ "status": "ok" }`.

The seed creates `Uncategorized` plus a few common categories. It also creates the
admin user if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, and a demo user if
`DEMO_EMAIL` and `DEMO_PASSWORD` are set. The demo user comes with about 20 sample
expenses (in RWF, spread over three months) and budgets for this and last month,
dated relative to the day you seed. Re-running the seed never changes an existing
account or its data. Skip both variables in production.

## API reference

### Authentication

| Method | Path               | Auth   | Description                                  |
| ------ | ------------------ | ------ | -------------------------------------------- |
| POST   | `/api/auth/signup` | public | Create a user account; returns `{ token, user }` |
| POST   | `/api/auth/signin` | public | Sign in; returns `{ token, user }`           |
| GET    | `/api/auth/me`     | Bearer | The signed-in user, `{ user }`               |

Send the token as `Authorization: Bearer <token>`. Passwords are hashed with
bcrypt; the role is read from the database on every request, so the token alone
never grants admin access. Errors always look like
`{ "error": { "message": "...", "details": { "field": ["..."] } } }`.

### Categories and expenses

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

### Budgets, summary, and insights

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

## Changing the database schema

Edit `prisma/schema.prisma`, then create a migration. `prisma migrate dev` needs a
shadow database, and `retain_migrator` is not allowed to create databases, so allow it
once as a superuser:

```sql
ALTER ROLE retain_migrator CREATEDB;
```

Then run `npx prisma migrate dev --name <change>`. Other useful scripts:
`npm run db:validate` and `npm run db:generate`.
