# Hệ thống quản lý English Complex

## Tổng quan
Hệ thống quản lý trung tâm Anh ngữ English Complex - Website nội bộ phục vụ 4 nhóm người dùng với 11 module chính.

## Tài khoản đăng nhập

### 1. Bộ phận Học vụ (Academic)
- **Username:** `admin`
- **Password:** `admin123`
- **Quyền hạn:** Quản lý toàn bộ hệ thống

### 2. Giáo viên (Teacher)
- **Username:** `teacher`
- **Password:** `teacher123`
- **Quyền hạn:** Xem lớp học, lịch dạy, nhập điểm, quản lý tài liệu

### 3. Học viên (Student)
- **Username:** `student`
- **Password:** `student123`
- **Quyền hạn:** Xem lịch học, điểm số cá nhân, tài liệu, nộp bài tập

### 4. Ban Giám đốc (Director)
- **Username:** `director`
- **Password:** `director123`
- **Quyền hạn:** Xem báo cáo tổng quan, phân tích, phản hồi

## Các module chính

### 1. Dashboard (Trang chủ)
- Academic: Tổng quan học viên, lớp học, giáo viên, lịch học hôm nay
- Teacher: Lịch dạy, lớp đang dạy, bài tập cần chấm
- Student: Lớp đang học, lịch học, điểm số, bài tập
- Director: Báo cáo tổng quan, biểu đồ, hiệu suất

### 2. Quản lý học viên (Students Management)
- ✅ Thêm/Sửa/Xóa học viên
- ✅ Tìm kiếm, lọc theo cơ sở, trạng thái
- ✅ Xem chi tiết hồ sơ học viên
- ✅ **Form chỉnh sửa đầy đủ** - Tất cả thông tin (cá nhân, phụ huynh, học tập) 🆕
- ✅ **Tab "Quá trình học tập"** - Xem lịch sử học tập trong detail view 🆕

### 3. Quản lý giáo viên (Teachers Management) 
- ✅ Thêm/Sửa/Xóa giáo viên
- ✅ Quản lý thông tin, lớp phụ trách
- ✅ Xem chi tiết hồ sơ

### 4. Quản lý lớp học (Classes Management)
- ✅ Thêm/Sửa lớp học
- ✅ Ghi danh học viên
- ✅ **Kiểm tra lớp đầy khi thêm học viên**
- ✅ 4 khóa học: Beginner, Intermediate, Advanced, Master

### 5. Quản lý lịch học (Schedule Management)
- ✅ Xem lịch theo tuần/tháng
- ✅ Thêm/Sửa lịch học
- ✅ Lọc theo giáo viên, lớp, phòng

### 6. Điểm danh (Attendance Management)
- ✅ Điểm danh theo buổi học
- ✅ Thống kê chuyên cần
- ✅ Xuất báo cáo

### 7. Quản lý điểm / Quá trình học tập (Grades Management)
- ✅ **Học viên: Menu "Quá trình học tập"** - chỉ xem điểm của mình
- ✅ **Academic/Teacher: "Quản lý điểm"** - xem tất cả
- ✅ **Giao diện nhập điểm** (giữa kỳ + cuối kỳ)
- ✅ Tính IELTS Overall tự động
- ✅ Xuất PDF báo cáo điểm
- ✅ **View theo lớp** - Xem và quản lý điểm theo từng lớp học 🆕
- ✅ **Dropdown chọn lớp** - Hiển thị điểm tất cả học viên trong lớp 🆕

### 8. Tài liệu - Thông báo (Documents Management)
- ✅ **Ẩn/Hiển thị thông báo** (chỉ admin/director)
- ✅ **Xóa thông báo-tài liệu** (chỉ admin/director)
- ✅ Tải lên tài liệu (giáo trình, slide, bài tập)
- ✅ Tạo thông báo với độ ưu tiên
- ✅ Phân quyền xem theo vai trò và cơ sở

### 9. Bài tập (Assignments Management)
- ✅ Tạo/Giao bài tập
- ✅ Học viên nộp bài
- ✅ Giáo viên chấm điểm

### 10. Phản hồi (Feedback Management)
- ✅ Học viên gửi phản hồi
- ✅ Academic/Director xử lý

### 11. Quản lý người dùng (User Management)
- ✅ **Phân quyền vai trò dạng Tab** (không chuyển màn hình)
- ✅ Thêm/Sửa/Xóa người dùng
- ✅ 4 vai trò: Academic, Teacher, Student, Director

