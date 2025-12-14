# ⚡ Quick Start - Database English Complex

## 🎯 TL;DR (Quá dài không đọc)

✅ **Database đã sẵn sàng!** Hệ thống đã kết nối Supabase.

---

## 🚀 3 Bước Sử Dụng

### 1️⃣ Mở App
```
Figma Make đã tự động chạy
→ Chờ 5 giây khởi tạo database
```

### 2️⃣ Đăng Nhập
```
Username: huongvtt
Password: 123456
```

### 3️⃣ Sử Dụng
```
✅ Thêm/sửa/xóa dữ liệu → Tự động lưu vào database
✅ Refresh → Dữ liệu không mất
✅ Logout/Login → Dữ liệu vẫn còn
```

---

## 📝 Tài khoản Demo

| Username | Password | Vai trò |
|----------|----------|---------|
| `huongvtt` | `123456` | Admin |
| `duccv` | `123456` | Giám đốc |
| `lanntm` | `123456` | Giáo viên |
| `huyenntk` | `123456` | Học viên |

---

## 💻 Code nhanh

### Lấy dữ liệu
```javascript
import { studentAPI } from '../utils/api';

const { students } = await studentAPI.getAll();
```

### Thêm mới
```javascript
await studentAPI.create({ id, username, fullName, ... });
```

### Cập nhật
```javascript
await studentAPI.update(id, { phone: '0987654321' });
```

### Xóa
```javascript
await studentAPI.delete(id);
```

---

## 📁 Files quan trọng

```
/utils/api.ts              → Tất cả API functions
/utils/initDatabase.ts     → Auto-init database
/supabase/functions/server/index.tsx  → Backend server
```

---

## 🌐 Deploy lên WordPress

```bash
1. npm run build
2. Upload build/ → /public_html/english-complex/
   (hoặc dist/ nếu dùng Vite)
3. Truy cập: yoursite.com/english-complex
4. Done! ✅
```

---

## 📖 Docs đầy đủ

- **Chi tiết:** `/DATABASE_GUIDE.md` (API đầy đủ, examples)
- **Test:** `/TEST_DATABASE.md` (Test scenarios, debug)
- **Overview:** `/README_DATABASE.md` (Tổng quan, roadmap)

---

## 🔄 Reset Database

```javascript
localStorage.removeItem('english_complex_db_initialized');
location.reload();
```

---

## ✨ Highlights

✅ **Không cần MySQL** - Supabase on cloud
✅ **Không cần PHP** - API sẵn sàng  
✅ **Auto-init** - Dữ liệu có sẵn
✅ **Persistent** - Không mất data
✅ **Multi-user** - Nhiều người dùng cùng lúc

---

**🎉 That's it! Bắt đầu sử dụng ngay thôi!**