-- ============================================
-- TEST QUERY: SELECT * FROM STUDENTS
-- ============================================

-- 1. View all students (raw)
SELECT * FROM students;

-- 2. View students with their user info
SELECT 
  s.*,
  u.full_name,
  u.gender,
  u.address,
  u.avatar_url,
  u.id_account
FROM students s
LEFT JOIN "user" u ON s.id_user = u.id_user;

-- 3. View students with complete info (user + account)
SELECT 
  s.id_student,
  s.code as student_code,
  s.parent_name,
  s.parent_phone,
  s.level,
  s.dob,
  u.id_user,
  u.full_name,
  u.gender,
  u.address,
  u.avatar_url,
  a.id_account,
  a.user_name,
  a.email,
  a.phone,
  a.status
FROM students s
LEFT JOIN "user" u ON s.id_user = u.id_user
LEFT JOIN accounts a ON u.id_account = a.id_account
ORDER BY s.created_at DESC;

-- 4. Count students
SELECT COUNT(*) as total_students FROM students;

-- 5. Check if students.id_user exists in user table
SELECT 
  s.id_student,
  s.id_user,
  CASE 
    WHEN u.id_user IS NULL THEN '❌ NOT FOUND'
    ELSE '✅ FOUND'
  END as user_exists
FROM students s
LEFT JOIN "user" u ON s.id_user = u.id_user;

-- 6. Check column names in students table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
