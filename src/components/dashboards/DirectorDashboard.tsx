import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stats = [
  { label: 'Tổng học viên', value: '1,247', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { label: 'Tổng lớp học', value: '42', change: '+5%', icon: BookOpen, color: 'bg-green-500' },
  { label: 'Tổng giáo viên', value: '28', change: '+3%', icon: GraduationCap, color: 'bg-purple-500' },
  { label: 'Tỷ lệ hoàn thành', value: '89%', change: '+7%', icon: TrendingUp, color: 'bg-orange-500' },
];

const studentsByCampus = [
  { name: 'Cơ sở 1', students: 450 },
  { name: 'Cơ sở 2', students: 387 },
  { name: 'Cơ sở 3', students: 410 },
];

const enrollmentTrend = [
  { month: 'T7', students: 1100 },
  { month: 'T8', students: 1150 },
  { month: 'T9', students: 1180 },
  { month: 'T10', students: 1200 },
  { month: 'T11', students: 1230 },
  { month: 'T12', students: 1247 },
];

const gradeDistribution = [
  { name: 'Xuất sắc (9-10)', value: 28, color: '#10b981' },
  { name: 'Giỏi (8-9)', value: 35, color: '#3b82f6' },
  { name: 'Khá (7-8)', value: 25, color: '#f59e0b' },
  { name: 'Trung bình (6-7)', value: 10, color: '#ef4444' },
  { name: 'Yếu (<6)', value: 2, color: '#6b7280' },
];

const teacherPerformance = [
  { name: 'Trần Thị B', rating: 9.5, classes: 3, students: 45 },
  { name: 'Nguyễn Văn C', rating: 9.2, classes: 2, students: 30 },
  { name: 'Lê Thị D', rating: 9.0, classes: 2, students: 27 },
  { name: 'Phạm Văn E', rating: 8.8, classes: 3, students: 38 },
  { name: 'Hoàng Thị F', rating: 8.5, classes: 2, students: 25 },
];

const recentFeedback = [
  { student: 'Nguyễn Văn A', rating: 5, comment: 'Giáo viên nhiệt tình, giảng dạy dễ hiểu', date: '02/12/2025' },
  { student: 'Trần Thị B', rating: 4, comment: 'Cơ sở vật chất tốt, phòng học rộng rãi', date: '01/12/2025' },
  { student: 'Lê Văn C', rating: 5, comment: 'Chương trình học phù hợp, tiến bộ rõ rệt', date: '30/11/2025' },
];

export default function DirectorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-gray-900">Dashboard - Ban giám đốc</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm">{stat.change}</span>
            </div>
            <p className="text-gray-600 mb-1">{stat.label}</p>
            <p className="text-gray-900">{stat.value}</p>
          </div>
        ))}
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
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Số học viên" />
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
              <Bar dataKey="students" fill="#10b981" name="Số học viên" />
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
              <div key={index} className="border border-gray-200 rounded-lg p-4">
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
            <div key={index} className="border border-gray-200 rounded-lg p-4">
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
