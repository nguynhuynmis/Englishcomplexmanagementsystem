# 🗄️ DATABASE MIGRATION ANALYSIS - KV Store vs SQL Schema

## 📋 **TÌNH HUỐNG HIỆN TẠI**

User muốn migrate từ **KV Store flat structure** sang **SQL normalized schema** theo ERD đã thiết kế.

---

## ⚠️ **VẤN ĐỀ QUAN TRỌNG: FIGMA MAKE LIMITATIONS**

### **Figma Make KHÔNG CHO PHÉP:**

```
❌ CREATE TABLE (custom tables)
❌ ALTER TABLE (modify schema)
❌ Migration files (Flyway/Liquibase)
❌ DDL statements
❌ Access to Supabase UI trong Make environment
```

### **Figma Make CHỈ CHO PHÉP:**

```
✅ Sử dụng 1 table duy nhất: kv_store_e2861589
✅ CRUD operations qua kv.get() / kv.set()
✅ Lưu JSON data (schema-less)
```

**Reference:** `/supabase/functions/server/kv_store.tsx` (protected file)

---

## 🎯 **2 APPROACHES KHẢ THI**

### **APPROACH 1: SIMULATE SQL TRONG KV STORE** ⭐ (RECOMMENDED)

**Ý tưởng:**
- Vẫn dùng KV Store (1 table)
- Nhưng restructure data theo ERD
- Simulate foreign keys bằng IDs
- Update API logic để join data manually

**Ưu điểm:**
- ✅ Hoạt động ngay trong Figma Make
- ✅ Không cần setup thêm
- ✅ Deploy dễ dàng
- ✅ Có thể refactor từ từ

**Nhược điểm:**
- ❌ Không có foreign key constraints (phải validate manually)
- ❌ Không có JOIN queries (phải merge trong code)
- ❌ Không có indexes (search chậm với large data)
- ❌ Phải tự implement referential integrity

**Phù hợp cho:**
- ✅ Prototyping
- ✅ MVP
- ✅ Internal tools
- ✅ < 10K records

---

### **APPROACH 2: TẠO TABLES THẬT TRONG SUPABASE** 🚀 (PRODUCTION-READY)

**Ý tưởng:**
- User tự tạo tables trong Supabase dashboard
- Sử dụng Supabase Client để query trực tiếp
- Bỏ KV Store, dùng SQL queries thật

**Ưu điểm:**
- ✅ True relational database
- ✅ Foreign key constraints
- ✅ JOIN queries
- ✅ Indexes, transactions
- ✅ Better performance với large data

**Nhược điểm:**
- ❌ Phải setup tables manually trong Supabase UI
- ❌ Phức tạp hơn
- ❌ Cần Supabase credentials
- ❌ Deployment phức tạp hơn (cần migrate data)

**Phù hợp cho:**
- ✅ Production app
- ✅ Large scale (> 100K records)
- ✅ Complex queries
- ✅ Need ACID guarantees

---

## 📊 **PHÂN TÍCH ERD**

### **Tables trong ERD (20 tables):**

```
1. users (Core entity)
2. accounts (Authentication)
3. roles (RBAC)
4. account_roles (Many-to-many: accounts ↔ roles)
5. permissions (RBAC)
6. role_permissions (Many-to-many: roles ↔ permissions)
7. students (Extends users)
8. teachers (Extends users)
9. centers (Campuses)
10. class (Classes)
11. class_students (Many-to-many: students ↔ classes)
12. class_levels (IELTS levels: 4.0, 5.0, 6.0, 7.0)
13. schedules (Class sessions)
14. materials (Study materials)
15. assignments (Homework)
16. assignment_submissions (Student submissions)
17. scores (Grades)
18. feedbacks (User feedback)
19. notification (Notifications)
20. system_logs (Audit trail)
```

### **Key Relationships:**

