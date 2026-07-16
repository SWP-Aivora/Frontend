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

## 📋 Checklist Trước Commit

Luôn kiểm tra kỹ trước khi commit để tránh lỗi syntax và CI/CD fails:

1. **Chạy linter**: `npm run lint` - không lỗi
2. **Build project**: `npm run build` - build thành công  
3. **Check JSX syntax**: Đảm bảo mọi thẻ đều có opening/closing tag
4. **Test functionality**: Chạy thử trên local environment

Xem chi tiết: [README-CHECKLIST.md](README-CHECKLIST.md)

## ⚠️ Lưu Ý Quan Trọng

- "Check twice, commit once!" - Luôn verify syntax trước khi commit
- "Better safe than sorry" - Đảm bảo build thành công trên cả local và production
- Ghi nhớ bài học từ các lỗi thực tế để tránh lặp lại
