# 🚀 DATABASE MIGRATION: START HERE

## 🎯 **GOAL**

Migrate English Complex from **KV Store** (flat structure) to **SQL Tables** (normalized schema) based on your ERD design.

---

## 📋 **WHAT YOU CHOSE**

✅ **APPROACH 2: Create Real SQL Tables in Supabase**

**Why this is better:**
- ✅ True relational database
- ✅ Foreign key constraints
- ✅ JOIN queries
- ✅ Better performance
- ✅ Production-ready

---

## 📁 **FILES CREATED**

I've created a complete migration package for you:

```
/database/
├── 00_START_HERE.md           ← YOU ARE HERE
├── 01_CREATE_TABLES.sql       ← SQL script (20 tables)
├── 02_SETUP_GUIDE.md          ← Setup instructions
├── 03_migration_script.ts     ← Data migration code
├── 04_MIGRATION_GUIDE.md      ← Migration instructions
└── 05_UPDATE_SERVER_CODE.md   ← (Next step - coming soon)
```

---

## 🗺️ **MIGRATION ROADMAP**

Follow these steps IN ORDER:

### **PHASE 1: SETUP SUPABASE** (30 mins)

**File:** `/database/02_SETUP_GUIDE.md`

```
Step 1: Access Supabase SQL Editor
Step 2: Run /database/01_CREATE_TABLES.sql
Step 3: Verify 20 tables created
Step 4: Get Supabase credentials
Step 5: Setup RLS (optional)
Step 6: Test database
```

**Output:**
- ✅ 20 SQL tables created
- ✅ Foreign keys configured
- ✅ Indexes created
- ✅ Triggers working
- ✅ Credentials saved

---

### **PHASE 2: MIGRATE DATA** (10 mins)

**File:** `/database/04_MIGRATION_GUIDE.md`

```
Step 1: Add migration endpoint to server
Step 2: Copy migration script
Step 3: Test server starts
Step 4: Run migration via API
Step 5: Verify data in Supabase
Step 6: Rollback if needed
```

**Output:**
- ✅ 58 users migrated → accounts + users
- ✅ 50 students migrated
- ✅ 4 teachers migrated
- ✅ 3 campuses migrated → centers
- ✅ 8 classes migrated
- ✅ Enrollments migrated → class_students
- ✅ 40 schedules migrated
- ✅ 15 notifications migrated

---

### **PHASE 3: UPDATE SERVER CODE** (3-4 hours)

