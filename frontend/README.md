# Retain frontend

The Retain frontend is a React and TypeScript application built with Vite. It will provide authenticated expense management, monthly budget tracking, user summaries, Redux-powered expense filtering, and protected admin screens.

## Getting started

```bash
npm install
npm run dev
```

The API base URL can be configured with `VITE_API_BASE_URL`. See `.env.example` for the local default.


## Connecting to the API

The app talks to the Express API in `../backend` through typed service functions in
`src/services` (one shared Axios client in `apiClient.ts`). Components never call
Axios directly.

1. Start the backend (`cd backend && npm run dev`, default `http://localhost:3000`).
2. Copy `.env.example` to `.env` if the API runs somewhere else and set
   `VITE_API_BASE_URL`.
3. Run `npm run dev` here and open `http://localhost:5173`.

Sign up creates a normal user. The administrator is created by the backend seed
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`).

The login token is kept in `localStorage`. On a 401 from any request the session
ends and the user is sent to sign in. Failed requests surface as an `ApiError` with a
message ready to show; an unreachable server has `status` 0.
