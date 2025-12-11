import { Users, BookOpen, GraduationCap, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { students, classes, teachers, campuses } from '../../data/mockData';

// Tính toán số liệu học viên theo cơ sở từ mockData
const studentsByCampus = campuses.map(campus => {
  const campusStudents = students.filter(s => s.campus === campus.id);
  return {
    name: campus.name,
    students: campusStudents.length
  };
});

// Tính toán hiệu suất giáo viên từ mockData
const teacherPerformance = teachers.slice(0, 5).map(teacher => {
  const teacherClasses = classes.filter(c => c.teacher === teacher.fullName && c.status === 'active');
  const totalStudents = teacherClasses.reduce((sum, c) => sum + c.totalStudents, 0);
  // Mock rating dựa trên IELTS score
  const rating = teacher.ieltsScore ? (teacher.ieltsScore / 9 * 10).toFixed(1) : '8.5';
  
  return {
    name: teacher.fullName,
    rating: parseFloat(rating),
    classes: teacherClasses.length,
    students: totalStudents
  };
}).sort((a, b) => b.rating - a.rating);

// Mock data cho xu hướng tăng trưởng (có thể cải thiện bằng cách tính từ enrollDate)
const enrollmentTrend = [
  { month: 'T7', students: students.length - 5 },
  { month: 'T8', students: students.length - 4 },
  { month: 'T9', students: students.length - 3 },
  { month: 'T10', students: students.length - 2 },
  { month: 'T11', students: students.length - 1 },
  { month: 'T12', students: students.length },
];

// Mock data phân bố điểm
const gradeDistribution = [
  { name: 'Xuất sắc (9-10)', value: 15, color: 'var(--brand-primary)' },
  { name: 'Giỏi (8-9)', value: 35, color: '#00b894' },
  { name: 'Khá (7-8)', value: 25, color: '#ffe9ae' },
  { name: 'Trung bình (6-7)', value: 10, color: '#e74c3c' },
];

// Mock data phản hồi
const recentFeedback = [
  { student: students[0]?.fullName || 'Học viên A', rating: 5, comment: 'Giáo viên nhiệt tình, giảng dạy dễ hiểu', date: '02/12/2024' },
  { student: students[1]?.fullName || 'Học viên B', rating: 4, comment: 'Cơ sở vật chất tốt, phòng học rộng rãi', date: '01/12/2024' },
  { student: students[2]?.fullName || 'Học viên C', rating: 5, comment: 'Chương trình học phù hợp, tiến bộ rõ rệt', date: '30/11/2024' },
];

export default function DirectorDashboard() {
  const exportToExcel = () => {
    alert('Xuất báo cáo Excel thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Dashboard - Ban giám đốc</h1>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng học viên</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-green-light)' }}>
              <Users className="w-5 h-5" style={{ color: '#00b894' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{students.length}</h2>
          <p className="text-sm" style={{ color: '#00b894' }}>+12% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng lớp học</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{classes.length}</h2>
          <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>+5% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng giảng viên</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender-light)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: 'var(--pastel-lavender-dark)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{teachers.length}</h2>
          <p className="text-sm" style={{ color: 'var(--pastel-lavender-dark)' }}>+3% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Lớp đang hoạt động</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow-light)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#e67e22' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{classes.filter(c => c.status === 'active').length}</h2>
          <p className="text-sm" style={{ color: '#e67e22' }}>+7% so với tháng trước</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng tăng trưởng học viên</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="var(--brand-primary)" strokeWidth={2} name="Số học viên" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students by Campus */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Học viên theo cơ sở</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByCampus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#00b894" name="Số học viên" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Phân bố điểm số (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Teacher Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Hiệu suất giảng dạy</h2>
          <div className="space-y-3">
            {teacherPerformance.map((teacher, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-900">{teacher.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-900">{teacher.rating}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-gray-600 text-sm">
                  <span>{teacher.classes} lớp</span>
                  <span>{teacher.students} học viên</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Phản hồi & Đánh giá gần đây</h2>
        <div className="space-y-3">
          {recentFeedback.map((feedback, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-gray-900">{feedback.student}</p>
                  <div className="flex gap-1 my-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{feedback.date}</span>
              </div>
              <p className="text-gray-600 text-sm">{feedback.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
