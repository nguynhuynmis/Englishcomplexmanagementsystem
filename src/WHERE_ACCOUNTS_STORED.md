# 📍 TÀI KHOẢN ĐƯỢC LƯU Ở ĐÂU?

## 🎯 **CÂU TRẢ LỜI NHANH:**

Tài khoản được lưu ở **2 NƠI**:

```
┌─────────────────────────────────────────────────┐
│  1. SERVER (Persistent Storage)                 │
│     Supabase KV Store                           │
│     Key: "users"                                │
│     Location: Postgres table kv_store_e2861589  │
│     ✅ Permanent storage (không mất khi reload) │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  2. CLIENT (Session Storage)                    │
│     Browser localStorage                        │
│     Key: "currentUser"                          │
│     Location: Browser storage                   │
│     ⚠️ Temporary (chỉ lưu user đang login)      │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ **1. SERVER STORAGE (DATABASE) - LƯU TẤT CẢ TÀI KHOẢN**

### **Nơi lưu trữ:**

```
Supabase Postgres Database
  └─ Table: kv_store_e2861589
       └─ Row: key = "users"
            └─ value = [
                 { id, username, password, fullName, role, ... },
                 { id, username, password, fullName, role, ... },
                 ...
               ]
```

### **Cấu trúc dữ liệu:**

```typescript
// Key: "users"
// Value: Array of User objects
[
  {
    id: "user-001",
    username: "huongvtt",
    password: "123456",
    fullName: "Vũ Thị Thu Hương",
    role: "academic",
    email: "huongvtt@englishcomplex.edu.vn",
    phone: "0901234567",
    avatar: "https://...",
    code: "EC-ACAD-001"
  },
  {
    id: "user-002",
    username: "duccv",
    password: "123456",
    fullName: "Cao Văn Đức",
    role: "director",
    email: "duccv@englishcomplex.edu.vn",
    phone: "0912345678",
    avatar: "https://..."
  },
  {
    id: "teacher-001",
    username: "lanntm",
    password: "123456",
    fullName: "Nguyễn Thị Minh Lan",
    role: "teacher",
    email: "lanntm@englishcomplex.edu.vn",
    phone: "0923456789",
    avatar: "https://...",
    code: "EC-TEACH-001"
  },
  {
    id: "student-001",
    username: "huyenntk",
    password: "123456",
    fullName: "Nguyễn Thị Kim Huyền",
    role: "student",
    email: "huyenntk@gmail.com",
    phone: "0934567890",
    avatar: "https://...",
    code: "EC-STU-001",
    dateOfBirth: "2005-03-15",
    gender: "female",
    address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    parentName: "Nguyễn Văn A",
    parentPhone: "0945678901"
  }
  // ... 54 users khác (total 58 users)
]
```

### **API để truy cập:**

```typescript
// File: /supabase/functions/server/index.tsx

// 1. ĐỌC tất cả users
const users = await kv.get("users") || [];
// Returns: Array of all users

// 2. GHI/CẬP NHẬT users
await kv.set("users", users);
// Saves entire users array

// 3. TÌM user cụ thể
const user = users.find((u: any) => u.username === "huongvtt");

// 4. CẬP NHẬT 1 user
const userIndex = users.findIndex((u: any) => u.id === "user-001");
users[userIndex].password = "new-password";
await kv.set("users", users);

// 5. XÓA 1 user
const filteredUsers = users.filter((u: any) => u.id !== "user-001");
await kv.set("users", filteredUsers);
```

### **Các endpoint sử dụng:**

| Endpoint | Method | Mục đích | Code location |
|----------|--------|----------|---------------|
| `/auth/login` | POST | Đọc users để verify login | Dòng 33 |
| `/auth/change-password` | POST | Cập nhật password | Dòng 61, 75 |
| `/auth/forgot-password` | POST | Tìm user theo email | Dòng 90 |
| `/auth/reset-password` | POST | Cập nhật password sau reset | Dòng 141, 149 |
| `/students` (CREATE) | POST | Tạo user mới cho student | Dòng 244, 255 |
| `/students/:id` (UPDATE) | PUT | Cập nhật user của student | Dòng 279, 289 |
| `/students/:id` (DELETE) | DELETE | Xóa user của student | Dòng 307, 309 |
| `/teachers` (CREATE) | POST | Tạo user mới cho teacher | Dòng 340, 351 |
| `/teachers/:id` (UPDATE) | PUT | Cập nhật user của teacher | Dòng 375, 385 |
| `/teachers/:id` (DELETE) | DELETE | Xóa user của teacher | Dòng 403, 405 |
| `/admin/init-data` | POST | Khởi tạo users lần đầu | Dòng 812 |
| `/admin/reset-data` | POST | Xóa toàn bộ users | Dòng 837 |

---

## 💾 **2. CLIENT STORAGE (BROWSER) - LƯU SESSION HIỆN TẠI**

### **Nơi lưu trữ:**

```
Browser localStorage
  └─ Key: "currentUser"
       └─ Value: JSON string of current logged-in user
