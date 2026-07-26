# AIVORA Frontend

AIVORA is a React, TypeScript, Vite, and TanStack Query frontend built with a feature-based architecture.

## Overview

- UI: React + TypeScript
- Bundler: Vite
- State and data fetching: Zustand + TanStack Query
- Router: React Router v6
- Feature-based source layout: `src/features/*`
- Shared UI, hooks, and services: `src/shared/*`

## Install and Run

```bash
npm install
npm run dev
```

Build and preview production output:

```bash
npm run build
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Pre-Commit Checklist

Always verify changes before committing to avoid syntax errors and CI/CD failures:

1. Run lint: `npm run lint`
2. Build the project: `npm run build`
3. Check JSX syntax: make sure tags are opened, closed, and self-closed correctly
4. Test the changed functionality locally

See [README-CHECKLIST.md](README-CHECKLIST.md) for more detail.

## Important Notes

- "Check twice, commit once."
- Make sure the app builds locally and in production-like environments.
- Keep lessons from real failures documented so they are not repeated.
