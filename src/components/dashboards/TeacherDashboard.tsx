import { BookOpen, Calendar, ClipboardList, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../App';

interface TeacherDashboardProps {
  user: User;
}

const myClasses = [
  { id: 1, name: 'IELTS Beginner A1', level: 'Beginner', students: 18, schedule: 'T2, T4, T6: 08:00-10:00' },
  { id: 2, name: 'IELTS Intermediate B1', level: 'Intermediate', students: 15, schedule: 'T3, T5, T7: 14:00-16:00' },
  { id: 3, name: 'IELTS Advanced C1', level: 'Advanced', students: 12, schedule: 'T2, T4: 16:00-18:00' },
];

const todaySchedule = [
  { time: '08:00 - 10:00', class: 'IELTS Beginner A1', room: 'Phòng 101', topic: 'Unit 3: Family & Friends' },
  { time: '16:00 - 18:00', class: 'IELTS Advanced C1', room: 'Phòng 201', topic: 'IELTS Writing Task 2' },
];

const assignmentsToGrade = [
  { class: 'IELTS Beginner A1', assignment: 'Bài tập Unit 2', submissions: 15, total: 18 },
  { class: 'IELTS Intermediate B1', assignment: 'Essay Writing Practice', submissions: 12, total: 15 },
];

const notifications = [
  { title: 'Thông báo từ học vụ', content: 'Họp giáo viên vào 15:00 ngày 05/12', time: '1 giờ trước' },
  { title: 'Học viên nghỉ học', content: 'Nguyễn Văn A (IELTS Beginner A1) xin nghỉ buổi học hôm nay', time: '2 giờ trước' },
];

const quickActions = [
  { label: 'Giao bài tập', icon: ClipboardList, to: '/dashboard/assignments', color: 'bg-blue-600' },
  { label: 'Tải tài liệu', icon: FileText, to: '/dashboard/documents', color: 'bg-green-600' },
  { label: 'Xem lịch dạy', icon: Calendar, to: '/dashboard/schedule', color: 'bg-purple-600' },
  { label: 'Quản lý lớp học', icon: BookOpen, to: '/dashboard/classes', color: 'bg-orange-600' },
];

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Xin chào, {user.fullName}!</h1>
        <p className="text-gray-600">Dashboard - Giáo viên</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Truy cập nhanh</h2>
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
        {/* My Classes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lớp đang phụ trách</h2>
          <div className="space-y-3">
            {myClasses.map((classItem) => (
              <div key={classItem.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-900 mb-1">{classItem.name}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                      {classItem.level}
                    </span>
                  </div>
                  <p className="text-gray-600">{classItem.students} HV</p>
                </div>
                <p className="text-gray-600 text-sm mt-2">{classItem.schedule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lịch dạy hôm nay</h2>
          <div className="space-y-3">
            {todaySchedule.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-blue-600">{schedule.time}</p>
                  <span className="text-gray-600 text-sm">{schedule.room}</span>
                </div>
                <p className="text-gray-900 mb-1">{schedule.class}</p>
                <p className="text-gray-600 text-sm">Chủ đề: {schedule.topic}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assignments to Grade */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Bài tập cần chấm</h2>
          <div className="space-y-3">
            {assignmentsToGrade.map((assignment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 mb-1">{assignment.assignment}</p>
                <p className="text-gray-600 text-sm mb-2">{assignment.class}</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">
                    {assignment.submissions}/{assignment.total} bài đã nộp
                  </p>
                  <Link
                    to="/dashboard/assignments"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Chấm bài
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Thông báo</h2>
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
