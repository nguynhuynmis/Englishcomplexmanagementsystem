/**
 * MIGRATION SCRIPT: KV Store → SQL Tables
 * 
 * This script migrates data from KV Store (flat structure)
 * to normalized SQL tables in Supabase.
 * 
 * Run this AFTER:
 * 1. Creating SQL tables in Supabase
 * 2. Setting up environment variables
 * 
 * Usage:
 * - Copy this file to /supabase/functions/server/migration_script.ts
 * - Create endpoint to call migration
 * - Or run directly in Deno
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials! Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate UUID (fallback if needed)
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Hash password (basic - replace with bcrypt in production)
 */
async function hashPassword(password: string): Promise<string> {
  // TODO: Use bcrypt in production
  // For now, just mark as needs hashing
  return `temp_hash_${password}`;
}

/**
 * Log migration step
 */
function log(message: string, data?: any) {
  console.log(`[MIGRATION] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Log error
 */
function logError(message: string, error: any) {
  console.error(`[MIGRATION ERROR] ${message}`, error);
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * Step 1: Migrate class_levels (already inserted in schema)
 */
async function migrateClassLevels() {
  log('Step 1: Verifying class_levels...');
  
  const { data, error } = await supabase
    .from('class_levels')
    .select('*')
    .order('order_index');
  
  if (error) {
    throw new Error(`Failed to verify class_levels: ${error.message}`);
  }
  
  log(`✅ Found ${data.length} class levels`, data);
  return data;
}

/**
 * Step 2: Migrate accounts & users
 * 
 * KV Structure:
 * users: [{ id, username, password, fullName, role, email, phone, avatar, ... }]
 * 
 * SQL Structure:
 * accounts: [{ id_account, user_name, email, phone, password_hash, status }]
 * users: [{ id_user, id_account, full_name, role, gender, address, avatar_url }]
 */
async function migrateAccountsAndUsers() {
  log('Step 2: Migrating accounts & users...');
  
  // Get users from KV Store
  const kvUsers = await kv.get('users') || [];
  log(`Found ${kvUsers.length} users in KV Store`);
  
  const accountsData: any[] = [];
  const usersData: any[] = [];
  const userIdMapping: Record<string, string> = {}; // old_id → new_user_id
  const accountIdMapping: Record<string, string> = {}; // old_id → new_account_id
  
  for (const kvUser of kvUsers) {
    // Create account
    const accountId = generateUUID();
    accountIdMapping[kvUser.id] = accountId;
    
    accountsData.push({
      id_account: accountId,
      user_name: kvUser.username,
      email: kvUser.email || `${kvUser.username}@englishcomplex.edu.vn`,
      phone: kvUser.phone || null,
      password_hash: await hashPassword(kvUser.password || '123456'),
      status: 'active',
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Create user
    const userId = generateUUID();
    userIdMapping[kvUser.id] = userId;
    
    usersData.push({
      id_user: userId,
      id_account: accountId,
      full_name: kvUser.fullName,
      role: kvUser.role,
      gender: kvUser.gender || null,
      date_of_birth: kvUser.dateOfBirth ? new Date(kvUser.dateOfBirth) : null,
      address: kvUser.address || null,
      avatar_url: kvUser.avatar || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Insert accounts
  const { data: insertedAccounts, error: accountsError } = await supabase
    .from('accounts')
    .insert(accountsData)
    .select();
  
  if (accountsError) {
    throw new Error(`Failed to insert accounts: ${accountsError.message}`);
  }
  
  log(`✅ Inserted ${insertedAccounts.length} accounts`);
  
  // Insert users
  const { data: insertedUsers, error: usersError } = await supabase
    .from('users')
    .insert(usersData)
    .select();
  
  if (usersError) {
    throw new Error(`Failed to insert users: ${usersError.message}`);
  }
  
  log(`✅ Inserted ${insertedUsers.length} users`);
  
  return { userIdMapping, accountIdMapping };
}

/**
 * Step 3: Migrate centers
 */
async function migrateCenters(userIdMapping: Record<string, string>) {
  log('Step 3: Migrating centers...');
  
  const kvCampuses = await kv.get('campuses') || [];
  log(`Found ${kvCampuses.length} campuses in KV Store`);
  
  const centersData = kvCampuses.map((campus: any) => ({
    id_center: generateUUID(),
    name_center: campus.name,
    address: campus.address,
    phone: campus.phone || null,
    email: campus.email || null,
    id_manager: campus.managerId ? userIdMapping[campus.managerId] : null,
    status: campus.status || 'active',
    capacity: campus.capacity || 100,
    description: campus.description || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('centers')
    .insert(centersData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert centers: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} centers`);
  
  // Create mapping old_id → new_id
  const centerIdMapping: Record<string, string> = {};
  kvCampuses.forEach((campus: any, index: number) => {
    centerIdMapping[campus.id] = data[index].id_center;
  });
  
  return centerIdMapping;
}

