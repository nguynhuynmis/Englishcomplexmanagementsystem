import { Calendar, FileText, ClipboardList, Award, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../App';
import { students, schedules, classes } from '../../data/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { schedulesAPI, gradesAPI, studentsAPI, assignmentsAPI } from '../../utils/api';

interface StudentDashboardProps {
  user: User;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [studentData, setStudentData] = useState<any>(null);
  const [thisWeekSchedules, setThisWeekSchedules] = useState<any[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState('');
  
  useEffect(() => {
    loadDashboardData();
  }, [user.studentId]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load student info
      const studentsResponse = await studentsAPI.getAll();
      const student = studentsResponse.students?.find((s: any) => s.id === user.studentId);
      setStudentData(student);
      
      // Load schedules
      const schedulesResponse = await schedulesAPI.getAll();
      const allSchedules = schedulesResponse.schedules || [];
      
      // Filter schedules for this week
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      
      const filtered = allSchedules.filter((s: any) => {
        const scheduleDate = new Date(s.date);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd;
      });
      setThisWeekSchedules(filtered);
      
      // Filter today's schedules
      const todayStr = today.toISOString().split('T')[0];
      setTodayStr(todayStr);
      const todayFiltered = allSchedules.filter((s: any) => s.date === todayStr);
      setTodaySchedules(todayFiltered);
      
      // Load recent grades
      if (user.studentId) {
        const gradesResponse = await gradesAPI.getAll();
        const studentGrades = (gradesResponse.grades || [])
          .filter((g: any) => g.studentId === user.studentId)
          .sort((a: any, b: any) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
          .slice(0, 5);
        setRecentGrades(studentGrades);
      }
      
      // Load pending assignments
      const assignmentsResponse = await assignmentsAPI.getAll();
      const allAssignments = assignmentsResponse.assignments || [];
      const pending = allAssignments
        .filter((a: any) => {
          const deadline = new Date(a.deadline);
          return deadline >= today && a.status !== 'submitted';
        })
        .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3);
      setPendingAssignments(pending);
      
    } catch (err) {
      console.error('❌ [StudentDashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy lớp học của học viên
  const studentClass = studentData?.currentClass ? classes.find(c => c.id === studentData.currentClass) : null;
  
  // Mock data tài liệu mới
  const recentDocuments = [
    { id: '1', title: 'Unit 3: Technology and Innovation', type: 'Giáo trình', uploadDate: '2025-12-01' },
    { id: '2', title: 'IELTS Writing Band 8+ Samples', type: 'Tài liệu bổ sung', uploadDate: '2025-11-28' },
    { id: '3', title: 'Vocabulary List - Unit 3', type: 'Slide', uploadDate: '2025-11-27' },
  ];

  // Mock data điểm số theo thời gian
  const scoreProgress = [
    { month: 'T9', speaking: 6.5, writing: 6.0, listening: 7.0, reading: 6.5 },
    { month: 'T10', speaking: 7.0, writing: 6.5, listening: 7.5, reading: 7.0 },
    { month: 'T11', speaking: 7.5, writing: 7.0, listening: 8.0, reading: 7.5 },
    { month: 'T12', speaking: 8.0, writing: 7.5, listening: 8.5, reading: 8.0 },
  ];

  // Mock điểm trung bình
  const currentAverage = 7.75;
  const attendanceRate = 95;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Xin chào, {user.fullName}!</h1>
        <p className="text-gray-600">
          {studentClass ? `Lớp ${studentClass.name} - ${studentClass.level}` : 'Chưa xếp lớp'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <span className="text-gray-600 text-sm">Lịch tuần này</span>
          </div>
          <p className="text-2xl text-gray-900">{thisWeekSchedules.length} buổi</p>
          <p className="text-xs text-gray-500 mt-1">
            Hôm nay: {todaySchedules.length} buổi
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600 text-sm">Bài tập chưa nộp</span>
          </div>
          <p className="text-2xl text-gray-900">{pendingAssignments.length} bài</p>
          <p className="text-xs text-gray-500 mt-1">
            {pendingAssignments.length > 0 
              ? `Gần nhất: ${new Date(pendingAssignments[0].deadline).toLocaleDateString('vi-VN')}`
              : 'Không có bài tập sắp tới'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 text-sm">Điểm TB</span>
          </div>
          <p className="text-2xl text-gray-900">{currentAverage.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <p className="text-xs text-green-600">+0.5 so với tháng trước</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">Điểm danh</span>
          </div>
          <p className="text-2xl text-gray-900">{attendanceRate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Tuyệt vời!
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lịch học hôm nay */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900">Lịch học hôm nay</h2>
              <Link 
                to="/dashboard/schedule" 
                className="text-sm hover:opacity-70"
                style={{ color: 'var(--brand-primary)' }}
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-6">
            {todaySchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có lịch học hôm nay</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className="p-4 rounded-lg border-l-4"
                    style={{ 
                      borderColor: 'var(--brand-primary)',
                      backgroundColor: 'var(--brand-primary-50)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900">{schedule.className}</h3>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: schedule.status === 'completed' ? '#d1fae5' : 
                                         schedule.status === 'cancelled' ? '#fee2e2' : '#dbeafe',
                          color: schedule.status === 'completed' ? '#065f46' :
                                 schedule.status === 'cancelled' ? '#991b1b' : '#1e40af'
                        }}
                      >
                        {schedule.status === 'completed' ? 'Đã học' :
                         schedule.status === 'cancelled' ? 'Đã hủy' : 'Sắp diễn ra'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <p>📍 Phòng {schedule.room} - {schedule.campus}</p>
                      <p>👨‍🏫 GV: {schedule.teacher}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bài tập cần nộp */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-gray-900">Bài tập cần nộp</h2>
          </div>
          <div className="p-6">
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có bài tập nào cần nộp</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => {
                  const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;
                  
                  return (
                    <div 
                      key={assignment.id}
                      className="p-4 rounded-lg border"
                      style={{ 
                        borderColor: isUrgent ? '#f59e0b' : '#d1d5db',
                        backgroundColor: isUrgent ? '#fef3c7' : '#f9fafb'
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-gray-900 text-sm flex-1">{assignment.title}</h3>
                        {isUrgent && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs ml-2">
                            Gấp!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{assignment.subject}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Hạn: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        <span className={`text-xs ${isUrgent ? 'text-orange-600' : 'text-gray-500'}`}>
                          Còn {daysLeft} ngày
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lịch học tuần này */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Lịch học tuần này ({thisWeekSchedules.length} buổi)</h2>
        </div>
        <div className="p-6">
          {thisWeekSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có lịch học tuần này</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thisWeekSchedules.sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.startTime.localeCompare(b.startTime);
              }).map((schedule) => {
                const scheduleDate = new Date(schedule.date);
                const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][scheduleDate.getDay()];
                const isToday = schedule.date === todayStr;
                
                return (
                  <div 
                    key={schedule.id}
                    className="p-4 rounded-lg border"
                    style={{ 
                      borderColor: isToday ? 'var(--brand-primary)' : '#e5e7eb',
                      backgroundColor: isToday ? 'var(--brand-primary-50)' : '#ffffff',
                      borderWidth: isToday ? '2px' : '1px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm"
                          style={{ 
                            backgroundColor: isToday ? 'var(--brand-primary)' : '#f3f4f6',
                            color: isToday ? '#ffffff' : '#4b5563'
                          }}
                        >
                          {dayOfWeek}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {scheduleDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-900">{schedule.startTime}</p>
                        </div>
                      </div>
                      <span 
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: schedule.status === 'completed' ? '#d1fae5' : 
                                         schedule.status === 'cancelled' ? '#fee2e2' : '#dbeafe',
                          color: schedule.status === 'completed' ? '#065f46' :
                                 schedule.status === 'cancelled' ? '#991b1b' : '#1e40af'
                        }}
                      >
                        {schedule.status === 'completed' ? 'Đã học' :
                         schedule.status === 'cancelled' ? 'Hủy' : 'Học'}
                      </span>
                    </div>
                    <h4 className="text-gray-900 mb-1 text-sm">{schedule.className}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>📍 Phòng {schedule.room}</p>
                      <p>⏱️ {schedule.startTime} - {schedule.endTime}</p>
                      <p>👨‍🏫 {schedule.teacher}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tiến độ học tập */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Tiến độ học tập</h2>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis domain={[0, 9]} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="speaking" 
                stroke="#3b82f6" 
                name="Speaking"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="writing" 
                stroke="#10b981" 
                name="Writing"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="listening" 
                stroke="#f59e0b" 
                name="Listening"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="reading" 
                stroke="#8b5cf6" 
                name="Reading"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tài liệu mới */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Tài liệu mới</h2>
            <Link 
              to="/dashboard/documents" 
              className="text-sm hover:opacity-70"
              style={{ color: 'var(--brand-primary)' }}
            >
              Xem tất cả
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--brand-primary-50)' }}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 truncate">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                  </p>
                  <button 
                    className="text-sm mt-1 hover:opacity-70"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}