```

### **Cấu trúc dữ liệu:**

```typescript
// Key: "currentUser"
// Value: JSON string
localStorage.setItem('currentUser', JSON.stringify({
  id: "user-001",
  username: "huongvtt",
  fullName: "Vũ Thị Thu Hương",
  role: "academic",
  avatar: "https://...",
  email: "huongvtt@englishcomplex.edu.vn",
  phone: "0901234567",
  code: "EC-ACAD-001"
  // ⚠️ KHÔNG LƯU PASSWORD!
}));
```

### **Mục đích:**

1. ✅ **Persist login session** - Giữ user đăng nhập khi reload page
2. ✅ **Fast access** - Không cần gọi API mỗi lần check user
3. ✅ **Offline-friendly** - App vẫn biết user đang login
4. ⚠️ **Security** - KHÔNG lưu password, chỉ lưu thông tin public

### **API để truy cập:**

```typescript
// File: /App.tsx

// 1. SAVE user khi login
const handleLogin = (user: User) => {
  setCurrentUser(user);
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// 2. LOAD user khi app khởi động
useEffect(() => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    setCurrentUser(JSON.parse(savedUser));
  }
}, []);

// 3. REMOVE user khi logout
const handleLogout = () => {
  setCurrentUser(null);
  localStorage.removeItem('currentUser');
};
```

### **Kiểm tra trong Console:**

```javascript
// Mở Console (F12) và chạy:

// 1. Xem user hiện tại
console.log(localStorage.getItem('currentUser'));
// Output: '{"id":"user-001","username":"huongvtt",...}'

// 2. Parse JSON
console.log(JSON.parse(localStorage.getItem('currentUser')));
// Output: { id: "user-001", username: "huongvtt", ... }

// 3. Xem tất cả localStorage keys
console.log(Object.keys(localStorage));
// Output: ["currentUser", "english_complex_db_initialized"]
```

---

## 🔄 **FLOW: TỪ ĐĂNG KÝ → LƯU TRỮ → ĐĂNG NHẬP**

### **1. Khởi tạo hệ thống (First-time setup):**

```
User mở app lần đầu
        ↓
App.tsx useEffect: checkDatabaseInitialization()
        ↓
Check localStorage flag = null?
        ↓
Call initializeDatabase()
        ↓
POST /admin/init-data
  Body: {
    users: [
      { id: "user-001", username: "huongvtt", password: "123456", ... },
      { id: "user-002", username: "duccv", password: "123456", ... },
      ... (58 users)
    ],
    students: [...],
    teachers: [...],
    ...
  }
        ↓
Server: await kv.set("users", data.users)
        ↓
✅ 58 users được lưu vào Supabase KV Store
        ↓
Set localStorage flag = 'true'
```

### **2. Đăng nhập (Login):**

```
User nhập username + password
        ↓
POST /auth/login
  Body: { username: "huongvtt", password: "123456" }
        ↓
Server: const users = await kv.get("users")
        ↓
Server: const user = users.find(u => 
          u.username === "huongvtt" && 
          u.password === "123456"
        )
        ↓
Server: return { user: userWithoutPassword }
        ↓
Client: handleLogin(user)
        ↓
Client: localStorage.setItem('currentUser', JSON.stringify(user))
        ↓
Client: setCurrentUser(user)
        ↓
✅ User được lưu vào localStorage
✅ App hiển thị dashboard
```

### **3. Reload page (Session restore):**

```
User reload page (F5)
        ↓
App.tsx useEffect
        ↓
const savedUser = localStorage.getItem('currentUser')
        ↓
savedUser exists?
        ↓ YES
setCurrentUser(JSON.parse(savedUser))
        ↓
✅ User vẫn đăng nhập (không cần login lại)
```

### **4. Đổi mật khẩu (Change password):**

```
User click "Đổi mật khẩu"
        ↓
