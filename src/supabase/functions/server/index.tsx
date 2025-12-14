import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// ========================================
// HELPER FUNCTIONS
// ========================================

// Auto-generate sequential student code (HV001, HV002, ...)
async function generateStudentCode(): Promise<string> {
  const students = await kv.get("students") || [];
  const existingCodes = students
    .map((s: any) => s.code)
    .filter((code: string) => code && code.startsWith('HV'))
    .map((code: string) => parseInt(code.replace('HV', '')))
    .filter((num: number) => !isNaN(num));
  
  const maxNumber = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
  const nextNumber = maxNumber + 1;
  return `HV${nextNumber.toString().padStart(3, '0')}`;
}

// Auto-generate sequential teacher code (GV001, GV002, ...)
async function generateTeacherCode(): Promise<string> {
  const teachers = await kv.get("teachers") || [];
  const existingCodes = teachers
    .map((t: any) => t.code)
    .filter((code: string) => code && code.startsWith('GV'))
    .map((code: string) => parseInt(code.replace('GV', '')))
    .filter((num: number) => !isNaN(num));
  
  const maxNumber = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
  const nextNumber = maxNumber + 1;
  return `GV${nextNumber.toString().padStart(3, '0')}`;
}

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
// AUTHENTICATION & USERS
// ========================================

// Login endpoint
app.post("/make-server-e2861589/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Get all users from KV store
    const users = await kv.get("users") || [];
    
    // Find user by username and password
    const user = users.find((u: any) => 
      u.username === username && u.password === password
    );
    
    if (!user) {
      return c.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, 401);
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Đã xảy ra lỗi khi đăng nhập" }, 500);
  }
});

// Change password endpoint
app.post("/make-server-e2861589/auth/change-password", async (c) => {
  try {
    console.log('🔐 [Server] Change password request received');
    const { userId, oldPassword, newPassword } = await c.req.json();
    console.log('🔐 [Server] UserId:', userId);
    
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      console.error('❌ [Server] User not found:', userId);
      return c.json({ success: false, message: "Không tìm thấy người dùng" }, 404);
    }
    
    if (users[userIndex].password !== oldPassword) {
      console.error('❌ [Server] Wrong old password for user:', userId);
      return c.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, 401);
    }
    
    users[userIndex].password = newPassword;
    await kv.set("users", users);
    
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
    
    const users = await kv.get("users") || [];
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      return c.json({ error: "Email không tồn tại trong hệ thống" }, 404);
    }
    
    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset code with expiry (15 minutes)
    const resetCodes = await kv.get("reset_codes") || {};
    resetCodes[email] = {
      code: resetCode,
      expiry: Date.now() + 15 * 60 * 1000,
      userId: user.id
    };
    await kv.set("reset_codes", resetCodes);
    
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
    
    const resetCodes = await kv.get("reset_codes") || {};
    const resetData = resetCodes[email];
    
    if (!resetData) {
      return c.json({ error: "Mã xác thực không hợp lệ" }, 400);
    }
    
    if (resetData.code !== code) {
      return c.json({ error: "Mã xác thực không đúng" }, 400);
    }
    
    if (Date.now() > resetData.expiry) {
      return c.json({ error: "Mã xác thực đã hết hạn" }, 400);
    }
    
    // Update password
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === resetData.userId);
    
    if (userIndex === -1) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    users[userIndex].password = newPassword;
    await kv.set("users", users);
    
    // Delete used reset code
    delete resetCodes[email];
    await kv.set("reset_codes", resetCodes);
    
    return c.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// CAMPUSES
// ========================================

