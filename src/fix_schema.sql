-- ============================================
-- FIX SCHEMA: Add missing 'code' columns
-- ============================================

-- 1. Add 'code' column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- 2. Add 'code' column to teachers table
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_code ON students(code);
CREATE INDEX IF NOT EXISTS idx_teachers_code ON teachers(code);

-- ============================================
-- DONE! Now the schema matches the server code
-- ============================================

-- Verify the changes:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name = 'code';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' AND column_name = 'code';
