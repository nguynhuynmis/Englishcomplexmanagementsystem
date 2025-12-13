# 🗄️ Hướng dẫn Database - Hệ thống English Complex

## 📋 Tổng quan

Hệ thống quản lý English Complex hiện đã được **kết nối với database thật** thông qua Supabase. Tất cả dữ liệu được lưu trữ và thao tác trên cloud thay vì mock data.

## 🚀 Khởi tạo Database

### Tự động khởi tạo
Khi bạn chạy ứng dụng lần đầu tiên, hệ thống sẽ **tự động khởi tạo** database với:
- ✅ 4 loại người dùng: Academic, Director, Teacher, Student
- ✅ 12 học viên mẫu
- ✅ 12 giáo viên mẫu  
- ✅ 2 cơ sở
- ✅ 8 lớp học (Beginner, Intermediate, Advanced, Master)
- ✅ Lịch học chi tiết
- ✅ Thông báo mẫu

### Đặt lại Database
Nếu muốn khởi tạo lại database từ đầu:
```javascript
// Xóa flag khởi tạo trong localStorage
localStorage.removeItem('english_complex_db_initialized');
// Reload trang
location.reload();
```

## 🔐 Tài khoản Demo

### Academic (Học vụ)
- **Username:** `huongvtt`
- **Password:** `123456`
- **Quyền:** Quản lý toàn bộ hệ thống

### Director (Giám đốc)
- **Username:** `duccv`
- **Password:** `123456`
- **Quyền:** Xem báo cáo, thống kê

### Teacher (Giáo viên)
- **Username:** `lanntm`, `binhtv`, `anhltpt`, etc.
- **Password:** `123456`
- **Quyền:** Quản lý lớp học, điểm danh, nhập điểm

### Student (Học viên)
- **Username:** `huyenntk`, `anhtm`, `namlh`, etc.
- **Password:** `123456`
- **Quyền:** Xem lịch học, điểm số, tài liệu

## 🛠️ API Endpoints

### Authentication
```javascript
import { authAPI } from './utils/api';

// Đăng nhập
const response = await authAPI.login(username, password);

// Đổi mật khẩu
await authAPI.changePassword(userId, oldPassword, newPassword);

// Quên mật khẩu
await authAPI.forgotPassword(email);

// Đặt lại mật khẩu
await authAPI.resetPassword(email, code, newPassword);
```

### Students (Học viên)
```javascript
import { studentAPI } from './utils/api';

// Lấy tất cả học viên
const { students } = await studentAPI.getAll();

// Thêm học viên mới
await studentAPI.create({
  id: 'HV013',
  code: 'HV013',
  fullName: 'Nguyễn Văn A',
  username: 'nvana',
  // ... các field khác
});

// Cập nhật thông tin học viên
await studentAPI.update('HV001', {
  phone: '0987654321',
  address: 'Địa chỉ mới'
});

// Xóa học viên
await studentAPI.delete('HV001');
```

### Teachers (Giáo viên)
```javascript
import { teacherAPI } from './utils/api';

// Lấy tất cả giáo viên
const { teachers } = await teacherAPI.getAll();

// Thêm giáo viên mới
await teacherAPI.create({...});

// Cập nhật giáo viên
await teacherAPI.update(id, {...});

// Xóa giáo viên
await teacherAPI.delete(id);
```

### Classes (Lớp học)
```javascript
import { classAPI } from './utils/api';

// Lấy tất cả lớp học
const { classes } = await classAPI.getAll();

// Tạo lớp học mới
await classAPI.create({
  id: 'LH012',
  code: 'IELTS-BG-LB08',
  name: 'IELTS Beginner - LB08',
  level: 'Beginner',
  // ...
});

// Cập nhật lớp học
await classAPI.update('LH001', {
  totalStudents: 20
});
```

