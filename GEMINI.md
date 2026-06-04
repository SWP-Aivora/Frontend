# AIVORA Frontend - Architecture & Rules

This file serves as the core memory and instruction set for the Gemini CLI agent working on the AIVORA project.

## 🏗️ Architecture (Feature-Sliced Design)
- **Structure:** Features are strictly isolated in `src/features/`.
- **Naming:** Within a feature, strictly use `services.ts`, `schema.ts`, `types.ts`, and `components/`. Do not create deep nested subfolders like `api/` or `store/` unless specifically required.
- **Routing:** Use role-based routing (`/client`, `/expert`, `/admin`) wrapped in `<ProtectedRoute>`.

## 🎨 Styling & UI
- **Tailwind:** We are using **Tailwind v4** with `@theme` configurations. Do not use legacy v3 configurations (`tailwind.config.js`).
- **Brand Tokens:** Rely on the tokens defined in `src/app/styles/index.css` (e.g., `text-primary`, `bg-brand-accent`).
- **Components:** Reuse components from `src/shared/components/ui/` (Button, Input).

## 🔧 Technical Rules
- **TypeScript:** Strict compliance with `verbatimModuleSyntax` (must use `import type`) and `erasableSyntaxOnly` (no standard `enum`, use `const X = {...} as const`).
- **Data Validation:** Use `Zod` combined with `react-hook-form`.
- **API Compliance:** 
  - ALWAYS check the backend schema (`Aivoraapi v1.json`) before implementing models or forms. 
  - Do NOT invent fields (e.g., location, timezone) if they are not in the API documentation.
- **Linting:** Code must pass `eslint .` without errors before committing.
- **Building:** Code must pass `tsc -b && vite build` before committing.

## 📝 Workflows
- **Committing:** Always verify build and lint before pushing. If there are merge conflicts, use `git fetch` and `git merge` or `git rebase` carefully, preserving our "Premium" feature code over older main branch placeholders.
