# 🚨 KHẮC PHỤC NGAY - ADMIN KHÔNG HIỂN THỊ DANH SÁCH

## ✅ BƯỚC 1: CHẠY SQL (BẮT BUỘC!)

**Mở Supabase Dashboard → SQL Editor → Chạy query này:**

```sql
-- Add missing 'code' column to students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- Add missing 'code' column to teachers  
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_code ON students(code);
CREATE INDEX IF NOT EXISTS idx_teachers_code ON teachers(code);
```

**✅ CHẠY XONG → Tiếp tục Bước 2**

---

## 🔧 BƯỚC 2: FIX CODE - CÁC LỖI CÒN LẠI

### **❌ VẤN ĐỀ HIỆN TẠI:**

Trong file `/supabase/functions/server/index.tsx`, còn **NHIỀU LỖI SCHEMA**:

| **Lỗi** | **Sai** | **Đúng** | **Số lượng** |
|---|---|---|---|
| Table name | `'user'` | `'users'` | 11 chỗ |
| FK students | `students.user` | `students.id_user` | ~6 chỗ |
| FK teachers | `teachers.user` | `teachers.id_user` | ~6 chỗ |
| Query | `.eq('user', ...)` | `.eq('id_user', ...)` | ~4 chỗ |
| Query | `.in('user', ...)` | `.in('id_user', ...)` | ~2 chỗ |
| Map | `s.user` | `s.id_user` | ~2 chỗ |

---

### **📋 DANH SÁCH 11 CHỖ CẦN SỬA `.from('user')` → `.from('users')`:**

1. **Line ~435** - POST students - Insert user
2. **Line ~507** - PUT students - Update user
3. **Line ~553** - DELETE students - Delete user
4. **Line ~595** - GET teachers - Query users (Step 2)
5. **Line ~690** - POST teachers - Insert user
6. **Line ~763** - PUT teachers - Update user
7. **Line ~810** - DELETE teachers - Delete user
8. **Line ~1065** - Debug endpoint
9. **Line ~1203** - Students by role (Step 4)
10. **Line ~1320** - Teachers by role (Step 4)
11. **Line ~1408** - Reset data

---

### **📋 DANH SÁCH CHỖ CẦN SỬA `students.user` → `students.id_user`:**

1. **Line ~337** - GET students - Map:
   ```typescript
   // ❌ SAI
   const userIds = students.map(s => s.user).filter(Boolean);
   
   // ✅ ĐÚNG  
   const userIds = students.map(s => s.id_user).filter(Boolean);
   ```

2. **Line ~366** - GET students - Find:
   ```typescript
   // ❌ SAI
   const user = users?.find(u => u.id_user === s.user);
   
   // ✅ ĐÚNG
   const user = users?.find(u => u.id_user === s.id_user);
   ```

3. **Line ~138** - Login - Query student code:
   ```typescript
   // ❌ SAI
   .eq('user', user?.id_user)
   
   // ✅ ĐÚNG
   .eq('id_user', user?.id_user)
   ```

4. **Line ~455** - POST students - Insert:
   ```typescript
   // ❌ SAI
   user: user.id_user,
   
   // ✅ ĐÚNG
   id_user: user.id_user,
   ```

5. **Line ~486** - PUT students - Select:
   ```typescript
   // ❌ SAI
   .select('user, user!inner(id_account)')
   
   // ✅ ĐÚNG
   .select('id_user, users!id_user(id_account)')
   ```

6. **Line ~514** - PUT students - Update:
   ```typescript
   // ❌ SAI
   .eq('id_user', student.user)
   
   // ✅ ĐÚNG
   .eq('id_user', student.id_user)
   ```

7. **Line ~541** - DELETE students - Select:
   ```typescript
   // ❌ SAI
   .select('user, user!inner(id_account)')
   
   // ✅ ĐÚNG
   .select('id_user, users!id_user(id_account)')
   ```

8. **Line ~553** - DELETE students - Delete user:
   ```typescript
   // ❌ SAI
   .delete().eq('id_user', student.user)
   
   // ✅ ĐÚNG
   .delete().eq('id_user', student.id_user)
   ```

9. **Line ~1227** - Students by role - Query:
   ```typescript
   // ❌ SAI
   .in('user', userIds)
   
   // ✅ ĐÚNG
   .in('id_user', userIds)
   ```

10. **Line ~1238** - Students by role - Find:
    ```typescript
    // ❌ SAI
    const student = students?.find(s => s.user === user?.id_user);
    
    // ✅ ĐÚNG
    const student = students?.find(s => s.id_user === user?.id_user);
    ```

---

### **📋 DANH SÁCH CHỖ CẦN SỬA `teachers.user` → `teachers.id_user`:**

*(Tương tự như students, thay đổi tất cả references từ `user` → `id_user` trong teachers endpoints)*

---

## 🎯 CÁCH FIX NHANH NHẤT:

### **Option 1: Dùng VSCode Find & Replace (KHUYÊN DÙNG)**

1. Download file `/supabase/functions/server/index.tsx`
2. Mở bằng VSCode
3. Thực hiện 4 lần Find & Replace:

   **Replace 1:**
   - Find: `.from('user')`
   - Replace: `.from('users')`
   - Click "Replace All"

   **Replace 2:**
   - Find: `students.map(s => s.user)`
   - Replace: `students.map(s => s.id_user)`
   - Click "Replace All"

   **Replace 3:**
   - Find: `teachers.map(t => t.user)`
   - Replace: `teachers.map(t => t.id_user)`
   - Click "Replace All"

   **Replace 4:**
   - Find: `.eq('user',`
   - Replace: `.eq('id_user',`
   - Click "Replace All"

   **Replace 5:**
   - Find: `.in('user',`
   - Replace: `.in('id_user',`
   - Click "Replace All"

   **Replace 6:**
   - Find: `user: user.id_user`
   - Replace: `id_user: user.id_user`
   - Click "Replace All"

   **Replace 7:**
   - Find: `s.user`
   - Replace: `s.id_user`
   - Manual check (có thể có false positives)

   **Replace 8:**
   - Find: `t.user`
   - Replace: `t.id_user`
   - Manual check (có thể có false positives)

4. Save file
5. Upload lại vào Figma Make

---

## 🧪 BƯỚC 3: TEST

Sau khi fix xong, test ngay:

```javascript
// Test debug endpoint
fetch('https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/debug-db')
  .then(r => r.json())
  .then(console.log);

// Test students list
fetch('https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/students')
  .then(r => r.json())
  .then(console.log);

// Test teachers list
fetch('https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/teachers')
  .then(r => r.json())
  .then(console.log);
```

**KẾT QUẢ MONG ĐỢI:**
- ✅ Status 200 (không phải 204)
- ✅ Có data array (có thể empty nếu chưa insert data)
- ✅ Không có error message

---

## ⚡ NẾU VẪN KHÔNG FIX ĐƯỢC:

**PASTE TOÀN BỘ FILE `/supabase/functions/server/index.tsx` CHO TÔI**

Tôi sẽ generate lại file hoàn chỉnh với schema chính xác 100%!

---

**BẮT ĐẦU NGAY TỪ BƯỚC 1 - CHẠY SQL!** 🚀
