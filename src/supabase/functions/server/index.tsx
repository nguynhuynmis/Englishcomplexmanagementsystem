import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateNextId, formatId } from "./id-generator.tsx";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role key (for admin operations)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Retry helper for race condition handling
 * Retries a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 100
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a duplicate key error (23505)
      if (error.code === '23505' && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⚠️ [RETRY] Duplicate key detected, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a duplicate key error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Map frontend status to database status
 * Frontend: 'active', 'completed', 'inactive'
 * Database: 'ongoing', 'completed', 'scheduled', 'cancelled'
 */
function mapStatusToDb(frontendStatus: string): string {
  switch (frontendStatus) {
    case 'active':
      return 'ongoing';
    case 'completed':
      return 'completed';
    case 'inactive':
      return 'scheduled';
    default:
      return 'scheduled';
  }
}

/**
 * Map database status to frontend status
 * Database: 'ongoing', 'completed', 'scheduled', 'cancelled'
 * Frontend: 'active', 'completed', 'inactive'
 */
function mapStatusToFrontend(dbStatus: string): string {
  switch (dbStatus) {
    case 'ongoing':
      return 'active';
    case 'completed':
      return 'completed';
    case 'scheduled':
      return 'inactive';
    case 'cancelled':
      return 'inactive';
    default:
      return 'inactive';
  }
}

/**
 * Generate batch IDs for schedule table
 * @param count - Number of IDs to generate
 * @returns Array of schedule IDs (e.g., ['TKB001', 'TKB002', ...])
 */
async function generateScheduleIds(count: number): Promise<string[]> {
  if (count === 0) return [];
  
  const prefix = 'TKB';
  
  // Get current max ID
  const { data, error } = await supabase
    .from('schedule')
    .select('id_schedule')
    .order('id_schedule', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastId = data[0].id_schedule;
    const numberPart = lastId.replace(/\D/g, '');
    nextNumber = parseInt(numberPart || '0') + 1;
  }
  
  // Generate array of IDs
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const paddedNumber = String(nextNumber + i).padStart(3, '0');
    ids.push(`${prefix}${paddedNumber}`);
  }
  
  return ids;
}

/**
 * Generate schedule records from schedule string
 * @param scheduleStr - Format: "Thứ 2: 18:00-20:00, Thứ 4: 18:00-20:00"
 * @param classId - Class ID
 * @param weeksAhead - Number of weeks to generate (default: 8)
 * @returns Array of schedule records to insert
 */
async function generateScheduleRecords(scheduleStr: string, classId: string, weeksAhead: number = 8) {
  if (!scheduleStr || scheduleStr.trim() === '') return [];
  
  // Map Vietnamese day names to JS day numbers (0=Sunday, 1=Monday, etc.)
  const dayMap: Record<string, number> = {
    'Chủ nhật': 0,
    'Chủ Nhật': 0,
    'Thứ 2': 1,
    'Thứ 3': 2,
    'Thứ 4': 3,
    'Thứ 5': 4,
    'Thứ 6': 5,
    'Thứ 7': 6,
  };
  
  const schedules: any[] = [];
  const today = new Date();
  
  // Parse schedule string
  const items = scheduleStr.split(',').map(s => s.trim());
  
  for (const item of items) {
    // ✅ Fix: Only split at FIRST colon to avoid splitting time ranges
    const colonIndex = item.indexOf(':');
    if (colonIndex === -1) continue;
    
    const dayStr = item.substring(0, colonIndex).trim();
    const timeRange = item.substring(colonIndex + 1).trim();
    if (!timeRange) continue;
    
    const [startTime, endTime] = timeRange.split('-').map(s => s.trim());
    const dayNum = dayMap[dayStr];
    
    if (dayNum === undefined) {
      console.warn(`⚠️ Unknown day: ${dayStr}`);
      continue;
    }
    
    // Generate dates for next N weeks
    for (let week = 0; week < weeksAhead; week++) {
      const targetDate = new Date(today);
      const daysUntilTarget = (dayNum - today.getDay() + 7) % 7;
      targetDate.setDate(today.getDate() + daysUntilTarget + (week * 7));
      
      // Format as YYYY-MM-DD
      const sessionDate = targetDate.toISOString().split('T')[0];
      
      schedules.push({
        id_class: classId,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        topic: '',
        required_materials: '',
        is_cancelled: false
      });
    }
  }
  
  // ✅ Generate batch IDs for all schedule records
  const scheduleIds = await generateScheduleIds(schedules.length);
  
  // ✅ Add id_schedule to each record
  const schedulesWithIds = schedules.map((schedule, index) => ({
    id_schedule: scheduleIds[index],
    ...schedule
  }));
  
  return schedulesWithIds;
}

// DEPRECATED: Old ID generation functions - now using generateNextId from id-generator.tsx
// These are kept for reference but should not be used in new code

// ========================================
// AUTHENTICATION & USERS
// ========================================

// Login endpoint
app.post("/make-server-e2861589/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    console.log('🔐 [Server] Login attempt:', { username, password });
    
    // Query accounts table for user
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_name', username)
      .eq('password_hash', password);
    
    console.log('🔍 [Server] Account query result:', { accounts, error: accountError });
    
    if (accountError) {
      console.error('❌ [Server] Account query error:', accountError);
      return c.json({ error: "Lỗi truy vấn database" }, 500);
    }
    
    if (!accounts || accounts.length === 0) {
      console.log('❌ [Server] No account found with username:', username);
      return c.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, 401);
    }
    
    const account = accounts[0];
    console.log('✅ [Server] Account found:', account.id_account);
    
    // Update last login
    await supabase
      .from('accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id_account', account.id_account);
    
    // Get role from account_roles → roles
    const { data: accountRoles, error: roleError } = await supabase
      .from('account_roles')
      .select(`
        id_role,
        roles!id_role (
          name
        )
      `)
      .eq('id_account', account.id_account)
      .single();
    
    console.log('🔍 [Server] Role query result:', { accountRoles, error: roleError });
    
    // Get role name and convert to lowercase
    const roleName = accountRoles?.roles?.name?.toLowerCase() || 'user';
    
    console.log('🎭 [Server] Final role name (lowercase):', roleName);
    
    // Get user info (optional - for full_name, avatar, etc.)
    const { data: users } = await supabase
      .from('user')
      .select('*')
      .eq('id_account', account.id_account);
    
    const user = users && users.length > 0 ? users[0] : null;
    console.log('👤 [Server] User record:', user ? `Found: ${user.id_user}` : 'Not found');
    
    // Get code and role-specific ID based on role
    let code = null;
    let teacherId = null;
    let studentId = null;
    
    if (roleName === 'student') {
      console.log('🔍 [Server] Looking for student with id_user:', user?.id_user);
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id_student')
        .eq('id_user', user?.id_user)
        .single();
      
      console.log('🔍 [Server] Student query result:', { student, error: studentError });
      
      if (studentError) {
        console.error('❌ [Server] Student query error:', studentError);
      }
      
      // Use id_student as code (e.g., HV001)
      code = student?.id_student;
      studentId = student?.id_student;
      console.log('📝 [Server] Student code:', code, 'ID:', studentId);
    } else if (roleName === 'teacher') {
      console.log('🔍 [Server] Looking for teacher with id_user:', user?.id_user);
      console.log('🔍 [Server] User id_user type:', typeof user?.id_user);
      
      // 🔍 DIAGNOSTIC: Get all teachers to see structure and find match
      const { data: allTeachers, error: allTeachersError } = await supabase
        .from('teachers')
        .select('*');
      
      console.log('🔍 [DIAGNOSTIC] All teachers in database:', allTeachers);
      console.log('🔍 [DIAGNOSTIC] Number of teachers:', allTeachers?.length || 0);
      
      if (allTeachers && allTeachers.length > 0) {
        console.log('🔍 [DIAGNOSTIC] First teacher columns:', Object.keys(allTeachers[0]));
        console.log('🔍 [DIAGNOSTIC] First teacher data:', allTeachers[0]);
        
        // Try to find teacher by matching id_user
        const matchedTeacher = allTeachers.find(t => {
          console.log(`🔍 [MATCH] Comparing t.id_user (${t.id_user}) with user.id_user (${user?.id_user})`);
          return t.id_user === user?.id_user;
        });
        
        console.log('🔍 [DIAGNOSTIC] Matched teacher:', matchedTeacher);
        
        if (matchedTeacher) {
          code = matchedTeacher.id_teacher;
          teacherId = matchedTeacher.id_teacher;
          console.log('✅ [Server] Found teacher by manual match!');
          console.log('📝 [Server] Teacher code:', code, 'ID:', teacherId);
        } else {
          console.warn('⚠️ [Server] No teacher found matching id_user:', user?.id_user);
          console.warn('⚠️ [Server] Available id_user values in teachers:', allTeachers.map(t => t.id_user));
        }
      }
      
      // Fallback: Try original query method
      if (!teacherId) {
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id_teacher')
          .eq('id_user', user?.id_user)
          .single();
        
        console.log('🔍 [Server] Fallback query result:', { teacher, error: teacherError });
        
        if (teacher) {
          code = teacher.id_teacher;
          teacherId = teacher.id_teacher;
        } else if (teacherError) {
          console.error('❌ [Server] Teacher query error:', teacherError);
        }
      }
      
      console.log('📝 [Server] Final Teacher code:', code, 'ID:', teacherId);
      console.log('📝 [Server] Teacher ID type:', typeof teacherId);
    } else {
      console.log('⚠️ [Server] Role is neither student nor teacher:', roleName);
    }
    
    // Return user data (matching old format for frontend compatibility)
    const userData = {
      id: user?.id_user || account.id_account,
      username: account.user_name,
      fullName: user?.full_name || account.user_name,
      role: roleName, // ← Role from account_roles → roles table
      email: account.email,
      phone: account.phone,
      avatar: user?.avatar_url || null,
      code: code,
      teacherId: teacherId || '', // ✅ Always return string, not null
      studentId: studentId || ''  // ✅ Always return string, not null
    };
    
    console.log('✅ [Server] Login successful, returning userData:');
    console.log('   - id:', userData.id);
    console.log('   - role:', userData.role);
    console.log('   - code:', userData.code);
    console.log('   - teacherId:', userData.teacherId, `(type: ${typeof userData.teacherId})`);
    console.log('   - studentId:', userData.studentId, `(type: ${typeof userData.studentId})`);
    
    return c.json({ user: userData });
  } catch (error) {
    console.error("❌ [Server] Login error:", error);
    return c.json({ error: "Đã xảy ra lỗi khi đăng nhập" }, 500);
  }
});

// Change password endpoint
app.post("/make-server-e2861589/auth/change-password", async (c) => {
  try {
    console.log('🔐 [Server] Change password request received');
    const { userId, oldPassword, newPassword } = await c.req.json();
    console.log('🔐 [Server] UserId:', userId);
    
    // Find user's account
    const { data: user } = await supabase
      .from('user')
      .select('id_account')
      .eq('id_user', userId)
      .single();
    
    if (!user) {
      console.error('❌ [Server] User not found:', userId);
      return c.json({ success: false, message: "Không tìm thấy người dùng" }, 404);
    }
    
    // Check old password
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('id_account', user.id_account)
      .eq('password_hash', oldPassword)
      .single();
    
    if (!account) {
      console.error('❌ [Server] Wrong old password for user:', userId);
      return c.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, 401);
    }
    
    // Update password
    const { error } = await supabase
      .from('accounts')
      .update({ password_hash: newPassword })
      .eq('id_account', user.id_account);
    
    if (error) throw error;
    
    console.log('✅ [Server] Password changed successfully for user:', userId);
    return c.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("❌ [Server] Change password error:", error);
    return c.json({ success: false, message: "Đã xảy ra lỗi khi đổi mật khẩu" }, 500);
  }
});

// Forgot password - Send reset code
app.post("/make-server-e2861589/auth/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!account) {
      return c.json({ error: "Email không tồn tại trong hệ thống" }, 404);
    }
    
    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in system_logs (temporary solution)
    await supabase
      .from('system_logs')
      .insert({
        id_account: account.id_account,
        action: 'password_reset_code',
        details: JSON.stringify({ code: resetCode, expiry: Date.now() + 15 * 60 * 1000 })
      });
    
    // In real app, send email. For now, return code (development only)
    return c.json({ 
      message: "Mã xác thực đã được gửi đến email của bạn",
      resetCode // Remove in production
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Reset password with code
app.post("/make-server-e2861589/auth/reset-password", async (c) => {
  try {
    const { email, code, newPassword } = await c.req.json();
    
    // Get account
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!account) {
      return c.json({ error: "Email không tồn tại" }, 404);
    }
    
    // Verify code from system_logs
    const { data: logs } = await supabase
      .from('system_logs')
      .select('*')
      .eq('id_account', account.id_account)
      .eq('action', 'password_reset_code')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!logs || logs.length === 0) {
      return c.json({ error: "Mã xác thực không hợp lệ" }, 400);
    }
    
    const logDetails = JSON.parse(logs[0].details);
    
    if (logDetails.code !== code) {
      return c.json({ error: "Mã xác thực không đúng" }, 400);
    }
    
    if (Date.now() > logDetails.expiry) {
      return c.json({ error: "Mã xác thực đã hết hạn" }, 400);
    }
    
    // Update password
    await supabase
      .from('accounts')
      .update({ password_hash: newPassword })
      .eq('id_account', account.id_account);
    
    return c.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// STUDENTS APIs
// ========================================
// NOTE: POST/PUT/DELETE endpoints for /students are DEPRECATED
// Use /users endpoint instead for creating/updating students
// These endpoints are kept for backward compatibility but may have issues

app.get("/make-server-e2861589/students", async (c) => {
  try {
    console.log('📚 [Server] GET /students - Start');
    
    // Step 1: Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (studentsError) {
      console.error('❌ [Server] Students query error:', studentsError);
      throw studentsError;
    }
    
    console.log('📝 [Server] Found students:', students?.length || 0);
    
    if (!students || students.length === 0) {
      return c.json({ students: [] }); // ✅ FIX: Wrap in object
    }
    
    // Step 2: Get all users for these students
    const userIds = students.map(s => s.id_user).filter(Boolean);
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .in('id_user', userIds);
    
    if (usersError) {
      console.error('❌ [Server] Users query error:', usersError);
      throw usersError;
    }
    
    console.log('👤 [Server] Found users:', users?.length || 0);
    
    // Step 3: Get all accounts for these users
    const accountIds = users?.map(u => u.id_account).filter(Boolean) || [];
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id_account', accountIds);
    
    if (accountsError) {
      console.error('❌ [Server] Accounts query error:', accountsError);
      throw accountsError;
    }
    
    console.log('🔐 [Server] Found accounts:', accounts?.length || 0);
    
    // Step 4: Get class enrollments for students
    const studentIds = students.map(s => s.id_student).filter(Boolean);
    const { data: classStudents, error: classStudentsError } = await supabase
      .from('class_students')
      .select('id_students, id_class')
      .in('id_students', studentIds);
    
    if (classStudentsError) {
      console.error('❌ [Server] Class students query error:', classStudentsError);
    }
    
    console.log('🏫 [Server] Found class enrollments:', classStudents?.length || 0);
    
    // Step 5: Get classes and centers
    const classIds = [...new Set(classStudents?.map(cs => cs.id_class).filter(Boolean) || [])];
    const { data: classesData, error: classesError } = await supabase
      .from('class')
      .select('id_class, name_class, id_center')
      .in('id_class', classIds);
    
    if (classesError) {
      console.error('❌ [Server] Classes query error:', classesError);
    }
    
    const centerIds = [...new Set(classesData?.map(cl => cl.id_center).filter(Boolean) || [])];
    const { data: centersData, error: centersError } = await supabase
      .from('centers')
      .select('id_center, name')
      .in('id_center', centerIds);
    
    if (centersError) {
      console.error('❌ [Server] Centers query error:', centersError);
    }
    
    console.log('🏢 [Server] Found centers:', centersData?.length || 0);
    
    // Step 6: Merge data
    const transformed = students.map(s => {
      const user = users?.find(u => u.id_user === s.id_user);
      const account = accounts?.find(a => a.id_account === user?.id_account);
      
      // Get student's class (take first one if multiple)
      const studentClass = classStudents?.find(cs => cs.id_students === s.id_student);
      const classData = classesData?.find(cl => cl.id_class === studentClass?.id_class);
      const centerData = centersData?.find(ct => ct.id_center === classData?.id_center);
      
      return {
        id: s.id_student,
        code: s.id_student, // Use the VARCHAR ID directly (HV001, HV002, etc.)
        fullName: user?.full_name || '',
        username: account?.user_name || '',
        email: account?.email || '',
        phone: account?.phone || '',
        dateOfBirth: user?.dob || '', // dob is in user table, not students table
        gender: user?.gender || '',
        address: user?.address || '',
        parentName: s.parent_name || '',
        parentPhone: s.parent_phone || '',
        level: s.level || 'Beginner',
        campus: centerData?.name || null, // Get from class -> center (null if no class)
        currentClass: classData?.name_class || '',
        status: account?.status === 1 ? 'active' : 'inactive', // Convert 1/0 to string
        avatar: user?.avatar_url || null,
        school: '' // Placeholder for school field
      };
    });
    
    console.log('✅ [Server] GET /students - Success, returning', transformed.length, 'records');
    return c.json({ students: transformed });
  } catch (error) {
    console.error("❌ [Server] Get students error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách học sinh" }, 500);
  }
});

// Get students without class (available for enrollment)
app.get("/make-server-e2861589/students/available", async (c) => {
  try {
    console.log('📚 [Server] GET /students/available - Start');
    
    // Get all students who are NOT in class_students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        user:id_user (
          id_user,
          full_name,
          id_account,
          accounts:id_account (
            email,
            phone
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (studentsError) {
      console.error('❌ [Server] Students query error:', studentsError);
      throw studentsError;
    }
    
    if (!students || students.length === 0) {
      return c.json({ students: [] });
    }
    
    // Get all enrolled student IDs from class_students table
    const { data: enrolledStudents, error: enrolledError } = await supabase
      .from('class_students')
      .select('id_students');
    
    if (enrolledError) {
      console.error('❌ [Server] Enrolled students query error:', enrolledError);
      throw enrolledError;
    }
    
    const enrolledIds = new Set(enrolledStudents?.map(e => e.id_students) || []);
    console.log('🎓 [Server] Found enrolled student IDs:', enrolledIds.size);
    
    // Filter out enrolled students
    const availableStudents = students.filter(s => !enrolledIds.has(s.id_student));
    console.log('✅ [Server] Found available students:', availableStudents.length);
    
    // Transform to frontend format
    const transformed = availableStudents.map(s => ({
      id: s.id_student,
      code: s.id_student, // Student ID serves as code
      fullName: s.user?.full_name || '',
      email: s.user?.accounts?.email || '',
      phone: s.user?.accounts?.phone || '',
      currentClass: null, // No class for available students
      status: 'active'
    }));
    
    return c.json({ students: transformed });
  } catch (error) {
    console.error("❌ [Server] Get available students error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách học viên" }, 500);
  }
});

app.post("/make-server-e2861589/students", async (c) => {
  try {
    const studentData = await c.req.json();
    
    // Create account first
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_name: studentData.email.split('@')[0],
        email: studentData.email,
        phone: studentData.phone,
        password_hash: '123456', // Default password
        status: 1 // 1 = active, 0 = inactive
      })
      .select()
      .single();
    
    if (accountError) throw accountError;
    
    // Get "Student" role ID
    const { data: studentRole } = await supabase
      .from('roles')
      .select('id_role')
      .eq('name', 'Student')
      .single();
    
    if (!studentRole) {
      throw new Error('Student role not found in roles table');
    }
    
    // Create account_roles entry
    await supabase
      .from('account_roles')
      .insert({
        id_account: account.id_account,
        id_role: studentRole.id_role
      });
    
    // Create user (NO role column!)
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        id_account: account.id_account,
        full_name: studentData.fullName || studentData.name, // Accept both formats
        dob: studentData.dob || studentData.dateOfBirth, // dob belongs to user table
        gender: studentData.gender,
        address: studentData.address,
        avatar_url: studentData.avatar
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Generate student code
    const code = await generateStudentCode();
    
    // Create student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        user: user.id_user,
        code: code,
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        level: studentData.level
        // Note: dob is in user table, not students
      })
      .select()
      .single();
    
    if (studentError) throw studentError;
    
    return c.json({ 
      id: student.id_student,
      code: code,
      ...studentData
    });
  } catch (error) {
    console.error("Create student error:", error);
    return c.json({ error: "Lỗi khi tạo học sinh" }, 500);
  }
});