```
users ← (1:1) → accounts
users ← (1:1) → students
users ← (1:1) → teachers
users ← (1:N) → centers (manager)
users ← (1:N) → feedbacks
accounts ← (N:M) → roles (via account_roles)
roles ← (N:M) → permissions (via role_permissions)
class ← (N:1) → centers
class ← (N:1) → teachers
class ← (N:1) → class_levels
class ← (N:M) → students (via class_students)
class ← (1:N) → schedules
class ← (1:N) → materials
class ← (1:N) → assignments
assignments ← (1:N) → assignment_submissions
students ← (1:N) → scores
```

---

## 🔄 **SO SÁNH: CURRENT vs ERD SCHEMA**

### **CURRENT (KV Store - Flat structure):**

```typescript
// Key: "users"
[
  {
    id: "user-001",
    username: "huongvtt",
    password: "123456",
    fullName: "Vũ Thị Thu Hương",
    role: "academic", // ← Single role (string)
    email: "...",
    phone: "...",
    avatar: "...",
    code: "EC-ACAD-001"
  }
]

// Key: "students" (duplicate some user data)
[
  {
    id: "student-001",
    username: "huyenntk", // ← Duplicate from users
    fullName: "...", // ← Duplicate from users
    email: "...", // ← Duplicate from users
    phone: "...", // ← Duplicate from users
    dateOfBirth: "2005-03-15",
    parentName: "...",
    parentPhone: "..."
  }
]

// Key: "classes" (denormalized)
[
  {
    id: "class-001",
    name: "IELTS 7.0 - Morning",
    level: "7.0", // ← Should reference class_levels
    teacherId: "teacher-001", // ← OK
    campusId: "campus-001", // ← OK
    studentIds: ["student-001", "student-002"], // ← Should use junction table
    capacity: 15,
    schedule: "Mon, Wed, Fri 8:00-10:00" // ← Should be separate schedules table
  }
]
```

### **ERD (Normalized structure):**

```typescript
// Table: accounts
[
  {
    id_account: "acc-001",
    user_name: "huongvtt",
    email: "huongvtt@englishcomplex.edu.vn",
    phone: "0901234567",
    password_hash: "$2b$10$...", // ← Hashed
    status: "active",
    last_login: "2024-12-14T10:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-12-14T10:00:00Z"
  }
]

// Table: users
[
  {
    id_user: "user-001",
    id_account: "acc-001", // ← FK to accounts
    full_name: "Vũ Thị Thu Hương",
    role: "academic", // Or reference to roles table
    gender: "female",
    address: "Hà Nội",
    avatar_url: "https://..."
  }
]

// Table: students (NO duplicate data!)
[
  {
    id_student: "stu-001",
    id_user: "user-002", // ← FK to users
    parent_name: "Nguyễn Văn A",
    parent_phone: "0945678901",
    level: "7.0",
    created_at: "2024-01-01T00:00:00Z"
  }
]

// Table: teachers (NO duplicate data!)
[
  {
    id_teacher: "tea-001",
    id_user: "user-003", // ← FK to users
    bio: "10 years teaching IELTS",
    specialties: "Speaking, Writing",
    experience_years: 10,
    certifications: "CELTA, TESOL",
    created_at: "2024-01-01T00:00:00Z"
  }
]

// Table: class
[
  {
    id_class: "cls-001",
    id_center: "cen-001", // ← FK to centers
    id_level: "lvl-004", // ← FK to class_levels
    id_teacher: "tea-001", // ← FK to teachers
    name_class: "IELTS 7.0 Morning",
    status: "active",
    capacity: 15,
    note: "Advanced class",
    created_at: "2024-01-01T00:00:00Z"
  }
]

// Table: class_students (Junction table - NO denormalization!)
[
  {
    id_students: "stu-001",
    id_class: "cls-001",
    academic_year: "2024",
    period_data: "Q1",
    start_date: "2024-01-15"
  }
]

// Table: class_levels (Lookup table)
[
  { id_level: "lvl-001", name: "IELTS 4.0", description: "Beginner", order_index: 1 },
  { id_level: "lvl-002", name: "IELTS 5.0", description: "Pre-intermediate", order_index: 2 },
  { id_level: "lvl-003", name: "IELTS 6.0", description: "Intermediate", order_index: 3 },
  { id_level: "lvl-004", name: "IELTS 7.0", description: "Advanced", order_index: 4 }
]

// Table: schedules (Separated from class!)
[
  {
    id_schedule: "sch-001",
    id_class: "cls-001",
    session_date: "2024-12-16",
    start_time: "08:00:00",
    end_time: "10:00:00",
    topic: "Unit 1: Introduction",
    required_materials: "Textbook, notebook",
    is_cancelled: false,
    updated_at: "2024-12-14T10:00:00Z"
  }
]

// Table: assignment_submissions (New!)
[
  {
    id_assignment: "asg-001",
    id_student: "stu-001",
    ac_url: "https://...",
    submitted_at: "2024-12-14T10:00:00Z",
    grade: 8.5,
    feedback: "Good job!"
  }
]
```