app.get("/make-server-e2861589/campuses", async (c) => {
  try {
    const campuses = await kv.get("campuses") || [];
    return c.json({ campuses });
  } catch (error) {
    console.error("Get campuses error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/campuses", async (c) => {
  try {
    const campus = await c.req.json();
    const campuses = await kv.get("campuses") || [];
    campuses.push(campus);
    await kv.set("campuses", campuses);
    return c.json({ campus });
  } catch (error) {
    console.error("Create campus error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/campuses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedCampus = await c.req.json();
    const campuses = await kv.get("campuses") || [];
    const index = campuses.findIndex((c: any) => c.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy cơ sở" }, 404);
    }
    
    campuses[index] = { ...campuses[index], ...updatedCampus };
    await kv.set("campuses", campuses);
    return c.json({ campus: campuses[index] });
  } catch (error) {
    console.error("Update campus error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/campuses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const campuses = await kv.get("campuses") || [];
    const filtered = campuses.filter((c: any) => c.id !== id);
    await kv.set("campuses", filtered);
    return c.json({ message: "Xóa cơ sở thành công" });
  } catch (error) {
    console.error("Delete campus error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// USERS (for UserManagement module)
// ========================================

// Get all users
app.get("/make-server-e2861589/users", async (c) => {
  try {
    console.log('🔄 [Server] GET /users - Fetching all users...');
    const usersData = await kv.get("users") || [];
    
    // Remove passwords from response
    const users = usersData.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    console.log(`✅ [Server] Found ${users.length} users`);
    return c.json({ users });
  } catch (error) {
    console.error("❌ [Server] Get users error:", error);
    return c.json({ error: "Không thể tải danh sách người dùng" }, 500);
  }
});

// Get user by ID
app.get("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🔄 [Server] GET /users/${id}`);
    
    const users = await kv.get("users") || [];
    const user = users.find((u: any) => u.id === id);
    
    if (!user) {
      console.error(`❌ [Server] User not found: ${id}`);
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    const { password, ...userWithoutPassword } = user;
    console.log(`✅ [Server] User found: ${userWithoutPassword.username}`);
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("❌ [Server] Get user error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Create new user (with auto student/teacher creation)
app.post("/make-server-e2861589/users", async (c) => {
  try {
    const data = await c.req.json();
    console.log('🔄 [Server] POST /users - Creating new user:', data.username, 'Role:', data.role);
    
    const { studentData, teacherData, ...userData } = data;
    
    // Generate ID
    const newUser = {
      id: `U${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    // Add to users list
    const users = await kv.get("users") || [];
    
    // Check if username already exists
    if (users.some((u: any) => u.username === userData.username)) {
      console.error('❌ [Server] Username already exists:', userData.username);
      return c.json({ error: "Tên đăng nhập đã tồn tại" }, 400);
    }
    
    users.push(newUser);
    await kv.set("users", users);
    console.log(`✅ [Server] User created: ${newUser.id} (${newUser.username})`);
    
    // If role is student, create student record
    if (userData.role === 'student' && studentData) {
      console.log('📚 [Server] Creating student record for user:', newUser.id);
      const students = await kv.get("students") || [];
      const newStudent = {
        id: `S${Date.now()}`,
        userId: newUser.id,
        code: await generateStudentCode(),
        fullName: userData.fullName,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        address: studentData.address || '',
        email: userData.email,
        phone: userData.phone,
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
        class: studentData.className,
        enrollmentDate: studentData.enrollmentDate,
        status: userData.status,
        tuitionFee: studentData.tuitionFee || 0,
        campus: studentData.campus,
        createdAt: new Date().toISOString(),
      };
      students.push(newStudent);
      await kv.set("students", students);
      console.log(`✅ [Server] Student created: ${newStudent.id} (${newStudent.code})`);
    }
    
    // If role is teacher, create teacher record
    if (userData.role === 'teacher' && teacherData) {
      console.log('👨‍🏫 [Server] Creating teacher record for user:', newUser.id);
      const teachers = await kv.get("teachers") || [];
      const newTeacher = {
        id: `T${Date.now()}`,
        userId: newUser.id,
        code: await generateTeacherCode(),
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        specialization: teacherData.specialization,
        status: userData.status,
        salary: teacherData.salary || 0,
        startDate: teacherData.startDate,
        campus: teacherData.campus,
        createdAt: new Date().toISOString(),
      };
      teachers.push(newTeacher);
      await kv.set("teachers", teachers);
      console.log(`✅ [Server] Teacher created: ${newTeacher.id} (${newTeacher.code})`);
    }
    
    // Return without password
    const { password, ...userWithoutPassword } = newUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("❌ [Server] Create user error:", error);
    return c.json({ error: "Không thể tạo người dùng: " + error.message }, 500);
  }
});

// Update user
app.put("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log(`🔄 [Server] PUT /users/${id} - Updating user`);
    
    const users = await kv.get("users") || [];
    const index = users.findIndex((u: any) => u.id === id);
    
    if (index === -1) {
      console.error(`❌ [Server] User not found: ${id}`);
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    // Update user (keep password if not provided)
    const { password, studentData, teacherData, ...userData } = updates;
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    // Only update password if provided
    if (password) {
      users[index].password = password;
    }
    
    await kv.set("users", users);
    console.log(`✅ [Server] User updated: ${id}`);
    
    // Update corresponding student/teacher record if data provided
    if (users[index].role === 'student' && studentData) {
      const students = await kv.get("students") || [];
      const studentIndex = students.findIndex((s: any) => s.userId === id);
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          ...studentData,
          fullName: userData.fullName || students[studentIndex].fullName,
          email: userData.email || students[studentIndex].email,
          phone: userData.phone || students[studentIndex].phone,
          updatedAt: new Date().toISOString(),
        };
        await kv.set("students", students);
        console.log(`✅ [Server] Student record updated`);
      }
    }
    
    if (users[index].role === 'teacher' && teacherData) {
      const teachers = await kv.get("teachers") || [];
      const teacherIndex = teachers.findIndex((t: any) => t.userId === id);
      if (teacherIndex !== -1) {
        teachers[teacherIndex] = {
          ...teachers[teacherIndex],
          ...teacherData,
          fullName: userData.fullName || teachers[teacherIndex].fullName,
          email: userData.email || teachers[teacherIndex].email,
          phone: userData.phone || teachers[teacherIndex].phone,
          updatedAt: new Date().toISOString(),
        };
        await kv.set("teachers", teachers);
        console.log(`✅ [Server] Teacher record updated`);
      }
    }
    
    const { password: _, ...userWithoutPassword } = users[index];
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("❌ [Server] Update user error:", error);
    return c.json({ error: "Đã xảy ra lỗi khi cập nhật" }, 500);
  }
});

// Delete user
app.delete("/make-server-e2861589/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🔄 [Server] DELETE /users/${id}`);
    
    const users = await kv.get("users") || [];
    const user = users.find((u: any) => u.id === id);
    
    if (!user) {
      console.error(`❌ [Server] User not found: ${id}`);
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    // Delete user
    const filtered = users.filter((u: any) => u.id !== id);
    await kv.set("users", filtered);
    console.log(`✅ [Server] User deleted: ${id}`);
    
    // Delete corresponding student/teacher record
    if (user.role === 'student') {
      const students = await kv.get("students") || [];
      const filteredStudents = students.filter((s: any) => s.userId !== id);
      await kv.set("students", filteredStudents);
      console.log(`✅ [Server] Student record deleted`);
    }
    
    if (user.role === 'teacher') {
      const teachers = await kv.get("teachers") || [];
      const filteredTeachers = teachers.filter((t: any) => t.userId !== id);
      await kv.set("teachers", filteredTeachers);
      console.log(`✅ [Server] Teacher record deleted`);
    }
    
    return c.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("❌ [Server] Delete user error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Update user status
app.patch("/make-server-e2861589/users/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    console.log(`🔄 [Server] PATCH /users/${id}/status - Setting status to:`, status);
    
    const users = await kv.get("users") || [];
    const index = users.findIndex((u: any) => u.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    users[index].status = status;
    await kv.set("users", users);
    console.log(`✅ [Server] User status updated: ${id} -> ${status}`);
    
    const { password, ...userWithoutPassword } = users[index];
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("❌ [Server] Update status error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Reset user password
app.post("/make-server-e2861589/users/:id/reset-password", async (c) => {
  try {
    const id = c.req.param("id");
    const { newPassword } = await c.req.json();
    console.log(`🔄 [Server] POST /users/${id}/reset-password`);
    
    const users = await kv.get("users") || [];
    const index = users.findIndex((u: any) => u.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    users[index].password = newPassword;
    await kv.set("users", users);
    console.log(`✅ [Server] Password reset for user: ${id}`);
    
    return c.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("❌ [Server] Reset password error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// STUDENTS
// ========================================

app.get("/make-server-e2861589/students", async (c) => {
  try {
    const students = await kv.get("students") || [];
    return c.json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/students", async (c) => {
  try {
    const student = await c.req.json();
    const students = await kv.get("students") || [];
    students.push(student);
    await kv.set("students", students);
    
    // Also create user account
    const users = await kv.get("users") || [];
    users.push({
      id: student.id,
      username: student.username,
      password: "123456", // Default password
      fullName: student.fullName,
      role: "student",
      email: student.email,
      phone: student.phone,
      avatar: student.avatar
    });
    await kv.set("users", users);
    
    return c.json({ student });
  } catch (error) {
    console.error("Create student error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedStudent = await c.req.json();
    const students = await kv.get("students") || [];
    const index = students.findIndex((s: any) => s.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy học viên" }, 404);
    }
    
    students[index] = { ...students[index], ...updatedStudent };
    await kv.set("students", students);
    
    // Update user account
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        fullName: updatedStudent.fullName || users[userIndex].fullName,
        email: updatedStudent.email || users[userIndex].email,
        phone: updatedStudent.phone || users[userIndex].phone,
        avatar: updatedStudent.avatar || users[userIndex].avatar
      };
      await kv.set("users", users);
    }
    
    return c.json({ student: students[index] });
  } catch (error) {
    console.error("Update student error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const students = await kv.get("students") || [];
    const filtered = students.filter((s: any) => s.id !== id);
    await kv.set("students", filtered);
    
    // Also delete user account
    const users = await kv.get("users") || [];
    const filteredUsers = users.filter((u: any) => u.id !== id);
    await kv.set("users", filteredUsers);
    
    return c.json({ message: "Xóa học viên thành công" });
  } catch (error) {
    console.error("Delete student error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// TEACHERS
// ========================================

app.get("/make-server-e2861589/teachers", async (c) => {
  try {
    const teachers = await kv.get("teachers") || [];
    return c.json({ teachers });
  } catch (error) {
    console.error("Get teachers error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/teachers", async (c) => {
  try {
    const teacher = await c.req.json();
    const teachers = await kv.get("teachers") || [];
    teachers.push(teacher);
    await kv.set("teachers", teachers);
    
    // Also create user account
    const users = await kv.get("users") || [];
    users.push({
      id: teacher.id,
      username: teacher.username,
      password: "123456", // Default password
      fullName: teacher.fullName,
      role: "teacher",
      email: teacher.email,
      phone: teacher.phone,
      avatar: teacher.avatar
    });
    await kv.set("users", users);
    
    return c.json({ teacher });
  } catch (error) {
    console.error("Create teacher error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/teachers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedTeacher = await c.req.json();
    const teachers = await kv.get("teachers") || [];
    const index = teachers.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy giáo viên" }, 404);
    }
    
    teachers[index] = { ...teachers[index], ...updatedTeacher };
    await kv.set("teachers", teachers);
    
    // Update user account
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        fullName: updatedTeacher.fullName || users[userIndex].fullName,
        email: updatedTeacher.email || users[userIndex].email,
        phone: updatedTeacher.phone || users[userIndex].phone,
        avatar: updatedTeacher.avatar || users[userIndex].avatar
      };
      await kv.set("users", users);
    }
    
    return c.json({ teacher: teachers[index] });
  } catch (error) {
    console.error("Update teacher error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/teachers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const teachers = await kv.get("teachers") || [];
    const filtered = teachers.filter((t: any) => t.id !== id);
    await kv.set("teachers", filtered);
    
    // Also delete user account
    const users = await kv.get("users") || [];
    const filteredUsers = users.filter((u: any) => u.id !== id);
    await kv.set("users", filteredUsers);
    
    return c.json({ message: "Xóa giáo viên thành công" });
  } catch (error) {
    console.error("Delete teacher error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// CLASSES
// ========================================

app.get("/make-server-e2861589/classes", async (c) => {
  try {
    const classes = await kv.get("classes") || [];
    return c.json({ classes });
  } catch (error) {
    console.error("Get classes error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/classes", async (c) => {
  try {
    const classData = await c.req.json();
    const classes = await kv.get("classes") || [];
    classes.push(classData);
    await kv.set("classes", classes);
    return c.json({ class: classData });
  } catch (error) {
    console.error("Create class error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/classes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedClass = await c.req.json();
    const classes = await kv.get("classes") || [];
    const index = classes.findIndex((cls: any) => cls.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy lớp học" }, 404);
    }
    
    classes[index] = { ...classes[index], ...updatedClass };
    await kv.set("classes", classes);
    return c.json({ class: classes[index] });
  } catch (error) {
    console.error("Update class error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/classes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const classes = await kv.get("classes") || [];
    const filtered = classes.filter((cls: any) => cls.id !== id);
    await kv.set("classes", filtered);
    return c.json({ message: "Xóa lớp học thành công" });
  } catch (error) {
    console.error("Delete class error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// SCHEDULES
// ========================================

app.get("/make-server-e2861589/schedules", async (c) => {
  try {
    const schedules = await kv.get("schedules") || [];
    return c.json({ schedules });
  } catch (error) {
    console.error("Get schedules error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/schedules", async (c) => {
  try {
    const schedule = await c.req.json();
    const schedules = await kv.get("schedules") || [];
    schedules.push(schedule);
    await kv.set("schedules", schedules);
    return c.json({ schedule });
  } catch (error) {
    console.error("Create schedule error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/schedules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedSchedule = await c.req.json();
    const schedules = await kv.get("schedules") || [];
    const index = schedules.findIndex((s: any) => s.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy lịch học" }, 404);
    }
    
    schedules[index] = { ...schedules[index], ...updatedSchedule };
    await kv.set("schedules", schedules);
    return c.json({ schedule: schedules[index] });
  } catch (error) {
    console.error("Update schedule error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// GRADES (Điểm số)
// ========================================

app.get("/make-server-e2861589/grades", async (c) => {
  try {
    const grades = await kv.get("grades") || [];
    return c.json({ grades });
  } catch (error) {
    console.error("Get grades error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/grades", async (c) => {
  try {
    const grade = await c.req.json();
    const grades = await kv.get("grades") || [];
    grades.push(grade);
    await kv.set("grades", grades);
    return c.json({ grade });
  } catch (error) {
    console.error("Create grade error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/grades/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedGrade = await c.req.json();
    const grades = await kv.get("grades") || [];
    const index = grades.findIndex((g: any) => g.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy bản ghi điểm" }, 404);
    }
    
    grades[index] = { ...grades[index], ...updatedGrade };
    await kv.set("grades", grades);
    return c.json({ grade: grades[index] });
  } catch (error) {
    console.error("Update grade error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Batch update grades (nhập điểm hàng loạt)
app.post("/make-server-e2861589/grades/batch", async (c) => {
  try {
    const newGrades = await c.req.json();
    const grades = await kv.get("grades") || [];
    
    for (const newGrade of newGrades) {
      const index = grades.findIndex((g: any) => 
        g.studentId === newGrade.studentId && 
        g.classId === newGrade.classId && 
        g.examType === newGrade.examType
      );
      
      if (index !== -1) {
        grades[index] = { ...grades[index], ...newGrade };
      } else {
        grades.push(newGrade);
      }
    }
    
    await kv.set("grades", grades);
    return c.json({ message: "Cập nhật điểm thành công", count: newGrades.length });
  } catch (error) {
    console.error("Batch update grades error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// DOCUMENTS
// ========================================

app.get("/make-server-e2861589/documents", async (c) => {
  try {
    const documents = await kv.get("documents") || [];
    return c.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/documents", async (c) => {
  try {
    const document = await c.req.json();
    const documents = await kv.get("documents") || [];
    documents.push(document);
    await kv.set("documents", documents);
    return c.json({ document });
  } catch (error) {
    console.error("Create document error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/documents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const documents = await kv.get("documents") || [];
    const filtered = documents.filter((d: any) => d.id !== id);
    await kv.set("documents", filtered);
    return c.json({ message: "Xóa tài liệu thành công" });
  } catch (error) {
    console.error("Delete document error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// ASSIGNMENTS (Bài tập)
// ========================================

app.get("/make-server-e2861589/assignments", async (c) => {
  try {
    const assignments = await kv.get("assignments") || [];
    return c.json({ assignments });
  } catch (error) {
    console.error("Get assignments error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/assignments", async (c) => {
  try {
    const assignment = await c.req.json();
    const assignments = await kv.get("assignments") || [];
    assignments.push(assignment);
    await kv.set("assignments", assignments);
    return c.json({ assignment });
  } catch (error) {
    console.error("Create assignment error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedAssignment = await c.req.json();
    const assignments = await kv.get("assignments") || [];
    const index = assignments.findIndex((a: any) => a.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy bài tập" }, 404);
    }
    
    assignments[index] = { ...assignments[index], ...updatedAssignment };
    await kv.set("assignments", assignments);
    return c.json({ assignment: assignments[index] });
  } catch (error) {
    console.error("Update assignment error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/assignments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const assignments = await kv.get("assignments") || [];
    const filtered = assignments.filter((a: any) => a.id !== id);
    await kv.set("assignments", filtered);
    return c.json({ message: "Xóa bài tập thành công" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// FEEDBACK (Phản hồi)
// ========================================

app.get("/make-server-e2861589/feedback", async (c) => {
  try {
    const feedback = await kv.get("feedback") || [];
    return c.json({ feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/feedback", async (c) => {
  try {
    const newFeedback = await c.req.json();
    const feedback = await kv.get("feedback") || [];
    feedback.push(newFeedback);
    await kv.set("feedback", feedback);
    return c.json({ feedback: newFeedback });
  } catch (error) {
    console.error("Create feedback error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/feedback/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedFeedback = await c.req.json();
    const feedback = await kv.get("feedback") || [];
    const index = feedback.findIndex((f: any) => f.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy phản hồi" }, 404);
    }
    
    feedback[index] = { ...feedback[index], ...updatedFeedback };
    await kv.set("feedback", feedback);
    return c.json({ feedback: feedback[index] });
  } catch (error) {
    console.error("Update feedback error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// NOTIFICATIONS (Thông báo)
// ========================================

app.get("/make-server-e2861589/notifications", async (c) => {
  try {
    const notifications = await kv.get("notifications") || [];
    return c.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.post("/make-server-e2861589/notifications", async (c) => {
  try {
    const notification = await c.req.json();
    const notifications = await kv.get("notifications") || [];
    notifications.push(notification);
    await kv.set("notifications", notifications);
    return c.json({ notification });
  } catch (error) {
    console.error("Create notification error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.put("/make-server-e2861589/notifications/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedNotification = await c.req.json();
    const notifications = await kv.get("notifications") || [];
    const index = notifications.findIndex((n: any) => n.id === id);
    
    if (index === -1) {
      return c.json({ error: "Không tìm thấy thông báo" }, 404);
    }
    
    notifications[index] = { ...notifications[index], ...updatedNotification };
    await kv.set("notifications", notifications);
    return c.json({ notification: notifications[index] });
  } catch (error) {
    console.error("Update notification error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

app.delete("/make-server-e2861589/notifications/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const notifications = await kv.get("notifications") || [];
    const filtered = notifications.filter((n: any) => n.id !== id);
    await kv.set("notifications", filtered);
    return c.json({ message: "Xóa thông báo thành công" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// ========================================
// ADMIN - Initialize default data
// ========================================

app.post("/make-server-e2861589/admin/init-data", async (c) => {
  try {
    const data = await c.req.json();
    
    // Initialize all data collections
    if (data.users) await kv.set("users", data.users);
    if (data.students) await kv.set("students", data.students);
    if (data.teachers) await kv.set("teachers", data.teachers);
    if (data.campuses) await kv.set("campuses", data.campuses);
    if (data.classes) await kv.set("classes", data.classes);
    if (data.schedules) await kv.set("schedules", data.schedules);
    if (data.notifications) await kv.set("notifications", data.notifications);
    if (data.grades) await kv.set("grades", data.grades || []);
    if (data.documents) await kv.set("documents", data.documents || []);
    if (data.assignments) await kv.set("assignments", data.assignments || []);
    if (data.feedback) await kv.set("feedback", data.feedback || []);
    
    return c.json({ message: "Khởi tạo dữ liệu thành công" });
  } catch (error) {
    console.error("Init data error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Reset database - Clear all data (like Spring Boot ddl-auto=create-drop)
app.post("/make-server-e2861589/admin/reset-data", async (c) => {
  try {
    console.log('🔄 [Admin] Resetting database...');
    
    // Clear all collections
    await kv.set("users", []);
    await kv.set("students", []);
    await kv.set("teachers", []);
    await kv.set("campuses", []);
    await kv.set("classes", []);
    await kv.set("schedules", []);
    await kv.set("notifications", []);
    await kv.set("grades", []);
    await kv.set("documents", []);
    await kv.set("assignments", []);
    await kv.set("feedback", []);
    await kv.set("reset_codes", {});
    
    console.log('✅ [Admin] Database reset successfully!');
    return c.json({ message: "Xóa toàn bộ dữ liệu thành công" });
  } catch (error) {
    console.error("❌ [Admin] Reset data error:", error);
    return c.json({ error: "Đã xảy ra lỗi" }, 500);
  }
});

// Debug endpoint - View all users (without passwords)
app.get("/make-server-e2861589/debug/users", async (c) => {
  try {
    console.log('🔍 [Debug] Fetching all users...');
    const users = await kv.get("users") || [];
    
    // Remove passwords for security
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      email: u.email,
      phone: u.phone,
      code: u.code,
      // ⚠️ NOT returning password for security!
    }));
    
    console.log(`✅ [Debug] Found ${users.length} users`);
    return c.json({ 
      count: users.length,
      users: safeUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ [Debug] Failed to get users:", error);
    return c.json({ error: "Không thể lấy danh sách users" }, 500);
  }
});

// Debug endpoint - View user by username
app.get("/make-server-e2861589/debug/user/:username", async (c) => {
  try {
    const username = c.req.param('username');
    console.log('🔍 [Debug] Looking for username:', username);
    
    const users = await kv.get("users") || [];
    const user = users.find((u: any) => u.username === username);
    
    if (!user) {
      return c.json({ error: `User '${username}' not found` }, 404);
    }
    
    // Remove password
    const { password: _, ...safeUser } = user;
    
    console.log('✅ [Debug] Found user:', user.fullName);
    return c.json({ user: safeUser });
  } catch (error) {
    console.error("❌ [Debug] Failed to get user:", error);
    return c.json({ error: "Không thể lấy thông tin user" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-e2861589/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);