app.put("/make-server-e2861589/students/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const studentData = await c.req.json();
    
    console.log('✏️ [Server] PUT /students/:id - Start, ID:', id);
    console.log('📝 [Server] Student data:', studentData);
    
    // Get student to find user_id and account_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id_user, user!inner(id_account)')
      .eq('id_student', id)
      .single();
    
    console.log('🔍 [Server] Student query result:', { student, error: studentError });
    
    if (studentError || !student) {
      console.error('❌ [Server] Student not found:', studentError);
      return c.json({ error: "Không tìm thấy học sinh" }, 404);
    }
    
    const userId = student.id_user;
    const accountId = student.user?.id_account;
    
    console.log('🆔 [Server] User ID:', userId, 'Account ID:', accountId);
    
    // Update account
    if (accountId) {
      console.log('📧 [Server] Updating account...');
      const { error: accountError } = await supabase
        .from('accounts')
        .update({
          email: studentData.email,
          phone: studentData.phone
        })
        .eq('id_account', accountId);
      
      if (accountError) console.error('❌ [Server] Account update error:', accountError);
    }
    
    // Update user
    console.log('👤 [Server] Updating user...');
    const { error: userError } = await supabase
      .from('user')
      .update({
        full_name: studentData.fullName || studentData.name,
        dob: studentData.dob || studentData.dateOfBirth, // FIXED: dob belongs to user table, not students
        gender: studentData.gender,
        address: studentData.address,
        avatar_url: studentData.avatar
      })
      .eq('id_user', userId);
    
    if (userError) console.error('❌ [Server] User update error:', userError);
    
    // Update student
    console.log('📚 [Server] Updating student...');
    const { error: updateError } = await supabase
      .from('students')
      .update({
        parent_name: studentData.parentName,
        parent_phone: studentData.parentPhone,
        level: studentData.level
        // REMOVED: dob - it's in user table, not students table
      })
      .eq('id_student', id);
    
    if (updateError) {
      console.error('❌ [Server] Student update error:', updateError);
      throw updateError;
    }
    
    console.log('✅ [Server] Student updated successfully');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Update student error:", error);
    return c.json({ error: "Lỗi khi cập nhật học sinh" }, 500);
  }
});

app.delete("/make-server-e2861589/students/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    console.log('🗑️ [Server] DELETE /students/:id - Start, ID:', id);
    
    // Step 1: Get student to find user and account
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id_user, user!inner(id_account)')
      .eq('id_student', id)
      .single();
    
    console.log('🔍 [Server] Student query result:', { student, error: studentError });
    
    if (studentError || !student) {
      console.error('❌ [Server] Student not found:', studentError);
      return c.json({ error: "Không tìm thấy học sinh" }, 404);
    }
    
    const userId = student.id_user;
    const accountId = student.user?.id_account;
    
    console.log('🆔 [Server] User ID:', userId, 'Account ID:', accountId);
    
    // Step 2: Get Student role ID
    const { data: studentRole, error: roleError } = await supabase
      .from('roles')
      .select('id_role')
      .eq('name', 'Student')
      .single();
    
    if (roleError) {
      console.error('❌ [Server] Role query error:', roleError);
      throw roleError;
    }
    
    // Step 3: Delete in correct order (FK constraints)
    // 3a. Delete class enrollments first (class_students table)
    console.log('🗑️ [Server] Deleting class_students records...');
    const { error: deleteEnrollmentError } = await supabase
      .from('class_students')
      .delete()
      .eq('id_students', id); // FK: id_students -> students.id_student
    
    if (deleteEnrollmentError) {
      console.error('❌ [Server] Delete class_students error:', deleteEnrollmentError);
      // Don't throw - continue even if no enrollments found
    }
    
    // 3b. Delete student record
    console.log('🗑️ [Server] Deleting student record...');
    const { error: deleteStudentError } = await supabase
      .from('students')
      .delete()
      .eq('id_student', id);
    
    if (deleteStudentError) {
      console.error('❌ [Server] Delete student error:', deleteStudentError);
      throw deleteStudentError;
    }
    
    // 3c. Delete student role from account_roles
    if (accountId && studentRole) {
      console.log('🗑️ [Server] Deleting student role from account_roles...');
      const { error: deleteRoleError } = await supabase
        .from('account_roles')
        .delete()
        .eq('id_account', accountId)
        .eq('id_role', studentRole.id_role);
      
      if (deleteRoleError) {
        console.error('❌ [Server] Delete role error:', deleteRoleError);
        // Don't throw - continue even if role deletion fails
      }
    }
    
    // NOTE: We keep user and account records for potential future use
    // (e.g., if they want to re-enroll or assign different role)
    
    console.log('✅ [Server] Student deleted successfully (removed: class_students, students, account_roles; kept: user, account)');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Delete student error:", error);
    return c.json({ error: "Lỗi khi xóa học sinh" }, 500);
  }
});

// ========================================
// TEACHERS APIs
// ========================================
// NOTE: POST/PUT/DELETE endpoints for /teachers are DEPRECATED
// Use /users endpoint instead for creating/updating teachers
// These endpoints are kept for backward compatibility but may have issues

app.get("/make-server-e2861589/teachers", async (c) => {
  try {
    console.log('👨‍🏫 [Server] GET /teachers - Start');
    
    // Step 1: Get all teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (teachersError) {
      console.error('❌ [Server] Teachers query error:', teachersError);
      throw teachersError;
    }
    
    console.log('📝 [Server] Found teachers:', teachers?.length || 0);
    
    if (!teachers || teachers.length === 0) {
      return c.json({ teachers: [] }); // ✅ FIX: Wrap in object
    }
    
    // Step 2: Get all users for these teachers - FIXED: use id_user instead of user
    const userIds = teachers.map(t => t.id_user).filter(Boolean);
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .in('id_user', userIds);
    
    if (usersError) {
      console.error('❌ [Server] Users query error:', usersError);
      throw usersError;
    }
    
    console.log('👤 [Server] Found users:', users?.length || 0);
    
    // Step 3: Get all accounts for these users
    const accountIds = users?.map(u => u.id_account).filter(Boolean) || [];
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id_account', accountIds);
    
    if (accountsError) {
      console.error('❌ [Server] Accounts query error:', accountsError);
      throw accountsError;
    }
    
    console.log('🔐 [Server] Found accounts:', accounts?.length || 0);
    
    // Step 4: Merge data - FIXED: use t.id_user
    const transformed = teachers.map(t => {
      const user = users?.find(u => u.id_user === t.id_user);
      const account = accounts?.find(a => a.id_account === user?.id_account);
      
      return {
        id: t.id_teacher,
        code: t.id_teacher, // Use the VARCHAR ID directly (GV001, GV002, etc.)
        fullName: user?.full_name || '',
        email: account?.email || '',
        phone: account?.phone || '',
        dateOfBirth: user?.dob || '',
        gender: user?.gender || '',
        address: user?.address || '',
        bio: t.bio || '', // From teachers.bio
        specialization: t.specialize || '', // From teachers.specialize - NO CONVERSION
        experienceYears: t.experience_years || 0, // From teachers.experience_years
        certificates: t.certifications || '', // From teachers.certifications - NO CONVERSION
        joinDate: t.created_at?.split('T')[0] || '', // ✅ Use created_at instead of start_date
        status: account?.status === 1 ? 'active' : 'inactive', // Convert 1/0 to string
        avatar: user?.avatar_url || null
      };
    });
    
    console.log('✅ [Server] GET /teachers - Success, returning', transformed.length, 'records');
    return c.json({ teachers: transformed }); // ✅ FIX: Wrap in object like students API
  } catch (error) {
    console.error("❌ [Server] Get teachers error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách giáo viên" }, 500);
  }
});

app.post("/make-server-e2861589/teachers", async (c) => {
  try {
    const teacherData = await c.req.json();
    
    // Create account first
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_name: teacherData.email.split('@')[0],
        email: teacherData.email,
        phone: teacherData.phone,
        password_hash: '123456', // Default password
        status: 1 // 1 = active, 0 = inactive
      })
      .select()
      .single();
    
    if (accountError) throw accountError;
    
    // Get "Teacher" role ID
    const { data: teacherRole } = await supabase
      .from('roles')
      .select('id_role')
      .eq('name', 'Teacher')
      .single();
    
    if (!teacherRole) {
      throw new Error('Teacher role not found in roles table');
    }
    
    // Create account_roles entry
    await supabase
      .from('account_roles')
      .insert({
        id_account: account.id_account,
        id_role: teacherRole.id_role
      });
    
    // Create user (NO role column!)
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        id_account: account.id_account,
        full_name: teacherData.name,
        gender: teacherData.gender,
        address: teacherData.address,
        avatar_url: teacherData.avatar
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Generate teacher code
    const code = await generateTeacherCode();
    
    // Create teacher
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user: user.id_user,
        code: code,
        bio: teacherData.bio || '',
        specialize: teacherData.specialty,
        experience_years: teacherData.experienceYears,
        certifications: teacherData.certifications || ''
        // Note: dob and salary fields don't exist in teachers table
      })
      .select()
      .single();
    
    if (teacherError) throw teacherError;
    
    return c.json({ 
      id: teacher.id_teacher,
      code: code,
      ...teacherData
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    return c.json({ error: "Lỗi khi tạo giáo viên" }, 500);
  }
});

app.put("/make-server-e2861589/teachers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const teacherData = await c.req.json();
    
    console.log('✏️ [Server] PUT /teachers/:id - Start, ID:', id);
    console.log('📝 [Server] Teacher data:', teacherData);
    
    // Get teacher to find user_id and account_id - FIXED: select id_user
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select(`
        id_user,
        user!inner (
          id_account
        )
      `)
      .eq('id_teacher', id)
      .single();
    
    console.log('🔍 [Server] Teacher query result:', { teacher, error: teacherError });
    
    if (teacherError || !teacher) {
      console.error('❌ [Server] Teacher not found:', teacherError);
      return c.json({ error: "Không tìm th��y giáo viên" }, 404);
    }
    
    const userId = teacher.id_user;
    const accountId = teacher.user?.id_account;
    
    console.log('🆔 [Server] User ID:', userId, 'Account ID:', accountId);
    
    // Update account
    if (accountId) {
      console.log('📧 [Server] Updating account...');
      const { error: accountError } = await supabase
        .from('accounts')
        .update({
          email: teacherData.email,
          phone: teacherData.phone
        })
        .eq('id_account', accountId);
      
      if (accountError) console.error('❌ [Server] Account update error:', accountError);
    }
    
    // Update user
    console.log('👤 [Server] Updating user...');
    const { error: userError } = await supabase
      .from('user')
      .update({
        full_name: teacherData.fullName || teacherData.name, // Accept both formats
        dob: teacherData.dob || teacherData.dateOfBirth, // FIXED: Support dateOfBirth field
        gender: teacherData.gender,
        address: teacherData.address,
        avatar_url: teacherData.avatar
      })
      .eq('id_user', userId);
    
    if (userError) console.error('❌ [Server] User update error:', userError);
    
    // Update teacher
    console.log('👨‍🏫 [Server] Updating teacher...');
    
    // Build teacher update object
    const teacherUpdate: any = {
      bio: teacherData.bio || '',
      specialize: Array.isArray(teacherData.specialization) 
        ? teacherData.specialization.join(',') 
        : (teacherData.specialty || teacherData.specialize || ''),
      experience_years: teacherData.experienceYears || teacherData.experience_years || 0,
      certifications: Array.isArray(teacherData.certificates)
        ? teacherData.certificates.join(';')
        : (teacherData.certifications || '')
    };
    
    // ✅ REMOVED: start_date field doesn't exist in teachers table
    // NOTE: id_center removed - teacher's campus is determined from their classes
    
    console.log('📦 [Server] Teacher update data:', teacherUpdate);
    
    const { error: updateError } = await supabase
      .from('teachers')
      .update(teacherUpdate)
      .eq('id_teacher', id);
    
    if (updateError) {
      console.error('❌ [Server] Teacher update error:', updateError);
      throw updateError;
    }
    
    console.log('✅ [Server] Teacher updated successfully');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Update teacher error:", error);
    return c.json({ error: "Lỗi khi cập nhật giáo viên" }, 500);
  }
});

