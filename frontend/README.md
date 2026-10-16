# Retain frontend

The Retain frontend is a React and TypeScript application built with Vite and styled
with Tailwind CSS. It talks to the Express API in `../backend`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build for production
```

The API must be running (default `http://localhost:3000`). To point at a different
API, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

Sign up creates a normal user. The administrator is created by the backend seed
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`).

## How it is organized

| Folder            | Contents                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `src/pages`       | One component per screen (dashboard, budget, expenses, admin)         |
| `src/components`  | Reusable pieces; `ui/` holds the shared Tailwind building blocks      |
| `src/hooks`       | Data and behavior hooks (`useAsyncData`, `useExpenses`, `useDebouncedValue`, ...) |
| `src/services`    | Typed API functions; the only code that calls Axios                   |
| `src/auth`        | Authentication context, protected routes, and the sign-in/up form     |
| `src/store`       | Redux Toolkit store and the expense filter slice                      |
| `src/month`       | Context holding the month shared by the dashboard and budget pages    |
| `src/types`       | Domain and API types shared across the app                            |

State is split deliberately:

- **React Context** - the signed-in user and session (`AuthContext`) and the selected
  month (`SelectedMonthContext`).
- **Redux Toolkit** - expense search, filters, sort order, and page. A memoized
  selector turns them into the query sent to `GET /api/expenses`.
- **Local state** - everything owned by a single component, such as form fields and
  open dialogs.

## API access and sessions

Components never call Axios directly. They use the functions in `src/services`, which
share one client (`apiClient.ts`) that adds the login token to every request. The token
is kept in `localStorage`; the user is loaded from the server on every page load, so a
changed role or deleted account takes effect immediately.

A 401 from any request ends the session and sends the user to sign in. Failed requests
surface as an `ApiError` with a message ready to show; an unreachable server has
`status` 0.