/**
 * Step 4: Migrate students
 */
async function migrateStudents(userIdMapping: Record<string, string>) {
  log('Step 4: Migrating students...');
  
  const kvStudents = await kv.get('students') || [];
  log(`Found ${kvStudents.length} students in KV Store`);
  
  const studentsData = kvStudents.map((student: any) => ({
    id_student: generateUUID(),
    id_user: userIdMapping[student.id],
    student_code: student.code || `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    parent_name: student.parentName || null,
    parent_phone: student.parentPhone || null,
    parent_email: student.parentEmail || null,
    current_level: student.level || null,
    enrollment_date: student.enrollmentDate ? new Date(student.enrollmentDate) : new Date(),
    status: student.status || 'active',
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('students')
    .insert(studentsData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert students: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} students`);
  
  // Create mapping old_id → new_id
  const studentIdMapping: Record<string, string> = {};
  kvStudents.forEach((student: any, index: number) => {
    studentIdMapping[student.id] = data[index].id_student;
  });
  
  return studentIdMapping;
}

/**
 * Step 5: Migrate teachers
 */
async function migrateTeachers(userIdMapping: Record<string, string>) {
  log('Step 5: Migrating teachers...');
  
  const kvTeachers = await kv.get('teachers') || [];
  log(`Found ${kvTeachers.length} teachers in KV Store`);
  
  const teachersData = kvTeachers.map((teacher: any) => ({
    id_teacher: generateUUID(),
    id_user: userIdMapping[teacher.id],
    teacher_code: teacher.code || `TCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bio: teacher.bio || null,
    specialties: teacher.specialties ? teacher.specialties.split(',').map((s: string) => s.trim()) : [],
    experience_years: teacher.experienceYears || 0,
    certifications: teacher.certifications ? teacher.certifications.split(',').map((c: string) => c.trim()) : [],
    hourly_rate: teacher.hourlyRate || null,
    status: teacher.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('teachers')
    .insert(teachersData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert teachers: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} teachers`);
  
  // Create mapping old_id → new_id
  const teacherIdMapping: Record<string, string> = {};
  kvTeachers.forEach((teacher: any, index: number) => {
    teacherIdMapping[teacher.id] = data[index].id_teacher;
  });
  
  return teacherIdMapping;
}

/**
 * Step 6: Migrate classes
 */
async function migrateClasses(
  centerIdMapping: Record<string, string>,
  teacherIdMapping: Record<string, string>
) {
  log('Step 6: Migrating classes...');
  
  const kvClasses = await kv.get('classes') || [];
  log(`Found ${kvClasses.length} classes in KV Store`);
  
  // Get class_levels for mapping
  const { data: classLevels } = await supabase
    .from('class_levels')
    .select('*');
  
  const levelMapping: Record<string, string> = {};
  classLevels?.forEach((level: any) => {
    levelMapping[level.level_code] = level.id_level;
  });
  
  const classesData = kvClasses.map((cls: any) => {
    const levelId = levelMapping[cls.level] || levelMapping['6.0']; // Default to 6.0
    
    return {
      id_class: generateUUID(),
      class_code: cls.code || `CLS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name_class: cls.name,
      id_center: centerIdMapping[cls.campusId],
      id_level: levelId,
      id_teacher: cls.teacherId ? teacherIdMapping[cls.teacherId] : null,
      capacity: cls.capacity || 15,
      current_students: cls.studentIds?.length || 0,
      start_date: cls.startDate ? new Date(cls.startDate) : null,
      end_date: cls.endDate ? new Date(cls.endDate) : null,
      status: cls.status || 'ongoing',
      room: cls.room || null,
      schedule_summary: cls.schedule || null,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  const { data, error } = await supabase
    .from('class')
    .insert(classesData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert classes: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} classes`);
  
  // Create mapping old_id → new_id
  const classIdMapping: Record<string, string> = {};
  kvClasses.forEach((cls: any, index: number) => {
    classIdMapping[cls.id] = data[index].id_class;
  });
  
  return classIdMapping;
}

/**
 * Step 7: Migrate class_students (enrollments)
 */
async function migrateClassStudents(
  studentIdMapping: Record<string, string>,
  classIdMapping: Record<string, string>
) {
  log('Step 7: Migrating class_students...');
  
  const kvClasses = await kv.get('classes') || [];
  const classStudentsData: any[] = [];
  
  kvClasses.forEach((cls: any) => {
    if (cls.studentIds && Array.isArray(cls.studentIds)) {
      cls.studentIds.forEach((studentId: string) => {
        if (studentIdMapping[studentId] && classIdMapping[cls.id]) {
          classStudentsData.push({
            id_student: studentIdMapping[studentId],
            id_class: classIdMapping[cls.id],
            enrollment_date: new Date(),
            academic_year: new Date().getFullYear().toString(),
            period_data: 'Q1',
            status: 'enrolled',
            final_grade: null,
            attendance_rate: null,
            note: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
    }
  });
  
  if (classStudentsData.length === 0) {
    log('⚠️ No class enrollments to migrate');
    return;
  }
  
  const { data, error } = await supabase
    .from('class_students')
    .insert(classStudentsData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert class_students: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} class enrollments`);
}

/**
 * Step 8: Migrate schedules
 */
async function migrateSchedules(classIdMapping: Record<string, string>) {
  log('Step 8: Migrating schedules...');
  
  const kvSchedules = await kv.get('schedules') || [];
  log(`Found ${kvSchedules.length} schedules in KV Store`);
  
  const schedulesData = kvSchedules.map((schedule: any, index: number) => ({
    id_schedule: generateUUID(),
    id_class: classIdMapping[schedule.classId],
    session_number: index + 1,
    session_date: new Date(schedule.date),
    start_time: schedule.startTime || '08:00:00',
    end_time: schedule.endTime || '10:00:00',
    topic: schedule.topic || null,
    lesson_plan: null,
    required_materials: null,
    homework_assigned: null,
    is_cancelled: schedule.status === 'cancelled',
    cancellation_reason: schedule.cancellationReason || null,
    actual_start_time: null,
    actual_end_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })).filter((s: any) => s.id_class); // Filter out schedules without valid class mapping
  
  if (schedulesData.length === 0) {
    log('⚠️ No schedules to migrate');
    return;
  }
  
  const { data, error } = await supabase
    .from('schedules')
    .insert(schedulesData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert schedules: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} schedules`);
}

/**
 * Step 9: Migrate notifications
 */
async function migrateNotifications(userIdMapping: Record<string, string>) {
  log('Step 9: Migrating notifications...');
  
  const kvNotifications = await kv.get('notifications') || [];
  log(`Found ${kvNotifications.length} notifications in KV Store`);
  
  const notificationsData = kvNotifications.map((notif: any) => ({
    id_notification: generateUUID(),
    title: notif.title,
    content: notif.message || notif.content,
    notification_type: notif.type || 'announcement',
    priority: notif.priority || 'normal',
    target_role: notif.role || null,
    target_class: null,
    target_user: notif.userId ? userIdMapping[notif.userId] : null,
    id_creator: null,
    is_read: notif.read || false,
    read_at: notif.read ? new Date() : null,
    expires_at: null,
    created_at: new Date(notif.date || Date.now()).toISOString()
  }));
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationsData)
    .select();
  
  if (error) {
    throw new Error(`Failed to insert notifications: ${error.message}`);
  }
  
  log(`✅ Inserted ${data.length} notifications`);
}

/**
 * Step 10: Migrate other collections (grades, documents, etc.)
 */
async function migrateOtherCollections(
  studentIdMapping: Record<string, string>,
  classIdMapping: Record<string, string>
) {
  log('Step 10: Migrating other collections...');
  
  // Grades
  const kvGrades = await kv.get('grades') || [];
  if (kvGrades.length > 0) {
    log(`Migrating ${kvGrades.length} grades...`);
    const gradesData = kvGrades.map((grade: any) => ({
      id_score: generateUUID(),
      id_student: studentIdMapping[grade.studentId],
      id_class: classIdMapping[grade.classId],
      exam_type: grade.examType || 'quiz',
      exam_date: new Date(grade.date || Date.now()),
      score_listening: grade.listening || null,
      score_reading: grade.reading || null,
      score_writing: grade.writing || null,
      score_speaking: grade.speaking || null,
      overall_score: grade.overall || grade.score || null,
      id_grader: null,
      feedback: grade.feedback || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })).filter((g: any) => g.id_student && g.id_class);
    
    if (gradesData.length > 0) {
      const { data, error } = await supabase.from('scores').insert(gradesData);
      if (error) logError('Failed to insert grades', error);
      else log(`✅ Inserted ${gradesData.length} grades`);
    }
  }
  
  // Documents/Materials
  const kvDocuments = await kv.get('documents') || [];
  if (kvDocuments.length > 0) {
    log(`Migrating ${kvDocuments.length} documents...`);
    // Similar mapping for materials table
    // TODO: Implement if needed
  }
  
  // Assignments
  const kvAssignments = await kv.get('assignments') || [];
  if (kvAssignments.length > 0) {
    log(`Migrating ${kvAssignments.length} assignments...`);
    // Similar mapping for assignments table
    // TODO: Implement if needed
  }
  
  log('✅ Finished migrating other collections');
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

export async function runMigration() {
  console.log('='.repeat(60));
  console.log('STARTING DATABASE MIGRATION');
  console.log('KV Store → SQL Tables');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Verify class_levels
    await migrateClassLevels();
    
    // Step 2: Migrate accounts & users
    const { userIdMapping, accountIdMapping } = await migrateAccountsAndUsers();
    
    // Step 3: Migrate centers
    const centerIdMapping = await migrateCenters(userIdMapping);
    
    // Step 4: Migrate students
    const studentIdMapping = await migrateStudents(userIdMapping);
    
    // Step 5: Migrate teachers
    const teacherIdMapping = await migrateTeachers(userIdMapping);
    
    // Step 6: Migrate classes
    const classIdMapping = await migrateClasses(centerIdMapping, teacherIdMapping);
    
    // Step 7: Migrate class_students
    await migrateClassStudents(studentIdMapping, classIdMapping);
    
    // Step 8: Migrate schedules
    await migrateSchedules(classIdMapping);
    
    // Step 9: Migrate notifications
    await migrateNotifications(userIdMapping);
    
    // Step 10: Migrate other collections
    await migrateOtherCollections(studentIdMapping, classIdMapping);
    
    console.log('='.repeat(60));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    // Return summary
    return {
      success: true,
      migrated: {
        accounts: Object.keys(accountIdMapping).length,
        users: Object.keys(userIdMapping).length,
        students: Object.keys(studentIdMapping).length,
        teachers: Object.keys(teacherIdMapping).length,
        classes: Object.keys(classIdMapping).length,
        centers: Object.keys(centerIdMapping).length
      }
    };
    
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ MIGRATION FAILED!');
    console.error('='.repeat(60));
    logError('Migration error', error);
    throw error;
  }
}

// ============================================
// ROLLBACK FUNCTION (if migration fails)
// ============================================

export async function rollback() {
  log('🔄 Rolling back migration...');
  
  const tables = [
    'system_logs',
    'notifications',
    'feedbacks',
    'scores',
    'assignment_submissions',
    'assignments',
    'materials',
    'schedules',
    'class_students',
    'class',
    'teachers',
    'students',
    'centers',
    'role_permissions',
    'account_roles',
    'permissions',
    'roles',
    'users',
    'accounts'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        logError(`Failed to clear ${table}`, error);
      } else {
        log(`✅ Cleared ${table}`);
      }
    } catch (error) {
      logError(`Error clearing ${table}`, error);
    }
  }
  
  log('✅ Rollback complete');
}