app.delete("/make-server-e2861589/teachers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    console.log('🗑️ [Server] DELETE /teachers/:id - Start, ID:', id);
    
    // Step 1: Get teacher to find user and account
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select(`
        id_user,
        user!inner (
          id_account
        )
      `)
      .eq('id_teacher', id)
      .single();
    
    console.log('🔍 [Server] Teacher query result:', { teacher, error: teacherError });
    
    if (teacherError || !teacher) {
      console.error('❌ [Server] Teacher not found:', teacherError);
      return c.json({ error: "Không tìm thấy giáo viên" }, 404);
    }
    
    const userId = teacher.id_user;
    const accountId = teacher.user?.id_account;
    
    console.log('🆔 [Server] User ID:', userId, 'Account ID:', accountId);
    
    // Step 2: Check if teacher is assigned to any classes
    const { data: assignedClasses, error: classCheckError } = await supabase
      .from('class')
      .select('id_class')
      .eq('id_teacher', id)
      .limit(1); // Only check existence
    
    if (classCheckError) {
      console.error('❌ [Server] Class check error:', classCheckError);
      throw classCheckError;
    }
    
    if (assignedClasses && assignedClasses.length > 0) {
      console.warn('⚠️ [Server] Teacher is assigned to classes');
      return c.json({ 
        error: `Giáo viên đang giảng dạy lớp, không thể xóa.` 
      }, 400);
    }
    
    // Step 3: Get Teacher role ID
    const { data: teacherRole, error: roleError } = await supabase
      .from('roles')
      .select('id_role')
      .eq('name', 'Teacher')
      .single();
    
    if (roleError) {
      console.error('❌ [Server] Role query error:', roleError);
      throw roleError;
    }
    
    // Step 4: Delete in correct order (FK constraints)
    // 4a. Delete teacher record first
    console.log('🗑️ [Server] Deleting teacher record...');
    const { error: deleteTeacherError } = await supabase
      .from('teachers')
      .delete()
      .eq('id_teacher', id);
    
    if (deleteTeacherError) {
      console.error('❌ [Server] Delete teacher error:', deleteTeacherError);
      throw deleteTeacherError;
    }
    
    // 4b. Delete teacher role from account_roles
    if (accountId && teacherRole) {
      console.log('🗑️ [Server] Deleting teacher role from account_roles...');
      const { error: deleteRoleError } = await supabase
        .from('account_roles')
        .delete()
        .eq('id_account', accountId)
        .eq('id_role', teacherRole.id_role);
      
      if (deleteRoleError) {
        console.error('❌ [Server] Delete role error:', deleteRoleError);
        // Don't throw - continue even if role deletion fails
      }
    }
    
    // NOTE: We keep user and account records for potential future use
    // (e.g., if they want to assign different role later)
    
    console.log('✅ [Server] Teacher deleted successfully (removed: teachers, account_roles; kept: user, account)');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Delete teacher error:", error);
    return c.json({ error: "Lỗi khi xóa giáo viên" }, 500);
  }
});

// ========================================
// COURSES APIs
// ========================================

app.get("/make-server-e2861589/courses", async (c) => {
  try {
    console.log('📖 [Server] GET /courses - Start');
    
    const { data: courses, error } = await supabase
      .from('class_levels')
      .select('*')
      .order('id_level', { ascending: true });
    
    if (error) {
      console.error('❌ [Server] GET /courses - Supabase error:', error);
      throw error;
    }
    
    console.log(`✅ [Server] GET /courses - Found ${courses?.length || 0} courses`);
    
    // Transform to match frontend interface
    const formattedCourses = courses.map(course => ({
      id: course.id_level.toString(),
      name: course.name,
      description: course.description || null
    }));
    
    return c.json(formattedCourses);
  } catch (error) {
    console.error("❌ [Server] GET /courses - Error:", error);
    return c.json({ error: "Lỗi khi tải danh sách khóa học" }, 500);
  }
});

// ========================================
// CLASSES APIs
// ========================================

app.get("/make-server-e2861589/classes", async (c) => {
  try {
    const { data: classes, error } = await supabase
      .from('class')
      .select(`
        *,
        centers:id_center (name),
        class_levels:id_level (name),
        teachers:id_teacher (
          users:id_user (full_name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get student counts
    const classIds = classes?.map(c => c.id_class) || [];
    const { data: studentCounts } = await supabase
      .from('class_students')
      .select('id_class')
      .in('id_class', classIds);
    
    const countMap: Record<string, number> = {};
    studentCounts?.forEach(cs => {
      countMap[cs.id_class] = (countMap[cs.id_class] || 0) + 1;
    });
    
    // Transform to match frontend format
    const transformed = classes?.map(c => {
      // ✅ Extract schedule from note field (format: "📅 Thứ 2: 18:00-20:00, Thứ 4: 18:00-20:00")
      let scheduleStr = '';
      if (c.note && c.note.startsWith('📅 ')) {
        const parts = c.note.split('\n');
        scheduleStr = parts[0].replace('📅 ', '');
      }
      
      return {
        id: c.id_class,
        name: c.name_class,
        campus: c.centers?.name || '',
        campusId: c.id_center || '', // Add center ID for filtering
        level: c.class_levels?.name || '',
        maxStudents: c.capacity, // Renamed to match frontend
        totalStudents: countMap[c.id_class] || 0, // Renamed to match frontend
        teacher: c.teachers?.users?.full_name || '',
        teacherId: c.id_teacher || '', // Add teacher ID for filtering
        status: mapStatusToFrontend(c.status || 'scheduled'), // Map DB status to frontend status
        schedule: scheduleStr
      };
    }) || [];
    
    // Return in object format for consistency with other APIs
    return c.json({ classes: transformed });
  } catch (error) {
    console.error("Get classes error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách lớp học" }, 500);
  }
});

app.post("/make-server-e2861589/classes", async (c) => {
  try {
    const classData = await c.req.json();
    
    // Generate unique class ID (LH001, LH002, ...)
    const classId = await generateNextId('class', 'id_class');
    console.log('🆔 [CREATE CLASS] Generated Class ID:', classId);
    
    // Get center id
    const { data: center } = await supabase
      .from('centers')
      .select('id_center')
      .eq('name', classData.campus)
      .single();
    
    // Get level id
    const { data: level } = await supabase
      .from('class_levels')
      .select('id_level')
      .eq('name', classData.level)
      .single();
    
    // Get teacher id
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id_teacher, users!inner(full_name)')
      .eq('users.full_name', classData.teacher)
      .single();
    
    // Map frontend status to database status
    const dbStatus = mapStatusToDb(classData.status || 'inactive');
    
    // ✅ Save schedule string into note field
    const noteWithSchedule = classData.schedule 
      ? `📅 ${classData.schedule}${classData.note ? '\n' + classData.note : ''}`
      : (classData.note || '');
    
    // Create class with generated ID
    const { data: newClass, error } = await supabase
      .from('class')
      .insert({
        id_class: classId,
        // Note: class_code removed - using id_class as the unique code
        id_center: center?.id_center,
        id_level: level?.id_level,
        name_class: classData.name,
        status: dbStatus,
        capacity: classData.maxStudents || classData.capacity || 20, // Support both field names
        note: noteWithSchedule, // ✅ Store schedule in note field
        id_teacher: teacher?.id_teacher
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ [CREATE CLASS] Class created with schedule in note:', noteWithSchedule);
    
    // ✅ Auto-generate schedule records for next 8 weeks
    if (classData.schedule) {
      const scheduleRecords = await generateScheduleRecords(classData.schedule, classId, 8);
      console.log(`📅 [CREATE CLASS] Generating ${scheduleRecords.length} schedule records for next 8 weeks...`);
      
      if (scheduleRecords.length > 0) {
        const { error: scheduleError } = await supabase
          .from('schedule')
          .insert(scheduleRecords);
        
        if (scheduleError) {
          console.error('❌ [CREATE CLASS] Schedule generation error:', scheduleError);
        } else {
          console.log('✅ [CREATE CLASS] Schedule records created successfully');
        }
      }
    }
    
    return c.json({ id: newClass.id_class, ...classData });
  } catch (error) {
    console.error("Create class error:", error);
    return c.json({ error: "Lỗi khi tạo lớp học" }, 500);
  }
});

app.put("/make-server-e2861589/classes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const classData = await c.req.json();
    
    // NOTE: Keep the same id_class - don't regenerate to avoid cascading updates
    console.log('🔄 [UPDATE CLASS] Updating class with ID:', id);
    
    // Get IDs for foreign keys
    const { data: center } = await supabase
      .from('centers')
      .select('id_center')
      .eq('name', classData.campus)
      .single();
    
    const { data: level } = await supabase
      .from('class_levels')
      .select('id_level')
      .eq('name', classData.level)
      .single();
    
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id_teacher, user!inner(full_name)')
      .eq('user.full_name', classData.teacher)
      .single();
    
    // Map frontend status to database status
    const dbStatus = mapStatusToDb(classData.status || 'inactive');
    
    // ✅ Save schedule string into note field
    const noteWithSchedule = classData.schedule 
      ? `📅 ${classData.schedule}${classData.note ? '\n' + classData.note : ''}`
      : (classData.note || '');
    
    // Update class (keep same id_class)
    await supabase
      .from('class')
      .update({
        id_center: center?.id_center,
        id_level: level?.id_level,
        name_class: classData.name,
        status: dbStatus,
        capacity: classData.maxStudents || classData.capacity || 20, // Support both field names
        note: noteWithSchedule, // ✅ Store schedule in note field
        id_teacher: teacher?.id_teacher
      })
      .eq('id_class', id);
    
    console.log('✅ [UPDATE CLASS] Class updated with schedule in note:', noteWithSchedule);
    
    // ✅ Regenerate schedule records: delete old ones and create new ones
    if (classData.schedule) {
      // Delete existing auto-generated schedules (keep only future sessions)
      await supabase
        .from('schedule')
        .delete()
        .eq('id_class', id)
        .gte('session_date', new Date().toISOString().split('T')[0]); // Only delete future schedules
      
      // Generate new schedules
      const scheduleRecords = await generateScheduleRecords(classData.schedule, id, 8);
      console.log(`📅 [UPDATE CLASS] Regenerating ${scheduleRecords.length} schedule records...`);
      
      if (scheduleRecords.length > 0) {
        const { error: scheduleError } = await supabase
          .from('schedule')
          .insert(scheduleRecords);
        
        if (scheduleError) {
          console.error('❌ [UPDATE CLASS] Schedule regeneration error:', scheduleError);
        } else {
          console.log('✅ [UPDATE CLASS] Schedule records regenerated successfully');
        }
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update class error:", error);
    return c.json({ error: "Lỗi khi cập nhật lớp học" }, 500);
  }
});

app.delete("/make-server-e2861589/classes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Delete related records first
    // ✅ Keep schedule deletion for specific session schedules (if any)
    await supabase.from('schedule').delete().eq('id_class', id);
    await supabase.from('class_students').delete().eq('id_class', id);
    
    // Delete class
    await supabase.from('class').delete().eq('id_class', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete class error:", error);
    return c.json({ error: "Lỗi khi xóa lớp học" }, 500);
  }
});

// Enroll students to class
app.post("/make-server-e2861589/classes/:classId/enroll", async (c) => {
  try {
    const classId = c.req.param('classId');
    const { studentIds } = await c.req.json();
    
    console.log(`📝 [Server] POST /classes/${classId}/enroll - Start`);
    console.log(`📝 [Server] Enrolling ${studentIds?.length || 0} students:`, studentIds);
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return c.json({ error: "Danh sách học viên không hợp lệ" }, 400);
    }
    
    // Step 1: Verify class exists and has capacity
    const { data: classData, error: classError } = await supabase
      .from('class')
      .select('id_class, name_class, capacity')
      .eq('id_class', classId)
      .single();
    
    if (classError || !classData) {
      console.error('❌ [Server] Class not found:', classError);
      return c.json({ error: "Không tìm thấy lớp học" }, 404);
    }
    
    // Step 2: Check current enrollment count
    const { data: currentEnrollments, error: countError } = await supabase
      .from('class_students')
      .select('id_students')
      .eq('id_class', classId);
    
    if (countError) {
      console.error('❌ [Server] Error checking enrollment count:', countError);
      throw countError;
    }
    
    const currentCount = currentEnrollments?.length || 0;
    const availableSlots = classData.capacity - currentCount;
    
    console.log(`📊 [Server] Class capacity check:`, {
      capacity: classData.capacity,
      currentCount,
      availableSlots,
      requestedCount: studentIds.length
    });
    
    if (studentIds.length > availableSlots) {
      return c.json({ 
        error: `Lớp chỉ còn ${availableSlots} chỗ trống. Bạn đang chọn ${studentIds.length} học viên.` 
      }, 400);
    }
    
    // Step 3: Verify all students exist and are not already enrolled
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id_student')
      .in('id_student', studentIds);
    
    if (studentsError) {
      console.error('❌ [Server] Error verifying students:', studentsError);
      throw studentsError;
    }
    
    if (students.length !== studentIds.length) {
      return c.json({ error: "Một số học viên không tồn tại" }, 400);
    }
    
    // Check if any student is already enrolled in ANY class
    const { data: existingEnrollments, error: enrollmentCheckError } = await supabase
      .from('class_students')
      .select('id_students')
      .in('id_students', studentIds);
    
    if (enrollmentCheckError) {
      console.error('❌ [Server] Error checking existing enrollments:', enrollmentCheckError);
      throw enrollmentCheckError;
    }
    
    if (existingEnrollments && existingEnrollments.length > 0) {
      const alreadyEnrolledIds = existingEnrollments.map(e => e.id_students);
      return c.json({ 
        error: `Một số học viên đã được ghi danh vào lớp khác: ${alreadyEnrolledIds.join(', ')}` 
      }, 400);
    }
    
    // Step 4: Generate enrollment IDs (GD001, GD002, etc.)
    const { data: existingEnrollmentIds, error: idError } = await supabase
      .from('class_students')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (idError) {
      console.error('❌ [Server] Error getting last enrollment ID:', idError);
      throw idError;
    }
    
    let nextNumber = 1;
    if (existingEnrollmentIds && existingEnrollmentIds.length > 0) {
      const lastId = existingEnrollmentIds[0].id;
      console.log('🔍 [Server] Last enrollment ID:', lastId);
      
      // Extract number from ID (e.g., "GD001" → 1)
      const numberPart = lastId?.replace(/\D/g, ''); // Remove all non-digits
      const lastNumber = parseInt(numberPart || '0');
      
      // Validate: if NaN or invalid, start from 1
      if (!isNaN(lastNumber) && lastNumber > 0) {
        nextNumber = lastNumber + 1;
      } else {
        console.warn('⚠️ [Server] Invalid last ID format, starting from 1');
        nextNumber = 1;
      }
    }
    
    console.log('🆔 [Server] Generating enrollment IDs starting from GD' + String(nextNumber).padStart(3, '0'));
    
    // Step 5: Insert enrollments with generated IDs (with retry for race conditions)
    const insertedRecords = await retryWithBackoff(async () => {
      // Re-fetch latest ID in case of concurrent requests
      const { data: latestIds } = await supabase
        .from('class_students')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      let currentNextNumber = nextNumber;
      if (latestIds && latestIds.length > 0) {
        const latestId = latestIds[0].id;
        const latestNumberPart = latestId?.replace(/\D/g, '');
        const latestNumber = parseInt(latestNumberPart || '0');
        if (!isNaN(latestNumber) && latestNumber >= currentNextNumber) {
          currentNextNumber = latestNumber + 1;
        }
      }
      
      const enrollmentRecords = studentIds.map((studentId, index) => ({
        id: 'GD' + String(currentNextNumber + index).padStart(3, '0'), // GD001, GD002, etc.
        id_class: classId,
        id_students: studentId,
        joined_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      }));
      
      console.log('📝 [Server] Enrollment records to insert:', enrollmentRecords);
      
      const { data, error } = await supabase
        .from('class_students')
        .insert(enrollmentRecords)
        .select();
      
      if (error) {
        console.error('❌ [Server] Error inserting enrollments:', error);
        throw error;
      }
      
      return data;
    });
    
    console.log(`✅ [Server] Successfully enrolled ${insertedRecords?.length || 0} students to class ${classId}`);
    
    return c.json({ 
      success: true, 
      enrolled: insertedRecords?.length || 0,
      newTotal: currentCount + (insertedRecords?.length || 0)
    });
  } catch (error) {
    console.error("❌ [Server] Enroll students error:", error);
    return c.json({ error: "Lỗi khi ghi danh học viên" }, 500);
  }
});

// ========================================
// ENROLLMENTS APIs
// ========================================

// Get all enrollments with student and class details
app.get("/make-server-e2861589/enrollments", async (c) => {
  try {
    console.log("📝 [Server] GET /enrollments - Start");
    
    const { data, error } = await supabase
      .from('class_students')
      .select(`
        id,
        joined_date,
        id_students,
        id_class,
        students!class_students_id_students_fkey (
          id_student,
          id_user
        ),
        class!class_students_id_class_fkey (
          id_class,
          name_class
        )
      `)
      .order('joined_date', { ascending: false });
    
    if (error) {
      console.error("❌ [Server] Error fetching enrollments:", error);
      throw error;
    }
    
    // Get all unique user IDs
    const userIds = [...new Set(data.map((e: any) => e.students?.id_user).filter(Boolean))];
    
    // Get user names
    const { data: users } = await supabase
      .from('user')
      .select('id_user, full_name')
      .in('id_user', userIds);
    
    // Create map for quick lookup
    const userMap = new Map(users?.map(u => [u.id_user, u.full_name]) || []);
    
    // Transform to flat structure
    const enrollments = data.map((enrollment: any) => ({
      id: enrollment.id,
      joined_date: enrollment.joined_date,
      student_id: enrollment.students?.id_student || enrollment.id_students,
      student_name: userMap.get(enrollment.students?.id_user) || 'N/A',
      class_id: enrollment.class?.id_class || enrollment.id_class,
      class_name: enrollment.class?.name_class || 'N/A'
    }));
    
    console.log(`✅ [Server] Fetched ${enrollments.length} enrollments`);
    return c.json({ enrollments });
  } catch (error) {
    console.error("❌ [Server] Get enrollments error:", error);
    return c.json({ error: "Failed to fetch enrollments" }, 500);
  }
});

// ========================================
// SCHEDULES APIs
// ========================================

app.get("/make-server-e2861589/schedules", async (c) => {
  try {
    console.log('📅 [Server] GET /schedules - Start');
    
    // Get all schedules with class and teacher info
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedule')
      .select(`
        *,
        class!inner (
          id_class,
          name_class,
          id_teacher,
          centers:id_center (name),
          class_levels:id_level (name)
        )
      `)
      .order('session_date', { ascending: true });
    
    if (schedulesError) {
      console.error('❌ [Server] Schedules query error:', schedulesError);
      throw schedulesError;
    }
    
    console.log('📝 [Server] Found schedules:', schedules?.length || 0);
    
    if (!schedules || schedules.length === 0) {
      return c.json({ schedules: [] });
    }
    
    // Get teacher info for all classes
    const teacherIds = schedules
      .map(s => s.class?.id_teacher)
      .filter(Boolean);
    
    let teachers: any[] = [];
    if (teacherIds.length > 0) {
      const { data } = await supabase
        .from('teachers')
        .select(`
          id_teacher,
          users:id_user (
            full_name
          )
        `)
        .in('id_teacher', teacherIds);
      teachers = data || [];
    }
    
    // Transform to match frontend format - USING ACTUAL SCHEMA
    const transformed = schedules.map(s => ({
      id: s.id_schedule,
      classId: s.id_class,
      className: s.class?.name_class || '',
      date: s.session_date, // FIXED: renamed from sessionDate to date
      dayOfWeek: new Date(s.session_date).toLocaleDateString('vi-VN', { weekday: 'long' }), // Calculate dayOfWeek
      startTime: s.start_time,
      endTime: s.end_time,
      room: '', // No room in schedules table, placeholder
      teacher: teachers?.find(t => t.id_teacher === s.class?.id_teacher)?.users?.full_name || '',
      teacherId: s.class?.id_teacher?.toString() || '', // FIXED: added teacherId
      campus: s.class?.centers?.name || '',
      level: s.class?.class_levels?.name || '',
      status: s.is_cancelled ? 'cancelled' : 'scheduled', // FIXED: map is_cancelled to status
      topic: s.topic || '',
      requiredMaterials: s.required_materials || '',
      studentIds: [], // Will need separate query if needed
      createdAt: s.created_at
    }));
    
    console.log('✅ [Server] GET /schedules - Success, returning', transformed.length, 'records');
    // Return in object format for consistency with other APIs
    return c.json({ schedules: transformed });
  } catch (error) {
    console.error("❌ [Server] Get schedules error:", error);
    return c.json({ error: "Lỗi khi lấy lịch học" }, 500);
  }
});

app.post("/make-server-e2861589/schedules", async (c) => {
  try {
    const scheduleData = await c.req.json();
    
    const { data: schedule, error } = await supabase
      .from('schedule')
      .insert({
        id_class: scheduleData.classId,
        session_date: scheduleData.sessionDate,
        start_time: scheduleData.startTime,
        end_time: scheduleData.endTime,
        topic: scheduleData.topic || '',
        required_materials: scheduleData.requiredMaterials || '',
        is_cancelled: scheduleData.isCancelled || false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({ 
      id: schedule.id_schedule,
      ...scheduleData
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    return c.json({ error: "Lỗi khi tạo lịch học" }, 500);
  }
});

app.put("/make-server-e2861589/schedules/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const scheduleData = await c.req.json();
    
    await supabase
      .from('schedule')
      .update({
        id_class: scheduleData.classId,
        session_date: scheduleData.sessionDate,
        start_time: scheduleData.startTime,
        end_time: scheduleData.endTime,
        topic: scheduleData.topic || '',
        required_materials: scheduleData.requiredMaterials || '',
        is_cancelled: scheduleData.isCancelled || false
      })
      .eq('id_schedule', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update schedule error:", error);
    return c.json({ error: "Lỗi khi cập nhật lịch học" }, 500);
  }
});

app.delete("/make-server-e2861589/schedules/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    await supabase.from('schedule').delete().eq('id_schedule', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return c.json({ error: "Lỗi khi xóa lịch học" }, 500);
  }
});

// ========================================
// GRADES/SCORES APIs
// ========================================

// Generate sample grades for enrolled students (for testing)
app.post("/make-server-e2861589/grades/generate-samples", async (c) => {
  try {
    console.log('🎲 [Server] POST /grades/generate-samples - Start');
    
    // Get all enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_students')
      .select(`
        id_students,
        id_class
      `);
    
    if (enrollmentsError) throw enrollmentsError;
    
    if (!enrollments || enrollments.length === 0) {
      return c.json({ message: 'No enrollments found', generated: 0 });
    }
    
    // Check existing scores
    const { data: existingScores } = await supabase
      .from('scores')
      .select('id_student, id_class');
    
    const existingKeys = new Set(
      existingScores?.map(s => `${s.id_student}_${s.id_class}`) || []
    );
    
    // Generate sample scores
    const samplesToInsert = enrollments
      .filter(e => !existingKeys.has(`${e.id_students}_${e.id_class}`))
      .map(enrollment => {
        // Generate random scores for 4 skills (4.0 - 9.0)
        const listening = (Math.floor(Math.random() * 10 + 8) / 2).toFixed(1);
        const reading = (Math.floor(Math.random() * 10 + 8) / 2).toFixed(1);
        const writing = (Math.floor(Math.random() * 10 + 8) / 2).toFixed(1);
        const speaking = (Math.floor(Math.random() * 10 + 8) / 2).toFixed(1);
        const overall = ((parseFloat(listening) + parseFloat(reading) + parseFloat(writing) + parseFloat(speaking)) / 4).toFixed(1);
        
        return {
          id_student: enrollment.id_students,
          id_class: enrollment.id_class,
          exam_type: 'midterm',
          exam_date: new Date().toISOString().split('T')[0], // Today's date
          score_listening: parseFloat(listening),
          score_reading: parseFloat(reading),
          score_writing: parseFloat(writing),
          score_speaking: parseFloat(speaking),
          overall_score: parseFloat(overall)
        };
      });
    
    if (samplesToInsert.length === 0) {
      return c.json({ message: 'All students already have grades', generated: 0 });
    }
    
    const { data: insertedScores, error: insertError } = await supabase
      .from('scores')
      .insert(samplesToInsert)
      .select();
    
    if (insertError) throw insertError;
    
    console.log(`✅ [Server] Generated ${insertedScores?.length || 0} sample grades`);
    return c.json({ generated: insertedScores?.length || 0 });
  } catch (error) {
    console.error("❌ [Server] Generate sample grades error:", error);
    return c.json({ error: "Lỗi khi tạo điểm mẫu" }, 500);
  }
});

// GET all grades - Returns all exam scores from scores table
app.get("/make-server-e2861589/grades", async (c) => {
  try {
    console.log('📊 [Server] GET /grades - Start');
    
    // Get all scores with student and class info
    // ⚠️ Fix: Changed nested select syntax to avoid alias conflict
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        *,
        students!inner (
          id_student,
          id_user,
          student_code,
          users!inner (
            full_name
          )
        ),
        class!inner (
          id_class,
          name_class
        )
      `)
      .order('updated_at', { ascending: false });
    
    if (scoresError) {
      console.error('❌ [Server] Scores query error:', scoresError);
      throw scoresError;
    }
    
    console.log('📝 [Server] Found scores:', scores?.length || 0);
    
    if (!scores || scores.length === 0) {
      return c.json({ grades: [] });
    }
    
    // Transform to frontend format
    // Each score record represents one exam/test
    const transformed = scores.map(score => ({
      id: score.id_score,
      studentId: score.id_student, // ✅ Fixed: use id_student not id_students
      studentName: score.students?.users?.full_name || '',
      studentCode: score.students?.student_code || '',
      classId: score.id_class,
      className: score.class?.name_class || '',
      examType: score.exam_type,
      examDate: score.exam_date,
      // Individual skill scores
      listening: score.score_listening || 0,
      reading: score.score_reading || 0,
      writing: score.score_writing || 0,
      speaking: score.score_speaking || 0,
      // Overall score for this exam
      average: score.overall_score || 0,
      feedback: score.feedback || '',
      updatedAt: score.updated_at,
      createdAt: score.created_at
    }));
    
    console.log('✅ [Server] GET /grades - Success, returning', transformed.length, 'records');
    if (transformed.length > 0) {
      console.log('📊 [Server] Sample grade:', transformed[0]);
    }
    return c.json({ grades: transformed });
  } catch (error) {
    console.error("❌ [Server] Get grades error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách điểm" }, 500);
  }
});

