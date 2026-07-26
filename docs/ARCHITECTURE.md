# Architecture — Aivora Frontend

> Feature-Sliced Design (FSD) overview, routing, API layer, state management, auth, and realtime.
> For detailed engineering standards (TypeScript rules, styling, validation), see [`../GEMINI.md`](../GEMINI.md). This file only describes the current runtime architecture.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 (SPA, no Next.js) |
| Build tool | Vite 5 (`vite.config.ts`) |
| Language | TypeScript 5 |
| Routing | `react-router-dom` v6 (`createBrowserRouter`) |
| Server state | `@tanstack/react-query` v5 |
| Client state | `zustand` v4 (with `persist` middleware) |
| HTTP client | `axios` |
| Forms | `react-hook-form` + `@hookform/resolvers` |
| Validation | `zod` |
| Styling | Tailwind v4 (`@theme` in CSS, no config file) |
| UI primitives | Radix UI (shadcn/ui style) |
| Realtime | `@microsoft/signalr` |

---

## Feature-Sliced Design (FSD)

Entry point: `src/main.tsx` → `src/app/App.tsx`.

```
src/
├── app/          # App layer: routing, providers, global store, global styles
├── lib/          # Core config layer: axios, env, react-query client, api-utils
├── features/     # Feature modules, isolated by domain (auth, jobs, chat, wallet, ...)
├── shared/       # Shared layer: UI components, services, hooks, types, constants
└── test/         # Test setup + tests mirroring the feature structure
```

**Layer rules:** `app` → `lib` → `shared` → `features`. Each feature in `src/features/` is isolated and follows this convention:
```
features/{feature}/
├── components/
├── hooks/
├── pages/
├── schema.ts     # zod schema (when a form exists)
├── services.ts   # Feature API calls
├── store.ts      # Feature-specific Zustand store (when needed)
├── types.ts
└── index.ts
```

Current feature list: `auth`, `admin`, `chat`, `dashboard`, `disputes`, `jobs`, `notifications`, `profiles`, `projects`, `proposals`, `reviews`, `settings`, `wallet`.

---

## Routing

**File:** `src/app/router.tsx`

`createBrowserRouter` uses role-based route groups: `/client`, `/expert`, `/admin`. Each group is wrapped in `<ProtectedRoute allowedRoles={[Role.X]}>` plus its own layout (`ClientLayout`/`ExpertLayout`/`AdminLayout`).

- Public routes: `/`, `/login`, `/register`
- `*` → redirect `/`
- `/unauthorized` → when access is denied

**Route guards** (`src/shared/components/common/`):
- `ProtectedRoute.tsx` — waits for hydration (shows spinner), redirects unauthenticated users to `/login`, redirects wrong-role users to `/unauthorized`
- `GuestRoute.tsx` — redirects authenticated users to the role-specific home page

---

## API Layer

**Axios instance:** `src/lib/axios.ts`
- `baseURL: env.API_URL`, `withCredentials: true`
- **Request interceptor:** attaches `Authorization: Bearer <accessToken>` from `useAuthStore` when the header is missing
- **Response interceptor:** on 401 (except login/refresh/logout requests), performs a single-flight token refresh via `POST auth/refresh-token` (refresh token is in an HttpOnly cookie), queues waiting requests (`failedQueue`), and retries the original request. If refresh fails, calls `logout()` and redirects to `/login`.

**Generic CRUD:** `src/shared/services/BaseService.ts` — `getAll/getById/create/update/delete`. Feature services extend this class (for example, `ChatService extends BaseService`).

**Response normalization:** `src/lib/api-utils.ts` — `normalizePaginatedResponse` / `normalizeBaseResponse` handle multiple backend envelope shapes (`{data:{items}}`, `{data:[]}`, raw array) and camelCase/PascalCase differences. Standard types live in `src/shared/types/api.ts` (`BaseResponse<T>`, `PaginatedResponse<T>`).

**Endpoint registry:** `src/shared/constants/index.ts` — all `API_ENDPOINTS`, plus `QUERY_KEYS` and `REFETCH_INTERVALS`.

---

## State Management

**Server state — React Query:** `src/lib/queryClient.ts` — `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 5 minutes`. Each feature has its own hooks wrapping queries/mutations (for example, `useNotifications`, `useConversations`, `useMessages`).

**Client state — Zustand:**
- Global store `src/app/store.ts` — only stores theme, syncs localStorage, and listens cross-tab through the `storage` event
- Auth store `src/features/auth/store.ts` — persisted (`name: aivora-auth-store`), persists `user`/`isAuthenticated`/`accessToken` via `partialize`; `isHydrated` is set in `onRehydrateStorage`

---

## Auth

- Access token is stored in memory and persisted through Zustand; refresh token is stored in an HttpOnly cookie managed by the backend
- `src/features/auth/services.ts` — `login`, `register`, `getMe`, `logout`; strictly validates backend responses and maps roles to the `Role` enum
- `logout()` resets state and closes the SignalR connection

---

## Realtime (SignalR)

**File:** `src/features/chat/services.ts` — `ChatService` manages the SignalR hub connection pool (LongPolling transport, `accessTokenFactory`, automatic reconnect, and group rejoin after reconnect).

**Subscribed events:** `ReceiveMessage`, `UserTyping`, `ReadConfirmation`, `JobStatusUpdated`, `NewJobPublished`.

**Global hook:** `src/shared/hooks/useGlobalRealtimeSync.ts` — called once in `DashboardLayout`; keeps the connection active while authenticated and invalidates React Query cache when job/project events arrive.

> Backend hub docs (methods and detailed event payloads) are the source of truth. See `docs/ARCHITECTURE.md` in the `Aivora-Backend` repo.
