import { Users, BookOpen, GraduationCap, Calendar, Plus, MessageSquare, Building2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchDashboardStats, DashboardStats } from '../../utils/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface TodaySchedule {
  time: string;
  class: string;
  teacher: string;
  room: string;
}

const quickActions = [
  { label: 'Thêm lớp học', icon: Plus, to: '/dashboard/classes', color: 'var(--brand-primary)' },
  { label: 'Thêm học viên', icon: Users, to: '/dashboard/students', color: '#10b981' },
  { label: 'Thêm giáo viên', icon: GraduationCap, to: '/dashboard/teachers', color: '#e4ccf1' },
  { label: 'Xem phản hồi', icon: MessageSquare, to: '/dashboard/feedback', color: '#ffe9ae' },
];

export default function AcademicDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    todaySchedules: 0,
    totalEnrollments: 0,
    totalCenters: 0,
    recentEnrollments: [],
    enrollmentsByMonth: [],
    classesByStatus: []
  });
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
      setTodaySchedule([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { label: 'Tổng học viên', value: stats.totalStudents.toString(), icon: Users, color: '#2baec0' },
    { label: 'Lớp đang hoạt động', value: stats.activeClasses.toString(), icon: BookOpen, color: '#10b981' },
    { label: 'Giáo viên giảng dạy', value: stats.totalTeachers.toString(), icon: GraduationCap, color: '#e4ccf1' },
    { label: 'Ghi danh tổng', value: stats.totalEnrollments.toString(), icon: UserCheck, color: '#f59e0b' },
    { label: 'Trung tâm', value: stats.totalCenters.toString(), icon: Building2, color: '#8b5cf6' },
    { label: 'Lịch học hôm nay', value: stats.todaySchedules.toString(), icon: Calendar, color: '#ffe9ae' },
  ];

  const COLORS = ['#2baec0', '#10b981', '#f59e0b', '#e4ccf1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2baec0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-gray-900">Dashboard - Bộ phận học vụ</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsDisplay.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">{stat.label}</p>
                <p className="text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color }}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="text-white p-4 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: action.color }}
            >
              <action.icon className="w-6 h-6 mb-2" />
              <p>{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollments by Month Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng ghi danh theo tháng</h2>
          {stats.enrollmentsByMonth && stats.enrollmentsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.enrollmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2baec0" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Classes by Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Phân bổ lớp học theo trạng thái</h2>
          {stats.classesByStatus && stats.classesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.classesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.classesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Ghi danh gần đây</h2>
          <div className="space-y-3">
            {stats.recentEnrollments && stats.recentEnrollments.length > 0 ? (
              stats.recentEnrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-900">{enrollment.student_name}</p>
                    <span className="text-gray-600 text-sm">{enrollment.joined_date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Lớp: {enrollment.class_name}</p>
                  <p className="text-gray-500 text-xs mt-1">ID: {enrollment.id}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có ghi danh mới</p>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lịch học hôm nay</h2>
          <div className="space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((schedule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p style={{ color: 'var(--brand-primary)' }}>{schedule.time}</p>
                    <span className="text-gray-600 text-sm">{schedule.room}</span>
                  </div>
                  <p className="text-gray-900 mb-1">{schedule.class}</p>
                  <p className="text-gray-600 text-sm">GV: {schedule.teacher}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Không có lịch học hôm nay</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}