// Get grades grouped by class with class averages - Schema mới: 1 record per student
app.get("/make-server-e2861589/grades/by-class", async (c) => {
  try {
    console.log('📊 [Server] GET /grades/by-class - Start (NEW SCHEMA)');
    
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        *,
        students!inner (
          id_student,
          id_user
        ),
        class:id_class (
          id_class,
          name_class,
          status
        )
      `)
      .order('id_class', { ascending: true });
    
    if (scoresError) throw scoresError;
    
    if (!scores || scores.length === 0) {
      return c.json({ classSummaries: [] });
    }
    
    // Get all unique user IDs from students
    const userIds = [...new Set(scores.map(s => s.students.id_user))];
    
    // Get user names in a separate query
    const { data: users } = await supabase
      .from('user')
      .select('id_user, full_name')
      .in('id_user', userIds);
    
    // Create a map for quick lookup
    const userMap = new Map(users?.map(u => [u.id_user, u.full_name]) || []);
    
    // Schema mới: mỗi score record đã có sẵn midterm_score, final_score, average_score
    // Không cần grouping phức tạp như cũ
    const studentScores = scores.map(score => ({
      id: score.id_score,
      classId: score.id_class,
      className: score.class?.name_class || '',
      classStatus: score.class?.status || 'active',
      studentId: score.id_students,
      studentName: userMap.get(score.students.id_user) || 'N/A',
      midtermScore: score.midterm_score || 0,
      finalScore: score.final_score || 0,
      averageScore: score.average_score || 0,
      attendanceScore: score.attendance_score || 0
    }));
    
    // Group students by class
    const groupedByClass: Record<string, any> = {};
    
    for (const student of studentScores) {
      if (!groupedByClass[student.classId]) {
        groupedByClass[student.classId] = {
          classId: student.classId,
          className: student.className,
          classStatus: student.classStatus,
          students: []
        };
      }
      
      groupedByClass[student.classId].students.push({
        id: student.id,
        studentId: student.studentId,
        studentName: student.studentName,
        midtermScore: student.midtermScore,
        finalScore: student.finalScore,
        averageScore: student.averageScore,
        attendanceScore: student.attendanceScore
      });
    }
    
    const classSummaries = Object.values(groupedByClass).map((classData: any) => {
      const totalStudents = classData.students.length;
      const sumMidterm = classData.students.reduce((sum: number, s: any) => sum + s.midtermScore, 0);
      const sumFinal = classData.students.reduce((sum: number, s: any) => sum + s.finalScore, 0);
      const sumAverage = classData.students.reduce((sum: number, s: any) => sum + s.averageScore, 0);
      
      return {
        ...classData,
        totalStudents,
        averageMidterm: totalStudents > 0 ? Number((sumMidterm / totalStudents).toFixed(1)) : 0,
        averageFinal: totalStudents > 0 ? Number((sumFinal / totalStudents).toFixed(1)) : 0,
        averageOverall: totalStudents > 0 ? Number((sumAverage / totalStudents).toFixed(1)) : 0,
        students: classData.students.sort((a: any, b: any) => 
          a.studentName.localeCompare(b.studentName, 'vi')
        )
      };
    });
    
    console.log('✅ [Server] GET /grades/by-class - Success, returning', classSummaries.length, 'classes');
    return c.json({ classSummaries });
  } catch (error) {
    console.error("❌ [Server] Get grades by class error:", error);
    return c.json({ error: "Lỗi khi lấy điểm theo lớp" }, 500);
  }
});

// POST create new grade - Schema mới: 1 record với midterm_score, final_score, average_score
app.post("/make-server-e2861589/grades", async (c) => {
  try {
    const gradeData = await c.req.json();
    
    console.log('📝 [Server] POST /grades - Creating grade (NEW SCHEMA)');
    console.log('📄 [Server] Grade data:', gradeData);
    
    // Extract scores from frontend format
    const midtermScore = gradeData.midterm?.overall || 0;
    const finalScore = gradeData.final?.overall || 0;
    const averageScore = Number((midtermScore * 0.4 + finalScore * 0.6).toFixed(1));
    const attendanceScore = gradeData.attendance?.attendedSessions || 0;
    
    const { data: score, error } = await supabase
      .from('scores')
      .insert({
        id_students: gradeData.studentId,
        id_class: gradeData.classId,
        midterm_score: midtermScore,
        final_score: finalScore,
        average_score: averageScore,
        attendance_score: attendanceScore
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [Server] Create grade error:', error);
      throw error;
    }
    
    console.log('✅ [Server] Grade created successfully:', score.id_score);
    
    return c.json({ 
      id: score.id_score,
      studentId: gradeData.studentId,
      classId: gradeData.classId,
      attendance: {
        totalSessions: 0,
        attendedSessions: Math.round(score.attendance_score || 0),
        absentSessions: 0
      },
      midterm: {
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0,
        overall: score.midterm_score || 0
      },
      final: {
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0,
        overall: score.final_score || 0
      },
      average: score.average_score || 0
    });
  } catch (error) {
    console.error("❌ [Server] Create grade error:", error);
    return c.json({ error: "Lỗi khi tạo điểm" }, 500);
  }
});

// PUT update grades - Schema mới: chỉ update 1 record duy nhất với midterm_score, final_score, average_score
app.put("/make-server-e2861589/grades/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const gradeData = await c.req.json();
    
    console.log('💾 [Server] PUT /grades/:id - Updating grade:', id, '(NEW SCHEMA)');
    console.log('📝 [Server] Grade data:', gradeData);
    
    const { studentId, classId, midterm, final, attendance } = gradeData;
    
    // Calculate average: midterm 40% + final 60%
    const midtermScore = midterm?.overall || 0;
    const finalScore = final?.overall || 0;
    const averageScore = Number((midtermScore * 0.4 + finalScore * 0.6).toFixed(1));
    const attendanceScore = attendance?.attendedSessions || 0;
    
    // Check if record exists
    const { data: existingScore } = await supabase
      .from('scores')
      .select('id_score')
      .eq('id_score', id)
      .single();
    
    if (existingScore) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('scores')
        .update({
          midterm_score: midtermScore,
          final_score: finalScore,
          average_score: averageScore,
          attendance_score: attendanceScore,
          updated_at: new Date().toISOString()
        })
        .eq('id_score', id);
      
      if (updateError) {
        console.error('❌ [Server] Error updating score:', updateError);
        throw updateError;
      }
      console.log('✅ [Server] Score updated successfully');
    } else {
      // Create new record if it doesn't exist
      if (!studentId || !classId) {
        throw new Error('studentId and classId are required to create new score');
      }
      
      const { error: createError } = await supabase
        .from('scores')
        .insert({
          id_students: studentId,
          id_class: classId,
          midterm_score: midtermScore,
          final_score: finalScore,
          average_score: averageScore,
          attendance_score: attendanceScore
        });
      
      if (createError) {
        console.error('❌ [Server] Error creating score:', createError);
        throw createError;
      }
      console.log('✅ [Server] New score created successfully');
    }
    
    return c.json({ 
      success: true,
      message: 'Cập nhật điểm thành công'
    });
  } catch (error) {
    console.error("❌ [Server] Update grade error:", error);
    return c.json({ error: "Lỗi khi cập nhật điểm" }, 500);
  }
});

app.delete("/make-server-e2861589/grades/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    await supabase.from('scores').delete().eq('id_score', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete grade error:", error);
    return c.json({ error: "Lỗi khi xóa điểm" }, 500);
  }
});

// ========================================
// NOTIFICATIONS APIs
// ========================================

// GET all notifications (for DocumentManagement Announcements tab)
app.get("/make-server-e2861589/notifications", async (c) => {
  try {
    console.log('📢 [Server] GET /notifications - Start');
    
    const { data: notifications, error } = await supabase
      .from('notification')
      .select(`
        *,
        teachers!id_teacher (
          user!id_user (
            full_name
          )
        ),
        class!id_class (
          name_class
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [Server] Notifications query error:', error);
      throw error;
    }
    
    console.log('✅ [Server] Found notifications:', notifications?.length || 0);
    
    // Transform to match frontend format
    const transformed = notifications?.map(n => ({
      id: n.id_notification,
      title: 'Thông báo', // notification table doesn't have title field
      content: n.description || '', // ← Use description field from schema
      postedBy: n.teachers?.user?.full_name || 'Giáo viên',
      postedDate: new Date(n.created_at).toLocaleDateString('vi-VN'),
      targetAudience: 'all', // notification table doesn't have target_role
      targetClass: n.class?.name_class || null,
      priority: 'normal', // notification table doesn't have priority field
      isVisible: true, // notification table doesn't have expires_at
      createdAt: n.created_at,
      expiresAt: null
    })) || [];
    
    return c.json(transformed);
  } catch (error) {
    console.error("❌ [Server] Get notifications error:", error);
    return c.json({ error: "Lỗi khi lấy thông báo" }, 500);
  }
});

