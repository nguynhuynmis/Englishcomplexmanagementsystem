import { Users, BookOpen, GraduationCap, TrendingUp, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { fetchReportStats, ReportStats } from '../../utils/dashboardApi';

export default function DirectorDashboard() {
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    fetchReportStats().then(data => setReportStats(data));
  }, []);

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
          <h2 className="text-gray-900 mb-1">{reportStats?.totalStudents || 0}</h2>
          <p className="text-sm" style={{ color: '#00b894' }}>+12% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng lớp học</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{reportStats?.totalClasses || 0}</h2>
          <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>+5% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng giảng viên</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender-light)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: 'var(--pastel-lavender-dark)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{reportStats?.totalTeachers || 0}</h2>
          <p className="text-sm" style={{ color: 'var(--pastel-lavender-dark)' }}>+3% so với tháng trước</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Lớp đang hoạt động</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow-light)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#e67e22' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{reportStats?.activeClasses || 0}</h2>
          <p className="text-sm" style={{ color: '#e67e22' }}>+7% so với tháng trước</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng tăng trưởng học viên</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportStats?.enrollmentTrend || []}>
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
            <BarChart data={reportStats?.studentsByCampus || []}>
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
                data={reportStats?.gradeDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportStats?.gradeDistribution?.map((entry, index) => (
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
            {reportStats?.teacherPerformance?.map((teacher, index) => (
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
          {reportStats?.recentFeedback?.map((feedback, index) => (
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