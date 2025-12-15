-- ============================================
-- SQL SCRIPT: XÓA VÀ TẠO LẠI TEST USERS
-- ============================================
-- Chạy từng đoạn này trong Supabase SQL Editor

-- BƯỚC 1: XÓA TẤT CẢ DATA CŨ (thận trọng!)
DELETE FROM class_students;
DELETE FROM schedules;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM users;
DELETE FROM accounts;

-- BƯỚC 2: TẠO TEST USERS MỚI

-- Test User 1: Academic (Học vụ)
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('academic', '123456', 'academic@englishcomplex.com', '0901234567', 'active')
  RETURNING id_account
)
INSERT INTO users (account, full_name, role, gender, address)
SELECT id_account, 'Nguyễn Văn Học Vụ', 'Academic', 'male', 'Hà Nội'
FROM new_account;

-- Test User 2: Teacher (Giáo viên)
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('teacher', '123456', 'teacher@englishcomplex.com', '0901234568', 'active')
  RETURNING id_account
),
new_user AS (
  INSERT INTO users (account, full_name, role, gender, address)
  SELECT id_account, 'Trần Thị Giáo Viên', 'Teacher', 'female', 'Hà Nội'
  FROM new_account
  RETURNING id_user
)
INSERT INTO teachers (id_user, code, specialty, experience_years, bio)
SELECT id_user, 'GV001', 'IELTS Speaking', 5, 'Chuyên gia IELTS'
FROM new_user;

-- Test User 3: Student (Học viên)
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('student', '123456', 'student@englishcomplex.com', '0901234569', 'active')
  RETURNING id_account
),
new_user AS (
  INSERT INTO users (account, full_name, role, gender, address)
  SELECT id_account, 'Lê Văn Học Viên', 'Student', 'male', 'Hà Nội'
  FROM new_account
  RETURNING id_user
)
INSERT INTO students (id_user, code, parent_name, parent_phone, level, dob)
SELECT id_user, 'HV001', 'Lê Văn Phụ Huynh', '0987654321', 'Beginner', '2005-01-01'
FROM new_user;

-- Test User 4: Director (Giám đốc)
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('director', '123456', 'director@englishcomplex.com', '0901234570', 'active')
  RETURNING id_account
)
INSERT INTO users (account, full_name, role, gender, address)
SELECT id_account, 'Phạm Thị Giám Đốc', 'Director', 'female', 'Hà Nội'
FROM new_account;

-- BƯỚC 3: KIỂM TRA KẾT QUẢ
SELECT 
  a.user_name,
  a.password_hash,
  u.full_name,
  u.role
FROM accounts a
LEFT JOIN users u ON u.account = a.id_account
ORDER BY a.id_account;

-- Kết quả mong đợi:
-- user_name | password_hash | full_name              | role
-- ----------|---------------|------------------------|----------
-- academic  | 123456        | Nguyễn Văn Học Vụ      | Academic
-- teacher   | 123456        | Trần Thị Giáo Viên     | Teacher
-- student   | 123456        | Lê Văn Học Viên        | Student
-- director  | 123456        | Phạm Thị Giám Đốc      | Director
