# 🔍 DEBUG INSTRUCTIONS

## Bước 1: Test Debug Endpoint

Mở **Browser Console** hoặc **Postman/Insomnia** và gọi:

```
GET https://zbp4dvqfqbcmtljqxcxt.supabase.co/functions/v1/make-server-e2861589/admin/debug-db
```

### Expected Response (Nếu thành công):
```json
{
  "success": true,
  "summary": {
    "accounts": { "count": 4, "error": null },
    "users": { "count": 4, "error": null },
    "students": { "count": 0, "error": null },
    "teachers": { "count": 0, "error": null },
    "roles": { "count": 4, "error": null },
    "account_roles": { "count": 4, "error": null }
  },
  "sample_data": {
    "accounts": { "id_account": 1, "user_name": "academic", ... },
    "users": { "id_user": 1, "id_account": 1, ... },
    ...
  }
}
```

### Nếu có lỗi:
Sẽ trả về error message cụ thể cho từng table.

---

## Bước 2: Kiểm tra Console Log

Xem **Supabase Function Logs** (hoặc browser console) để thấy:
```
🔍 [DEBUG] Starting database inspection...
🔍 [DEBUG] Accounts: { count: 4, error: null }
🔍 [DEBUG] Users: { count: 4, error: null }
🔍 [DEBUG] Students: { count: 0, error: null }
🔍 [DEBUG] Teachers: { count: 0, error: null }
🔍 [DEBUG] Roles: { count: 4, error: null }
🔍 [DEBUG] Account Roles: { count: 4, error: null }
```

---

## Bước 3: Nếu có error "RLS" hoặc "permission denied"

Vào **Supabase Dashboard** → **Authentication** → **Policies** và tạm thời **DISABLE RLS** cho các tables:
- accounts
- users
- students
- teachers
- roles
- account_roles

Hoặc tạo policy cho phép SERVICE_ROLE_KEY access:
```sql
-- For all tables
CREATE POLICY "Service role can do everything" ON accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## Bước 4: Nếu tables không tồn tại

Chạy SQL trong **Supabase SQL Editor**:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accounts', 'users', 'students', 'teachers', 'roles', 'account_roles')
ORDER BY table_name;
```

Kết quả phải trả về 6 rows.

---

## ✅ NEXT STEPS

Sau khi debug endpoint hoạt động, gửi cho tôi:
1. Response JSON từ `/admin/debug-db`
2. Console logs (nếu có)
3. Thông báo lỗi cụ thể (nếu có)

Tôi sẽ điều chỉnh code dựa trên kết quả thực tế!
