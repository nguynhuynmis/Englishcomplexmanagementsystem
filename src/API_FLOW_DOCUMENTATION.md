# 📘 ENGLISH COMPLEX - API FLOW DOCUMENTATION

## 🗄️ DATABASE SCHEMA OVERVIEW

### **Bảng quan hệ:**
```
accounts (id_account, user_name, password_hash, email, phone)
    ↓
account_roles (id_account, id_role) 
    ↓
roles (id_role, name)

accounts (id_account)
    ↓
users (id_user, id_account, full_name, gender, address, avatar_url)
    ↓
students (id_student, user, code, parent_name, parent_phone, level, dob)
teachers (id_teacher, user, code, bio, specialty, experience_years, certifications)
```

---

## 🔐 1. LOGIN FLOW

### **Endpoint:** `POST /make-server-e2861589/auth/login`

### **Steps:**
1. **Query accounts table:**
   ```sql
   SELECT * FROM accounts 
   WHERE user_name = 'academic' AND password_hash = '123456'
   ```

2. **Update last_login:**
   ```sql
   UPDATE accounts SET last_login = NOW() WHERE id_account = ?
   ```

3. **Get role from account_roles → roles:**
   ```sql
   SELECT account_roles.id_role, roles.name 
   FROM account_roles 
   JOIN roles ON account_roles.id_role = roles.id_role
   WHERE account_roles.id_account = ?
   ```

4. **Get user info:**
   ```sql
   SELECT * FROM users WHERE id_account = ?
   ```

5. **Get student/teacher code (if applicable):**
   ```sql
   -- For students:
   SELECT code FROM students WHERE user = ?
   
   -- For teachers:
   SELECT code FROM teachers WHERE user = ?
   ```

### **Response:**
```json
{
  "user": {
    "id": 1,
    "username": "academic",
    "fullName": "Academic Manager",
    "role": "academic",
    "email": "academic@englishcomplex.com",
    "phone": "0909123456",
    "avatar": null,
    "code": null
  }
}
```

---

## 👨‍🎓 2. GET STUDENTS FLOW

### **Endpoint:** `GET /make-server-e2861589/students`

### **Current Query (Complex):**
```javascript
.from('students')
.select(`
  id_student,
  code,
  parent_name,
  parent_phone,
  level,
  dob,
  created_at,
  user (
    id_user,
    full_name,
    gender,
    address,
    avatar_url,
    accounts!id_account (
      email,
      phone
    )
  )
`)
```

### **Equivalent SQL:**
```sql
SELECT 
  s.id_student,
  s.code,
  s.parent_name,
  s.parent_phone,
  s.level,
  s.dob,
  s.created_at,
  u.id_user,
  u.full_name,
  u.gender,
  u.address,
  u.avatar_url,
  a.email,
  a.phone
FROM students s
LEFT JOIN users u ON s.user = u.id_user
LEFT JOIN accounts a ON u.id_account = a.id_account
ORDER BY s.created_at DESC
```

### **Response Format:**
```json
[
  {
    "id": 1,
    "code": "HV001",
    "name": "Nguyen Van A",
    "email": "nguyenvana@gmail.com",
    "phone": "0901234567",
    "dob": "2005-03-15",
    "gender": "Nam",
    "address": "123 Nguyen Trai, Q1, TPHCM",
    "parentName": "Nguyen Van B",
    "parentPhone": "0909876543",
    "level": "Beginner",
    "currentClass": "",
    "status": "active",
    "avatar": null
  }
]
```

---

## 👨‍🏫 3. GET TEACHERS FLOW

### **Endpoint:** `GET /make-server-e2861589/teachers`

### **Current Query (Complex):**
```javascript
.from('teachers')
.select(`
  id_teacher,
  code,
  bio,
  specialty,
  experience_years,
  certifications,
  created_at,
  user (
    id_user,
    full_name,
    gender,
    address,
    avatar_url,
    accounts!id_account (
      email,
      phone
    )
  )
`)
```

### **Equivalent SQL:**
```sql
SELECT 
  t.id_teacher,
  t.code,
  t.bio,
  t.specialty,
  t.experience_years,
  t.certifications,
  t.created_at,
  u.id_user,
  u.full_name,
  u.gender,
  u.address,
  u.avatar_url,
  a.email,
  a.phone
FROM teachers t
LEFT JOIN users u ON t.user = u.id_user
LEFT JOIN accounts a ON u.id_account = a.id_account
ORDER BY t.created_at DESC
```

---

## ➕ 4. POST STUDENT FLOW

### **Endpoint:** `POST /make-server-e2861589/students`

### **Steps:**
1. **Create account:**
   ```sql
   INSERT INTO accounts (user_name, email, phone, password_hash, status)
   VALUES ('nguyenvana', 'nguyenvana@gmail.com', '0901234567', '123456', 'active')
   RETURNING id_account
   ```

2. **Get Student role ID:**
   ```sql
   SELECT id_role FROM roles WHERE name = 'Student'
   ```

3. **Create account_roles:**
   ```sql
   INSERT INTO account_roles (id_account, id_role)
   VALUES (?, ?)
   ```

4. **Create user:**
   ```sql
   INSERT INTO users (id_account, full_name, gender, address, avatar_url)
   VALUES (?, 'Nguyen Van A', 'Nam', '123 Nguyen Trai', NULL)
   RETURNING id_user
   ```

5. **Generate student code:**
   ```sql
   SELECT code FROM students ORDER BY code DESC LIMIT 1
   -- Then increment: HV001 → HV002
   ```

