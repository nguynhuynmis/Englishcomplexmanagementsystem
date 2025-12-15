# 🔧 CRITICAL FIX: TABLE NAME LÀ `users` (SỐ NHIỀU), KHÔNG PHẢI `user` (SỐ ÍT)!

## ❌ VẤN ĐỀ:

Trong `/supabase/functions/server/index.tsx`, hiện đang có **MIX** giữa `'user'` và `'users'`:
- ✅ Đã fix: Login & change-password → `'users'`  
- ❌ Chưa fix: Còn **12 chỗ** vẫn dùng `'user'`

##  ✅ GIẢI PHÁP - FIND & REPLACE TỒI BỘ:

Mở `/supabase/functions/server/index.tsx` và tìm kiếm:

```
.from('user')
```

Thay thế tất cả thành:

```
.from('users')
```

---

## 📋 DANH SÁCH 12 CHỖ CẦN SỬA:

1. **Line 339** - GET students - Step 2:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

2. **Line 435** - POST students - Create user:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

3. **Line 507** - PUT students - Update user:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

4. **Line 553** - DELETE students - Delete user:
   ```typescript
   .from('user').delete()  // ❌ SAI
   .from('users').delete() // ✅ ĐÚNG
   ```

5. **Line 595** - GET teachers - Step 2:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

6. **Line 690** - POST teachers - Create user:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

7. **Line 763** - PUT teachers - Update user:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

8. **Line 810** - DELETE teachers - Delete user:
   ```typescript
   .from('user').delete()  // ❌ SAI
   .from('users').delete() // ✅ ĐÚNG
   ```

9. **Line 1065** - Debug endpoint:
   ```typescript
   .from('user')  // ❌ SAI
   .from('users') // ✅ ĐÚNG
   ```

10. **Line 1203** - Students by role - Step 4:
    ```typescript
    .from('user')  // ❌ SAI
    .from('users') // ✅ ĐÚNG
    ```

11. **Line 1320** - Teachers by role - Step 4:
    ```typescript
    .from('user')  // ❌ SAI
    .from('users') // ✅ ĐÚNG
    ```

12. **Line 1408** - Reset data:
    ```typescript
    .from('user').delete()  // ❌ SAI
    .from('users').delete() // ✅ ĐÚNG
    ```

---

## 🎯 CÁCH FIX NHANH NHẤT:

### **Option 1: VSCode (hoặc editor khác)**

1. Mở `/supabase/functions/server/index.tsx`
2. Nhấn `Ctrl+H` (hoặc `Cmd+H` trên Mac)
3. Find: `.from('user')`
4. Replace: `.from('users')`
5. Click "Replace All" (hoặc `Ctrl+Alt+Enter`)
6. **LƯU FILE!**

### **Option 2: Command line (sed)**

```bash
sed -i "s/\.from('user')/\.from('users')/g" /supabase/functions/server/index.tsx
```

---

## ✅ SAU KHI FIX, KIỂM TRA:

1. Tìm kiếm `.from('user')` trong file → Không còn kết quả nào
2. Tìm kiếm `.from('users')` trong file → Phải có **14 kết quả** (2 đã fix + 12 mới fix)
3. Refresh app và test login
4. Test GET students/teachers endpoints

---

## 📊 TÓM TẮT:

| **Status** | **Count** | **Description** |
|---|---|---|
| ✅ Fixed | 2 | Login & change-password |
| ❌ Need Fix | 12 | Students, Teachers, Debug, By-role, Reset endpoints |
| **Total** | **14** | **Tất cả phải là `.from('users')`** |

---

**HÃY FIX NGAY VÀ GỬI KẾT QUẢ!** 🚀