POST /auth/change-password
  Body: { 
    userId: "user-001",
    oldPassword: "123456",
    newPassword: "newpass123"
  }
        ↓
Server: const users = await kv.get("users")
        ↓
Server: const userIndex = users.findIndex(u => u.id === userId)
        ↓
Server: Verify oldPassword === users[userIndex].password
        ↓
Server: users[userIndex].password = newPassword
        ↓
Server: await kv.set("users", users)
        ↓
✅ Password mới được lưu vào Supabase KV Store
⚠️ localStorage KHÔNG thay đổi (vì không lưu password)
```

### **5. Đăng xuất (Logout):**

```
User click "Đăng xuất"
        ↓
handleLogout()
        ↓
setCurrentUser(null)
        ↓
localStorage.removeItem('currentUser')
        ↓
✅ currentUser bị xóa khỏi localStorage
✅ App quay về login page
⚠️ Users vẫn còn trên server (không bị xóa)
```

### **6. Tạo user mới (Create student/teacher):**

```
Admin tạo student mới
        ↓
POST /students
  Body: {
    id: "student-051",
    username: "newstudent",
    password: "123456",
    fullName: "Nguyễn Văn A",
    ...
  }
        ↓
Server: const students = await kv.get("students")
        ↓
Server: students.push(newStudent)
        ↓
Server: await kv.set("students", students)
        ↓
Server: const users = await kv.get("users")
        ↓
Server: users.push({
          id: student.id,
          username: student.username,
          password: student.password,
          role: "student",
          ...
        })
        ↓
Server: await kv.set("users", users)
        ↓
✅ Student được lưu vào 2 collections:
   - "students" collection (full data)
   - "users" collection (login credentials)
```

---

## 🔍 **KIỂM TRA DỮ LIỆU**

### **A. Kiểm tra trên SERVER (Supabase Database):**

Hiện tại **KHÔNG CÓ** UI để xem trực tiếp KV Store data trong Figma Make. Nhưng có thể:

#### **Cách 1: Tạo endpoint để xem data (Debug):**

```typescript
// Thêm vào /supabase/functions/server/index.tsx:

