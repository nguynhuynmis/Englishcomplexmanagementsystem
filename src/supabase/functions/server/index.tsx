import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

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
    const { userId, oldPassword, newPassword } = await c.req.json();
    
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      return c.json({ error: "Không tìm thấy người dùng" }, 404);
    }
    
    if (users[userIndex].password !== oldPassword) {
      return c.json({ error: "Mật khẩu cũ không đúng" }, 401);
    }
    
    users[userIndex].password = newPassword;
    await kv.set("users", users);
    
    return c.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({ error: "Đã xảy ra lỗi khi đổi mật khẩu" }, 500);
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

// Health check endpoint
app.get("/make-server-e2861589/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);