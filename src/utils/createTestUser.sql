-- ============================================
-- SQL SCRIPT: Tạo test users cho hệ thống
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- để tạo 4 users test với 4 roles khác nhau

-- 1. Tạo account cho Academic (Học vụ)
INSERT INTO accounts (user_name, password_hash, email, phone, status)
VALUES ('academic', '123456', 'academic@englishcomplex.com', '0901234567', 'active')
RETURNING id_account;

-- Lấy id_account vừa tạo và tạo user
-- Thay <id_account_academic> bằng id trả về từ query trên
INSERT INTO users (account, full_name, role, gender, address)
VALUES (<id_account_academic>, 'Nguyễn Văn Học Vụ', 'Academic', 'male', 'Hà Nội');

-- 2. Tạo account cho Teacher (Giáo viên)
INSERT INTO accounts (user_name, password_hash, email, phone, status)
VALUES ('teacher', '123456', 'teacher@englishcomplex.com', '0901234568', 'active')
RETURNING id_account;

-- Tạo user cho teacher
INSERT INTO users (account, full_name, role, gender, address)
VALUES (<id_account_teacher>, 'Trần Thị Giáo Viên', 'Teacher', 'female', 'Hà Nội')
RETURNING id_user;

-- Tạo teacher record
INSERT INTO teachers (id_user, code, specialty, experience_years, bio)
VALUES (<id_user_teacher>, 'GV001', 'IELTS Speaking', 5, 'Chuyên gia IELTS');

-- 3. Tạo account cho Student (Học viên)
INSERT INTO accounts (user_name, password_hash, email, phone, status)
VALUES ('student', '123456', 'student@englishcomplex.com', '0901234569', 'active')
RETURNING id_account;

-- Tạo user cho student
INSERT INTO users (account, full_name, role, gender, address)
VALUES (<id_account_student>, 'Lê Văn Học Viên', 'Student', 'male', 'Hà Nội')
RETURNING id_user;

-- Tạo student record
INSERT INTO students (id_user, code, parent_name, parent_phone, level, dob)
VALUES (<id_user_student>, 'HV001', 'Lê Văn Phụ Huynh', '0987654321', 'Beginner', '2005-01-01');

-- 4. Tạo account cho Director (Giám đốc)
INSERT INTO accounts (user_name, password_hash, email, phone, status)
VALUES ('director', '123456', 'director@englishcomplex.com', '0901234570', 'active')
RETURNING id_account;

-- Tạo user cho director
INSERT INTO users (account, full_name, role, gender, address)
VALUES (<id_account_director>, 'Phạm Thị Giám Đốc', 'Director', 'female', 'Hà Nội');

-- ============================================
-- HOẶC CHẠY SCRIPT NÀY (CÁCH ĐƠN GIẢN HƠN)
-- ============================================

-- Academic user
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('academic', '123456', 'academic@englishcomplex.com', '0901234567', 'active')
  RETURNING id_account
)
INSERT INTO users (account, full_name, role, gender, address)
SELECT id_account, 'Nguyễn Văn Học Vụ', 'Academic', 'male', 'Hà Nội'
FROM new_account;

-- Teacher user
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

-- Student user
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

-- Director user
WITH new_account AS (
  INSERT INTO accounts (user_name, password_hash, email, phone, status)
  VALUES ('director', '123456', 'director@englishcomplex.com', '0901234570', 'active')
  RETURNING id_account
)
INSERT INTO users (account, full_name, role, gender, address)
SELECT id_account, 'Phạm Thị Giám Đốc', 'Director', 'female', 'Hà Nội'
FROM new_account;

-- ============================================
-- TEST LOGIN
-- ============================================
-- Username: academic / Password: 123456
-- Username: teacher  / Password: 123456
-- Username: student  / Password: 123456
-- Username: director / Password: 123456
