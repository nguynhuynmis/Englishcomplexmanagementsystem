# 🗄️ SUPABASE DATABASE SETUP GUIDE

## 📋 **OVERVIEW**

This guide will help you create 20 SQL tables in your Supabase project following the ERD design.

**Estimated time:** 30-45 minutes

---

## ⚠️ **PREREQUISITES**

Before starting, make sure you have:

- ✅ Supabase account (free tier is OK)
- ✅ A Supabase project created
- ✅ Access to SQL Editor in Supabase dashboard
- ✅ `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from your project

---

## 📍 **STEP 1: ACCESS SUPABASE SQL EDITOR**

### **1.1. Login to Supabase**

```
1. Go to: https://supabase.com/dashboard
2. Login with your account
3. Select your project (or create new one)
```

### **1.2. Open SQL Editor**

```
1. In left sidebar, click "SQL Editor"
2. Click "+ New query" button
```

---

## 📍 **STEP 2: RUN SQL SCRIPT**

### **2.1. Copy SQL Script**

```bash
# From your project, open file:
/database/01_CREATE_TABLES.sql

# Copy ENTIRE content (Ctrl+A, Ctrl+C)
```

### **2.2. Paste into Supabase SQL Editor**

```
1. Paste the SQL script into the editor
2. Click "Run" button (or Ctrl+Enter)
3. Wait for execution (should take ~10-15 seconds)
```

### **2.3. Verify Success**

You should see output like:

```
Success. No rows returned.

Created tables:
- accounts
- users
- roles
- account_roles
- permissions
- role_permissions
- centers
- students
- teachers
- class_levels
- class
- class_students
- schedules
- materials
- assignments
- assignment_submissions
- scores
- feedbacks
- notifications
- system_logs

Created indexes: 50+
Created triggers: 15+
Inserted initial data: class_levels (4 rows)
```

---

## 📍 **STEP 3: VERIFY TABLES**

### **3.1. Check Table List**

```
1. In left sidebar, click "Table Editor"
2. You should see all 20 tables listed
```

### **3.2. Verify class_levels data**

```sql
-- Run this query in SQL Editor:
SELECT * FROM class_levels ORDER BY order_index;

-- Expected result:
-- level_code | level_name  | target_band_score
-- -----------|-------------|------------------
-- 4.0        | IELTS 4.0   | 4.0
-- 5.0        | IELTS 5.0   | 5.0
-- 6.0        | IELTS 6.0   | 6.0
-- 7.0        | IELTS 7.0   | 7.0
```

---

## 📍 **STEP 4: GET SUPABASE CREDENTIALS**

### **4.1. Get Project URL**

```
1. Go to Settings > API
2. Copy "Project URL"
   Example: https://abcdefghijk.supabase.co
```

### **4.2. Get Service Role Key**

```
1. Still in Settings > API
2. Under "Project API keys" section
3. Copy "service_role" key (NOT anon key!)
   
⚠️ WARNING: Keep this secret! Don't commit to Git!
```

### **4.3. Save to Environment Variables**

You'll need these later. Keep them safe!

```bash
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...very-long-key
```

---

## 📍 **STEP 5: OPTIONAL - SETUP ROW LEVEL SECURITY (RLS)**

For production, you should enable RLS to secure your tables.

### **5.1. Enable RLS on all tables**

```sql
-- Run this in SQL Editor:
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
```

### **5.2. Create basic policies**

```sql
-- Example: Allow service role to do everything
CREATE POLICY "Service role has full access" ON accounts
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Repeat for other tables...
-- Or wait for more specific policies later
```

⚠️ **NOTE:** We'll use `service_role` key in backend, which bypasses RLS.  
For frontend direct access, you'd need more specific policies.

---

## 📍 **STEP 6: TEST DATABASE**

### **6.1. Insert test account**

```sql
-- Run in SQL Editor:
INSERT INTO accounts (user_name, email, password_hash, status)
VALUES ('testuser', 'test@example.com', 'temp-password', 'active')
RETURNING *;

-- Should return the created account with UUID
```

### **6.2. Insert test user**

```sql
-- Use the id_account from previous step
INSERT INTO users (id_account, full_name, role, gender)
VALUES (
  'paste-uuid-here', -- Replace with actual UUID from step 6.1
  'Test User',
  'student',
  'male'
)
RETURNING *;
```

### **6.3. Clean up test data**

```sql
-- Delete test data
DELETE FROM users WHERE full_name = 'Test User';
DELETE FROM accounts WHERE user_name = 'testuser';
```

---

## 📍 **STEP 7: BACKUP SQL SCRIPT**

### **7.1. Save your schema**

```sql
-- In SQL Editor, create a new query and run:
-- This will show you the full schema if you need it later

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### **7.2. Export as CSV** (optional)

```
1. Run the query above
2. Click "Download CSV" button
3. Save as "schema_backup.csv"
```

---

## ✅ **SUCCESS CHECKLIST**

Before moving to next step, verify:

- [ ] All 20 tables created successfully
- [ ] `class_levels` has 4 rows (4.0, 5.0, 6.0, 7.0)
- [ ] Triggers are working (updated_at auto-updates)
- [ ] Foreign keys are set up correctly
- [ ] You have `SUPABASE_URL` saved
- [ ] You have `SUPABASE_SERVICE_ROLE_KEY` saved
- [ ] RLS is enabled (optional but recommended)

---

## 🐛 **TROUBLESHOOTING**

### **Error: "extension uuid-ossp does not exist"**

**Solution:**
```sql
-- Run this first:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Error: "permission denied"**

**Solution:**
- Make sure you're using your own Supabase project
- Check that you have admin access
- Try refreshing the page and logging in again

### **Error: "relation already exists"**

**Solution:**
```sql
-- Drop all tables and start over
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run 01_CREATE_TABLES.sql again
```

### **Partial success (some tables created, some failed)**

**Solution:**
```sql
-- Check which tables exist:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Drop failed tables and re-run specific CREATE TABLE statements
```

---

## 🎯 **NEXT STEPS**

Once database is set up:

1. ✅ **Run migration script** → `/database/03_MIGRATION_SCRIPT.ts`
2. ✅ **Update server code** → Use Supabase client instead of KV Store
3. ✅ **Test API endpoints** → Verify CRUD operations work
4. ✅ **Update frontend** → Handle new response formats

---

## 📚 **USEFUL SQL QUERIES**

### **Check table sizes:**

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **Check foreign keys:**

```sql
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
ORDER BY tc.table_name;
```

### **Check indexes:**

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 📞 **SUPPORT**

If you encounter issues:

1. Check Supabase docs: https://supabase.com/docs
2. Check Supabase Discord: https://discord.supabase.com
3. Review error messages in SQL Editor
4. Check `/database/01_CREATE_TABLES.sql` for syntax errors

---

**Ready to continue?** Next step: Run migration script! 🚀