// POST new notification
app.post("/make-server-e2861589/notifications", async (c) => {
  try {
    const notificationData = await c.req.json();
    console.log('📢 [Server] POST /notifications - Creating:', notificationData);
    
    // Generate unique notification ID (ND001, ND002, ...)
    const notificationId = await generateNextId('notification', 'id_notification');
    console.log('🆔 [CREATE NOTIFICATION] Generated ID:', notificationId);
    
    // WORKAROUND: If id_class is required but not provided, use first available class
    // This is a temporary solution - ideally id_class should be nullable in DB
    let classId = notificationData.targetClass;
    if (!classId) {
      console.log('⚠️ [CREATE NOTIFICATION] No targetClass provided, fetching default class...');
      const { data: defaultClass } = await supabase
        .from('class')
        .select('id_class')
        .limit(1)
        .single();
      
      if (defaultClass) {
        classId = defaultClass.id_class;
        console.log('✅ [CREATE NOTIFICATION] Using default class:', classId);
      } else {
        console.error('❌ [CREATE NOTIFICATION] No classes found in database!');
        return c.json({ error: "Không tìm thấy lớp học nào. Vui lòng tạo lớp học trước." }, 400);
      }
    }
    
    const { data: notification, error } = await supabase
      .from('notification')
      .insert({
        id_notification: notificationId, // ✅ Generate ID manually
        id_class: classId, // ✅ Use provided class or default
        id_teacher: notificationData.teacherId || null, // ← FK to teachers table (creator)
        description: notificationData.content || '' // ← Use description field
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ [Server] Notification created:', notification.id_notification);
    return c.json({ 
      id: notification.id_notification,
      title: 'Thông báo',
      content: notificationData.content,
      postedBy: notificationData.postedBy || 'Giáo viên',
      postedDate: new Date(notification.created_at).toLocaleDateString('vi-VN'),
      targetAudience: 'all',
      targetClass: notificationData.targetClass,
      priority: 'normal',
      isVisible: true,
      createdAt: notification.created_at
    });
  } catch (error) {
    console.error("❌ [Server] Create notification error:", error);
    return c.json({ error: "Lỗi khi tạo thông báo" }, 500);
  }
});

// PUT update notification visibility
app.put("/make-server-e2861589/notifications/:id/visibility", async (c) => {
  try {
    const id = c.req.param('id');
    const { isVisible } = await c.req.json();
    
    console.log(`📢 [Server] PUT /notifications/${id}/visibility - Setting to:`, isVisible);
    
    // NOTE: notification table doesn't have expires_at or visibility field
    // For now, we just return success without updating anything
    // If you need visibility control, add a new column to notification table
    
    console.log('✅ [Server] Notification visibility updated (no-op for now)');
    return c.json({ success: true, isVisible });
  } catch (error) {
    console.error("❌ [Server] Update notification visibility error:", error);
    return c.json({ error: "Lỗi khi cập nhật hiển thị thông báo" }, 500);
  }
});

// DELETE notification
app.delete("/make-server-e2861589/notifications/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`📢 [Server] DELETE /notifications/${id}`);
    
    const { error } = await supabase
      .from('notification')
      .delete()
      .eq('id_notification', id);
    
    if (error) throw error;
    
    console.log('✅ [Server] Notification deleted');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Delete notification error:", error);
    return c.json({ error: "Lỗi khi xóa thông báo" }, 500);
  }
});

// ========================================
// FEEDBACK APIs
// ========================================

// GET all feedbacks
app.get("/make-server-e2861589/feedback", async (c) => {
  try {
    console.log('💬 [Server] GET /feedback - Start');
    
    // ✅ Join with users table to get responder's name
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select(`
        *,
        sender:id_user(full_name),
        responder:responded_by(full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('✅ [Server] Found feedbacks:', feedbacks?.length || 0);
    
    // Transform to match frontend format
    const transformed = feedbacks?.map(f => ({
      id: f.id_feedback,
      sender: f.sender?.full_name || f.sender_name || 'Người dùng',
      senderRole: f.sender_role || 'student',
      type: f.type || 'general',
      content: f.content || '',
      status: f.status || 'pending',
      date: new Date(f.created_at).toLocaleDateString('vi-VN'),
      reply: f.response || null, // ✅ Fixed: use 'response' column
      replied_by: f.responder?.full_name || null, // ✅ Added: responder name
      replied_at: f.responded_at || null
    })) || [];
    
    return c.json({ feedbacks: transformed });
  } catch (error) {
    console.error("❌ [Server] Get feedbacks error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách phản hồi" }, 500);
  }
});

// POST new feedback
app.post("/make-server-e2861589/feedback", async (c) => {
  try {
    const feedbackData = await c.req.json();
    console.log('���� [Server] POST /feedback - Creating:', feedbackData);
    
    // Generate unique feedback ID (PH001, PH002, ...) - PH = Phản Hồi
    const feedbackId = await generateNextId('feedbacks', 'id_feedback');
    console.log('🆔 [CREATE FEEDBACK] Generated ID:', feedbackId);
    
    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .insert({
        id_feedback: feedbackId,
        sender_name: feedbackData.sender,
        sender_role: feedbackData.senderRole,
        type: feedbackData.type,
        content: feedbackData.content,
        status: feedbackData.status || 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ [Server] Feedback created:', feedback.id_feedback);
    return c.json({ 
      id: feedback.id_feedback,
      sender: feedback.sender_name,
      senderRole: feedback.sender_role,
      type: feedback.type,
      content: feedback.content,
      status: feedback.status,
      date: new Date(feedback.created_at).toLocaleDateString('vi-VN'),
      reply: null
    });
  } catch (error) {
    console.error("❌ [Server] Create feedback error:", error);
    return c.json({ error: "Lỗi khi tạo phản hồi" }, 500);
  }
});

// PUT update feedback (for replies and status)
app.put("/make-server-e2861589/feedback/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const feedbackData = await c.req.json();
    console.log(`💬 [Server] PUT /feedback/${id} - Updating:`, feedbackData);
    
    const updateData: any = {};
    
    // ✅ Map both 'response' and 'reply' to database column 'response'
    if (feedbackData.response !== undefined) {
      updateData.response = feedbackData.response;
      updateData.responded_at = new Date().toISOString();
      
      // ✅ Get user ID from auth token to set responder
      const authHeader = c.req.header('Authorization');
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          updateData.responded_by = user.id;
        }
      }
    } else if (feedbackData.reply !== undefined) {
      updateData.response = feedbackData.reply;
      updateData.responded_at = new Date().toISOString();
      
      // ✅ Get user ID from auth token to set responder
      const authHeader = c.req.header('Authorization');
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          updateData.responded_by = user.id;
        }
      }
    }
    
    if (feedbackData.status !== undefined) updateData.status = feedbackData.status;
    
    // ✅ Join with users to get responder name
    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .update(updateData)
      .eq('id_feedback', id)
      .select(`
        *,
        responder:responded_by(full_name)
      `)
      .single();
    
    if (error) throw error;
    
    console.log('✅ [Server] Feedback updated:', feedback.id_feedback);
    return c.json({ 
      id: feedback.id_feedback,
      sender: feedback.sender_name,
      senderRole: feedback.sender_role,
      type: feedback.type,
      content: feedback.content,
      status: feedback.status,
      date: new Date(feedback.created_at).toLocaleDateString('vi-VN'),
      reply: feedback.response, // ✅ Map 'response' column to 'reply' field
      replied_by: feedback.responder?.full_name || null,
      replied_at: feedback.responded_at
    });
  } catch (error) {
    console.error("❌ [Server] Update feedback error:", error);
    return c.json({ error: "Lỗi khi cập nhật phản hồi" }, 500);
  }
});

// ========================================
// ASSIGNMENTS APIs
// ========================================

// GET all assignments
app.get("/make-server-e2861589/assignments", async (c) => {
  try {
    console.log('📝 [Server] GET /assignments - Start');
    
    const { data: assignments, error } = await supabase
      .from('asignments')
      .select(`
        *,
        class:id_class (
          name_class,
          id_class
        ),
        teachers:created_by (
          id_teacher,
          user:id_user (
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [Server] Assignments query error:', error);
      throw error;
    }
    
    console.log('✅ [Server] Found assignments:', assignments?.length || 0);
    console.log('📊 [Server] First assignment data:', JSON.stringify(assignments?.[0], null, 2));
    
    // Handle empty result
    if (!assignments || assignments.length === 0) {
      console.log('ℹ️ [Server] No assignments found, returning empty array');
      return c.json([]);
    }
    
    // Transform to match frontend format
    const transformed = assignments.map(a => {
      console.log('🔄 [Server] Processing assignment ID:', a.id_assignment, 'Type:', typeof a.id_assignment);
      return {
        id: a.id_assignment?.toString() || 'unknown',
      title: a.title || 'Untitled',
      description: a.description || '',
      className: a.class?.name_class || 'N/A',
      classId: a.class?.id_class || null,
      teacher: a.teachers?.user?.full_name || 'N/A',
      dueDate: a.due_date ? new Date(a.due_date).toLocaleDateString('vi-VN') : 'N/A',
      dueDateRaw: a.due_date,
      status: a.due_date && new Date(a.due_date) < new Date() ? 'closed' : 'open',
      fileUrl: a.file_url,
      createdAt: a.created_at,
      submissions: 0, // Will be calculated from submissions table
      totalStudents: 0 // Will be calculated from enrollments
    };
    });
    
    return c.json(transformed);
  } catch (error) {
    console.error("❌ [Server] Get assignments error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách bài tập" }, 500);
  }
});

// POST new assignment
app.post("/make-server-e2861589/assignments", async (c) => {
  try {
    const assignmentData = await c.req.json();
    console.log('📝 [Server] POST /assignments - Creating:', assignmentData);
    
    // ✅ Validate that createdBy is provided and is a teacher ID
    if (!assignmentData.createdBy) {
      console.error('❌ [Server] createdBy is missing in request');
      return c.json({ error: "Thiếu thông tin giáo viên (createdBy)" }, 400);
    }
    
    console.log('🔍 [Server] Validating teacher ID:', assignmentData.createdBy);
    
    // Verify teacher exists in database
    const { data: teacherExists, error: teacherCheckError } = await supabase
      .from('teachers')
      .select('id_teacher')
      .eq('id_teacher', assignmentData.createdBy)
      .single();
    
    if (teacherCheckError || !teacherExists) {
      console.error('❌ [Server] Teacher not found in database:', assignmentData.createdBy);
      console.error('❌ [Server] Teacher check error:', teacherCheckError);
      return c.json({ error: `Không tìm thấy giáo viên với ID: ${assignmentData.createdBy}` }, 400);
    }
    
    console.log('✅ [Server] Teacher verified:', teacherExists.id_teacher);
    
    // 🆔 Generate next assignment ID with retry logic for race conditions
    const newAssignmentId = await retryWithBackoff(async () => {
      const nextId = await generateNextId('asignments', 'id_assignment');
      console.log(`🆔 [Server] Generated assignment ID: ${nextId}`);
      
      // Prepare insert data
      const insertData = {
        id_assignment: nextId,
        id_class: assignmentData.classId,
        title: assignmentData.title,
        description: assignmentData.description,
        file_url: assignmentData.fileUrl || null,
        created_by: assignmentData.createdBy, // Teacher ID (GV001)
        due_date: assignmentData.dueDate || null
      };
      
      console.log('📝 [Server] Inserting assignment with data:', JSON.stringify(insertData, null, 2));
      
      // Try to insert with this ID
      const { data: assignment, error } = await supabase
        .from('asignments')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ [Server] Insert error:', error);
        throw error;
      }
      
      console.log('✅ [Server] Insert successful, returned data:', JSON.stringify(assignment, null, 2));
      
      return assignment;
    });
    
    console.log('✅ [Server] Assignment created:', newAssignmentId.id_assignment);
    
    // Query again with joins to get complete data including teacher info
    const { data: fullAssignment, error: queryError } = await supabase
      .from('asignments')
      .select(`
        *,
        class:id_class (
          name_class,
          id_class
        ),
        teachers:created_by (
          id_teacher,
          user:id_user (
            full_name
          )
        )
      `)
      .eq('id_assignment', newAssignmentId.id_assignment)
      .single();
    
    if (queryError) {
      console.error('❌ [Server] Query error after insert:', queryError);
      throw queryError;
    }
    
    console.log('📊 [Server] Full assignment data with joins:', JSON.stringify(fullAssignment, null, 2));
    
    // Transform to match frontend format
    const responseData = {
      id: fullAssignment.id_assignment?.toString() || 'unknown',
      title: fullAssignment.title || 'Untitled',
      description: fullAssignment.description || '',
      className: fullAssignment.class?.name_class || 'N/A',
      classId: fullAssignment.class?.id_class || null,
      teacher: fullAssignment.teachers?.user?.full_name || 'N/A',
      dueDate: fullAssignment.due_date ? new Date(fullAssignment.due_date).toLocaleDateString('vi-VN') : 'N/A',
      dueDateRaw: fullAssignment.due_date,
      status: fullAssignment.due_date && new Date(fullAssignment.due_date) < new Date() ? 'closed' : 'open',
      fileUrl: fullAssignment.file_url,
      createdAt: fullAssignment.created_at,
      submissions: 0,
      totalStudents: 0
    };
    
    return c.json(responseData);
  } catch (error) {
    console.error("❌ [Server] Create assignment error:", error);
    return c.json({ error: "Lỗi khi tạo bài tập" }, 500);
  }
});

