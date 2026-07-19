# Aivora Frontend — Documentation Index

> Tài liệu kỹ thuật cho `Aivora-Frontend`. Bắt đầu ở đây để tìm đúng file.
> `../README.md` (root) là giới thiệu nhanh dự án; các file trong `docs/` này là tài liệu kỹ thuật chi tiết.

| Tôi muốn... | Đọc |
|---|---|
| Hiểu tổng quan kiến trúc, layer (FSD), routing, state, API layer, auth, realtime | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Biết cần set biến môi trường nào | [`ENV.md`](ENV.md) |
| Setup máy dev, chạy test, quy tắc code style, PR checklist | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Chuẩn kỹ thuật chi tiết: FSD folder layout, TypeScript rules, Tailwind v4, validation, security | [`../GEMINI.md`](../GEMINI.md) |
| Tra cứu API contract (OpenAPI) | [`../Aivoraapi%20%20v1.json`](../Aivoraapi%20%20v1.json) |
| Hiểu 4 luồng nghiệp vụ chính (business flow) | Xem `docs/flows/` trong repo `Aivora-Backend` — đó là nguồn sự thật, repo này không nhân bản lại (2 repo git độc lập nên không đặt hyperlink trực tiếp) |

---

## Cấu trúc thư mục `docs/`

```
docs/
├── README.md          ← file này
├── ARCHITECTURE.md    ← kiến trúc FE (FSD, routing, API layer, state, auth, realtime)
├── ENV.md             ← biến môi trường
├── CONTRIBUTING.md    ← dev setup, test, code style, PR checklist
└── agents/            ← config cho Claude Code skills (issue tracker, triage labels, domain docs)
```

Các file khác ở root project (`../README.md`, `../README-CHECKLIST.md`, `../GEMINI.md`, `../Aivoraapi%20%20v1.json`) là context cho agent/dev, không lặp lại nội dung ở đây.

---

## Nguyên tắc giữ docs không drift

1. Mọi thay đổi route/API layer/store **phải** cập nhật `ARCHITECTURE.md` trong cùng PR.
2. `../GEMINI.md` là nguồn sự thật cho chuẩn kỹ thuật (FSD, TypeScript, styling, validation) — các doc khác tham chiếu tới đây, không định nghĩa lại.
3. Không tạo file doc mới ở `docs/` mà không link từ bảng trên — file mồ côi sẽ bị bỏ sót lần rà soát sau.
