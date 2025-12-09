import { Calendar, FileText, ClipboardList, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../App';

interface StudentDashboardProps {
  user: User;
}

const mySchedule = [
  { day: 'Thứ 2', time: '08:00 - 10:00', subject: 'IELTS Speaking', room: 'Phòng 101', teacher: 'Trần Thị B' },
  { day: 'Thứ 4', time: '08:00 - 10:00', subject: 'IELTS Writing', room: 'Phòng 101', teacher: 'Trần Thị B' },
  { day: 'Thứ 6', time: '08:00 - 10:00', subject: 'IELTS Listening & Reading', room: 'Phòng 101', teacher: 'Trần Thị B' },
];

const pendingAssignments = [
  { title: 'Bài tập Unit 3 - Writing Task 2', subject: 'IELTS Writing', deadline: '05/12/2025', status: 'Chưa nộp' },
  { title: 'Speaking Practice - Topic: Technology', subject: 'IELTS Speaking', deadline: '06/12/2025', status: 'Chưa nộp' },
];

const recentDocuments = [
  { title: 'Unit 3: Technology and Innovation', type: 'Giáo trình', uploadDate: '01/12/2025' },
  { title: 'IELTS Writing Band 8+ Samples', type: 'Tài liệu bổ sung', uploadDate: '28/11/2025' },
  { title: 'Vocabulary List - Unit 3', type: 'Slide', uploadDate: '27/11/2025' },
];

const notifications = [
  { title: 'Thông báo nghỉ học', content: 'Lớp IELTS Beginner A1 nghỉ học ngày 10/12', time: '3 giờ trước' },
  { title: 'Bài tập mới', content: 'Giáo viên đã giao bài tập mới cho Unit 3', time: '1 ngày trước' },
];

const grades = {
  attendance: 9.5,
  midterm: 8.5,
  final: 0,
  average: 9.0,
};

export default function StudentDashboard({ user }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Xin chào, {user.fullName}!</h1>
        <p className="text-gray-600">Dashboard - Học viên</p>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Lịch học tuần này</span>
          </div>
          <p className="text-gray-900">3 buổi</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5 text-orange-600" />
            <span className="text-gray-600">Bài tập cần nộp</span>
          </div>
          <p className="text-gray-900">2 bài</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-gray-600">Tài liệu mới</span>
          </div>
          <p className="text-gray-900">5 tài liệu</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600">Điểm TB</span>
          </div>
          <p className="text-gray-900">{grades.average}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lịch học của tôi</h2>
          <div className="space-y-3">
            {mySchedule.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-900 mb-1">{schedule.subject}</p>
                    <p className="text-blue-600 text-sm">{schedule.day}, {schedule.time}</p>
                  </div>
                  <span className="text-gray-600 text-sm">{schedule.room}</span>
                </div>
                <p className="text-gray-600 text-sm">GV: {schedule.teacher}</p>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/schedule"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700"
          >
            Xem lịch đầy đủ
          </Link>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Bài tập cần nộp</h2>
          <div className="space-y-3">
            {pendingAssignments.map((assignment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 mb-1">{assignment.title}</p>
                <p className="text-gray-600 text-sm mb-2">{assignment.subject}</p>
                <div className="flex items-center justify-between">
                  <p className="text-orange-600 text-sm">Hạn nộp: {assignment.deadline}</p>
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-sm">
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/assignments"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700"
          >
            Xem tất cả bài tập
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Tài liệu học tập</h2>
          <div className="space-y-3">
            {recentDocuments.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-900 mb-1">{doc.title}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                      {doc.type}
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Tải xuống
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">{doc.uploadDate}</p>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/documents"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700"
          >
            Xem tất cả tài liệu
          </Link>
        </div>

        {/* Grades Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Điểm số tổng hợp</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Chuyên cần</span>
              <span className="text-gray-900">{grades.attendance}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Giữa kỳ</span>
              <span className="text-gray-900">{grades.midterm}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cuối kỳ</span>
              <span className="text-gray-500">{grades.final || 'Chưa có'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-900">Điểm trung bình</span>
              <span className="text-blue-900">{grades.average}</span>
            </div>
          </div>
          <Link
            to="/dashboard/grades"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700"
          >
            Xem chi tiết
          </Link>
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
  );
}