// PUT update assignment
app.put("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const assignmentData = await c.req.json();
    
    console.log(`📝 [Server] PUT /assignments/${id} - Updating`);
    
    const { error } = await supabase
      .from('asignments')
      .update({
        title: assignmentData.title,
        description: assignmentData.description,
        file_url: assignmentData.fileUrl || null,
        due_date: assignmentData.dueDate || null
      })
      .eq('id_assignment', id);
    
    if (error) throw error;
    
    console.log('✅ [Server] Assignment updated');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Update assignment error:", error);
    return c.json({ error: "Lỗi khi cập nhật bài tập" }, 500);
  }
});

// DELETE assignment
app.delete("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`📝 [Server] DELETE /assignments/${id}`);
    
    const { error } = await supabase
      .from('asignments')
      .delete()
      .eq('id_assignment', id);
    
    if (error) throw error;
    
    console.log('✅ [Server] Assignment deleted');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Delete assignment error:", error);
    return c.json({ error: "Lỗi khi xóa bài tập" }, 500);
  }
});

// ========================================
// ASSIGNMENT SUBMISSIONS APIs
// ========================================

// GET submissions for an assignment
app.get("/make-server-e2861589/assignments/:id/submissions", async (c) => {
  try {
    const assignmentId = c.req.param('id');
    console.log(`📝 [Server] GET /assignments/${assignmentId}/submissions`);
    
    const { data: submissions, error } = await supabase
      .from('asignment_submissions')
      .select(`
        *,
        student:id_student (
          full_name,
          id_student
        )
      `)
      .eq('id_assignment', assignmentId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('✅ [Server] Found submissions:', submissions?.length || 0);
    
    // Transform to match frontend format
    const transformed = submissions?.map(s => ({
      id: s.id.toString(),
      assignmentId: s.id_assignment.toString(),
      studentName: s.student?.full_name || 'N/A',
      studentId: s.id_student.toString(),
      submittedDate: s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN') : undefined,
      fileUrl: s.file_url,
      grade: s.grade,
      feedback: s.feedback,
      status: s.grade ? 'graded' : (s.submitted_at ? 'submitted' : 'not_submitted')
    })) || [];
    
    return c.json(transformed);
  } catch (error) {
    console.error("❌ [Server] Get submissions error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách bài nộp" }, 500);
  }
});

// POST new submission (student submits assignment)
app.post("/make-server-e2861589/submissions", async (c) => {
  try {
    const submissionData = await c.req.json();
    console.log('📝 [Server] POST /submissions - Creating:', submissionData);
    
    const { data: submission, error } = await supabase
      .from('asignment_submissions')
      .insert({
        id_assignment: submissionData.assignmentId,
        id_student: submissionData.studentId,
        file_url: submissionData.fileUrl || null,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ [Server] Submission created:', submission.id);
    return c.json({ 
      id: submission.id.toString(),
      success: true
    });
  } catch (error) {
    console.error("❌ [Server] Create submission error:", error);
    return c.json({ error: "Lỗi khi nộp bài tập" }, 500);
  }
});

// PUT grade submission (teacher grades)
app.put("/make-server-e2861589/submissions/:id/grade", async (c) => {
  try {
    const id = c.req.param('id');
    const gradeData = await c.req.json();
    
    console.log(`📝 [Server] PUT /submissions/${id}/grade`);
    
    const { error } = await supabase
      .from('asignment_submissions')
      .update({
        grade: gradeData.grade,
        feedback: gradeData.feedback || null
      })
      .eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ [Server] Submission graded');
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Grade submission error:", error);
    return c.json({ error: "Lỗi khi chấm điểm" }, 500);
  }
});

// ========================================
// USERS APIs (for UserManagement)
// ========================================

app.get("/make-server-e2861589/users", async (c) => {
  try {
    console.log('👤 [Server] GET /users - Start');
    
    // Step 1: Get all users
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ [Server] Users query error:', usersError);
      throw usersError;
    }
    
    console.log('📝 [Server] Found users:', users?.length || 0);
    
    if (!users || users.length === 0) {
      return c.json([]);
    }
    
    // Step 2: Get all accounts for these users
    const accountIds = users.map(u => u.id_account).filter(Boolean);
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id_account', accountIds);
    
    if (accountsError) {
      console.error('❌ [Server] Accounts query error:', accountsError);
      throw accountsError;
    }
    
    console.log('🔐 [Server] Found accounts:', accounts?.length || 0);
    
    // DEBUG: Check account status values
    if (accounts && accounts.length > 0) {
      console.log('🔍 [Debug] First account status:', accounts[0].status, typeof accounts[0].status);
      accounts.slice(0, 3).forEach(acc => {
        console.log(`Account ${acc.id_account}: status = ${acc.status} (type: ${typeof acc.status})`);
      });
    }
    
    // Step 3: Get roles for each account
    const { data: accountRoles, error: accountRolesError } = await supabase
      .from('account_roles')
      .select(`
        id_account,
        roles (
          name
        )
      `)
      .in('id_account', accountIds);
    
    if (accountRolesError) {
      console.error('❌ [Server] Account roles query error:', accountRolesError);
    }
    
    console.log('🎭 [Server] Found account roles:', accountRoles?.length || 0);
    
    // Step 4: Get students and teachers to get their codes
    const userIds = users.map(u => u.id_user).filter(Boolean);
    const { data: students } = await supabase
      .from('students')
      .select('id_student, id_user')
      .in('id_user', userIds);
    
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id_teacher, id_user')
      .in('id_user', userIds);
    
    console.log('📚 [Server] Found students:', students?.length || 0);
    console.log('👨‍🏫 [Server] Found teachers:', teachers?.length || 0);
    
    // DEBUG: Log student/teacher data
    if (students && students.length > 0) {
      console.log('🔍 [Debug] First student:', students[0]);
    }
    if (teachers && teachers.length > 0) {
      console.log('🔍 [Debug] First teacher:', teachers[0]);
    }
    
    // Step 5: Merge data
    const transformed = users.map(u => {
      const account = accounts?.find(a => a.id_account === u.id_account);
      const roleData = accountRoles?.find(ar => ar.id_account === u.id_account);
      const student = students?.find(s => s.id_user === u.id_user);
      const teacher = teachers?.find(t => t.id_user === u.id_user);
      
      // DEBUG: Log matching info
      if (student) {
        console.log(`✅ [Match] User ${u.id_user} is student with code ${student.id_student}`);
      }
      if (teacher) {
        console.log(`✅ [Match] User ${u.id_user} is teacher with code ${teacher.id_teacher}`);
      }
      
      // DEBUG: Log status conversion
      const rawStatus = account?.status;
      const convertedStatus = rawStatus === 1 ? 'active' : (rawStatus === 0 ? 'inactive' : 'inactive');
      console.log(`🔍 [Status] User ${u.id_user}: raw=${rawStatus} (${typeof rawStatus}) → converted="${convertedStatus}"`);
      
      // Determine role with priority: students > teachers > account_roles
      let userRole = 'user'; // default
      let userCode = u.id_user; // default to user ID
      
      if (student) {
        userRole = 'student';
        userCode = student.id_student; // HV001, HV002, etc.
        console.log(`🎓 [Role] User ${u.id_user}: Học viên (found in students table)`);
      } else if (teacher) {
        userRole = 'teacher';
        userCode = teacher.id_teacher; // GV001, GV002, etc.
        console.log(`👨‍🏫 [Role] User ${u.id_user}: Giáo viên (found in teachers table)`);
      } else if (roleData?.roles?.name) {
        userRole = roleData.roles.name.toLowerCase();
        userCode = u.id_user; // Use ND001 pattern or user ID
        console.log(`🎭 [Role] User ${u.id_user}: ${roleData.roles.name} (from account_roles)`);
      }
      
      console.log(`🏷️ [Code] User ${u.id_user} (${u.full_name}): code = ${userCode}, role = ${userRole}`);
      
      return {
        id: u.id_user,
        code: userCode,
        fullName: u.full_name || '',
        username: account?.user_name || '',
        email: account?.email || '',
        phone: account?.phone || '',
        dateOfBirth: u.dob || '',
        gender: u.gender || '',
        address: u.address || '',
        role: userRole,
        status: convertedStatus,
        avatar: u.avatar_url || null,
        lastLogin: account?.last_login || null,
        createdAt: u.created_at,
        // ✅ Add specific IDs for teacher and student
        teacherId: teacher?.id_teacher || '',
        studentId: student?.id_student || ''
      };
    });
    
    console.log('✅ [Server] GET /users - Success, returning', transformed.length, 'records');
    return c.json(transformed);
  } catch (error) {
    console.error("❌ [Server] Get users error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách người dùng" }, 500);
  }
});

app.get("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get user
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('id_user', id)
      .single();
    
    if (userError || !user) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    // Get account
    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('id_account', user.id_account)
      .single();
    
    // Get role
    const { data: roleData } = await supabase
      .from('account_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq('id_account', user.id_account)
      .single();
    
    // Check if user is student or teacher
    const { data: student } = await supabase
      .from('students')
      .select('id_student')
      .eq('id_user', user.id_user)
      .single();
    
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id_teacher')
      .eq('id_user', user.id_user)
      .single();
    
    // Determine role with priority: students > teachers > account_roles
    let userRole = 'user';
    let userCode = user.id_user;
    
    if (student) {
      userRole = 'student';
      userCode = student.id_student;
    } else if (teacher) {
      userRole = 'teacher';
      userCode = teacher.id_teacher;
    } else if (roleData?.roles?.name) {
      userRole = roleData.roles.name.toLowerCase();
    }
    
    return c.json({
      id: user.id_user,
      code: userCode,
      fullName: user.full_name || '',
      username: account?.user_name || '',
      email: account?.email || '',
      phone: account?.phone || '',
      dateOfBirth: user.dob || '',
      gender: user.gender || '',
      address: user.address || '',
      role: userRole,
      status: account?.status === 1 ? 'active' : 'inactive',
      avatar: user.avatar_url || null,
      // ✅ Add specific IDs for teacher and student
      teacherId: teacher?.id_teacher || '',
      studentId: student?.id_student || ''
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return c.json({ error: "Lỗi khi lấy thông tin người dùng" }, 500);
  }
});

app.post("/make-server-e2861589/users", async (c) => {
  try {
    const userData = await c.req.json();
    console.log('📝 [CREATE USER] Received data:', JSON.stringify(userData, null, 2));
    
    // Wrap entire user creation in retry to handle race conditions
    const result = await retryWithBackoff(async () => {
      // Generate next account ID (TK001, TK002, ...)
      const nextAccountId = await generateNextId('accounts', 'id_account');
      console.log('🆔 [CREATE USER] Generated Account ID:', nextAccountId);
    
    // Generate next user ID - ALWAYS use US prefix for user table
    const nextUserId = await generateNextId('user', 'id_user');
    console.log('🆔 [CREATE USER] Generated User ID:', nextUserId);
    
    // Generate role-specific ID (HV for students, GV for teachers)
    let roleSpecificId: string | null = null;
    if (userData.role === 'student') {
      roleSpecificId = await generateNextId('students', 'id_student');
      console.log('🆔 [CREATE USER] Generated Student ID:', roleSpecificId);
    } else if (userData.role === 'teacher') {
      roleSpecificId = await generateNextId('teachers', 'id_teacher');
      console.log('🆔 [CREATE USER] Generated Teacher ID:', roleSpecificId);
    }
    
    console.log('✅ [CREATE USER] Final generated IDs - Account:', nextAccountId, 'User:', nextUserId, 'Role-specific:', roleSpecificId);
    
    // Convert status from string to integer (1 = active, 0 = inactive)
    const statusInt = userData.status === 'active' || userData.status === 1 ? 1 : 0;
    console.log('🔄 [CREATE USER] Status conversion:', userData.status, '→', statusInt);
    
    // Create account first with generated ID
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        id_account: nextAccountId,
        user_name: userData.username,
        email: userData.email,
        phone: userData.phone,
        password_hash: userData.password || '123456',
        status: statusInt
      })
      .select()
      .single();
    
    if (accountError) {
      console.error('❌ [CREATE USER] Account creation error:', accountError);
      throw accountError;
    }
    
    console.log('✅ [CREATE USER] Account created:', account.id_account);
    
    // Get role ID
    const roleName = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    const { data: role } = await supabase
      .from('roles')
      .select('id_role')
      .eq('name', roleName)
      .single();
    
    if (!role) {
      throw new Error(`Role ${roleName} not found in roles table`);
    }
    
    // Create account_roles entry
    await supabase
      .from('account_roles')
      .insert({
        id_account: account.id_account,
        id_role: role.id_role
      });
    
    // Create user with generated ID
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        id_user: nextUserId,
        id_account: account.id_account,
        full_name: userData.fullName,
        dob: userData.studentData?.dateOfBirth || userData.teacherData?.dateOfBirth || null,
        gender: userData.studentData?.gender || userData.teacherData?.gender || null,
        address: userData.studentData?.address || userData.teacherData?.address || null,
        avatar_url: userData.avatar || null
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // If student or teacher, create entry in respective table with role-specific ID
    if (userData.role === 'student' && userData.studentData && roleSpecificId) {
      console.log('📚 [CREATE USER] Creating student record - Student ID:', roleSpecificId, 'User ID:', nextUserId);
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id_student: roleSpecificId, // HV001, HV002, etc. (this is the code)
          id_user: nextUserId,        // US001, US002, etc.
          parent_name: userData.studentData.parentName || null,
          parent_phone: userData.studentData.parentPhone || null
          // NOTE: id_center removed - will be set when student enrolls in a class
        });
      
      if (studentError) {
        console.error('❌ [CREATE USER] Student creation error:', studentError);
        throw studentError;
      }
      console.log('✅ [CREATE USER] Student created successfully');
    } else if (userData.role === 'teacher' && userData.teacherData && roleSpecificId) {
      console.log('👨‍🏫 [CREATE USER] Creating teacher record - Teacher ID:', roleSpecificId, 'User ID:', nextUserId);
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          id_teacher: roleSpecificId, // GV001, GV002, etc. (this is the code)
          id_user: nextUserId,         // US001, US002, etc.
          bio: userData.teacherData.bio || null,
          specialize: userData.teacherData.specialization || null, // Note: DB column is "specialize" not "specialization"
          experience_years: userData.teacherData.experienceYears ? parseInt(userData.teacherData.experienceYears) : null,
          certifications: userData.teacherData.certifications || null
          // NOTE: id_center removed - will be set when teacher is assigned to a class
        });
      
      if (teacherError) {
        console.error('❌ [CREATE USER] Teacher creation error:', teacherError);
        throw teacherError;
      }
      console.log('✅ [CREATE USER] Teacher created successfully');
    }
    
    console.log('🎉 [CREATE USER] All records created successfully. Returning response...');
    
    return {
      id: user.id_user,
      code: roleSpecificId || nextUserId, // Use role-specific ID if available, otherwise user ID
      username: userData.username,
      fullName: userData.fullName,
      role: userData.role,
      status: userData.status,
      email: userData.email,
      phone: userData.phone,
      campus: userData.studentData?.campus || userData.teacherData?.campus
    };
    }); // End of retryWithBackoff
    
    return c.json({ user: result });
  } catch (error: any) {
    console.error("❌❌❌ [CREATE USER] FATAL ERROR:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return c.json({ 
      error: error.message || "Lỗi khi tạo người dùng",
      details: error.details || null,
      hint: error.hint || null
    }, 500);
  }
});

