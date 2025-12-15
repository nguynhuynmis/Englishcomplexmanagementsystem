# 🔥 DANH SÁCH LỖI SCHEMA CẦN FIX NGAY

## ❌ CÁC LỖI PHÁT HIỆN:

### **1. Table Name Sai (12 chỗ)**
```typescript
// ❌ SAI
.from('user')

// ✅ ĐÚNG
.from('users')
```

### **2. Foreign Key Column Name Sai (Students)**
```typescript
// ❌ SAI - Trong code hiện tại
students.user

// ✅ ĐÚNG - Theo schema thực tế
students.id_user
```

**Ảnh hưởng:** Tất cả queries liên quan đến students table

### **3. Foreign Key Column Name Sai (Teachers)**
```typescript
// ❌ SAI - Trong code hiện tại
teachers.user

// ✅ ĐÚNG - Theo schema thực tế
teachers.id_user
```

**Ảnh hưởng:** Tất cả queries liên quan đến teachers table

### **4. Column `code` KHÔNG TỒN TẠI**

**Theo schema bạn cung cấp:**
- ❌ `students` table: KHÔNG CÓ column `code`
- ❌ `teachers` table: KHÔNG CÓ column `code`

**Nhưng trong code hiện tại có:**
- `generateStudentCode()` function
- `generateTeacherCode()` function
- Login endpoint query `students.code` và `teachers.code`
- POST students/teachers insert `code` value

---

## 🎯 GIẢI PHÁP:

### **Option A: Thêm column `code` vào database**

Chạy SQL trong Supabase SQL Editor:

```sql
-- Thêm column code vào students
ALTER TABLE students 
ADD COLUMN code VARCHAR(20) UNIQUE;

-- Thêm column code vào teachers
ALTER TABLE teachers 
ADD COLUMN code VARCHAR(20) UNIQUE;

-- Tạo index để search nhanh hơn
CREATE INDEX idx_students_code ON students(code);
CREATE INDEX idx_teachers_code ON teachers(code);
```

### **Option B: Loại bỏ logic `code` khỏi server**

Xóa/comment các function và logic:
- `generateStudentCode()`
- `generateTeacherCode()`
- Tất cả queries select/insert `code`
- Return `code: null` trong responses

---

## 📋 DANH SÁCH TẤT CẢ CHỖ CẦN SỬA:

### **A. Table name `'user'` → `'users'` (12 chỗ):**

1. Line ~339: GET students - Query users
2. Line ~435: POST students - Insert user
3. Line ~507: PUT students - Update user
4. Line ~553: DELETE students - Delete user
5. Line ~595: GET teachers - Query users
6. Line ~690: POST teachers - Insert user
7. Line ~763: PUT teachers - Update user
8. Line ~810: DELETE teachers - Delete user
9. Line ~1065: Debug endpoint - Query users
10. Line ~1203: Students by role - Query users
11. Line ~1320: Teachers by role - Query users
12. Line ~1408: Reset data - Delete users

### **B. FK column `user` → `id_user` (Tất cả references):**

**Students queries:**
- `.select('user, user!inner(id_account)')` → `.select('id_user, users!id_user(id_account)')`
- `.eq('user', user?.id_user)` → `.eq('id_user', user?.id_user)`
- `.in('user', userIds)` → `.in('id_user', userIds)`
- `students.map(s => s.user)` → `students.map(s => s.id_user)`
- `user: user.id_user` → `id_user: user.id_user`

**Teachers queries:**
- Same pattern as above

### **C. Column `code` (Nếu chọn Option B - Loại bỏ):**

1. Xóa `generateStudentCode()` function (line ~34-48)
2. Xóa `generateTeacherCode()` function (line ~51-65)
3. Login endpoint: 
   - Xóa logic query `students.code` và `teachers.code`
   - Return `code: null`
4. POST students: Xóa logic generate và insert `code`
5. POST teachers: Xóa logic generate và insert `code`
6. GET students: Không return `code` field
7. GET teachers: Không return `code` field

---

## ✅ KHUYẾN NGHỊ:

**TÔI KHUYÊN BẠN CHỌN OPTION A** - Thêm column `code` vào database vì:
- ✅ Frontend đã sử dụng `code` field
- ✅ Logic tự động generate code (HV001, GV001...) rất hữu ích
- ✅ Ít thay đổi code hơn
- ✅ Không break existing functionality

**SAU KHI BẠN QUYẾT ĐỊNH, TÔI SẼ:**
1. Generate lại toàn bộ `/supabase/functions/server/index.tsx` với schema chính xác
2. Tạo file SQL script để update database (nếu chọn Option A)
3. Update tất cả endpoints để match schema

---

## 🚨 HÃY CHO TÔI BIẾT:

**Bạn muốn chọn Option nào?**
- ✅ **Option A**: Thêm column `code` vào database (KHUYÊN DÙNG)
- ⚠️ **Option B**: Loại bỏ logic `code` khỏi code

**Sau khi bạn trả lời, tôi sẽ generate code ngay!** 🚀
