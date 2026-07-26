# Environment Variables Reference

> **Source of truth:** `.env.example`, `src/lib/env.ts` (validate fail-fast).
> Vite only exposes variables starting with `VITE_` to the client through `import.meta.env`.

---

## App Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes (production) | Backend API base URL. Validated in `src/lib/env.ts`; throws an error when missing in production builds. Dev fallback is `http://localhost:5176/api/v1`. Used in `src/lib/axios.ts` (baseURL) and `src/features/chat/services.ts` (SignalR hub URL). |

## Built-In Vite Variables

| Variable | Description |
|---|---|
| `import.meta.env.MODE` | Exposed through `env.NODE_ENV` in `src/lib/env.ts` |
| `import.meta.env.DEV` | Enables warnings/behavior that run only in dev; used in `src/lib/env.ts`, `src/features/admin/services.ts` |

---

## Existing Env Files

- **`.env`** — `VITE_API_URL=http://localhost:8080/api/v1`
- **`.env.example`** — `VITE_API_URL=http://localhost:5176/api/v1` (includes comments for `VITE_APP_NAME`, `VITE_DEBUG_MODE`; not actually used yet)

> **Note:** `.env` and `.env.example` currently use different ports (8080 vs 5176). When setting up a new machine, check which port the Backend is running on and adjust `.env` to match.

---

## Setup local

```bash
cp .env.example .env
# edit VITE_API_URL to match the running Backend
```

## Deploy (Vercel)

Set `VITE_API_URL` in the Vercel dashboard (Project Settings → Environment Variables) to point to the Backend production/staging URL. `vercel.json` only configures the SPA rewrite and does not contain env variables.

---

## CI Secret (Not App Runtime)

`GEMINI_AI_KEY` — used by GitHub Actions workflows that review PRs with Gemini (`.github/workflows/gemini-review*.yml`); unrelated to the app runtime.