app.put("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const userData = await c.req.json();
    
    // Get user to find account_id
    const { data: user } = await supabase
      .from('user')
      .select('id_account')
      .eq('id_user', id)
      .single();
    
    if (!user) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    // Convert status from string to integer (1 = active, 0 = inactive)
    const statusInt = userData.status === 'active' || userData.status === 1 ? 1 : 0;
    
    // Update account
    await supabase
      .from('accounts')
      .update({
        user_name: userData.username,
        email: userData.email,
        phone: userData.phone,
        status: statusInt
      })
      .eq('id_account', user.id_account);
    
    // Update role if provided
    if (userData.role) {
      const roleName = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
      const { data: role } = await supabase
        .from('roles')
        .select('id_role')
        .eq('name', roleName)
        .single();
      
      if (role) {
        // Delete old role and insert new one
        await supabase
          .from('account_roles')
          .delete()
          .eq('id_account', user.id_account);
        
        await supabase
          .from('account_roles')
          .insert({
            id_account: user.id_account,
            id_role: role.id_role
          });
      }
    }
    
    // Update user
    await supabase
      .from('user')
      .update({
        full_name: userData.fullName,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        avatar_url: userData.avatar
      })
      .eq('id_user', id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ error: "Lỗi khi cập nhật người dùng" }, 500);
  }
});

app.delete("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get user to find account
    const { data: user } = await supabase
      .from('user')
      .select('id_account, id_user')
      .eq('id_user', id)
      .single();
    
    if (!user) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    // Delete related student records if exists
    const { data: student } = await supabase
      .from('students')
      .select('id_student')
      .eq('id_user', id)
      .single();
    
    if (student) {
      // Delete class_students first (foreign key constraint)
      await supabase.from('class_students').delete().eq('id_student', student.id_student);
      // Delete student record
      await supabase.from('students').delete().eq('id_student', student.id_student);
      console.log(`✅ [Server] Deleted student record for user ${id}`);
    }
    
    // Delete related teacher records if exists
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id_teacher')
      .eq('id_user', id)
      .single();
    
    if (teacher) {
      // Delete teacher record
      await supabase.from('teachers').delete().eq('id_teacher', teacher.id_teacher);
      console.log(`✅ [Server] Deleted teacher record for user ${id}`);
    }
    
    // Delete user
    await supabase.from('user').delete().eq('id_user', id);
    
    // Delete account and account_roles
    await supabase.from('account_roles').delete().eq('id_account', user.id_account);
    await supabase.from('accounts').delete().eq('id_account', user.id_account);
    
    console.log(`✅ [Server] User ${id} deleted successfully (cascade: student/teacher → user → account_roles → account)`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Lỗi khi xóa người dùng" }, 500);
  }
});

// ========================================
// MIGRATION ENDPOINT - Create students/teachers records for existing users
// ========================================
app.post("/make-server-e2861589/migrate-user-records", async (c) => {
  try {
    console.log('🔄 [MIGRATION] Starting migration of user records...');
    
    // Get all users with their account roles
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select(`
        id_user,
        id_account,
        full_name,
        accounts!inner (
          id_account,
          user_name
        )
      `)
      .order('created_at', { ascending: true });
    
    if (usersError) {
      console.error('❌ [MIGRATION] Error fetching users:', usersError);
      throw usersError;
    }
    
    console.log(`📊 [MIGRATION] Found ${users?.length || 0} users to check`);
    
    // Get all account roles
    const accountIds = users?.map(u => u.id_account).filter(Boolean) || [];
    const { data: accountRoles } = await supabase
      .from('account_roles')
      .select(`
        id_account,
        roles (
          name
        )
      `)
      .in('id_account', accountIds);
    
    // Get existing students and teachers
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id_user');
    
    const { data: existingTeachers } = await supabase
      .from('teachers')
      .select('id_user');
    
    const existingStudentUserIds = new Set(existingStudents?.map(s => s.id_user) || []);
    const existingTeacherUserIds = new Set(existingTeachers?.map(t => t.id_user) || []);
    
    console.log(`📚 [MIGRATION] Existing students: ${existingStudentUserIds.size}`);
    console.log(`👨‍🏫 [MIGRATION] Existing teachers: ${existingTeacherUserIds.size}`);
    
    let studentsCreated = 0;
    let teachersCreated = 0;
    let skipped = 0;
    
    // Process each user
    for (const user of users || []) {
      const roleData = accountRoles?.find(ar => ar.id_account === user.id_account);
      const roleName = roleData?.roles?.name?.toLowerCase();
      
      if (roleName === 'student' && !existingStudentUserIds.has(user.id_user)) {
        // Generate student ID
        const studentId = await generateNextId('students', 'id_student');
        
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id_student: studentId,
            id_user: user.id_user,
            parent_name: null,
            parent_phone: null
          });
        
        if (studentError) {
          console.error(`❌ [MIGRATION] Error creating student for user ${user.id_user}:`, studentError);
        } else {
          console.log(`✅ [MIGRATION] Created student ${studentId} for user ${user.id_user} (${user.full_name})`);
          studentsCreated++;
        }
      } else if (roleName === 'teacher' && !existingTeacherUserIds.has(user.id_user)) {
        // Generate teacher ID
        const teacherId = await generateNextId('teachers', 'id_teacher');
        
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            id_teacher: teacherId,
            id_user: user.id_user,
            specialties: []
          });
        
        if (teacherError) {
          console.error(`❌ [MIGRATION] Error creating teacher for user ${user.id_user}:`, teacherError);
        } else {
          console.log(`✅ [MIGRATION] Created teacher ${teacherId} for user ${user.id_user} (${user.full_name})`);
          teachersCreated++;
        }
      } else {
        skipped++;
      }
    }
    
    const summary = {
      totalUsers: users?.length || 0,
      studentsCreated,
      teachersCreated,
      skipped,
      message: `Migration completed: ${studentsCreated} students and ${teachersCreated} teachers created`
    };
    
    console.log('🎉 [MIGRATION] Summary:', summary);
    
    return c.json(summary);
  } catch (error: any) {
    console.error('❌ [MIGRATION] Fatal error:', error);
    return c.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, 500);
  }
});

// ========================================
// CAMPUSES/CENTERS APIs (for CampusManagement)
// ========================================

// Alias /centers to /campuses for consistency
app.get("/make-server-e2861589/centers", async (c) => {
  try {
    console.log('��� [Server] GET /centers - Redirect to /campuses');
    
    const { data: centers, error } = await supabase
      .from('centers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [Server] Centers query error:', error);
      throw error;
    }
    
    console.log('✅ [Server] Found centers:', centers?.length || 0);
    return c.json({ centers: centers || [] });
  } catch (error) {
    console.error("❌ [Server] Get centers error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách trung tâm" }, 500);
  }
});

app.get("/make-server-e2861589/campuses", async (c) => {
  try {
    console.log('🏢 [Server] GET /campuses - Start');
    
    const { data: campuses, error } = await supabase
      .from('centers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [Server] Campuses query error:', error);
      throw error;
    }
    
    console.log('✅ [Server] Found campuses:', campuses?.length || 0);
    
    if (!campuses || campuses.length === 0) {
      return c.json([]);
    }
    
    // Get all unique manager user IDs
    const managerIds = [...new Set(campuses.map(c => c.id_manager).filter(Boolean))];
    
    // Get manager names from user table
    const { data: managers } = await supabase
      .from('user')
      .select('id_user, full_name')
      .in('id_user', managerIds);
    
    // Create map for quick lookup
    const managerMap = new Map(managers?.map(m => [m.id_user, m.full_name]) || []);
    
    const transformed = campuses.map(c => ({
      id: c.id_center,
      code: c.id_center, // id_center is already formatted as CS001, CS002...
      name: c.name, // Fix: use correct column name from schema
      address: c.address,
      phone: c.phone,
      email: c.email || '',
      status: c.status || 'active',
      id_manager: c.id_manager || '',
      manager: managerMap.get(c.id_manager) || 'Chưa có',
      description: c.description || '',
      createdAt: c.created_at
    }));
    
    return c.json(transformed);
  } catch (error) {
    console.error("❌ [Server] Get campuses error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách cơ sở" }, 500);
  }
});

app.get("/make-server-e2861589/campuses/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data: campus, error } = await supabase
      .from('centers')
      .select('*')
      .eq('id_center', id)
      .single();
    
    if (error || !campus) {
      return c.json({ error: "Không tìm thấy cơ sở" }, 404);
    }
    
    return c.json({
      id: campus.id_center,
      code: campus.id_center, // id_center is already formatted as CS001, CS002...
      name: campus.name,
      address: campus.address,
      phone: campus.phone,
      email: campus.email || '',
      status: campus.status || 'active',
      capacity: campus.capacity || 0,
      currentStudents: campus.current_students || 0,
      manager: campus.manager || '',
      description: campus.description || ''
    });
  } catch (error) {
    console.error("Get campus by ID error:", error);
    return c.json({ error: "Lỗi khi lấy thông tin cơ sở" }, 500);
  }
});

app.post("/make-server-e2861589/campuses", async (c) => {
  try {
    const campusData = await c.req.json();
    
    // Generate next ID: CS001, CS002, CS003...
    const nextId = await generateNextId('centers', 'id_center');
    
    const { data: campus, error } = await supabase
      .from('centers')
      .insert({
        id_center: nextId,
        name: campusData.name,
        address: campusData.address,
        phone: campusData.phone,
        email: campusData.email || '',
        status: campusData.status || 'active',
        id_manager: campusData.id_manager || null,
        description: campusData.description || ''
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json({
      campus: {
        id: campus.id_center,
        code: campus.id_center,
        ...campusData
      }
    });
  } catch (error) {
    console.error("Create campus error:", error);
    return c.json({ error: "Lỗi khi tạo cơ sở" }, 500);
  }
});

app.put("/make-server-e2861589/campuses/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const campusData = await c.req.json();
    
    const { error } = await supabase
      .from('centers')
      .update({
        name: campusData.name,
        address: campusData.address,
        phone: campusData.phone,
        email: campusData.email,
        status: campusData.status,
        id_manager: campusData.id_manager || null,
        description: campusData.description
      })
      .eq('id_center', id);
    
    if (error) throw error;
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update campus error:", error);
    return c.json({ error: "Lỗi khi cập nhật cơ sở" }, 500);
  }
});

app.delete("/make-server-e2861589/campuses/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('centers')
      .delete()
      .eq('id_center', id);
    
    if (error) throw error;
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete campus error:", error);
    return c.json({ error: "Lỗi khi xóa cơ sở" }, 500);
  }
});

// ========================================
// ADMIN APIs (for initialization)
// ========================================