**File:** `/database/05_UPDATE_SERVER_CODE.md` (I'll create this next)

```
Step 1: Install Supabase client
Step 2: Replace kv.get() with SQL queries
Step 3: Update all API endpoints
Step 4: Add proper error handling
Step 5: Test endpoints
```

**Output:**
- ✅ All endpoints use SQL queries
- ✅ Proper JOIN queries implemented
- ✅ Foreign key validation
- ✅ Better error messages

---

### **PHASE 4: UPDATE FRONTEND** (1-2 hours)

```
Step 1: Test API responses
Step 2: Update data models (if needed)
Step 3: Fix any breaking changes
Step 4: Test all features
```

**Output:**
- ✅ All features working with SQL backend
- ✅ No breaking changes
- ✅ Better performance

---

### **PHASE 5: DEPLOYMENT** (30 mins)

```
Step 1: Remove migration endpoints
Step 2: Remove debug endpoints
Step 3: Build production bundle
Step 4: Deploy to hosting
Step 5: Test production
```

**Output:**
- ✅ Production app running
- ✅ SQL database connected
- ✅ All features working

---

## ⏱️ **TOTAL TIME ESTIMATE**

| Phase | Time | Can skip? |
|-------|------|-----------|
| Phase 1: Setup Supabase | 30 mins | ❌ Required |
| Phase 2: Migrate Data | 10 mins | ❌ Required |
| Phase 3: Update Server | 3-4 hours | ❌ Required |
| Phase 4: Update Frontend | 1-2 hours | ⚠️ Maybe (depends on breaking changes) |
| Phase 5: Deployment | 30 mins | ⚠️ When ready |
| **TOTAL** | **~6 hours** | |

---

## 🎬 **QUICK START (TL;DR)**

```bash
# 1. Setup Supabase (30 mins)
→ Open /database/02_SETUP_GUIDE.md
→ Follow steps 1-6
→ Save SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# 2. Migrate Data (10 mins)
→ Open /database/04_MIGRATION_GUIDE.md
→ Follow steps 1-6
→ Verify data in Supabase Table Editor

# 3. Update Server Code (3-4 hours)
→ Wait for next file: /database/05_UPDATE_SERVER_CODE.md
→ I'll create this after you complete Phase 1 & 2

# 4. Test & Deploy
→ Test all features
→ Build production
→ Deploy
```

---

## 📊 **WHAT'S MIGRATED**

### **Current (KV Store):**

```
kv_store_e2861589 (1 table)
├─ "users" → [58 objects]
├─ "students" → [50 objects]
├─ "teachers" → [4 objects]
├─ "campuses" → [3 objects]
├─ "classes" → [8 objects]
├─ "schedules" → [40 objects]
└─ "notifications" → [15 objects]
```

### **After Migration (SQL):**

```
20 Tables (normalized)
├─ accounts (58 rows)
├─ users (58 rows)
├─ students (50 rows)
├─ teachers (4 rows)
├─ centers (3 rows)
├─ class (8 rows)
├─ class_students (~200 rows)
├─ class_levels (4 rows)
├─ schedules (40 rows)
├─ notifications (15 rows)
├─ materials (0 rows - ready for use)
├─ assignments (0 rows - ready for use)
├─ assignment_submissions (0 rows)
├─ scores (0 rows - ready for use)
├─ feedbacks (0 rows - ready for use)
├─ roles (0 rows - ready for RBAC)
├─ account_roles (0 rows)
├─ permissions (0 rows)
├─ role_permissions (0 rows)
└─ system_logs (0 rows - ready for audit)
```

---

## ⚠️ **IMPORTANT NOTES**

### **1. Backup First!**

```javascript
// Before starting, backup current KV Store:
// The migration script preserves KV Store data
// But good to have a backup just in case!

// Export current data (in browser console):
const backup = {
  users: await (await fetch('/debug/users')).json(),
  // ... other collections
};
console.log('Backup:', JSON.stringify(backup));
// Copy and save to file
```

### **2. Passwords Will Need Rehashing**

The migration script uses temporary hashes:
```typescript
password_hash: `temp_hash_${password}`
```

**TODO after migration:**
- Install bcrypt: `npm install bcrypt`
- Update login endpoint to use bcrypt.compare()
- User should change passwords on first login

### **3. Some Data May Not Migrate**

If KV Store has invalid/orphaned data:
- Records with missing foreign keys will be skipped
- Check migration logs for warnings
- You can manually fix these later

### **4. Test Thoroughly**

After migration:
- [ ] Test login with existing credentials
- [ ] Test CRUD operations
- [ ] Test class enrollments
- [ ] Test schedules
- [ ] Test all modules

---

## 🆘 **IF SOMETHING GOES WRONG**

### **Migration failed?**

```javascript
// Run rollback endpoint:
fetch('/admin/rollback-migration', { 
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_KEY' }
});

// This clears all SQL tables (but keeps schema)
// Then you can fix issues and retry
```

### **Can't access Supabase?**

- Check credentials are correct
- Check Supabase project is active
- Check internet connection
- Check Supabase status page

### **Data looks wrong?**

```sql
-- Check specific table in SQL Editor:
SELECT * FROM students LIMIT 10;

-- Check foreign keys:
SELECT 
  s.student_code,
  u.full_name,
  a.email
FROM students s
LEFT JOIN users u ON s.id_user = u.id_user
LEFT JOIN accounts a ON u.id_account = a.id_account
WHERE u.id_user IS NULL OR a.id_account IS NULL;
-- Should return 0 rows
```

### **Need to start over?**

```sql
-- Drop all tables and recreate:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run 01_CREATE_TABLES.sql again
```

---

## ✅ **BEFORE YOU START CHECKLIST**

- [ ] I understand this will take ~6 hours total
- [ ] I have access to Supabase dashboard
- [ ] I have ~30 minutes now for Phase 1 (setup)
- [ ] I backed up current data (optional but recommended)
- [ ] I'm ready to test thoroughly after migration
- [ ] I understand passwords will need rehashing
- [ ] I'm OK with some manual cleanup if needed

---

## 🚦 **READY TO START?**

### **Step 1: Open Setup Guide**

```bash
→ Open: /database/02_SETUP_GUIDE.md
→ Follow all steps carefully
→ Come back here when done
```

### **Step 2: Let me know when done**

After completing Phase 1:
```
→ Reply: "Phase 1 complete! Ready for Phase 2"
→ I'll guide you through migration
```

After completing Phase 2:
```
→ Reply: "Phase 2 complete! Migration successful"
→ I'll create Phase 3 guide (Update Server Code)
```

---

## 📞 **QUESTIONS?**

Before starting, if you have questions:

- ❓ "How long will this take?" → ~6 hours total
- ❓ "Is my data safe?" → Yes, migration doesn't delete KV Store
- ❓ "Can I rollback?" → Yes, rollback endpoint provided
- ❓ "Will app break?" → No if you follow all steps
- ❓ "Do I need SQL knowledge?" → No, scripts provided
- ❓ "Can I do this in parts?" → Yes, pause after each phase

**Other questions?** Just ask! 🚀

---

## 🎉 **LET'S DO THIS!**

**Your next action:**

```
1. Open /database/02_SETUP_GUIDE.md
2. Follow steps 1-6 (30 mins)
3. Reply when done: "Phase 1 complete!"
```

**Good luck!** 💪
