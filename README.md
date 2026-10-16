# Retain

Retain is a personal expense and monthly budget manager. Users record their
expenses, set a budget for each month, and see how their spending compares. An
administrator manages expense categories and sees platform-wide insights.

## Live demo

- **App:** <https://alu-retain-app-seven.vercel.app>
- **API:** <https://retain-api-w0lz.onrender.com/api> (health check: `/api/health`)

| Role  | Email              | Password    | Notes                                         |
| ----- | ------------------ | ----------- | --------------------------------------------- |
| User  | `demo@retain.app`  | `demo1234`  | Comes with sample expenses and budgets        |
| Admin | `admin@retain.app` | `admin1234` | Category management and platform insights     |

You can also sign up for a new account, which starts empty.

The API runs on a free plan that goes to sleep after 15 minutes without traffic. The
first request after a quiet period can take up to a minute while it wakes up; the
app shows a notice while it waits.

## Features

- Sign up and sign in; protected pages for signed-in users and an admin-only area
- Create, view, edit, and delete personal expenses
- Search, filter (category, payment method, date range, amount range), sort, and
  paginate expenses
- A monthly budget with a status of within, approaching, or over budget
- A dashboard with the month's spending, a category breakdown, and recent expenses
- Admin category management (deleting a category moves its expenses to
  `Uncategorized`) and platform insights

Amounts are in Rwandan francs (RWF).

## Tech stack

| Part     | Technology                                                                 |
| -------- | -------------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Redux Toolkit, React Hook Form, Zod, Axios |
| Backend  | Node.js, Express 5, TypeScript, Prisma, Zod, JSON Web Tokens, bcrypt       |
| Database | PostgreSQL                                                                 |

Authentication state and protected routes use React Context; expense search,
filtering, sorting, and pagination state lives in Redux.

## Project structure

- `frontend/` - the React application ([frontend README](./frontend/README.md))
- `backend/` - the REST API, database schema, and migrations ([backend README](./backend/README.md), including the full API reference)

## Running it locally

You need Node.js 22 and a running PostgreSQL server.

1. Set up the database and start the API by following the
   [backend README](./backend/README.md).
2. Start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open <http://localhost:5173> and sign up, or use an account created by the
   backend seed:

   | Role  | Email              | Password    |
   | ----- | ------------------ | ----------- |
   | User  | `demo@retain.app`  | `demo1234`  |
   | Admin | `admin@retain.app` | `admin1234` |

   These come from `DEMO_EMAIL` / `DEMO_PASSWORD` and `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` in `backend/.env` and are for local development only. The demo
   user has sample expenses and budgets; a new sign-up starts empty.

## Deployment

| Part     | Host                                              | Notes                                   |
| -------- | ------------------------------------------------- | --------------------------------------- |
| Frontend | Vercel                                            | Static Vite build                       |
| API      | Render (free web service)                         | Node and Express                        |
| Database | Neon (free PostgreSQL)                            | Use the direct (non-pooled) connection string |

**Database (Neon).** Create a project, copy the direct connection string, then from
`backend/` run the migrations and seed against it (see the [backend README](./backend/README.md)):

```bash
DATABASE_URL='<neon-url>' npx prisma migrate deploy
DATABASE_URL='<neon-url>' ADMIN_EMAIL=... ADMIN_PASSWORD=... DEMO_EMAIL=... DEMO_PASSWORD=... npm run db:seed
```

**API (Render).** A web service from this repository with these settings:

| Setting           | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| Root directory    | `backend`                                                                |
| Build command     | `npm ci --include=dev && npm run build && npx prisma migrate deploy`     |
| Start command     | `npm start`                                                              |
| Health check path | `/api/health`                                                            |
| Environment       | `DATABASE_URL`, `JWT_SECRET` (a new random value), `FRONTEND_ORIGIN` (the frontend URL, no trailing slash) |

Migrations run on every deploy as part of the build. Point an uptime monitor at
`/api/health` (it never touches the database) if you want to keep the service awake.

**Frontend (Vercel).** A project from this repository with root directory `frontend`
and the environment variable `VITE_API_BASE_URL` set to the API address ending in
`/api`. `frontend/vercel.json` makes page refreshes on routes like `/expenses` work.
