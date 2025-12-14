# 🎓 English Complex - Hệ thống Quản lý Trung tâm Anh ngữ

![Version](https://img.shields.io/badge/version-8.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ecf8e)

Hệ thống quản lý nội bộ toàn diện cho trung tâm Anh ngữ English Complex, hỗ trợ 4 nhóm người dùng với 11 module chức năng.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open browser
# http://localhost:3000
```

**👉 XEM NGAY:** [START_HERE.md](START_HERE.md) - Hướng dẫn chi tiết từng bước!

---

## 📋 Tính năng chính

### 👥 4 Nhóm người dùng
- 🎯 **Học vụ (Academic):** Quản lý toàn bộ hệ thống
- 👨‍🏫 **Giáo viên (Teacher):** Quản lý lớp học, điểm danh, nhập điểm
- 🎓 **Học viên (Student):** Xem lịch học, điểm số, tài liệu
- 📊 **Giám đốc (Director):** Xem báo cáo, thống kê

### 🎯 11 Module chức năng
1. **Quản lý học viên** - CRUD, phân lớp, theo dõi tiến độ
2. **Quản lý giáo viên** - Profile, chứng chỉ, lịch dạy
3. **Quản lý lớp học** - 4 level IELTS, lịch học, sĩ số
4. **Quản lý lịch học** - Schedule, calendar view
5. **Điểm danh** - Attendance tracking
6. **Quản lý điểm** - Input điểm 4 kỹ năng, tính overall
7. **Quản lý tài liệu** - Upload, chia sẻ materials
8. **Quản lý bài tập** - Assignment, deadline
9. **Phản hồi** - Feedback từ học viên
10. **Báo cáo thống kê** - Charts, analytics
11. **Quản lý cơ sở** - Campus management

### 🎨 Design System
- 🎨 Màu chủ đạo: `#2baec0` (Teal)
- 🎭 Theme: Pastel, xanh-trắng chuyên nghiệp
- 📱 Responsive: Desktop & Mobile
- 🎯 UI/UX: Modern, intuitive

### 🗄️ Database & Backend
- ☁️ **Supabase Cloud Database** - KV Store
- 🔌 **50+ API Endpoints** - RESTful API
- 🔐 **Authentication** - Login, forgot password, reset
- 🚀 **Auto-initialization** - Sample data included
- 💾 **Persistent storage** - Data không mất khi refresh

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 18.2** - UI framework
- 📘 **TypeScript 5.2** - Type safety
- 🎨 **Tailwind CSS 4.0** - Styling
- 🛣️ **React Router 6** - Navigation
- 📊 **Recharts** - Data visualization
- 🎯 **Lucide React** - Icons

### Backend
- ☁️ **Supabase** - Cloud platform
- 🔥 **Edge Functions** - Serverless API
- 🗄️ **KV Store** - Database
- 🔐 **Supabase Auth** - Authentication

### Build Tools
- ⚡ **Vite 5** - Build tool
- 📦 **npm** - Package manager
- 🔧 **ESLint** - Linting
- 📝 **PostCSS** - CSS processing

---

## 📁 Project Structure

```
english-complex/
├── index.html                  # Entry point HTML
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
│
├── src/
│   ├── main.tsx                # React entry point
│   └── App.tsx                 # Main component
│
├── components/
│   ├── LoginPage.tsx           # Login UI
│   ├── DashboardLayout.tsx     # Dashboard layout
│   ├── NotificationPanel.tsx   # Notifications
│   ├── ProfilePage.tsx         # User profile
│   │
│   ├── dashboards/             # Role-based dashboards
│   │   ├── AcademicDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── DirectorDashboard.tsx
│   │
│   ├── modules/                # Feature modules
│   │   ├── StudentManagement.tsx
│   │   ├── TeacherManagement.tsx
│   │   ├── ClassManagement.tsx
│   │   ├── ScheduleManagement.tsx
│   │   ├── AttendanceManagement.tsx
│   │   ├── GradeManagement.tsx
│   │   ├── DocumentManagement.tsx
│   │   ├── AssignmentManagement.tsx
│   │   ├── FeedbackManagement.tsx
│   │   ├── ReportStatistics.tsx
│   │   ├── CampusManagement.tsx
│   │   └── UserManagement.tsx
│   │
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ... (30+ components)
│
├── styles/
│   └── globals.css             # Global styles + Tailwind
│
├── utils/
│   ├── api.ts                  # API functions
│   ├── initDatabase.ts         # Database initialization
│   └── supabase/
│       └── info.tsx            # Supabase credentials
│
├── data/
│   ├── mockData.ts             # Sample data
│   └── schedules.ts            # Schedule data
│
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx       # Backend server (Hono)
            └── kv_store.tsx    # Database utilities
```

---

## 🔑 Demo Accounts

### Academic (Học vụ)
```
Username: huongvtt
Password: 123456
Role: Quản lý toàn bộ hệ thống
```

### Teacher (Giáo viên)
```
Username: lanntm, binhtv, anhltpt, etc.
Password: 123456
Role: Quản lý lớp học, điểm danh, nhập điểm
```

### Student (Học viên)
```
Username: huyenntk, anhtm, namlh, etc.
Password: 123456
Role: Xem lịch học, điểm số, tài liệu
```

### Director (Giám đốc)
```
Username: duccv
Password: 123456
Role: Xem báo cáo, thống kê
```

👉 **Chi tiết:** [ACCOUNTS.md](ACCOUNTS.md)

---

## 🚀 Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

App chạy tại: `http://localhost:3000`

### Build for Production
```bash
npm run build
```

Output: `build/` folder

### Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment

### Option 1: Subdomain (RECOMMENDED)
```bash
# 1. Tạo subdomain: english.yoursite.com
# 2. Build
npm run build

# 3. Upload build/* vào /public_html/english/
# 4. Truy cập: english.yoursite.com
```

### Option 2: Subfolder
```bash
# 1. Config base path
# vite.config.ts → base: '/english-complex/'

# 2. Build
npm run build

# 3. Upload build/* vào /public_html/english-complex/
# 4. Copy .htaccess
# 5. Truy cập: yoursite.com/english-complex
```

👉 **Chi tiết:** [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

---

## 📚 Documentation

### Quick Start
- 🚀 [START_HERE.md](START_HERE.md) - Bắt đầu từ đây!
- 🔧 [FIX_STRUCTURE.md](FIX_STRUCTURE.md) - Fix cấu trúc project

### Database
- 📖 [QUICK_START_DATABASE.md](QUICK_START_DATABASE.md) - Database quick guide
- 📗 [DATABASE_GUIDE.md](DATABASE_GUIDE.md) - API documentation
- 🧪 [TEST_DATABASE.md](TEST_DATABASE.md) - Testing guide
- 📘 [README_DATABASE.md](README_DATABASE.md) - Database overview

### Deployment
- 🚀 [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Deployment guide
- 🔧 [TROUBLESHOOTING_DEPLOY.md](TROUBLESHOOTING_DEPLOY.md) - Fix deploy issues

### System
- 📊 [SYSTEM_INFO.md](SYSTEM_INFO.md) - System architecture
- 🎨 [COLOR_SYSTEM.md](COLOR_SYSTEM.md) - Design system
- ⚡ [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - Advanced features
- 📋 [ACCOUNTS.md](ACCOUNTS.md) - Demo accounts

---

## 🧪 Testing

### Test Login
```bash
npm run dev
# Mở localhost:3000
# Login: huongvtt / 123456
```

### Test Database
```javascript
// Mở Console (F12)
localStorage.removeItem('english_complex_db_initialized');
location.reload();
// Database sẽ khởi tạo lại với sample data
```

### Test API
```javascript
// Mở Console (F12)
import { studentAPI } from './utils/api';
const { students } = await studentAPI.getAll();
console.log(students);
```

---

## 🐛 Troubleshooting

### Issue: `npm run dev` không hiện gì
**Fix:** Xem [FIX_STRUCTURE.md](FIX_STRUCTURE.md)

### Issue: Trang trắng sau deploy
**Fix:** Xem [TROUBLESHOOTING_DEPLOY.md](TROUBLESHOOTING_DEPLOY.md)

### Issue: API không hoạt động
**Fix:** Check Supabase credentials trong `/utils/supabase/info.tsx`

### Issue: Database không khởi tạo
**Fix:**
```javascript
localStorage.removeItem('english_complex_db_initialized');
location.reload();
```

---

## 📦 Features

### ✅ Completed (v8.0)
- [x] Authentication system (login, logout, forgot password)
- [x] Role-based access control (4 roles)
- [x] 11 management modules
- [x] Real database integration (Supabase)
- [x] 50+ API endpoints
- [x] Auto database initialization
- [x] Sample data (26 users, 8 classes)
- [x] Responsive design
- [x] Modern UI/UX
- [x] Performance optimization

### 🎯 Future Enhancements
- [ ] Real-time notifications (WebSocket)
- [ ] File upload to Supabase Storage
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Export to Excel/PDF
- [ ] Multi-language support
- [ ] Dark mode

---

## 🤝 Contributing

This is a private internal system for English Complex. Contributions are limited to authorized developers only.

---

## 📄 License

Private & Confidential - English Complex Internal System

---

## 📞 Support

For technical support or questions:
- 📧 Email: support@englishcomplex.edu.vn
- 📱 Phone: +84 xxx xxx xxx
- 🌐 Website: englishcomplex.edu.vn

---

## 🎉 Credits

**Developed by:** English Complex Development Team  
**Version:** 8.0.0  
**Last Updated:** December 2024  
**Powered by:** React + TypeScript + Supabase + Tailwind CSS

---

## 🔗 Quick Links

- 🚀 [Get Started](START_HERE.md)
- 📚 [Documentation](DATABASE_GUIDE.md)
- 🌐 [Deploy Guide](DEPLOY_GUIDE.md)
- 🐛 [Troubleshooting](TROUBLESHOOTING_DEPLOY.md)

---

**🎓 English Complex - Excellence in English Education**
