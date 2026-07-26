# Contributing to Aivora Frontend

> Development setup, scripts, testing, code style, PR checklist.
> For detailed engineering standards (FSD folder layout, TypeScript rules, Tailwind v4, validation, security), see [`../GEMINI.md`](../GEMINI.md). This file does not repeat them.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 or 22 | There is no `.nvmrc`/`engines` in `package.json`; versions are inferred from the CI matrix (`.github/workflows/frontend-ci.yml`) |
| npm | bundled with Node | Use `package-lock.json`; do not use yarn/pnpm |

---

## Development Setup

```bash
git clone <repo-url>
cd Aivora-Frontend
npm install
cp .env.example .env   # adjust VITE_API_URL to match Backend; see ENV.md
npm run dev            # http://localhost:5173, opens browser automatically
```

## Production Build

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + build production (`dist/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Preview the build |
| `npm run test` | Run Vitest |

---

## Testing

### Unit / Component — Vitest
- **Framework:** Vitest + Testing Library (`@testing-library/react`, `jest-dom`, `user-event`), jsdom environment
- **Setup:** `src/test/setup.ts` (import `@testing-library/jest-dom`)
- Test files live next to code and mirror the feature structure (`*.test.ts(x)`)

```bash
npm run test
```

### E2E — Playwright
- Tests live in `e2e/` (for example, `e2e/auth.spec.ts`)
- Config `playwright.config.ts`: baseURL `http://localhost:5173`, automatically starts the dev server, runs on 5 projects (Chromium/Firefox/WebKit/Mobile Chrome/Mobile Safari)

```bash
npx playwright test
```

---

## Lint & Type Check

```bash
npm run lint        # ESLint
npm run typecheck    # tsc --noEmit
```

There is no Prettier config file. Prettier is recommended only as an editor extension and is not enforced by CI.

---

## Code Style

See the full version in [`../GEMINI.md`](../GEMINI.md). Quick summary:

- **FSD strict:** feature isolation in `src/features/`; no cross-feature imports
- **TypeScript:** always use `import type` for type-only imports; **do not use `enum`** — use `const X = {...} as const` (see `src/shared/types/enums.ts`)
- **Styling:** Tailwind v4 (`@theme` in CSS, no config file); prefer CVA (`class-variance-authority`) for variants
- **Validation:** `zod` schema + `react-hook-form`

---

## CI

**File:** `.github/workflows/frontend-ci.yml` — runs on push/PR to `main`, matrix Node 20 & 22: `npm ci` → `npm run lint` → `npm run build` → upload `dist` artifact.

---

## Notes Before Commit (from `README-CHECKLIST.md`)

There was a case where a JSX syntax error slipped through local dev but failed CI (`ProjectWorkspacePage.tsx`). Before committing:

1. `npm run lint`
2. `npm run build` (catches type + JSX errors that the dev server may miss)
3. Carefully check JSX: missing `<`, unclosed or incorrectly self-closed tags, invalid JSX comment syntax
4. Test again on a real local build, not only the dev server, before pushing

---

## PR Checklist

### Code quality
- [ ] `npm run lint` pass
- [ ] `npm run build` passes (type-check + valid JSX)
- [ ] `npm run test` pass
- [ ] No leftover `TODO` in new code
- [ ] No hardcoded secrets/API keys

### Architecture
- [ ] New feature follows the FSD layout (`components/hooks/pages/services.ts/types.ts`)
- [ ] No cross-feature imports
- [ ] API calls go through `BaseService`/axios instance; no custom fetch wrappers
- [ ] New routes are wrapped with `ProtectedRoute`/`GuestRoute` when needed

### Git
- [ ] Branch is up to date with `main`
- [ ] No merge conflicts remain
- [ ] Commit message follows conventional format: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
