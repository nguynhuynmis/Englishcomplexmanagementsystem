import { Users, BookOpen, GraduationCap, Calendar, Plus, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Tổng số học viên', value: '1,247', icon: Users, color: 'bg-blue-500' },
  { label: 'Lớp đang hoạt động', value: '42', icon: BookOpen, color: 'bg-green-500' },
  { label: 'Giáo viên giảng dạy', value: '28', icon: GraduationCap, color: 'bg-purple-500' },
  { label: 'Lịch học hôm nay', value: '15', icon: Calendar, color: 'bg-orange-500' },
];

const todaySchedule = [
  { time: '08:00 - 10:00', class: 'IELTS Beginner A1', teacher: 'Trần Thị B', room: 'Phòng 101' },
  { time: '10:00 - 12:00', class: 'IELTS Intermediate B1', teacher: 'Nguyễn Văn C', room: 'Phòng 102' },
  { time: '14:00 - 16:00', class: 'IELTS Advanced C1', teacher: 'Lê Thị D', room: 'Phòng 201' },
  { time: '16:00 - 18:00', class: 'IELTS Master', teacher: 'Phạm Văn E', room: 'Phòng 202' },
];

const notifications = [
  { title: 'Học viên mới đăng ký', content: '5 học viên mới đăng ký khóa IELTS Beginner', time: '10 phút trước' },
  { title: 'Giáo viên xin nghỉ', content: 'Trần Thị B xin nghỉ buổi học ngày 05/12', time: '1 giờ trước' },
  { title: 'Phản hồi mới', content: '3 phản hồi mới từ học viên cần xử lý', time: '2 giờ trước' },
];

const quickActions = [
  { label: 'Thêm lớp học', icon: Plus, to: '/dashboard/classes', color: 'bg-blue-600' },
  { label: 'Thêm học viên', icon: Users, to: '/dashboard/students', color: 'bg-green-600' },
  { label: 'Thêm giáo viên', icon: GraduationCap, to: '/dashboard/teachers', color: 'bg-purple-600' },
  { label: 'Xem phản hồi', icon: MessageSquare, to: '/dashboard/feedback', color: 'bg-orange-600' },
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
              <div className={`${stat.color} p-3 rounded-lg`}>
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
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity`}
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
                  <p className="text-blue-600">{schedule.time}</p>
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