### Grades (Điểm số)
```javascript
import { gradeAPI } from './utils/api';

// Lấy tất cả điểm
const { grades } = await gradeAPI.getAll();

// Thêm điểm đơn lẻ
await gradeAPI.create({
  id: 'GRADE001',
  studentId: 'HV001',
  classId: 'LH001',
  examType: 'Midterm',
  listening: 7.0,
  reading: 7.5,
  writing: 6.5,
  speaking: 7.0,
  overall: 7.0
});

// Nhập điểm hàng loạt
await gradeAPI.batchUpdate([
  { studentId: 'HV001', classId: 'LH001', examType: 'Midterm', listening: 7.0, ... },
  { studentId: 'HV002', classId: 'LH001', examType: 'Midterm', listening: 6.5, ... },
  // ...
]);
```

### Schedules (Lịch học)
```javascript
import { scheduleAPI } from './utils/api';

// Lấy tất cả lịch học
const { schedules } = await scheduleAPI.getAll();

// Thêm lịch học
await scheduleAPI.create({...});

// Cập nhật lịch học (điểm danh)
await scheduleAPI.update('SCH001', {
  attendanceRecords: [
    { studentId: 'HV001', status: 'present' },
    { studentId: 'HV002', status: 'late', note: 'Đến muộn 10 phút' }
  ]
});
```

### Documents (Tài liệu)
```javascript
import { documentAPI } from './utils/api';

// Lấy tất cả tài liệu
const { documents } = await documentAPI.getAll();

// Thêm tài liệu
await documentAPI.create({
  id: 'DOC001',
  title: 'IELTS Grammar Guide',
  type: 'pdf',
  url: 'https://...',
  uploadedBy: 'GV001',
  uploadedAt: new Date().toISOString()
});
```

### Assignments (Bài tập)
```javascript
import { assignmentAPI } from './utils/api';

// Lấy tất cả bài tập
const { assignments } = await assignmentAPI.getAll();

// Tạo bài tập
await assignmentAPI.create({
  id: 'ASG001',
  classId: 'LH001',
  title: 'IELTS Writing Task 2',
  description: 'Write an essay...',
  dueDate: '2025-01-20',
  createdBy: 'GV001'
});
```

### Feedback (Phản hồi)
```javascript
import { feedbackAPI } from './utils/api';

// Lấy tất cả phản hồi
const { feedback } = await feedbackAPI.getAll();

// Gửi phản hồi
await feedbackAPI.create({
  id: 'FB001',
  studentId: 'HV001',
  classId: 'LH001',
  content: 'Giáo viên dạy rất tốt!',
  rating: 5,
  createdAt: new Date().toISOString()
});
```

### Notifications (Thông báo)
```javascript
import { notificationAPI } from './utils/api';

// Lấy tất cả thông báo
const { notifications } = await notificationAPI.getAll();

// Tạo thông báo
await notificationAPI.create({
  id: 'NTF006',
  title: 'Thông báo nghỉ lễ',
  content: 'Trung tâm nghỉ lễ 30/4 - 1/5',
  type: 'holiday',
  date: new Date().toISOString(),
  author: 'Cấn Việt Đức',
  targetRole: ['student', 'teacher', 'academic', 'director']
});
```

### Campuses (Cơ sở)
```javascript
import { campusAPI } from './utils/api';

// Lấy tất cả cơ sở
const { campuses } = await campusAPI.getAll();

// Thêm cơ sở mới
await campusAPI.create({
  id: 'CS003',
  code: 'CS003',
  name: 'Cơ sở Cầu Giấy',
  address: '123 Cầu Giấy, Hà Nội',
  phone: '024 1234 5678',
  email: 'caugiay@englishcomplex.edu.vn',
  status: 'active'
});
```

## 📊 Database Schema

### users
- id, username, password, fullName, role, email, phone, avatar, code

### students
- id, code, fullName, username, email, phone, dateOfBirth, gender, address
- school, parentName, parentPhone, campus, currentClass, enrollDate, status, avatar

### teachers
- id, code, fullName, username, email, phone, dateOfBirth, gender, address
- campus, bio, ieltsScore, toeicScore, toeflScore, certificates, specialization
- joinDate, status, avatar

