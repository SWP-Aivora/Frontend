# AIVORA Project

Nền tảng frontend được xây dựng với React, TypeScript, Vite và TanStack Query theo kiến trúc Feature-Sliced Design (FSD).

## 📌 Tổng quan

- UI: React + TypeScript
- Bundler: Vite
- State, query: Zustand + React Query
- Router: React Router v6
- Kiến trúc theo feature-based: `src/features/*`
- Thành phần chung: `src/shared/*`

## ⚙️ Cài đặt và chạy

```bash
npm install
npm run dev
```

Xây dựng production:

```bash
npm run build
npm run preview
```

Chạy kiểm tra linter:

```bash
npm run lint
```