## Thiết kế

### Màu sắc chủ đạo
- **Brand Primary:** `#2baec0` (Xanh pastel)
- **Tone:** Pastel, tông xanh-trắng chuyên nghiệp
- **Sidebar:** Bên trái với icon rõ ràng
- **Header:** Thông tin người dùng, avatar

### Trải nghiệm người dùng
- Responsive design
- Loading states
- Empty states với icon đẹp
- Modal forms dễ sử dụng
- Toast notifications

## Các khóa học IELTS

Trung tâm chỉ cung cấp 4 khóa học:

1. **IELTS Beginner** (A1-A2)
   - Dành cho người mới bắt đầu
   - Mục tiêu: 4.0-5.0

2. **IELTS Intermediate** (B1-B2)
   - Trình độ trung cấp
   - Mục tiêu: 5.5-6.5

3. **IELTS Advanced** (C1)
   - Trình độ cao
   - Mục tiêu: 7.0-8.0

4. **IELTS Master** (C2)
   - Trình độ thành thạo
   - Mục tiêu: 8.5-9.0

## Cơ sở

1. **Long Biên** (CS001)
2. **Hai Bà Trưng** (CS002)

## Công nghệ sử dụng

- **Frontend:** React + TypeScript
- **Routing:** React Router
- **Styling:** Tailwind CSS v4.0
- **Icons:** Lucide React
- **State:** React Hooks

## Các tính năng đặc biệt

### 1. Quản lý điểm IELTS
- Tự động tính Overall Band theo chuẩn IELTS
- Làm tròn điểm: 0.25 → 0, 0.25-0.75 → 0.5, >0.75 → 1
- Điểm trung bình: Giữa kỳ 40% + Cuối kỳ 60%

### 2. Phân quyền chi tiết
- Academic: Full quyền
- Teacher: Xem lớp + nhập điểm + tài liệu
- Student: Xem thông tin cá nhân
- Director: Báo cáo + phân tích

### 3. Kiểm tra nghiệp vụ
- ✅ Kiểm tra lớp đầy khi ghi danh
- ✅ Validate điểm IELTS (0-9, bước 0.5)
- ✅ Xác nhận trước khi xóa

### 4. Quản lý thông báo thông minh
- Độ ưu tiên: Normal, High, Urgent
- Đối tượng: All, Student, Teacher, Academic, Director
- Cơ sở: All, Long Biên, Hai Bà Trưng
- **Ẩn/Hiển thị** cho admin
- **Xóa** với xác nhận

## Lưu ý khi sử dụng

1. **Đăng nhập:** Sử dụng tài khoản test ở trên
2. **Dữ liệu:** Mock data, không lưu database
3. **Refresh:** Mất dữ liệu khi refresh (mock data reset)
4. **Responsive:** Tốt nhất trên desktop, responsive tablet/mobile

## Các cập nhật gần đây

### ✅ Hoàn thành 100% (Phiên bản 8.0 - 11/12/2024)
1. Xóa học viên/giáo viên/người dùng với icon Trash2
2. Menu "Quá trình học tập" cho học viên (thay "Quản lý điểm")
3. Học viên chỉ xem điểm của mình
4. Giao diện nhập điểm đầy đủ (modal)
5. Kiểm tra lớp đầy khi thêm học viên
6. Ẩn/Hiển thị & Xóa thông báo-tài liệu
7. Phân quyền vai trò dạng Tab (không chuyển màn hình)
8. **Quản lý điểm theo lớp** - View và dropdown chọn lớp 🆕
9. **Form sửa học viên** - Đầy đủ validation và fields 🆕
10. **Date Range Picker** - Lọc báo cáo theo khoảng thời gian 🆕
11. **Lịch sử học tập** - Module hoàn chỉnh với biểu đồ và nhận xét 🆕

### 📚 Tài liệu chi tiết
- Xem file `/ADVANCED_FEATURES.md` để biết thêm chi tiết về 4 tính năng mới

### 🔄 Hoàn thiện
- ✅ Tất cả tính năng core đã hoàn thành
- ✅ Hệ thống sẵn sàng production

## Liên hệ & Hỗ trợ

- **Developer:** English Complex Dev Team
- **Version:** 8.0 - Advanced Features
- **Last Update:** 11/12/2024