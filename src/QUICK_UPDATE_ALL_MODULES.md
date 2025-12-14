# 🚀 QUICK UPDATE: ALL REMAINING MODULES

## ✅ COMPLETED
- [x] StudentManagement - Using API ✅
- [x] TeacherManagement - Partially updated (need to add loading/error states to list view)

## ⏳ TODO: Apply Same Pattern

For each module below, apply these 3 changes:

### **1. Add imports at top:**
```typescript
import { useEffect } from 'react'; // Add useEffect
import { xxxAPI, classesAPI } from '../../utils/api'; // Add API imports
```

### **2. Add state variables:**
```typescript
const [data, setData] = useState<YourType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await yourAPI.getAll();
    setData(response.yourData || []);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### **3. Update CRUD handlers:**
```typescript
const handleCreate = async (item) => {
  try {
    const response = await yourAPI.create(item);
    setData([...data, response.item]);
  } catch (err: any) {
    alert(`Lỗi: ${err.message}`);
  }
};

const handleUpdate = async (item) => {
  try {
    await yourAPI.update(item.id, item);
    setData(data.map(d => d.id === item.id ? item : d));
  } catch (err: any) {
    alert(`Lỗi: ${err.message}`);
  }
};

const handleDelete = async (id) => {
  if (!confirm('Xác nhận xóa?')) return;
  try {
    await yourAPI.delete(id);
    setData(data.filter(d => d.id !== id));
  } catch (err: any) {
    alert(`Lỗi: ${err.message}`);
  }
};
```

---

## 📋 MODULES TO UPDATE

### **1. ClassManagement**
- API: `classesAPI`
- Data: `classes`
- CRUD: ✅ Full CRUD

### **2. CampusManagement**
- API: `campusesAPI`
- Data: `campuses`
- CRUD: ✅ Full CRUD

### **3. ScheduleManagement**
- API: `schedulesAPI`
- Data: `schedules`
- CRUD: ✅ Create, Update (no delete)

### **4. GradeManagement**
- API: `gradesAPI`
- Data: `grades`
- CRUD: ✅ Create, Update, Batch update

### **5. DocumentManagement**
- API: `documentsAPI`
- Data: `documents`
- CRUD: ✅ Create, Delete (no update)

### **6. AssignmentManagement**
- API: `assignmentsAPI`
- Data: `assignments`
- CRUD: ✅ Full CRUD

### **7. FeedbackManagement**
- API: `feedbackAPI`
- Data: `feedback`
- CRUD: ✅ Create, Update (no delete)

### **8. UserManagement** (if separate from Student/Teacher)
- Use: `studentsAPI`, `teachersAPI` combined
- Data: Combined users
- CRUD: Via respective APIs

### **9. AttendanceManagement**
- Note: No dedicated API yet
- Options:
  - Use `schedulesAPI` to fetch schedules
  - Store attendance in frontend state for now
  - OR create attendance endpoints later

---

## 🎯 PRIORITY ORDER

1. **ClassManagement** - High usage
2. **CampusManagement** - Required for student/teacher
3. **ScheduleManagement** - Core functionality
4. **GradeManagement** - Important for students
5. **AssignmentManagement** - Academic feature
6. **DocumentManagement** - Supporting feature
7. **FeedbackManagement** - Communication
8. **AttendanceManagement** - Can wait

---

## 💡 TIPS

- Copy pattern from StudentManagement
- Test each module after update
- Check console for errors
- Verify CRUD operations work

---

**Let me update them one by one now!**
