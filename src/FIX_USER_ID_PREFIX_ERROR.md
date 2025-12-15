# Fix: Duplicate Key Error - User ID Prefix Issue

## 🐛 Problem

System was trying to insert `id_user = "HV002"` into `user` table, causing duplicate key error:

```
Error: duplicate key value violates unique constraint "user_pkey"
Details: Key (id_user)=(HV002) already exists.
```

## 🔍 Root Cause

In `/supabase/functions/server/index.tsx`, the CREATE USER endpoint (line 1606-1617) was generating `nextUserId` based on role:

```typescript
// ❌ OLD CODE - WRONG!
let nextUserId: string;
if (userData.role === 'student') {
  nextUserId = await generateNextId('students', 'id_student'); // Returns HV001, HV002...
} else if (userData.role === 'teacher') {
  nextUserId = await generateNextId('teachers', 'id_teacher'); // Returns GV001, GV002...
} else {
  nextUserId = await generateNextId('user', 'id_user'); // Returns US001, US002...
}

// Then used this ID for user table:
await supabase.from('user').insert({ id_user: nextUserId }); // ❌ Trying to insert HV002 into user table!
```

**Issue**: When creating a student, it generated `HV002` and tried to insert it into `user.id_user`, which violates the ID convention.

## ✅ Solution

### 1. Separate User ID and Role-Specific ID Generation

```typescript
// ✅ NEW CODE - CORRECT!
// Generate user ID - ALWAYS use US prefix for user table
const nextUserId = await generateNextId('user', 'id_user'); // US001, US002...

// Generate role-specific ID (HV for students, GV for teachers)
let roleSpecificId: string | null = null;
if (userData.role === 'student') {
  roleSpecificId = await generateNextId('students', 'id_student'); // HV001, HV002...
} else if (userData.role === 'teacher') {
  roleSpecificId = await generateNextId('teachers', 'id_teacher'); // GV001, GV002...
}
```

### 2. Use Correct IDs When Inserting

```typescript
// Insert into user table with US prefix
await supabase.from('user').insert({
  id_user: nextUserId, // US001, US002...
  ...
});

// Insert into students table with HV prefix
if (userData.role === 'student' && roleSpecificId) {
  await supabase.from('students').insert({
    id_student: roleSpecificId, // HV001, HV002...
    id_user: nextUserId,         // US001, US002... (FK to user)
    ...
  });
}

// Insert into teachers table with GV prefix
if (userData.role === 'teacher' && roleSpecificId) {
  await supabase.from('teachers').insert({
    id_teacher: roleSpecificId, // GV001, GV002...
    id_user: nextUserId,         // US001, US002... (FK to user)
    ...
  });
}
```

### 3. Update ID Prefix in id-generator.tsx

Changed `user` table prefix from `ND` to `US`:

```typescript
export const ID_PREFIXES = {
  accounts: 'TK',      // Tài Khoản
  students: 'HV',      // Học Viên
  teachers: 'GV',      // Giáo Viên
  centers: 'CS',       // Cơ Sở
  users: 'US',         // ✅ Changed from 'ND' to 'US'
  user: 'US',          // ✅ Changed from 'ND' to 'US'
  // ... rest
} as const;
```

## 📊 ID Convention Summary

| Table      | Primary Key    | Prefix | Example | Foreign Key Reference        |
|------------|----------------|--------|---------|------------------------------|
| accounts   | id_account     | TK     | TK001   | -                            |
| user       | id_user        | US     | US001   | → accounts.id_account        |
| students   | id_student     | HV     | HV001   | → user.id_user (US001)       |
| teachers   | id_teacher     | GV     | GV001   | → user.id_user (US001)       |
| centers    | id_center      | CS     | CS001   | -                            |
| class      | id_class       | LH     | LH001   | -                            |

### Example Flow (Creating Student HV002):

```
1. Create account:  TK003
2. Create user:     US002 (FK: id_account = TK003)
3. Create student:  HV002 (FK: id_user = US002)

Database Result:
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ accounts            │ user                │ students            │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ id_account: TK003   │ id_user:    US002   │ id_student: HV002   │
│ user_name: john     │ id_account: TK003   │ id_user:    US002   │
│ email: john@...     │ full_name:  John    │ parent_name: ...    │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

## 🗂️ Files Modified

1. **`/supabase/functions/server/index.tsx`**
   - Line 1606-1620: Separated user ID and role-specific ID generation
   - Line 1683-1720: Use correct IDs when inserting into students/teachers
   - Line 1724-1734: Return role-specific ID as `code`
   - Line 64-99: Removed deprecated `generateStudentCode()` and `generateTeacherCode()`
   - Added deprecation warnings to old /students and /teachers POST endpoints

2. **`/supabase/functions/server/id-generator.tsx`**
   - Line 24-25: Changed `users` and `user` prefix from `'ND'` to `'US'`

## 🎯 Testing Checklist

- [ ] Create new student → Should generate US00X for user, HV00X for student
- [ ] Create new teacher → Should generate US00X for user, GV00X for teacher
- [ ] Create new academic/director → Should generate US00X for user only
- [ ] No more duplicate key errors when creating users concurrently
- [ ] User list displays correct codes (HV for students, GV for teachers)

## 🚨 Important Notes

1. **Old endpoints deprecated**: `/students` POST and `/teachers` POST endpoints should not be used anymore. Use `/users` endpoint instead.

2. **Backward compatibility**: Old endpoints are kept but have warnings. They may have issues with:
   - Using `code` field that doesn't exist in tables
   - Using `user` field instead of `id_user`
   - Not generating IDs with proper prefixes

3. **Retry logic**: The existing retry with exponential backoff is still in place to handle concurrent requests.

## ✅ Status

**FIXED** ✅ - User creation now properly generates:
- `US` prefix for `user.id_user`
- `HV` prefix for `students.id_student`  
- `GV` prefix for `teachers.id_teacher`
- Proper foreign key relationships between tables
