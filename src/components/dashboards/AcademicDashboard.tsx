import { Users, BookOpen, GraduationCap, Calendar, Plus, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { students, teachers, classes, schedules, notifications as mockNotifications } from '../../data/mockData';

// Lấy lịch học hôm nay từ schedules
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const todaySchedules = schedules.filter(s => s.date === todayStr);

// Tính toán số liệu thực từ mockData
const stats = [
  { label: 'Tổng học viên', value: students.length.toString(), icon: Users, color: '#2baec0' },
  { label: 'Lớp đang hoạt động', value: classes.filter(c => c.status === 'active').length.toString(), icon: BookOpen, color: '#10b981' },
  { label: 'Giáo viên giảng dạy', value: teachers.length.toString(), icon: GraduationCap, color: '#e4ccf1' },
  { label: 'Lịch học hôm nay', value: todaySchedules.length.toString(), icon: Calendar, color: '#ffe9ae' },
];

const todaySchedule = todaySchedules.map(s => ({
  time: `${s.startTime} - ${s.endTime}`,
  class: s.className,
  teacher: s.teacher,
  room: s.room
}));

// Lấy thông báo mới nhất cho academic staff
const notifications = mockNotifications
  .filter(n => !n.targetRole || n.targetRole.includes('academic'))
  .slice(0, 3)
  .map(n => ({
    title: n.title,
    content: n.content,
    time: new Date(n.date).toLocaleDateString('vi-VN')
  }));

const quickActions = [
  { label: 'Thêm lớp học', icon: Plus, to: '/dashboard/classes', color: 'var(--brand-primary)' },
  { label: 'Thêm học viên', icon: Users, to: '/dashboard/students', color: '#10b981' },
  { label: 'Thêm giáo viên', icon: GraduationCap, to: '/dashboard/teachers', color: '#e4ccf1' },
  { label: 'Xem phản hồi', icon: MessageSquare, to: '/dashboard/feedback', color: '#ffe9ae' },
];

export default function AcademicDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-gray-900">Dashboard - Bộ phận học vụ</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lịch học hôm nay</h2>
          <div className="space-y-3">
            {todaySchedule.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p style={{ color: 'var(--brand-primary)' }}>{schedule.time}</p>
                  <span className="text-gray-600 text-sm">{schedule.room}</span>
                </div>
                <p className="text-gray-900 mb-1">{schedule.class}</p>
                <p className="text-gray-600 text-sm">GV: {schedule.teacher}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Thông báo nội bộ</h2>
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 mb-1">{notification.title}</p>
                <p className="text-gray-600 text-sm mb-2">{notification.content}</p>
                <p className="text-gray-500 text-xs">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}