### classes
- id, code, name, level, campus, room, schedule, teacher
- startDate, endDate, totalStudents, maxStudents, status

### schedules
- id, classId, className, date, dayOfWeek, startTime, endTime
- room, teacher, teacherId, campus, status, studentIds, attendanceRecords

### grades
- id, studentId, classId, examType (Midterm/Final)
- listening, reading, writing, speaking, overall, date

### documents
- id, title, description, type, url, uploadedBy, uploadedAt, targetRole

### assignments
- id, classId, title, description, dueDate, createdBy, createdAt, status

### feedback
- id, studentId, classId, content, rating, createdAt, status, response

### notifications
- id, title, content, type, date, author, isRead, targetRole

### campuses
- id, code, name, address, phone, email, status

## 🔄 Real-time Updates

Database sử dụng Supabase KV Store, hỗ trợ:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Batch operations (nhập điểm hàng loạt)
- ✅ Data persistence (dữ liệu lưu trữ vĩnh viễn)
- ✅ Fast access (truy xuất nhanh)

## 🛡️ Bảo mật

- Mật khẩu mặc định: `123456` (nên đổi sau khi đăng nhập lần đầu)
- Authentication: Token-based với Supabase
- CORS: Đã được cấu hình
- API Rate limiting: Tự động bởi Supabase

## 📝 Lưu ý

1. **Dữ liệu thật**: Tất cả thay đổi sẽ được lưu vào database thật, không mất khi refresh
2. **Mật khẩu**: Đổi mật khẩu mặc định sau khi đăng nhập lần đầu
3. **Backup**: Dữ liệu được Supabase tự động backup
4. **Giới hạn**: Free tier Supabase: 500MB storage, 50K monthly active users

## 🎯 Các thao tác phổ biến

### Thêm học viên mới và tự động tạo tài khoản
```javascript
// Khi thêm học viên mới, hệ thống tự động tạo tài khoản đăng nhập
await studentAPI.create({
  id: 'HV013',
  username: 'newstudent',
  fullName: 'Học viên mới',
  email: 'newstudent@gmail.com',
  // ... các field khác
});
// → Tự động tạo user với password mặc định: 123456
```

### Điểm danh học viên
```javascript
// Cập nhật attendance trong schedule
await scheduleAPI.update(scheduleId, {
  attendanceRecords: [
    { studentId: 'HV001', status: 'present' },
    { studentId: 'HV002', status: 'absent', note: 'Xin phép nghỉ' },
    { studentId: 'HV003', status: 'late', note: 'Đến muộn 15 phút' }
  ]
});
```

### Nhập điểm cho cả lớp
```javascript
// Batch update grades
const grades = [
  { id: 'G001', studentId: 'HV001', classId: 'LH001', examType: 'Midterm', 
    listening: 7.0, reading: 7.5, writing: 6.5, speaking: 7.0, overall: 7.0 },
  { id: 'G002', studentId: 'HV002', classId: 'LH001', examType: 'Midterm',
    listening: 6.5, reading: 7.0, writing: 6.0, speaking: 6.5, overall: 6.5 },
  // ... các học viên khác
];

await gradeAPI.batchUpdate(grades);
```

## 🚀 Deployment lên WordPress Hosting

Khi deploy lên Hostinger WordPress:

1. **Build React App**
   ```bash
   npm run build
   ```

2. **Upload lên hosting**
   - Upload folder `dist/` vào `/public_html/english-complex/`
   - URL truy cập: `yoursite.com/english-complex`

3. **Supabase hoạt động tự động**
   - Không cần cấu hình thêm
   - API calls tự động kết nối tới Supabase cloud
   - Database ở trên cloud, không cần MySQL của hosting

4. **Truy cập hệ thống**
   - Mở: `yoursite.com/english-complex`
   - Đăng nhập với tài khoản demo
   - Tất cả dữ liệu đã có sẵn!

---

**🎉 Chúc bạn sử dụng hệ thống hiệu quả!**
