# Retain

Retain is a personal expense and monthly budget manager. Users record their
expenses, set a budget for each month, and see how their spending compares. An
administrator manages expense categories and sees platform-wide insights.

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
