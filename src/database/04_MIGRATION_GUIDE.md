# 🔄 DATA MIGRATION GUIDE

## 📋 **OVERVIEW**

This guide explains how to migrate your existing data from KV Store to SQL tables.

**What will be migrated:**
- ✅ 58 users → accounts + users tables
- ✅ 50 students → students table
- ✅ 4 teachers → teachers table
- ✅ 3 campuses → centers table
- ✅ 8 classes → class table
- ✅ Class enrollments → class_students table
- ✅ 40 schedules → schedules table
- ✅ 15 notifications → notifications table
- ✅ Grades (if any) → scores table

**Estimated time:** 5-10 minutes

---

## ⚠️ **PREREQUISITES**

Before running migration:

- [ ] SQL tables created in Supabase (completed Step 2)
- [ ] Supabase credentials configured
- [ ] Backup of current KV Store data (just in case!)
- [ ] Server is running locally for testing

---

## 📍 **OPTION A: RUN MIGRATION VIA ENDPOINT** (Recommended)

### **Step 1: Add migration endpoint to server**

Open `/supabase/functions/server/index.tsx` and add this endpoint at the end (before `Deno.serve`):

```typescript
// Import migration script
import { runMigration, rollback } from './migration_script.ts';

// Migration endpoint (ADMIN ONLY - Remove in production!)
app.post("/make-server-e2861589/admin/migrate-to-sql", async (c) => {
  try {
    console.log('🚀 [Admin] Starting database migration...');
    
    const result = await runMigration();
    
    console.log('✅ [Admin] Migration completed successfully!');
    return c.json({ 
      success: true,
      message: "Migration completed successfully",
      ...result
    });
  } catch (error) {
    console.error("❌ [Admin] Migration failed:", error);
    return c.json({ 
      success: false,
      error: error.message,
      message: "Migration failed. Check server logs."
    }, 500);
  }
});

// Rollback endpoint (if migration fails)
app.post("/make-server-e2861589/admin/rollback-migration", async (c) => {
  try {
    console.log('🔄 [Admin] Starting rollback...');
    
    await rollback();
    
    console.log('✅ [Admin] Rollback completed!');
    return c.json({ 
      success: true,
      message: "Rollback completed. SQL tables cleared."
    });
  } catch (error) {
    console.error("❌ [Admin] Rollback failed:", error);
    return c.json({ 
      success: false,
      error: error.message
    }, 500);
  }
});
```

### **Step 2: Copy migration script**

```bash
# The migration script is already at:
/database/03_migration_script.ts

# Copy it to server directory:
cp /database/03_migration_script.ts /supabase/functions/server/migration_script.ts
```

### **Step 3: Test server starts correctly**

```bash
# Make sure server runs without errors
# Check terminal for any import errors
```

### **Step 4: Run migration**

Open browser Console (F12) and run:

```javascript
// Run migration
fetch('http://localhost:54321/functions/v1/make-server-e2861589/admin/migrate-to-sql', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Migration result:', data);
  if (data.success) {
    console.log('✅ Migration successful!');
    console.log('Migrated:', data.migrated);
  } else {
    console.error('❌ Migration failed:', data.error);
  }
});
```

### **Step 5: Verify migration**

Check Supabase Table Editor:

```
1. Go to Supabase dashboard
2. Click "Table Editor"
3. Check each table has data:
   - accounts: 58 rows
   - users: 58 rows
   - students: 50 rows
   - teachers: 4 rows
   - centers: 3 rows
   - class: 8 rows
   - class_students: Check enrollments
   - schedules: 40 rows
   - notifications: 15 rows
```

### **Step 6: Test rollback (if needed)**

If migration failed, rollback:

```javascript
fetch('http://localhost:54321/functions/v1/make-server-e2861589/admin/rollback-migration', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  }
})
.then(r => r.json())
.then(data => console.log('Rollback result:', data));
```

---

## 📍 **OPTION B: RUN MIGRATION DIRECTLY IN DENO** (Advanced)

If you prefer to run migration as a standalone script:

### **Step 1: Create standalone runner**

Create `/database/run_migration.ts`:

```typescript
import { runMigration } from '../supabase/functions/server/migration_script.ts';

// Set environment variables
Deno.env.set('SUPABASE_URL', 'https://your-project.supabase.co');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'your-service-role-key');

// Run migration
console.log('Starting migration...');
const result = await runMigration();
console.log('Migration result:', result);
```

### **Step 2: Run with Deno**

```bash
deno run --allow-net --allow-env /database/run_migration.ts
```

---

## 🔍 **VERIFICATION QUERIES**

After migration, run these queries in Supabase SQL Editor to verify data:

### **Check row counts:**

