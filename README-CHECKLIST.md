# Bài Học Quan Trọng Khi Làm Việc Với Code

## 🚨 Kiểm Tra Syntax Trước Khi Commit

### Luôn làm những việc này:
1. **Chạy `npm run lint`** trước khi commit để kiểm tra syntax errors
2. **Chạy `npm run build`** để đảm bảo file build thành công
3. **Kiểm tra JSX syntax** đặc biệt:
   - Mọi thẻ JSX đều phải có opening và closing tag đúng
   - Kiểm tra các thẻ tự đóng (self-closing tags) có đủ `/>`
   - Đảm bảo không có ký tự lạ hoặc encoding issues

### Các lỗi thường gặp:
- **Missing `<` ở đầu thẻ**: `<Button` thay vì `Button`
- **Unmatched tags**: Đếm số lượng `<` và `>` phải khớp nhau
- **Self-closing tags**: `<input>` → `<input />`
- **Comment trong JSX**: `{/* comment */}` thay vì `// comment`

## 🔍 Kiểm Tra Environment

### Luôn test trên:
- ✅ Local environment
- ✅ Real build command (`npm run build`)
- ✅ CI/CD environment (nếu có)

### Các lệnh kiểm tra quan trọng:
```bash
# Kiểm tra syntax
npm run lint

# Build toàn bộ project
npm run build

# Kiểm tra TypeScript errors
npx tsc --noEmit
```

## 📝 Checklist Trước Commit

- [ ] Chạy `npm run lint` - không lỗi
- [ ] Chạy `npm run build` - build thành công
- [ ] Kiểm tra các thẻ JSX trong file đã sửa
- [ ] Đếm số lượng mở/đóng tag khớp nhau
- [ ] Test functionality trên local

## 🚨 Trường Hợp Cần Đặc Biệt Cẩn Thận

1. **Khi sửa JSX**: Kiểm tra kỹ từng thẻ, nhất là các thẻ lồng nhau
2. **Khi xóa code**: Đảm bảo không bỏ sót thẻ đóng hoặc comment
3. **Khi copy-paste**: Kiểm tra lại toàn bộ syntax, không chỉ logic

## 💡 Công Cụ Hỗ Trợ

- **VSCode extensions**: ESLint, Prettier
- **Terminal**: npm scripts, grep cho việc tìm lỗi
- **Build pipeline**: CI/CD để phát hiện lỗi sớm

## 📌 Bài Học Từ Thực Tế

### Case Study: JSX Syntax Error (ProjectWorkspacePage.tsx)
**Vấn đề**: Lỗi `Parsing error: Unexpected token. Did you mean `{'>'}` or `&gt;`?`
**Nguyên nhân**: Thẻ `<Button>` thiếu ký tự `<` ở đầu
**Khắc phục**: Thêm `<` vào đúng vị trí
**Hậu quả**: Gây fail CI/CD, cần commit lại

**Điều học được**: 
- "Better safe than sorry" - Kiểm tra kỹ hơn là phải sửa sau khi đã commit
- Luôn verify syntax trên cả local và production environment

---

*Ghi chú: Luôn nhớ - "Check twice, commit once!"*