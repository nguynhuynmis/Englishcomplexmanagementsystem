import { BookOpen, Calendar, ClipboardList, FileText, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../App';
import { useState, useEffect } from 'react';
import { teachersAPI, classesAPI, schedulesAPI, assignmentsAPI } from '../../utils/api';

interface TeacherDashboardProps {
  user: User;
}

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [teacherData, setTeacherData] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [thisWeekSchedules, setThisWeekSchedules] = useState<any[]>([]);
  const [assignmentsToGrade, setAssignmentsToGrade] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceNeeded, setAttendanceNeeded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user.teacherId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load teacher info
      try {
        const teachersResponse = await teachersAPI.getAll();
        const teacher = teachersResponse.teachers?.find((t: any) => t.id === user.teacherId);
        setTeacherData(teacher);
      } catch (err) {
        console.error('❌ [TeacherDashboard] Failed to load teacher info:', err);
      }
      
      // Load all classes and filter by teacher
      try {
        const classesResponse = await classesAPI.getAll();
        const allClasses = classesResponse.classes || [];
        const myClasses = allClasses.filter((c: any) => 
          c.teacher === user.fullname && c.status === 'active'
        );
        setTeacherClasses(myClasses);
        
        // Calculate total students
        const studentsCount = myClasses.reduce((sum: number, c: any) => sum + (c.currentStudents || 0), 0);
        setTotalStudents(studentsCount);
      } catch (err) {
        console.error('❌ [TeacherDashboard] Failed to load classes:', err);
      }
      
      // Load schedules
      try {
        const schedulesResponse = await schedulesAPI.getAll();
        const allSchedules = schedulesResponse.schedules || [];
        
        // Filter schedules for today
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        setTodayStr(todayString);
        
        const todayFiltered = allSchedules.filter((s: any) => 
          s.teacher === user.fullname && s.date === todayString
        );
        setTodaySchedules(todayFiltered);
        
        // Calculate attendance needed
        const attendanceCount = todayFiltered.filter((s: any) => 
          s.status === 'scheduled' && !s.attendanceRecords
        ).length;
        setAttendanceNeeded(attendanceCount);
        
        // Filter schedules for this week
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekFiltered = allSchedules.filter((s: any) => {
          const scheduleDate = new Date(s.date);
          return s.teacher === user.fullname && 
                 scheduleDate >= weekStart && 
                 scheduleDate <= weekEnd;
        });
        setThisWeekSchedules(weekFiltered);
      } catch (err) {
        console.error('❌ [TeacherDashboard] Failed to load schedules:', err);
      }
      
      // Load assignments to grade
      try {
        const assignmentsResponse = await assignmentsAPI.getAll();
        const allAssignments = assignmentsResponse.assignments || [];
        
        // Filter assignments by teacher's classes
        const myClassIds = teacherClasses.map((c: any) => c.id);
        const needGrading = allAssignments.filter((a: any) => 
          myClassIds.includes(a.classId)
        ).slice(0, 2); // Take first 2
        setAssignmentsToGrade(needGrading);
      } catch (err) {
        console.error('❌ [TeacherDashboard] Failed to load assignments:', err);
        // Keep empty array - already initialized
      }
      
    } catch (err) {
      console.error('❌ [TeacherDashboard] General load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Xin chào, {user.fullname || user.username}!</h1>
        <p className="text-gray-600">
          {teacherData?.campus === 'CS001' ? 'Cơ sở Long Biên' : 'Cơ sở Hai Bà Trưng'} · Giáo viên
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <span className="text-gray-600 text-sm">Lớp đang dạy</span>
          </div>
          <p className="text-2xl text-gray-900">{teacherClasses.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalStudents} học viên
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
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
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600 text-sm">Cần điểm danh</span>
          </div>
          <p className="text-2xl text-gray-900">{attendanceNeeded}</p>
          <p className="text-xs text-gray-500 mt-1">
            Buổi học hôm nay
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">Bài tập chưa chấm</span>
          </div>
          <p className="text-2xl text-gray-900">{assignmentsToGrade.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            Cần xem trước
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lịch dạy hôm nay */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900">Lịch dạy hôm nay</h2>
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
                <p>Không có lịch dạy hôm nay</p>
                <p className="text-xs mt-1">Hãy nghỉ ngơi và chuẩn bị cho ngày mai!</p>
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
                        {schedule.status === 'completed' ? 'Đã dạy' :
                         schedule.status === 'cancelled' ? 'Đã hủy' : 'Sắp diễn ra'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <p>📍 {schedule.room ? `Phòng ${schedule.room} - ` : ''}{schedule.campus}</p>
                      {schedule.studentIds && schedule.studentIds.length > 0 && (
                        <p>👥 {schedule.studentIds.length} học viên</p>
                      )}
                    </div>
                    {schedule.status === 'scheduled' && !schedule.attendanceRecords && (
                      <button 
                        className="mt-3 w-full px-4 py-2 text-white rounded-lg hover:opacity-90 text-sm"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Điểm danh ngay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lớp đang dạy */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-gray-900">Lớp đang dạy ({teacherClasses.length})</h2>
          </div>
          <div className="p-6">
            {teacherClasses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có lớp nào được phân công</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherClasses.map((classItem) => {
                  const levelColors = {
                    'Beginner': { bg: '#e3f2fd', color: '#1565c0' },
                    'Intermediate': { bg: '#fff3e0', color: '#e65100' },
                    'Advanced': { bg: '#f3e5f5', color: '#6a1b9a' },
                    'Master': { bg: '#fce4ec', color: '#c2185b' }
                  };
                  const colors = levelColors[classItem.level as keyof typeof levelColors] || levelColors.Beginner;

                  return (
                    <div 
                      key={classItem.id}
                      className="p-4 rounded-lg hover:shadow-md transition-shadow"
                      style={{ backgroundColor: 'var(--brand-primary-50)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-gray-900">{classItem.name}</h3>
                          <p className="text-sm text-gray-600">{classItem.id}</p>
                        </div>
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: colors.bg, color: colors.color }}
                        >
                          {classItem.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Sĩ số</p>
                          <p className="text-gray-900">{classItem.currentStudents}/{classItem.capacity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cơ sở</p>
                          <p className="text-gray-900">{classItem.campus}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        📅 {classItem.schedule || 'Chưa có lịch'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lịch dạy tuần này */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Lịch dạy tuần này ({thisWeekSchedules.length} buổi)</h2>
        </div>
        <div className="p-6">
          {thisWeekSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có lịch dạy tuần này</p>
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
                        {schedule.status === 'completed' ? 'Đã dạy' :
                         schedule.status === 'cancelled' ? 'Hủy' : 'Dạy'}
                      </span>
                    </div>
                    <h4 className="text-gray-900 mb-1 text-sm">{schedule.className}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {schedule.room && <p>📍 Phòng {schedule.room}</p>}
                      <p>⏱️ {schedule.startTime} - {schedule.endTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bài tập cần chấm */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Bài tập cần chấm</h2>
        </div>
        <div className="p-6">
          {assignmentsToGrade.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có bài tập nào cần chấm</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignmentsToGrade.map((item) => {
                // Calculate percentage based on assignment data structure
                const submissions = item.submissions || 0;
                const total = item.total || 1;
                const percentage = total > 0 ? Math.round((submissions / total) * 100) : 0;
                
                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-gray-900">{item.title || item.assignment}</h3>
                        <p className="text-sm text-gray-600">{item.className || item.class}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                        {submissions}/{total} bài
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-gray-600">Hạn nộp</span>
                        <span className="text-gray-900">{item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                    <button 
                      className="mt-3 w-full px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                      style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
                    >
                      Xem và chấm điểm
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Phản hồi từ học viên */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Phản hồi từ học viên</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-gray-900">Nguyên Thị Khánh Huyền</p>
                  <div className="flex gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-500">★</span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">10/12/2024</span>
              </div>
              <p className="text-gray-600 text-sm">Cô giảng dạy rất nhiệt tình và dễ hiểu. Em đã tiến bộ rất nhiều trong kỹ năng Speaking. Cảm ơn cô!</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-gray-900">Lê Hoàng Nam</p>
                  <div className="flex gap-1 my-1">
                    {[1, 2, 3, 4].map((star) => (
                      <span key={star} className="text-yellow-500">★</span>
                    ))}
                    <span className="text-gray-300">★</span>
                  </div>
                </div>
                <span className="text-gray-500 text-sm">08/12/2024</span>
              </div>
              <p className="text-gray-600 text-sm">Bài giảng hay, tài liệu phong phú. Mong thầy có thêm nhiều bài tập thực hành hơn.</p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-gray-900">Phạm Thu Hà</p>
                  <div className="flex gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-500">★</span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">05/12/2024</span>
              </div>
              <p className="text-gray-600 text-sm">Thầy rất tận tâm, luôn sẵn sàng giải đáp thắc mắc. Phương pháp giảng dạy của thầy rất hiệu quả!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/schedule"
            className="flex flex-col items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
            style={{ backgroundColor: 'var(--brand-primary-50)' }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-sm text-center">Lịch dạy</span>
          </Link>

          <Link
            to="/dashboard/documents"
            className="flex flex-col items-center gap-3 p-4 bg-green-50 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-sm text-center">Tài liệu</span>
          </Link>

          <Link
            to="/dashboard/grades"
            className="flex flex-col items-center gap-3 p-4 bg-purple-50 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-sm text-center">Nhập điểm</span>
          </Link>

          <Link
            to="/dashboard/classes"
            className="flex flex-col items-center gap-3 p-4 bg-orange-50 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 text-sm text-center">Lớp học</span>
          </Link>
        </div>
      </div>
    </div>
  );
}