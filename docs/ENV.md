# Environment Variables Reference

> **Source of truth:** `.env.example`, `src/lib/env.ts` (validate fail-fast).
> Vite chỉ expose biến bắt đầu bằng `VITE_` ra client qua `import.meta.env`.

---

## Biến ứng dụng

| Variable | Bắt buộc | Mô tả |
|---|---|---|
| `VITE_API_URL` | ✅ (production) | Base URL của Backend API. Validate ở `src/lib/env.ts`, throw lỗi nếu thiếu khi build production; dev fallback `http://localhost:5176/api/v1`. Dùng ở `src/lib/axios.ts` (baseURL) và `src/features/chat/services.ts` (SignalR hub URL). |

## Biến Vite built-in

| Variable | Mô tả |
|---|---|
| `import.meta.env.MODE` | Expose qua `env.NODE_ENV` trong `src/lib/env.ts` |
| `import.meta.env.DEV` | Bật cảnh báo/behavior chỉ chạy ở dev — dùng ở `src/lib/env.ts`, `src/features/admin/services.ts` |

---

## File env hiện có

- **`.env`** — `VITE_API_URL=http://localhost:8080/api/v1`
- **`.env.example`** — `VITE_API_URL=http://localhost:5176/api/v1` (kèm comment `VITE_APP_NAME`, `VITE_DEBUG_MODE` — chưa dùng thật)

> **Lưu ý:** `.env` và `.env.example` đang lệch port (8080 vs 5176). Khi setup máy mới, kiểm tra Backend đang chạy port nào rồi chỉnh `.env` cho khớp.

---

## Setup local

```bash
cp .env.example .env
# sửa VITE_API_URL cho khớp Backend đang chạy
```

## Deploy (Vercel)

Set `VITE_API_URL` trong Vercel dashboard (Project Settings → Environment Variables) trỏ về Backend production/staging URL. `vercel.json` chỉ config SPA rewrite, không chứa env.

---

## CI secret (không phải app runtime)

`GEMINI_AI_KEY` — dùng cho GitHub Actions workflow review PR bằng Gemini (`.github/workflows/gemini-review*.yml`), không liên quan đến app chạy thực tế.
