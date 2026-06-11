# Project: AIVORA - AI Marketplace

## Core Mandates

### 1. Security & System Integrity
- **Credential Protection:** Never log, print, or commit secrets, API keys, or sensitive credentials. Rigorously protect `.env` files.
- **AI Tooling Privacy:** Never stage or commit AI assistant metadata, session files, or local memory (e.g., `.gemini/`, `MEMORY.md`, or AI-generated specs/plans unless explicitly requested).
- **Source Control:** Do not stage or commit changes unless specifically requested by the user.

### 2. Context Efficiency
- Be strategic in tool usage. Combine parallel searching and reading where possible.
- Limit output volume to capture only necessary information.

## Engineering Standards

### 1. Architecture (Feature-Sliced Design - FSD)
Features are strictly isolated in `src/features/`. Each feature follow this structure:
```
src/features/<feature-name>/
├── components/       # UI Components specific to the feature
├── hooks/            # Feature-specific hooks (mutations/queries)
├── pages/            # Feature-specific pages
├── schema.ts         # Zod schemas for validation
├── services.ts       # API call definitions
├── store.ts          # State management (Zustand)
├── types.ts          # Feature-specific type definitions
└── index.ts          # Feature public API (optional)
```
- **Shared Layer:** Global components, hooks, services, and types are located in `src/shared/`.
- **App Layer:** Routing, providers, and global styles are in `src/app/`.
- **Lib Layer:** Core configurations (Axios, QueryClient, utils) are in `src/lib/`.

### 2. Routing
- Use role-based routing: `/client`, `/expert`, `/admin`.
- Wrap protected routes in `src/shared/components/common/ProtectedRoute.tsx`.
- Use `GuestRoute.tsx` for auth pages.

### 3. Styling (Tailwind v4)
- We use **Tailwind v4** with `@theme` configurations.
- **DO NOT** use legacy `tailwind.config.js`.
- Use brand tokens defined in `src/app/styles/index.css` and `src/shared/styles/tokens.css`.
- Components should prefer `class-variance-authority` (CVA) for variants.

### 4. TypeScript Strictness
- Strict compliance with `verbatimModuleSyntax`: Always use `import type` for type imports.
- Use `erasableSyntaxOnly`: Avoid standard `enum`, use `const X = {...} as const` instead.

### 5. Data Validation & API
- Use `Zod` combined with `react-hook-form`.
- **API Compliance:** ALWAYS check the backend schema (`Aivoraapi v1.json`) before implementing models or forms. Do NOT invent fields.
- API endpoints and query keys should be managed in `src/shared/constants/index.ts`.

## Implementation Flow

1. **Step 1:** Define global constants and types (`shared/constants`, `shared/types`).
2. **Step 2:** Configure core libraries (`lib/axios.ts`, `lib/queryClient.ts`).
3. **Step 4:** Set up `app/router.tsx` and `app/App.tsx`.
4. **Step 5:** Implement `features/auth` as the core feature.
5. **Step 6:** Implement business features (`profiles`, `jobs`, `proposals`, `projects`, `payments`, etc.).

## Figma Design Reference
- **File Key:** `fUL4M8KjswreWQHqJVh2Jg`
- **Link:** [Figma Design](https://www.figma.com/design/fUL4M8KjswreWQHqJVh2Jg/SWP391?node-id=1-2)
- Focus on rich aesthetics, consistent spacing, and modern UI as seen in the prototype.
