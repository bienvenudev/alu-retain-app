# Retain frontend

The Retain frontend is a React and TypeScript application built with Vite. It will provide authenticated expense management, monthly budget tracking, user summaries, Redux-powered expense filtering, and protected admin screens.

## Getting started

```bash
npm install
npm run dev
```

The API base URL can be configured with `VITE_API_BASE_URL`. See `.env.example` for the local default.


## Mock data (temporary)

Until the Express API is connected, `src/services` reads and writes a seeded
in-browser database (`src/mock/seed.json`, persisted in `localStorage`).
Components only talk to the services, so swapping in the API only changes the
service bodies.

Demo accounts:

| Role  | Email              | Password   |
| ----- | ------------------ | ---------- |
| User  | `demo@retain.app`  | `demo1234`  |
| Admin | `admin@retain.app` | `admin1234` |

To see error states, run `localStorage.setItem('retain.mock.fail', '1')` in the
browser console (remove the key to restore). To reset the mock data, delete the
`retain.mock.db.v3` key.
