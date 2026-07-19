# Contributing to Aivora Frontend

> Development setup, scripts, testing, code style, PR checklist.
> Chuẩn kỹ thuật chi tiết (FSD folder layout, TypeScript rules, Tailwind v4, validation, security) xem [`../GEMINI.md`](../GEMINI.md) — file này không lặp lại.

---

## Prerequisites

| Tool | Version | Ghi chú |
|---|---|---|
| Node.js | 20 hoặc 22 | Không có `.nvmrc`/`engines` trong `package.json` — version suy ra từ CI matrix (`.github/workflows/frontend-ci.yml`) |
| npm | bundled với Node | Dùng `package-lock.json`, không dùng yarn/pnpm |

---

## Development Setup

```bash
git clone <repo-url>
cd Aivora-Frontend
npm install
cp .env.example .env   # chỉnh VITE_API_URL cho khớp Backend — xem ENV.md
npm run dev            # http://localhost:5173, tự mở browser
```

## Production Build

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview
```

---

## Available Scripts

| Command | Mô tả |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + build production (`dist/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Preview bản build |
| `npm run test` | Chạy Vitest |

---

## Testing

### Unit / Component — Vitest
- **Framework:** Vitest + Testing Library (`@testing-library/react`, `jest-dom`, `user-event`), môi trường jsdom
- **Setup:** `src/test/setup.ts` (import `@testing-library/jest-dom`)
- Test file nằm cạnh code, mirror theo feature structure (`*.test.ts(x)`)

```bash
npm run test
```

### E2E — Playwright
- Test ở `e2e/` (vd `e2e/auth.spec.ts`)
- Config `playwright.config.ts`: baseURL `http://localhost:5173`, tự động start dev server, chạy trên 5 project (Chromium/Firefox/WebKit/Mobile Chrome/Mobile Safari)

```bash
npx playwright test
```

---

## Lint & Type Check

```bash
npm run lint        # ESLint
npm run typecheck    # tsc --noEmit
```

Không có Prettier config file — Prettier chỉ được khuyến nghị làm editor extension, không enforce qua CI.

---

## Code Style

Xem đầy đủ tại [`../GEMINI.md`](../GEMINI.md). Tóm tắt nhanh:

- **FSD strict:** feature isolation trong `src/features/`, không import chéo giữa các feature
- **TypeScript:** luôn dùng `import type` cho type-only import; **không dùng `enum`** — dùng `const X = {...} as const` (xem `src/shared/types/enums.ts`)
- **Styling:** Tailwind v4 (`@theme` trong CSS, không có config file); ưu tiên CVA (`class-variance-authority`) cho variant
- **Validation:** `zod` schema + `react-hook-form`

---

## CI

**File:** `.github/workflows/frontend-ci.yml` — chạy trên push/PR vào `main`, matrix Node 20 & 22: `npm ci` → `npm run lint` → `npm run build` → upload `dist` artifact.

---

## Lưu ý trước khi commit (từ `README-CHECKLIST.md`)

Từng có case JSX syntax error lọt qua local dev nhưng làm CI fail (`ProjectWorkspacePage.tsx`). Trước khi commit:

1. `npm run lint`
2. `npm run build` (bắt lỗi type + JSX mà dev server có thể bỏ qua)
3. Kiểm tra kỹ JSX: tag thiếu `<`, tag không đóng/không tự đóng đúng, comment JSX sai cú pháp
4. Test lại trên local build thật (không chỉ dev server) trước khi push

---

## PR Checklist

### Code quality
- [ ] `npm run lint` pass
- [ ] `npm run build` pass (type-check + JSX hợp lệ)
- [ ] `npm run test` pass
- [ ] Không có `TODO` sót trong code mới
- [ ] Không hardcode secret/API key

### Architecture
- [ ] Feature mới tuân theo FSD layout (`components/hooks/pages/services.ts/types.ts`)
- [ ] Không import chéo giữa các feature
- [ ] API call qua `BaseService`/axios instance, không tạo fetch riêng
- [ ] Route mới bọc đúng `ProtectedRoute`/`GuestRoute` nếu cần

### Git
- [ ] Branch up-to-date với `main`
- [ ] Không còn merge conflict
- [ ] Commit message theo conventional format: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
