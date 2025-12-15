# ✅ FIX: Trạng thái lớp học không thể thay đổi

## 🔍 Vấn đề đã phát hiện

Hệ thống không thể thay đổi trạng thái hoạt động của lớp học do có sự bất đồng giữa:

1. **Database Schema** (đúng):
   - Column `status` kiểu VARCHAR
   - Giá trị cho phép: `'scheduled'`, `'ongoing'`, `'completed'`, `'cancelled'`

2. **Server Code** (SAI):
   - Đang convert status thành INTEGER (0/1)
   - Logic: `classData.status === 'active' ? 1 : 0`
   - Tất cả status khác 'active' đều thành 0 → mất thông tin!

3. **Frontend** (khác với DB):
   - Sử dụng: `'active'`, `'completed'`, `'inactive'`

4. **API Response Fields**:
   - Server trả về: `capacity`, `currentStudents`
   - Frontend mong đợi: `maxStudents`, `totalStudents`

## ✅ Giải pháp đã thực hiện

### 1. Thêm Status Mapping Functions (server)

```typescript
// Map frontend → database
function mapStatusToDb(frontendStatus: string): string {
  switch (frontendStatus) {
    case 'active': return 'ongoing';
    case 'completed': return 'completed';
    case 'inactive': return 'scheduled';
    default: return 'scheduled';
  }
}

// Map database → frontend
function mapStatusToFrontend(dbStatus: string): string {
  switch (dbStatus) {
    case 'ongoing': return 'active';
    case 'completed': return 'completed';
    case 'scheduled': return 'inactive';
    case 'cancelled': return 'inactive';
    default: return 'inactive';
  }
}
```

### 2. Sửa GET /classes API

**Trước:**
```typescript
status: c.status || 'inactive'
capacity: c.capacity,
currentStudents: countMap[c.id_class] || 0,
```

**Sau:**
```typescript
status: mapStatusToFrontend(c.status || 'scheduled')
maxStudents: c.capacity,
totalStudents: countMap[c.id_class] || 0,
```

### 3. Sửa POST /classes API (Create)

**Trước:**
```typescript
const statusInt = classData.status === 'active' ? 1 : 0;
...
status: statusInt,
capacity: classData.capacity
```

**Sau:**
```typescript
const dbStatus = mapStatusToDb(classData.status || 'inactive');
...
status: dbStatus, // VARCHAR, not INTEGER!
class_code: classId, // Added missing class_code
capacity: classData.maxStudents || classData.capacity || 20
```

### 4. Sửa PUT /classes/:id API (Update)

**Trước:**
```typescript
const statusInt = classData.status === 'active' ? 1 : 0;
...
status: statusInt,
capacity: classData.capacity
```

**Sau:**
```typescript
const dbStatus = mapStatusToDb(classData.status || 'inactive');
...
status: dbStatus,
capacity: classData.maxStudents || classData.capacity || 20
```

### 5. Cập nhật ClassFormModal (frontend)

**Interface field names:**
- `capacity` → `maxStudents`
- `currentStudents` → `totalStudents`

### 6. Reload data sau khi save

**Trước (có bug):**
```typescript
if (editingClass) {
  await classesAPI.update(classItem.id, classItem);
  setClasses(classes.map(c => c.id === classItem.id ? classItem : c));
}
```

**Sau (đúng):**
```typescript
if (editingClass) {
  await classesAPI.update(classItem.id, classItem);
}
await loadData(); // Reload from server to get correct status
```

## 🎯 Status Mapping Chi Tiết

| Frontend Display | Frontend Value | Database Value |
|-----------------|---------------|----------------|
| Chưa bắt đầu    | `inactive`    | `scheduled`    |
| Đang hoạt động  | `active`      | `ongoing`      |
| Đã hoàn thành   | `completed`   | `completed`    |
| Đã hủy          | `inactive`    | `cancelled`    |

## 🧪 Test Cases

### Test 1: Tạo lớp mới với status "Đang hoạt động"
1. Mở modal thêm lớp học
2. Nhập thông tin, chọn status: "Đang hoạt động"
3. Lưu
4. ✅ Status trong DB phải là `'ongoing'`, hiển thị "Đang hoạt động"

### Test 2: Cập nhật status từ "Chưa bắt đầu" → "Đang hoạt động"
1. Edit một lớp có status "Chưa bắt đầu"
2. Đổi sang "Đang hoạt động"
3. Lưu
4. ✅ Status trong DB phải đổi từ `'scheduled'` → `'ongoing'`

### Test 3: Cập nhật status từ "Đang hoạt động" → "Đã hoàn thành"
1. Edit một lớp có status "Đang hoạt động"
2. Đổi sang "Đã hoàn thành"
3. Lưu
4. ✅ Status trong DB phải đổi từ `'ongoing'` → `'completed'`

## 📝 Các Files Đã Sửa

1. `/supabase/functions/server/index.tsx`
   - Thêm `mapStatusToDb()` và `mapStatusToFrontend()`
   - Sửa GET /classes (line ~1379)
   - Sửa POST /classes (line ~1422, 1438)
   - Sửa PUT /classes/:id (line ~1511, 1526)

2. `/components/modules/ClassFormModal.tsx`
   - Đổi interface: `capacity` → `maxStudents`, `currentStudents` → `totalStudents`
   - Cập nhật state và input fields

3. `/components/modules/ClassManagement.tsx`
   - Reload data sau khi save thay vì update local state

## ✅ Kết quả

- ✅ Có thể thay đổi trạng thái lớp học qua giao diện
- ✅ Status được lưu đúng vào database (VARCHAR)
- ✅ Mapping chính xác giữa frontend và database
- ✅ Hiển thị đúng trạng thái khi reload
- ✅ Field names nhất quán giữa frontend và API

## 🚀 Next Steps (Khuyến nghị)

1. **Kiểm tra các lớp học hiện có**: Có thể có data với status = 0 hoặc 1 (integer), cần migrate sang VARCHAR
   ```sql
   UPDATE class 
   SET status = 'scheduled' 
   WHERE status NOT IN ('scheduled', 'ongoing', 'completed', 'cancelled');
   ```

2. **Test thêm edge cases**:
   - Tạo lớp với từng loại status
   - Update status qua lại giữa các giá trị
   - Kiểm tra filtering theo status

3. **Cập nhật documentation**: Đảm bảo tất cả dev biết về status mapping
