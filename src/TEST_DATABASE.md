# 🧪 Test Database Connection - English Complex

## ✅ Checklist kết nối Database

### 1. Khởi tạo Database ✓
- [x] Backend server đã tạo (Supabase Functions)
- [x] API endpoints đầy đủ cho 11 modules
- [x] Authentication system (login, change password, forgot/reset)
- [x] Auto-initialize database với mock data

### 2. API Utility ✓
- [x] `/utils/api.ts` - Tất cả API functions
- [x] `/utils/initDatabase.ts` - Initialize database script
- [x] Kết nối Supabase qua `projectId` và `publicAnonKey`

### 3. Frontend Integration ✓
- [x] App.tsx - Auto init database khi load
- [x] LoginPage - Đăng nhập qua API
- [x] Loading state khi khởi tạo database

## 🔬 Test Scenarios

### Test 1: Đăng nhập
```
1. Mở app lần đầu
2. Chờ khởi tạo database (loading screen)
3. Đăng nhập với: huongvtt / 123456
4. ✅ Kỳ vọng: Đăng nhập thành công vào Academic Dashboard
```

### Test 2: Xem danh sách
```
1. Vào module "Quản lý học viên"
2. ✅ Kỳ vọng: Hiển thị 12 học viên từ database
3. Vào module "Quản lý giáo viên"  
4. ✅ Kỳ vọng: Hiển thị 12 giáo viên từ database
```

### Test 3: Thêm/Sửa/Xóa
```
1. Thêm học viên mới
2. ✅ Kỳ vọng: Học viên được lưu vào database
3. Refresh trang
4. ✅ Kỳ vọng: Học viên mới vẫn còn (không mất)
5. Sửa thông tin học viên
6. ✅ Kỳ vọng: Thông tin được cập nhật
7. Xóa học viên
8. ✅ Kỳ vọng: Học viên bị xóa khỏi database
```

### Test 4: Persistence
```
1. Thêm dữ liệu mới (học viên, lớp học, điểm số)
2. Đăng xuất
3. Refresh browser
4. Đăng nhập lại
5. ✅ Kỳ vọng: Dữ liệu vẫn còn nguyên
```

## 🐛 Debugging

### Kiểm tra kết nối API
Mở Console (F12) và chạy:

```javascript
// Test health check
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e2861589/health')
  .then(r => r.json())
  .then(console.log);
// ✅ Kỳ vọng: { status: "ok", timestamp: "..." }

// Test login
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e2861589/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_PUBLIC_KEY'
  },
  body: JSON.stringify({ username: 'huongvtt', password: '123456' })
})
  .then(r => r.json())
  .then(console.log);
// ✅ Kỳ vọng: { user: { id, username, fullName, role, ... } }
```

### Xem logs
- Mở DevTools Console
- Xem network requests (tab Network)
- Xem response từ API

### Common Issues

#### ❌ Issue: "Failed to fetch"
**Solution:**
- Kiểm tra `projectId` và `publicAnonKey` trong `/utils/supabase/info.tsx`
- Kiểm tra CORS đã được enable trong server

#### ❌ Issue: "Database not initialized"
**Solution:**
```javascript
// Xóa flag và reload
localStorage.removeItem('english_complex_db_initialized');
location.reload();
```

#### ❌ Issue: "Unauthorized"
**Solution:**
- Kiểm tra Authorization header có đúng không
- Kiểm tra token/key có hợp lệ không

## 📊 Monitor Database

### Check dữ liệu trong database
```javascript
// Vào Console và chạy:
import { studentAPI } from './utils/api';

// Xem tất cả học viên
const { students } = await studentAPI.getAll();
console.table(students);

// Xem tất cả lớp học
const { classes } = await classAPI.getAll();
console.table(classes);
```

## ✨ Expected Results

Sau khi setup thành công:
- ✅ Login hoạt động với API
- ✅ Dữ liệu load từ database thật
- ✅ Thêm/sửa/xóa được lưu vào database
- ✅ Refresh không mất dữ liệu
- ✅ Logout/Login vẫn giữ dữ liệu
- ✅ Nhiều người dùng có thể access cùng lúc

## 🎯 Next Steps

Để sử dụng database trong các modules còn lại:

1. **Import API utility**
   ```javascript
   import { studentAPI, classAPI, gradeAPI, ... } from '../utils/api';
   ```

2. **Replace mock data với API calls**
   ```javascript
   // Old (mock data)
   const [students, setStudents] = useState(mockStudents);

   // New (API)
   const [students, setStudents] = useState([]);
   
   useEffect(() => {
     const loadData = async () => {
       const { students } = await studentAPI.getAll();
       setStudents(students);
     };
     loadData();
   }, []);
   ```

3. **Update CRUD operations**
   ```javascript
   // Create
   await studentAPI.create(newStudent);
   
   // Update
   await studentAPI.update(studentId, updatedData);
   
   // Delete
   await studentAPI.delete(studentId);
   
   // Reload data
   const { students } = await studentAPI.getAll();
   setStudents(students);
   ```

---

**✅ Database connection is READY!**