6. **Create student:**
   ```sql
   INSERT INTO students (user, code, parent_name, parent_phone, level, dob)
   VALUES (?, 'HV002', 'Nguyen Van B', '0909876543', 'Beginner', '2005-03-15')
   RETURNING id_student
   ```

---

## ✏️ 5. PUT STUDENT FLOW

### **Endpoint:** `PUT /make-server-e2861589/students/:id`

### **Steps:**
1. **Get student with user and account info:**
   ```sql
   SELECT s.user, u.id_account
   FROM students s
   JOIN users u ON s.user = u.id_user
   WHERE s.id_student = ?
   ```

2. **Update account:**
   ```sql
   UPDATE accounts 
   SET email = ?, phone = ?
   WHERE id_account = ?
   ```

3. **Update user:**
   ```sql
   UPDATE users 
   SET full_name = ?, gender = ?, address = ?, avatar_url = ?
   WHERE id_user = ?
   ```

4. **Update student:**
   ```sql
   UPDATE students 
   SET parent_name = ?, parent_phone = ?, level = ?, dob = ?
   WHERE id_student = ?
   ```

---

## 🗑️ 6. DELETE STUDENT FLOW

### **Endpoint:** `DELETE /make-server-e2861589/students/:id`

### **Steps:**
1. **Get student with user and account:**
   ```sql
   SELECT s.user, u.id_account
   FROM students s
   JOIN users u ON s.user = u.id_user
   WHERE s.id_student = ?
   ```

2. **Delete student:**
   ```sql
   DELETE FROM students WHERE id_student = ?
   ```

3. **Delete user:**
   ```sql
   DELETE FROM users WHERE id_user = ?
   ```

4. **Delete account:**
   ```sql
   DELETE FROM accounts WHERE id_account = ?
   ```

---

## ⚠️ COMMON ERRORS

### **1. PGRST200 - Foreign Key Not Found**
**Cause:** Wrong FK column name in embedding syntax

**Example:**
```javascript
// ❌ WRONG
accounts!account (...)  // 'account' is not a column

// ✅ CORRECT
accounts!id_account (...)  // 'id_account' is the FK column in users table
```

### **2. Error 500 - Invalid Query**
**Possible causes:**
- Missing table/column in database
- Wrong column name in SELECT
- Circular reference in embedding
- Permission issue (RLS)

---

## 🔍 DEBUG CHECKLIST

### **Khi gặp lỗi 500, kiểm tra:**

1. **Console log từ server:**
   ```
   ❌ [Server] Get students error: { code, message, details }
   ```

2. **Kiểm tra table tồn tại:**
   ```sql
   SELECT * FROM students LIMIT 1
   SELECT * FROM users LIMIT 1
   SELECT * FROM accounts LIMIT 1
   ```

3. **Kiểm tra FK relationship:**
   ```sql
   -- Check if FK exists
   SELECT 
     tc.table_name, 
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
   AND tc.table_name = 'users';
   ```

4. **Test query directly in Supabase SQL Editor:**
   ```sql
   SELECT 
     s.*,
     u.full_name,
     a.email
   FROM students s
   LEFT JOIN users u ON s.user = u.id_user
   LEFT JOIN accounts a ON u.id_account = a.id_account
   LIMIT 10;
   ```

---

## 📊 TEST DATA STRUCTURE

### **Sample Account:**
```json
{
  "id_account": 1,
  "user_name": "academic",
  "password_hash": "123456",
  "email": "academic@englishcomplex.com",
  "phone": "0909123456",
  "status": "active",
  "last_login": "2025-12-14T10:30:00Z"
}
```

### **Sample User:**
```json
{
  "id_user": 1,
  "id_account": 1,
  "full_name": "Academic Manager",
  "gender": "Nam",
  "address": "123 Nguyen Trai, Q1, TPHCM",
  "avatar_url": null
}
```

### **Sample Account Role:**
```json
{
  "id_account_role": 1,
  "id_account": 1,
  "id_role": 1
}
```

### **Sample Role:**
```json
{
  "id_role": 1,
  "name": "Academic",
  "description": "Academic Manager"
}
```

### **Sample Student:**
```json
{
  "id_student": 1,
  "user": 2,
  "code": "HV001",
  "parent_name": "Nguyen Van B",
  "parent_phone": "0909876543",
  "level": "Beginner",
  "dob": "2005-03-15",
  "created_at": "2025-12-14T10:00:00Z"
}
```

---

## 🎯 SIMPLIFIED QUERY APPROACH

**Nếu embedding phức tạp gây lỗi, có thể tách thành multiple queries:**

```javascript
// Step 1: Get students only
const { data: students } = await supabase
  .from('students')
  .select('*');

// Step 2: Get users
const userIds = students.map(s => s.user);
const { data: users } = await supabase
  .from('users')
  .select('*')
  .in('id_user', userIds);

// Step 3: Get accounts
const accountIds = users.map(u => u.id_account);
const { data: accounts } = await supabase
  .from('accounts')
  .select('*')
  .in('id_account', accountIds);

// Step 4: Merge data manually
const result = students.map(s => {
  const user = users.find(u => u.id_user === s.user);
  const account = accounts.find(a => a.id_account === user?.id_account);
  
  return {
    id: s.id_student,
    code: s.code,
    name: user?.full_name,
    email: account?.email,
    phone: account?.phone,
    // ... etc
  };
});
```

---

**Document này mô tả toàn bộ luồng API hiện tại. Nếu vẫn lỗi, hãy gửi cho tôi error log chi tiết!**