---

## 💡 **RECOMMENDATION**

### **TÙY THEO MỤC ĐÍCH:**

#### **Nếu mục đích là PROTOTYPE / MVP / DEMO:**
→ **Chọn APPROACH 1** (Simulate SQL trong KV Store)
- Đơn giản, nhanh chóng
- Không cần setup thêm
- Đủ cho demo và testing

#### **Nếu mục đích là PRODUCTION APP:**
→ **Chọn APPROACH 2** (Tạo tables thật)
- Better performance
- Data integrity
- Scalable

---

## 🚀 **NEXT STEPS - USER QUYẾT ĐỊNH:**

### **OPTION A: Simulate SQL trong KV Store** (Có thể làm ngay!)

```
1. ✅ Tôi sẽ refactor data structure theo ERD
2. ✅ Update tất cả API endpoints
3. ✅ Thêm validation logic (simulate FK constraints)
4. ✅ Update frontend components
5. ⚠️ Data migration (convert existing data)

Estimated time: 2-3 hours work
Risk: Medium (phải test kỹ)
```

### **OPTION B: Tạo tables thật trong Supabase** (Cần manual setup!)

```
1. ⚠️ User phải tự tạo 20 tables trong Supabase UI
2. ⚠️ User phải setup foreign keys, indexes
3. ✅ Tôi sẽ viết SQL queries (SELECT, JOIN)
4. ✅ Update frontend components
5. ⚠️ Migration script (export KV → import SQL)

Estimated time: 4-6 hours work
Risk: High (complex migration, need Supabase access)
```

---

## ❓ **CÂU HỎI CHO USER:**

1. **Mục đích cuối cùng của project này là gì?**
   - [ ] Prototype/MVP/Demo → Recommend: APPROACH 1
   - [ ] Production app (deploy thật) → Recommend: APPROACH 2

2. **Bạn có quyền truy cập Supabase dashboard không?**
   - [ ] Có → Có thể làm APPROACH 2
   - [ ] Không → Chỉ có thể làm APPROACH 1

3. **Lượng data dự kiến:**
   - [ ] < 1000 records → KV Store đủ
   - [ ] > 10K records → Nên dùng SQL tables thật

4. **Timeline:**
   - [ ] Cần nhanh (< 1 tuần) → APPROACH 1
   - [ ] Có thời gian (1-2 tháng) → APPROACH 2

5. **Bạn muốn tôi làm gì ngay bây giờ?**
   - [ ] Refactor KV Store theo ERD (APPROACH 1)
   - [ ] Viết migration guide để tạo SQL tables (APPROACH 2)
   - [ ] Giải thích chi tiết hơn
   - [ ] Khác: _____________

---

**Hãy cho tôi biết lựa chọn của bạn để tôi tiếp tục!** 🚀
