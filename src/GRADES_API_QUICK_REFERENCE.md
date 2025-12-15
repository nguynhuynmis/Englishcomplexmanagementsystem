# 📚 GRADES API - QUICK REFERENCE

> **Schema mới**: Mỗi học viên chỉ có **1 record** với `midterm_score`, `final_score`, `average_score`

---

## 🔍 Database Schema

```sql
Table: scores
├── id_score BIGINT (PK)
├── id_students BIGINT (FK) → students.id_student  ⚠️ Chú ý: có 's' ở cuối
├── id_class BIGINT (FK) → class.id_class
├── attendance_score FLOAT
├── midterm_score FLOAT
├── final_score FLOAT
├── average_score FLOAT  (= midterm × 0.4 + final × 0.6)
└── updated_at TIMESTAMP
```

---

## 📡 API Endpoints

### **1. GET /grades** - Lấy tất cả điểm

**Query:**
```typescript
const { data: scores } = await supabase
  .from('scores')
  .select(`
    *,
    students (id_student, id_user, user:id_user (full_name)),
    class (id_class, name_class)
  `)
  .order('updated_at', { ascending: false });
```

**Transform:**
```typescript
const grades = scores.map(score => ({
  id: score.id_score,
  studentId: score.id_students,
  studentName: score.students?.user?.full_name,
  classId: score.id_class,
  className: score.class?.name_class,
  midterm: { overall: score.midterm_score || 0 },
  final: { overall: score.final_score || 0 },
  average: score.average_score || 0,
  attendance: { attendedSessions: score.attendance_score || 0 }
}));
```

---

### **2. GET /grades/by-class** - Lấy điểm theo lớp

**Query:** Giống GET /grades

**Transform:**
```typescript
const studentScores = scores.map(score => ({
  classId: score.id_class,
  studentId: score.id_students,
  midtermScore: score.midterm_score || 0,
  finalScore: score.final_score || 0,
  averageScore: score.average_score || 0
}));

// Sau đó group by classId
```

---

### **3. POST /grades** - Tạo điểm mới

**Input:**
```typescript
{
  studentId: "HV001",
  classId: "LH001",
  midterm: { overall: 6.5 },
  final: { overall: 7.0 },
  attendance: { attendedSessions: 20 }
}
```

**Query:**
```typescript
const midtermScore = gradeData.midterm?.overall || 0;
const finalScore = gradeData.final?.overall || 0;
const averageScore = (midtermScore * 0.4 + finalScore * 0.6).toFixed(1);

await supabase.from('scores').insert({
  id_students: studentId,  // ⚠️ Chú ý: id_students (có 's')
  id_class: classId,
  midterm_score: midtermScore,
  final_score: finalScore,
  average_score: averageScore,
  attendance_score: attendanceScore
});
```

---

### **4. PUT /grades/:id** - Cập nhật điểm

**Input:**
```typescript
{
  studentId: "HV001",
  classId: "LH001",
  midterm: { overall: 6.5 },
  final: { overall: 7.5 },
  attendance: { attendedSessions: 22 }
}
```

**Query:**
```typescript
const midtermScore = midterm?.overall || 0;
const finalScore = final?.overall || 0;
const averageScore = (midtermScore * 0.4 + finalScore * 0.6).toFixed(1);

await supabase.from('scores').update({
  midterm_score: midtermScore,
  final_score: finalScore,
  average_score: averageScore,
  attendance_score: attendanceScore,
  updated_at: new Date().toISOString()
}).eq('id_score', id);
```

---

### **5. DELETE /grades/:id** - Xóa điểm

**Query:**
```typescript
await supabase.from('scores').delete().eq('id_score', id);
```

---

## ⚠️ Common Pitfalls

### **1. Column Name: `id_students` vs `id_student`**
```typescript
// ❌ SAI
id_student: studentId

// ✅ ĐÚNG
id_students: studentId  // Có 's' ở cuối!
```

### **2. Average Calculation**
```typescript
// ✅ ĐÚNG: Midterm 40% + Final 60%
const average = (midterm * 0.4 + final * 0.6).toFixed(1);

// ❌ SAI: Trung bình cộng 50-50
const average = (midterm + final) / 2;
```

### **3. Schema Migration**
```typescript
// ❌ SAI: Tìm theo exam_type (field không còn tồn tại)
.eq('exam_type', 'midterm')

// ✅ ĐÚNG: Mỗi record có sẵn cả midterm và final
const midterm = score.midterm_score;
const final = score.final_score;
```

---

## 🎯 Key Differences từ Schema Cũ

| Aspect | Schema Cũ | Schema Mới |
|--------|-----------|------------|
| **Records per student** | 2 (midterm + final) | 1 |
| **Grouping needed** | Yes (by student) | No |
| **Update operations** | 2 UPDATE queries | 1 UPDATE query |
| **Skills tracking** | Yes (L/R/W/S) | No (overall only) |
| **Average calculation** | In API | In DB + API |
| **Code complexity** | High | Low |

---

## 📊 IELTS Rounding Formula

```typescript
// IELTS Rounding Rules:
// < 0.25 → Round down (6.2 → 6.0)
// < 0.75 → Round to .5 (6.3 → 6.5, 6.7 → 6.5)
// ≥ 0.75 → Round up (6.8 → 7.0)

function calculateOverall(r: number, l: number, w: number, s: number): number {
  const rawAverage = (r + l + w + s) / 4;
  const decimal = rawAverage - Math.floor(rawAverage);
  
  if (decimal < 0.25) return Math.floor(rawAverage);
  if (decimal < 0.75) return Math.floor(rawAverage) + 0.5;
  return Math.ceil(rawAverage);
}
```

**Lưu ý**: Với schema mới, frontend chỉ nhập **1 điểm tổng** cho mỗi exam (midterm/final), không nhập từng skill riêng nữa.

---

## ✅ Testing Commands

### **Create test score:**
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-e2861589/grades \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "HV001",
    "classId": "LH001",
    "midterm": { "overall": 6.5 },
    "final": { "overall": 7.0 },
    "attendance": { "attendedSessions": 20 }
  }'
```

### **Update score:**
```bash
curl -X PUT https://{projectId}.supabase.co/functions/v1/make-server-e2861589/grades/1 \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "HV001",
    "classId": "LH001",
    "midterm": { "overall": 7.0 },
    "final": { "overall": 7.5 },
    "attendance": { "attendedSessions": 22 }
  }'
```

---

**Updated**: December 15, 2024