// DEBUG USERS endpoint
app.get("/make-server-e2861589/admin/debug-users", async (c) => {
  try {
    console.log('🔍 [DEBUG USERS] Starting...');
    
    // Count users
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*');
    
    console.log('👤 Users count:', users?.length, 'Error:', usersError);
    
    // Count accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*');
    
    console.log('🔐 Accounts count:', accounts?.length, 'Error:', accountsError);
    
    // Count account_roles
    const { data: accountRoles, error: rolesError } = await supabase
      .from('account_roles')
      .select(`
        *,
        roles (
          name
        )
      `);
    
    console.log('🎭 Account roles count:', accountRoles?.length, 'Error:', rolesError);
    
    return c.json({
      users: {
        count: users?.length || 0,
        sample: users?.[0] || null,
        error: usersError
      },
      accounts: {
        count: accounts?.length || 0,
        sample: accounts?.[0] || null,
        error: accountsError
      },
      accountRoles: {
        count: accountRoles?.length || 0,
        sample: accountRoles?.[0] || null,
        error: rolesError
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG USERS] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// DEBUG endpoint - View database contents
app.get("/make-server-e2861589/admin/debug-db", async (c) => {
  try {
    console.log('🔍 [DEBUG] Starting database inspection...');
    
    // Test accounts table
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(3);
    console.log('🔍 [DEBUG] Accounts:', { count: accounts?.length, error: accountsError });
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .limit(3);
    console.log('🔍 [DEBUG] Users:', { count: users?.length, error: usersError });
    
    // Test students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(3);
    console.log('🔍 [DEBUG] Students:', { count: students?.length, error: studentsError });
    
    // Test teachers table
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('*')
      .limit(3);
    console.log('🔍 [DEBUG] Teachers:', { count: teachers?.length, error: teachersError });
    
    // Test roles table
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    console.log('🔍 [DEBUG] Roles:', { count: roles?.length, error: rolesError });
    
    // Test account_roles table
    const { data: accountRoles, error: accountRolesError } = await supabase
      .from('account_roles')
      .select('*')
      .limit(3);
    console.log('🔍 [DEBUG] Account Roles:', { count: accountRoles?.length, error: accountRolesError });
    
    return c.json({
      success: true,
      summary: {
        accounts: { count: accounts?.length || 0, error: accountsError?.message },
        users: { count: users?.length || 0, error: usersError?.message },
        students: { count: students?.length || 0, error: studentsError?.message },
        teachers: { count: teachers?.length || 0, error: teachersError?.message },
        roles: { count: roles?.length || 0, error: rolesError?.message },
        account_roles: { count: accountRoles?.length || 0, error: accountRolesError?.message }
      },
      sample_data: {
        accounts: accounts?.[0] || null,
        users: users?.[0] || null,
        students: students?.[0] || null,
        teachers: teachers?.[0] || null,
        roles: roles || [],
        account_roles: accountRoles?.[0] || null
      }
    });
  } catch (error) {
    console.error("❌ [DEBUG] Error:", error);
    return c.json({ 
      success: false,
      error: error.message || "Lỗi khi debug database",
      details: error
    }, 500);
  }
});

// RAW endpoint - Get all students (no transformation)
app.get("/make-server-e2861589/admin/students-raw", async (c) => {
  try {
    console.log('🔍 [TEST] SELECT * FROM students...');
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [TEST] Students error:', error);
      return c.json({ error: error.message, details: error }, 500);
    }
    
    console.log('✅ [TEST] Found students:', data?.length || 0);
    console.log('📝 [TEST] Sample record:', data?.[0]);
    
    return c.json({
      success: true,
      count: data?.length || 0,
      sample: data?.[0] || null,
      all_data: data || []
    });
  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// TEST endpoint - Get students with JOIN
app.get("/make-server-e2861589/admin/students-with-join", async (c) => {
  try {
    console.log('🔍 [TEST] SELECT students with JOIN user and accounts...');
    
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        user:id_user (
          *,
          accounts:id_account (*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [TEST] JOIN error:', error);
      return c.json({ error: error.message, details: error }, 500);
    }
    
    console.log('✅ [TEST] Found students with JOIN:', data?.length || 0);
    console.log('📝 [TEST] Sample record:', data?.[0]);
    
    return c.json({
      success: true,
      count: data?.length || 0,
      sample: data?.[0] || null,
      all_data: data || []
    });
  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// BY ROLE endpoint - Get all accounts with "Student" role
app.get("/make-server-e2861589/admin/students-by-role", async (c) => {
  try {
    console.log('🎓 [BY ROLE] Getting students by role...');
    
    // Step 1: Get "Student" role ID
    const { data: studentRole, error: roleError } = await supabase
      .from('roles')
      .select('id_role, name')
      .eq('name', 'Student')
      .single();
    
    if (roleError || !studentRole) {
      console.error('❌ [BY ROLE] Student role not found:', roleError);
      return c.json({ error: 'Student role not found', details: roleError }, 404);
    }
    
    console.log('✅ [BY ROLE] Found Student role:', studentRole);
    
    // Step 2: Get all account_roles with this role
    const { data: accountRoles, error: accountRolesError } = await supabase
      .from('account_roles')
      .select('id_account, id_role')
      .eq('id_role', studentRole.id_role);
    
    if (accountRolesError) {
      console.error('❌ [BY ROLE] Account roles error:', accountRolesError);
      return c.json({ error: accountRolesError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found account_roles:', accountRoles?.length || 0);
    
    if (!accountRoles || accountRoles.length === 0) {
      return c.json({ 
        message: 'No accounts with Student role found',
        count: 0,
        accounts: []
      });
    }
    
    // Step 3: Get accounts
    const accountIds = accountRoles.map(ar => ar.id_account);
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id_account', accountIds);
    
    if (accountsError) {
      console.error('❌ [BY ROLE] Accounts error:', accountsError);
      return c.json({ error: accountsError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found accounts:', accounts?.length || 0);
    
    // Step 4: Get users for these accounts
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .in('id_account', accountIds);
    
    if (usersError) {
      console.error('❌ [BY ROLE] Users error:', usersError);
      return c.json({ error: usersError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found users:', users?.length || 0);
    
    // Step 5: Get students records
    const userIds = users?.map(u => u.id_user) || [];
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('user', userIds);
    
    if (studentsError) {
      console.error('❌ [BY ROLE] Students error:', studentsError);
      return c.json({ error: studentsError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found students records:', students?.length || 0);
    
    // Step 6: Merge all data
    const result = accounts?.map(account => {
      const user = users?.find(u => u.id_account === account.id_account);
      const student = students?.find(s => s.user === user?.id_user);
      
      return {
        account_id: account.id_account,
        username: account.user_name,
        email: account.email,
        phone: account.phone,
        user_id: user?.id_user,
        full_name: user?.full_name,
        gender: user?.gender,
        address: user?.address,
        avatar_url: user?.avatar_url,
        student_id: student?.id_student,
        code: student?.code,
        parent_name: student?.parent_name,
        parent_phone: student?.parent_phone,
        level: student?.level,
        dob: student?.dob
      };
    });
    
    return c.json({
      success: true,
      role: 'Student',
      count: result?.length || 0,
      data: result || []
    });
  } catch (error) {
    console.error('❌ [BY ROLE] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// BY ROLE endpoint - Get all accounts with "Teacher" role
app.get("/make-server-e2861589/admin/teachers-by-role", async (c) => {
  try {
    console.log('👨‍🏫 [BY ROLE] Getting teachers by role...');
    
    // Step 1: Get "Teacher" role ID
    const { data: teacherRole, error: roleError } = await supabase
      .from('roles')
      .select('id_role, name')
      .eq('name', 'Teacher')
      .single();
    
    if (roleError || !teacherRole) {
      console.error('❌ [BY ROLE] Teacher role not found:', roleError);
      return c.json({ error: 'Teacher role not found', details: roleError }, 404);
    }
    
    console.log('✅ [BY ROLE] Found Teacher role:', teacherRole);
    
    // Step 2: Get all account_roles with this role
    const { data: accountRoles, error: accountRolesError } = await supabase
      .from('account_roles')
      .select('id_account, id_role')
      .eq('id_role', teacherRole.id_role);
    
    if (accountRolesError) {
      console.error('❌ [BY ROLE] Account roles error:', accountRolesError);
      return c.json({ error: accountRolesError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found account_roles:', accountRoles?.length || 0);
    
    if (!accountRoles || accountRoles.length === 0) {
      return c.json({ 
        message: 'No accounts with Teacher role found',
        count: 0,
        accounts: []
      });
    }
    
    // Step 3: Get accounts
    const accountIds = accountRoles.map(ar => ar.id_account);
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .in('id_account', accountIds);
    
    if (accountsError) {
      console.error('❌ [BY ROLE] Accounts error:', accountsError);
      return c.json({ error: accountsError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found accounts:', accounts?.length || 0);
    
    // Step 4: Get users for these accounts
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('*')
      .in('id_account', accountIds);
    
    if (usersError) {
      console.error('❌ [BY ROLE] Users error:', usersError);
      return c.json({ error: usersError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found users:', users?.length || 0);
    
    // Step 5: Get teachers records
    const userIds = users?.map(u => u.id_user) || [];
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('*')
      .in('user', userIds);
    
    if (teachersError) {
      console.error('❌ [BY ROLE] Teachers error:', teachersError);
      return c.json({ error: teachersError.message }, 500);
    }
    
    console.log('✅ [BY ROLE] Found teachers records:', teachers?.length || 0);
    
    // Step 6: Merge all data
    const result = accounts?.map(account => {
      const user = users?.find(u => u.id_account === account.id_account);
      const teacher = teachers?.find(t => t.user === user?.id_user);
      
      return {
        account_id: account.id_account,
        username: account.user_name,
        email: account.email,
        phone: account.phone,
        user_id: user?.id_user,
        full_name: user?.full_name,
        gender: user?.gender,
        address: user?.address,
        avatar_url: user?.avatar_url,
        teacher_id: teacher?.id_teacher,
        code: teacher?.code,
        bio: teacher?.bio,
        specialty: teacher?.specialty,
        experience_years: teacher?.experience_years,
        certifications: teacher?.certifications
      };
    });
    
    return c.json({
      success: true,
      role: 'Teacher',
      count: result?.length || 0,
      data: result || []
    });
  } catch (error) {
    console.error('❌ [BY ROLE] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-e2861589/admin/init-data", async (c) => {
  try {
    const data = await c.req.json();
    
    console.log("🚀 Initializing database with data...");
    
    // This endpoint is for backward compatibility
    // In normalized DB, we should use proper INSERT operations
    // For now, just return success
    
    return c.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Init data error:", error);
    return c.json({ error: "Lỗi khi khởi tạo dữ liệu" }, 500);
  }
});

app.post("/make-server-e2861589/admin/reset-data", async (c) => {
  try {
    console.log("🗑️ Resetting database...");
    
    // Delete all data (be careful with this in production!)
    await supabase.from('class_students').delete().neq('id_students', '');
    await supabase.from('schedule').delete().neq('id_schedule', '');
    await supabase.from('students').delete().neq('id_student', '');
    await supabase.from('teachers').delete().neq('id_teacher', '');
    await supabase.from('class').delete().neq('id_class', '');
    await supabase.from('user').delete().neq('id_user', '');
    await supabase.from('accounts').delete().neq('id_account', '');
    
    return c.json({ success: true, message: "Database reset complete" });
  } catch (error) {
    console.error("Reset data error:", error);
    return c.json({ error: "Lỗi khi reset dữ liệu" }, 500);
  }
});

// ============================================
// ASSIGNMENTS APIs (Using KV Store pattern for simplicity)
// ============================================

app.get("/make-server-e2861589/assignments", async (c) => {
  try {
    console.log('📚 [Server] GET /assignments - Start');
    
    // Get all assignments from KV store
    const assignments = await kv.getByPrefix('assignment:');
    
    console.log('✅ [Server] GET /assignments - Success, returning', assignments.length, 'records');
    return c.json({ assignments });
  } catch (error) {
    console.error("❌ [Server] Get assignments error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách bài tập" }, 500);
  }
});

app.post("/make-server-e2861589/assignments", async (c) => {
  try {
    const assignmentData = await c.req.json();
    console.log('📝 [Server] POST /assignments - Data:', assignmentData);
    
    // Generate ID
    const timestamp = Date.now();
    const id = `BT${String(timestamp).slice(-6)}`;
    
    const assignment = {
      id,
      ...assignmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`assignment:${id}`, assignment);
    
    console.log('✅ [Server] POST /assignments - Created:', id);
    return c.json({ assignment });
  } catch (error) {
    console.error("❌ [Server] Create assignment error:", error);
    return c.json({ error: "Lỗi khi tạo bài tập" }, 500);
  }
});

app.put("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    console.log('📝 [Server] PUT /assignments/:id - ID:', id, 'Updates:', updates);
    
    const existing = await kv.get(`assignment:${id}`);
    if (!existing) {
      return c.json({ error: "Bài tập không tồn tại" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`assignment:${id}`, updated);
    
    console.log('✅ [Server] PUT /assignments/:id - Updated:', id);
    return c.json({ assignment: updated });
  } catch (error) {
    console.error("❌ [Server] Update assignment error:", error);
    return c.json({ error: "Lỗi khi cập nhật bài tập" }, 500);
  }
});

app.delete("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ [Server] DELETE /assignments/:id - ID:', id);
    
    await kv.del(`assignment:${id}`);
    
    console.log('✅ [Server] DELETE /assignments/:id - Deleted:', id);
    return c.json({ success: true });
  } catch (error) {
    console.error("❌ [Server] Delete assignment error:", error);
    return c.json({ error: "Lỗi khi xóa bài tập" }, 500);
  }
});

// Assignment submissions
app.post("/make-server-e2861589/assignments/:id/submit", async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const submissionData = await c.req.json();
    console.log('📤 [Server] POST /assignments/:id/submit - Assignment:', assignmentId, 'Data:', submissionData);
    
    const timestamp = Date.now();
    const submissionId = `SUB${String(timestamp).slice(-6)}`;
    
    const submission = {
      id: submissionId,
      assignmentId,
      ...submissionData,
      submittedAt: new Date().toISOString()
    };
    
    await kv.set(`submission:${submissionId}`, submission);
    
    console.log('✅ [Server] POST /assignments/:id/submit - Created submission:', submissionId);
    return c.json({ submission });
  } catch (error) {
    console.error("❌ [Server] Submit assignment error:", error);
    return c.json({ error: "Lỗi khi nộp bài tập" }, 500);
  }
});

app.get("/make-server-e2861589/assignments/:id/submissions", async (c) => {
  try {
    const assignmentId = c.req.param('id');
    console.log('📥 [Server] GET /assignments/:id/submissions - Assignment:', assignmentId);
    
    const allSubmissions = await kv.getByPrefix('submission:');
    const submissions = allSubmissions.filter((s: any) => s.assignmentId === assignmentId);
    
    console.log('✅ [Server] GET /assignments/:id/submissions - Found:', submissions.length);
    return c.json({ submissions });
  } catch (error) {
    console.error("❌ [Server] Get submissions error:", error);
    return c.json({ error: "Lỗi khi lấy danh sách bài nộp" }, 500);
  }
});

// ========================================
// REPORTS & STATISTICS APIs
// ========================================

// GET comprehensive statistics for reports
app.get("/make-server-e2861589/reports/statistics", async (c) => {
  try {
    console.log('📊 [Server] GET /reports/statistics - Start');
    
    // Fetch all data in parallel for better performance
    const [
      studentsResult,
      teachersResult,
      classesResult,
      centersResult,
      gradesResult,
      attendancesResult,
      feedbacksResult,
      enrollmentsResult
    ] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('teachers').select('*, user:id_user(full_name)'),
      supabase.from('class').select('*'),
      supabase.from('centers').select('*'),
      supabase.from('grade').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('feedbacks').select('*'),
      supabase.from('enrollment').select('*')
    ]);

    // Check for errors
    if (studentsResult.error) throw studentsResult.error;
    if (teachersResult.error) throw teachersResult.error;
    if (classesResult.error) throw classesResult.error;
    if (centersResult.error) throw centersResult.error;

    const students = studentsResult.data || [];
    const teachers = teachersResult.data || [];
    const classes = classesResult.data || [];
    const centers = centersResult.data || [];
    const grades = gradesResult.data || [];
    const attendances = attendancesResult.data || [];
    const feedbacks = feedbacksResult.data || [];
    const enrollments = enrollmentsResult.data || [];

    console.log('✅ [Reports] Data loaded:', {
      students: students.length,
      teachers: teachers.length,
      classes: classes.length,
      centers: centers.length,
      grades: grades.length,
      attendances: attendances.length,
      feedbacks: feedbacks.length,
      enrollments: enrollments.length
    });

    // 🔍 DEBUG: Check class status format
    if (classes.length > 0) {
      console.log('🔍 [Reports] First class status:', {
        status: classes[0].status,
        type: typeof classes[0].status,
        sample: classes.slice(0, 3).map((c: any) => ({ id: c.id_class, status: c.status }))
      });
    }

    // Helper function to check if class is active (supports both integer and string)
    const isClassActive = (cls: any) => {
      return cls.status === 'active' || cls.status === 1;
    };

    // Calculate enrollment trend by month (last 6 months)
    const now = new Date();
    const enrollmentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `T${month.getMonth() + 1}/${month.getFullYear()}`;
      const monthEnrollments = enrollments.filter((e: any) => {
        const enrollDate = new Date(e.created_at);
        return enrollDate.getMonth() === month.getMonth() && 
               enrollDate.getFullYear() === month.getFullYear();
      });
      enrollmentTrend.push({
        month: monthStr,
        students: monthEnrollments.length,
        classes: classes.filter((c: any) => {
          const classDate = new Date(c.created_at);
          return classDate.getMonth() === month.getMonth() && 
                 classDate.getFullYear() === month.getFullYear();
        }).length
      });
    }

    // Students by center
    const studentsByCenter = centers.map((center: any) => ({
      name: center.name_center,
      students: students.filter((s: any) => s.id_center === center.id_center).length,
      classes: classes.filter((c: any) => c.id_center === center.id_center && isClassActive(c)).length
    }));

    // Classes by course level
    const classesByCourse = [
      { name: 'IELTS 4.0', value: 'IELTS_4.0' },
      { name: 'IELTS 5.5', value: 'IELTS_5.5' },
      { name: 'IELTS 6.5', value: 'IELTS_6.5' },
      { name: 'IELTS 7.5+', value: 'IELTS_7.5_plus' }
    ].map(course => ({
      name: course.name,
      classes: classes.filter((c: any) => c.id_course === course.value).length,
      students: enrollments.filter((e: any) => {
        const cls = classes.find((c: any) => c.id_class === e.id_class);
        return cls?.id_course === course.value;
      }).length
    }));

    // Grade statistics (average by skill)
    const gradesBySkill = ['listening', 'reading', 'writing', 'speaking'].map(skill => {
      const skillGrades = grades.filter((g: any) => g[`score_${skill}`] !== null);
      const avg = skillGrades.length > 0
        ? skillGrades.reduce((sum: number, g: any) => sum + (g[`score_${skill}`] || 0), 0) / skillGrades.length
        : 0;
      return {
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        average: Math.round(avg * 10) / 10
      };
    });

    // Attendance rate
    const totalAttendances = attendances.length;
    const presentAttendances = attendances.filter((a: any) => a.status === 'present').length;
    const attendanceRate = totalAttendances > 0 
      ? Math.round((presentAttendances / totalAttendances) * 100) 
      : 0;

    // Feedback statistics
    const feedbackStats = {
      total: feedbacks.length,
      pending: feedbacks.filter((f: any) => f.status === 'pending').length,
      responded: feedbacks.filter((f: any) => f.status === 'responded').length,
      byType: ['academic', 'technical', 'course', 'question', 'general'].map(type => ({
        type,
        count: feedbacks.filter((f: any) => f.type === type).length
      }))
    };

    // Student status distribution
    const studentsByStatus = [
      { name: 'Đang học', value: students.filter((s: any) => s.status === 'active').length },
      { name: 'Đã nghỉ', value: students.filter((s: any) => s.status === 'inactive').length }
    ];

    // Top performing students (by average grade)
    const studentGrades = students.map((student: any) => {
      const studentGradeRecords = grades.filter((g: any) => g.id_student === student.id_student);
      if (studentGradeRecords.length === 0) return null;
      
      const avgGrade = studentGradeRecords.reduce((sum: number, g: any) => {
        const scoreAvg = (
          (g.score_listening || 0) + 
          (g.score_reading || 0) + 
          (g.score_writing || 0) + 
          (g.score_speaking || 0)
        ) / 4;
        return sum + scoreAvg;
      }, 0) / studentGradeRecords.length;
      
      return {
        id: student.id_student,
        name: student.full_name,
        average: Math.round(avgGrade * 10) / 10
      };
    }).filter(Boolean).sort((a: any, b: any) => b.average - a.average).slice(0, 10);

    const response = {
      summary: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        activeClasses: classes.filter((c: any) => isClassActive(c)).length,
        totalCenters: centers.length,
        attendanceRate
      },
      enrollmentTrend,
      studentsByCenter,
      classesByCourse,
      gradesBySkill,
      feedbackStats,
      studentsByStatus,
      topStudents: studentGrades,
      // Raw data for custom filtering in frontend
      students,
      teachers,
      classes,
      centers
    };

    console.log('✅ [Reports] Statistics compiled successfully');
    return c.json(response);
  } catch (error) {
    console.error("❌ [Server] Get report statistics error:", error);
    return c.json({ error: "Lỗi khi lấy báo cáo thống kê" }, 500);
  }
});

// Start server
Deno.serve(app.fetch);