```sql
SELECT 
  'accounts' as table_name, COUNT(*) as row_count FROM accounts
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'centers', COUNT(*) FROM centers
UNION ALL
SELECT 'class', COUNT(*) FROM class
UNION ALL
SELECT 'class_students', COUNT(*) FROM class_students
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'scores', COUNT(*) FROM scores;
```

Expected output:
```
table_name      | row_count
----------------|----------
accounts        | 58
users           | 58
students        | 50
teachers        | 4
centers         | 3
class           | 8
class_students  | ~200 (depends on enrollments)
schedules       | 40
notifications   | 15
scores          | 0 (if no grades yet)
```

### **Check data integrity (foreign keys):**

```sql
-- Students without users (should be 0)
SELECT COUNT(*) as orphaned_students
FROM students s
LEFT JOIN users u ON s.id_user = u.id_user
WHERE u.id_user IS NULL;

-- Users without accounts (should be 0)
SELECT COUNT(*) as orphaned_users
FROM users u
LEFT JOIN accounts a ON u.id_account = a.id_account
WHERE a.id_account IS NULL;

-- Classes without centers (should be 0)
SELECT COUNT(*) as orphaned_classes
FROM class c
LEFT JOIN centers cen ON c.id_center = cen.id_center
WHERE cen.id_center IS NULL;
```

All should return 0.

### **Check sample data:**

```sql
-- Get a student with full info (test JOIN)
SELECT 
  s.student_code,
  u.full_name,
  u.gender,
  a.email,
  a.phone,
  s.parent_name,
  s.current_level,
  s.status
FROM students s
JOIN users u ON s.id_user = u.id_user
JOIN accounts a ON u.id_account = a.id_account
LIMIT 5;
```

Should return student data with joined information.

---

## 🐛 **TROUBLESHOOTING**

### **Error: "Missing Supabase credentials"**

**Solution:**
```bash
# Check environment variables are set:
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# If empty, set them:
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
```

### **Error: "Failed to insert accounts: duplicate key"**

**Solution:**
```sql
-- Tables already have data. Clear them first:
-- Run rollback endpoint or manually:
DELETE FROM users;
DELETE FROM accounts;
-- Then run migration again
```

### **Error: "Foreign key violation"**

**Solution:**
- Check that related records exist
- Verify ID mappings are correct
- Check migration script logic

### **Migration runs but 0 rows inserted**

**Solution:**
```javascript
// Check KV Store has data:
fetch('http://localhost:54321/functions/v1/make-server-e2861589/debug/users', {
  headers: { 'Authorization': 'Bearer YOUR_KEY' }
})
.then(r => r.json())
.then(data => console.log('KV Store users:', data.count));

// If 0, run initialization first:
localStorage.removeItem('english_complex_db_initialized');
location.reload();
```

### **Some data missing after migration**

**Possible causes:**
1. Invalid IDs in KV Store (orphaned records)
2. Data format mismatch
3. Migration script filtering out invalid data

**Solution:**
- Check migration logs for "⚠️ No X to migrate" messages
- Verify source data in KV Store
- Adjust migration script if needed

---

## 📊 **POST-MIGRATION TASKS**

After successful migration:

### **1. Backup SQL database**

```sql
-- In Supabase SQL Editor, run:
-- This creates a SQL dump you can restore later
-- (Supabase has automatic backups, but good to have your own)
```

Or use Supabase CLI:
```bash
supabase db dump -f backup.sql
```

### **2. Delete KV Store data** (optional)

If migration successful and you want to free up space:

```javascript
// Clear KV Store (CAUTION: No undo!)
fetch('http://localhost:54321/functions/v1/make-server-e2861589/admin/reset-data', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_KEY' }
});
```

### **3. Remove migration endpoints** (production)

Before deploying to production, remove these endpoints:
- `/admin/migrate-to-sql`
- `/admin/rollback-migration`

They should only be used during development/migration.

### **4. Update server code to use SQL**

Next step: Update all API endpoints to query SQL tables instead of KV Store.

---

## ✅ **SUCCESS CHECKLIST**

Migration complete when:

- [ ] All tables have expected row counts
- [ ] Foreign key checks return 0 orphaned records
- [ ] Sample JOIN queries work correctly
- [ ] Can login with existing credentials
- [ ] Backup created
- [ ] KV Store cleared (optional)
- [ ] Migration endpoints removed (for production)

---

## 🎯 **NEXT STEPS**

After migration:

1. ✅ **Update server code** → `/database/05_UPDATE_SERVER_CODE.md`
2. ✅ **Test API endpoints** → Verify CRUD operations
3. ✅ **Update frontend** → Handle new response formats (if needed)
4. ✅ **Deploy to production** → Build and upload

---

**Questions?** Check `/database/FAQ.md` or open an issue! 🚀
