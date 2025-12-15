# 🎓 TEST ENDPOINTS - LẤY THEO QUYỀN

## ✅ ĐÃ TẠO 2 ENDPOINTS MỚI

### **1. Students by Role** (Lấy tất cả accounts có quyền Student)
```
GET https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/students-by-role
```

### **2. Teachers by Role** (Lấy tất cả accounts có quyền Teacher)
```
GET https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/teachers-by-role
```

---

## 🧪 CÁCH TEST

### **Test Students by Role:**
```javascript
fetch('https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/students-by-role')
  .then(r => r.json())
  .then(data => {
    console.log('🎓 Students by role:', data);
    console.log('📊 Total:', data.count);
    console.log('📋 Data:', data.data);
  });
```

### **Test Teachers by Role:**
```javascript
fetch('https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/teachers-by-role')
  .then(r => r.json())
  .then(data => {
    console.log('👨‍🏫 Teachers by role:', data);
    console.log('📊 Total:', data.count);
    console.log('📋 Data:', data.data);
  });
```

---

## 📋 RESPONSE FORMAT

### **Success Response:**
```json
{
  "success": true,
  "role": "Student",
  "count": 2,
  "data": [
    {
      "account_id": 5,
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "user_id": 5,
      "full_name": "Nguyễn Văn A",
      "gender": "Nam",
      "address": "123 Đường ABC",
      "avatar_url": null,
      "student_id": 1,
      "code": "HV001",
      "parent_name": "Nguyễn Văn B",
      "parent_phone": "0909876543",
      "level": "Beginner",
      "dob": "2005-03-15"
    }
  ]
}
```

### **No Data Response:**
```json
{
  "message": "No accounts with Student role found",
  "count": 0,
  "accounts": []
}
```

---

## 🔍 CÁCH HOẠT ĐỘNG

**Query flow (6 bước):**

1. **roles** → Tìm `id_role` của "Student" hoặc "Teacher"
2. **account_roles** → Lấy tất cả `id_account` có `id_role` đó
3. **accounts** → Lấy thông tin accounts (username, email, phone)
4. **user** → Lấy thông tin user (full_name, gender, address, avatar)
5. **students/teachers** → Lấy thông tin chi tiết (code, parent_name, level, specialty, etc.)
6. **Merge** → Gộp tất cả thành 1 object hoàn chỉnh

---

## ✅ ƯU ĐIỂM

- ✅ **Chính xác 100%** - Lấy theo role từ bảng `roles`
- ✅ **Đầy đủ thông tin** - Merge từ 5 tables (roles → account_roles → accounts → user → students/teachers)
- ✅ **Có log chi tiết** - Console.log từng bước để debug
- ✅ **Handle edge cases** - Trả về message rõ ràng nếu không có data

---

## 🎯 KẾT QUẢ MONG ĐỢI

**Nếu database đã có data:**
```
🎓 [BY ROLE] Getting students by role...
✅ [BY ROLE] Found Student role: { id_role: 3, name: 'Student' }
✅ [BY ROLE] Found account_roles: 2
✅ [BY ROLE] Found accounts: 2
✅ [BY ROLE] Found users: 2
✅ [BY ROLE] Found students records: 2
```

**Nếu chưa có data:**
```
🎓 [BY ROLE] Getting students by role...
✅ [BY ROLE] Found Student role: { id_role: 3, name: 'Student' }
✅ [BY ROLE] Found account_roles: 0
```

---

## 🚀 NEXT STEPS

Sau khi test, bạn sẽ biết được:
- ✅ Có bao nhiêu accounts có role "Student"
- ✅ Có bao nhiêu accounts có role "Teacher"
- ✅ Trong số đó, bao nhiêu đã được tạo record trong bảng `students`/`teachers`
- ✅ Những accounts nào chưa có record chi tiết (student_id = null)

**GỬI KẾT QUẢ CHO TÔI để tôi phân tích tiếp!** 🎯