// Debug endpoint - View all users
app.get("/make-server-e2861589/debug/users", async (c) => {
  try {
    const users = await kv.get("users") || [];
    return c.json({ 
      count: users.length,
      users: users.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        email: u.email
        // ⚠️ KHÔNG return password cho security
      }))
    });
  } catch (error) {
    return c.json({ error: "Failed to get users" }, 500);
  }
});
```

Sau đó gọi:
```javascript
fetch('https://<projectId>.supabase.co/functions/v1/make-server-e2861589/debug/users', {
  headers: {
    'Authorization': 'Bearer <publicAnonKey>'
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

#### **Cách 2: Check trong login flow:**

```typescript
// File: /supabase/functions/server/index.tsx (dòng 28-52)

app.post("/make-server-e2861589/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    const users = await kv.get("users") || [];
    
    // Thêm log để debug
    console.log('📊 Total users in database:', users.length);
    console.log('🔍 Looking for username:', username);
    console.log('👥 Available usernames:', users.map((u: any) => u.username));
    
    // ... rest of code
  }
});
```

### **B. Kiểm tra trên CLIENT (Browser):**

```javascript
// Mở Console (F12) và chạy:

// 1. Xem user đang login
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser')));

// 2. Xem initialization flag
console.log('DB initialized?', localStorage.getItem('english_complex_db_initialized'));

// 3. Xem tất cả localStorage
console.log('All localStorage keys:', Object.keys(localStorage));
for (let key of Object.keys(localStorage)) {
  console.log(`  ${key}:`, localStorage.getItem(key));
}

// 4. Test login với fetch
fetch('https://<projectId>.supabase.co/functions/v1/make-server-e2861589/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <publicAnonKey>'
  },
  body: JSON.stringify({
    username: 'huongvtt',
    password: '123456'
  })
})
.then(r => r.json())
.then(data => console.log('Login response:', data));
```

---

## 📊 **TỔNG KẾT: 2 LỚP LƯU TRỮ**

```
┌──────────────────────────────────────────────────────────┐
│                    SERVER (Supabase)                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Postgres Table: kv_store_e2861589                 │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Key: "users"                                │  │  │
│  │  │  Value: [                                    │  │  │
│  │  │    { id, username, password, role, ... },    │  │  │
│  │  │    { id, username, password, role, ... },    │  │  │
│  │  │    ... (58 users total)                      │  │  │
│  │  │  ]                                           │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ✅ Permanent storage                               │  │
│  │  ✅ Lưu TẤT CẢ users (58 users)                    │  │
│  │  ✅ Có password (hashed nên được)                  │  │
│  │  ✅ Không mất khi reload                           │  │
│  │  ✅ Sync across devices                            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                            ↕
                    API Calls (fetch)
                            ↕
┌──────────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Browser localStorage                              │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Key: "currentUser"                          │  │  │
│  │  │  Value: {                                    │  │  │
│  │  │    id: "user-001",                           │  │  │
│  │  │    username: "huongvtt",                     │  │  │
│  │  │    fullName: "Vũ Thị Thu Hương",            │  │  │
│  │  │    role: "academic",                         │  │  │
│  │  │    email: "...",                             │  │  │
│  │  │    // ⚠️ NO PASSWORD!                       │  │  │
│  │  │  }                                           │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ⚠️ Temporary storage (session only)               │  │
│  │  ⚠️ Lưu CHỈ 1 user (đang login)                    │  │
│  │  ⚠️ KHÔNG có password (security)                   │  │
│  │  ⚠️ Mất khi clear browser data                     │  │
│  │  ✅ Không mất khi reload page                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 **BẢO MẬT**

### **Server (Supabase KV Store):**

| Data | Có lưu không? | Lý do |
|------|--------------|-------|
| **Password** | ✅ CÓ | Cần để verify login & change password |
| **Email** | ✅ CÓ | Cần để forgot password |
| **Phone** | ✅ CÓ | Contact info |
| **Full data** | ✅ CÓ | Master data source |

⚠️ **TODO (Production):**
- [ ] Hash passwords (bcrypt/argon2) thay vì plain text
- [ ] Encrypt sensitive data
- [ ] Add access control (role-based)
- [ ] Add audit log (who changed what)

### **Client (Browser localStorage):**

| Data | Có lưu không? | Lý do |
|------|--------------|-------|
| **Password** | ❌ KHÔNG | Security risk! |
| **User ID** | ✅ CÓ | Cần để identify user |
| **Username** | ✅ CÓ | Display purposes |
| **Role** | ✅ CÓ | Menu permissions |
| **Public info** | ✅ CÓ | Avatar, name, email |

✅ **Đúng thực hành:**
- Chỉ lưu public data
- KHÔNG lưu credentials
- Clear khi logout

---

## 📝 **FILES LIÊN QUAN**

| File | Mục đích | Dòng code quan trọng |
|------|----------|---------------------|
| `/supabase/functions/server/index.tsx` | Server endpoints quản lý users | Dòng 28-52 (login)<br>Dòng 54-81 (change password)<br>Dòng 808-828 (init)<br>Dòng 830-856 (reset) |
| `/App.tsx` | Client session management | Dòng 50-70 (useEffect)<br>Dòng 72-80 (handleLogin/Logout) |
| `/utils/initDatabase.ts` | Initialize users lần đầu | Dòng 16-113 (initializeDatabase) |
| `/utils/api.ts` | API client methods | Dòng 31-59 (authAPI) |
| `/data/mockData.ts` | Default users data | Tất cả user data |

---

## 🎯 **KẾT LUẬN**

### **Tài khoản được lưu ở 2 nơi:**

1. **SERVER (Supabase KV Store)** ← **MASTER DATA**
   - ✅ Lưu TẤT CẢ 58 users
   - ✅ Có password (cần hash trong production!)
   - ✅ Permanent storage
   - ✅ Source of truth

2. **CLIENT (Browser localStorage)** ← **SESSION ONLY**
   - ✅ Lưu CHỈ user đang login
   - ❌ KHÔNG có password
   - ⚠️ Temporary (chỉ cho session)
   - ⚠️ Có thể bị clear

### **Analogy (Ví dụ dễ hiểu):**

```
SERVER (Database)     =  Ngân hàng (lưu tất cả tài khoản)
CLIENT (localStorage) =  Thẻ ATM (chỉ info của 1 người)

- Ngân hàng có toàn bộ dữ liệu khách hàng
- Thẻ ATM chỉ có số thẻ + tên chủ (không có mật khẩu!)
- Mất thẻ ATM? → Làm lại (localStorage.removeItem)
- Ngân hàng vẫn còn data → Login lại là được
```

---

**Có câu hỏi gì thêm không?** 🚀
