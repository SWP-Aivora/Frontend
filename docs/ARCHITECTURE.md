# Architecture — Aivora Frontend

> Feature-Sliced Design (FSD) overview, routing, API layer, state management, auth, và realtime.
> Chuẩn kỹ thuật chi tiết (TypeScript rules, styling, validation) xem [`../GEMINI.md`](../GEMINI.md) — file này chỉ mô tả kiến trúc chạy thực tế.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 (SPA, không dùng Next.js) |
| Build tool | Vite 5 (`vite.config.ts`) |
| Ngôn ngữ | TypeScript 5 |
| Routing | `react-router-dom` v6 (`createBrowserRouter`) |
| Server state | `@tanstack/react-query` v5 |
| Client state | `zustand` v4 (với `persist` middleware) |
| HTTP client | `axios` |
| Forms | `react-hook-form` + `@hookform/resolvers` |
| Validation | `zod` |
| Styling | Tailwind v4 (`@theme` trong CSS, không có config file) |
| UI primitives | Radix UI (kiểu shadcn/ui) |
| Realtime | `@microsoft/signalr` |

---

## Feature-Sliced Design (FSD)

Entry point: `src/main.tsx` → `src/app/App.tsx`.

```
src/
├── app/          # App layer: routing, providers, global store, global styles
├── lib/          # Core config layer: axios, env, react-query client, api-utils
├── features/     # Feature modules, cô lập theo domain (auth, jobs, chat, wallet, ...)
├── shared/       # Shared layer: UI components, services, hooks, types, constants
└── test/         # Test setup + test mirror theo feature structure
```

**Quy tắc layer:** `app` → `lib` → `shared` → `features`. Mỗi feature trong `src/features/` cô lập, theo convention:
```
features/{feature}/
├── components/
├── hooks/
├── pages/
├── schema.ts     # zod schema (nếu có form)
├── services.ts   # API calls của feature
├── store.ts      # Zustand store riêng (nếu cần)
├── types.ts
└── index.ts
```

Danh sách features hiện có: `auth`, `admin`, `chat`, `dashboard`, `disputes`, `jobs`, `notifications`, `profiles`, `projects`, `proposals`, `reviews`, `settings`, `wallet`.

---

## Routing

**File:** `src/app/router.tsx`

`createBrowserRouter` với route group theo role: `/client`, `/expert`, `/admin`, mỗi group bọc trong `<ProtectedRoute allowedRoles={[Role.X]}>` + layout riêng (`ClientLayout`/`ExpertLayout`/`AdminLayout`).

- Public routes: `/`, `/login`, `/register`
- `*` → redirect `/`
- `/unauthorized` → khi bị từ chối quyền

**Route guards** (`src/shared/components/common/`):
- `ProtectedRoute.tsx` — chờ hydrate xong (hiện spinner), redirect chưa đăng nhập → `/login`, sai role → `/unauthorized`
- `GuestRoute.tsx` — redirect user đã đăng nhập về trang chủ theo role

---

## API Layer

**Axios instance:** `src/lib/axios.ts`
- `baseURL: env.API_URL`, `withCredentials: true`
- **Request interceptor:** gắn `Authorization: Bearer <accessToken>` từ `useAuthStore` nếu chưa có
- **Response interceptor:** khi gặp 401 (trừ request login/refresh/logout) → thực hiện single-flight refresh token qua `POST auth/refresh-token` (refresh token nằm trong HttpOnly cookie), queue các request đang chờ (`failedQueue`), retry lại request gốc. Nếu refresh fail → gọi `logout()` và redirect `/login`.

**Generic CRUD:** `src/shared/services/BaseService.ts` — `getAll/getById/create/update/delete`. Feature services extend class này (vd `ChatService extends BaseService`).

**Chuẩn hóa response:** `src/lib/api-utils.ts` — `normalizePaginatedResponse` / `normalizeBaseResponse` xử lý nhiều dạng envelope backend trả về (`{data:{items}}`, `{data:[]}`, raw array) và khác biệt camelCase/PascalCase. Kiểu chuẩn ở `src/shared/types/api.ts` (`BaseResponse<T>`, `PaginatedResponse<T>`).

**Endpoint registry:** `src/shared/constants/index.ts` — toàn bộ `API_ENDPOINTS`, cùng `QUERY_KEYS` và `REFETCH_INTERVALS`.

---

## State Management

**Server state — React Query:** `src/lib/queryClient.ts` — `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 5 phút`. Mỗi feature có hook riêng wrap query/mutation (vd `useNotifications`, `useConversations`, `useMessages`).

**Client state — Zustand:**
- Global store `src/app/store.ts` — chỉ chứa theme, sync localStorage + lắng nghe cross-tab qua `storage` event
- Auth store `src/features/auth/store.ts` — persisted (`name: aivora-auth-store`), persist `user`/`isAuthenticated`/`accessToken` qua `partialize`; `isHydrated` set trong `onRehydrateStorage`

---

## Auth

- Access token vừa lưu trong memory vừa persist qua Zustand; refresh token nằm trong HttpOnly cookie (backend quản lý)
- `src/features/auth/services.ts` — `login`, `register`, `getMe`, `logout`; validate chặt response backend, map role sang `Role` enum
- `logout()` reset state + đóng kết nối SignalR

---

## Realtime (SignalR)

**File:** `src/features/chat/services.ts` — `ChatService` quản lý pool kết nối SignalR hub (LongPolling transport, `accessTokenFactory`, tự reconnect, tự join lại group khi reconnect).

**Events lắng nghe:** `ReceiveMessage`, `UserTyping`, `ReadConfirmation`, `JobStatusUpdated`, `NewJobPublished`.

**Hook global:** `src/shared/hooks/useGlobalRealtimeSync.ts` — gọi 1 lần trong `DashboardLayout`; duy trì kết nối khi đã đăng nhập và invalidate React Query cache khi có event job/project.

> Backend hub docs (methods, event payload chi tiết) là nguồn sự thật — xem `docs/ARCHITECTURE.md` bên repo `Aivora-Backend`.
