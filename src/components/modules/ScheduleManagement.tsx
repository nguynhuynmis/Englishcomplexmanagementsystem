import { useState } from 'react';
import { Plus, Edit, Trash2, Download, Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, BookOpen, ChevronLeft, ChevronRight, ClipboardCheck, ArrowLeft, CheckCircle, XCircle, AlertCircle, Grid, List, BarChart3 } from 'lucide-react';
import { User } from '../../App';
import { classes, students, schedules as initialSchedules, Schedule, teachers } from '../../data/mockData';

type ViewMode = 'list' | 'detail' | 'calendar';

interface ScheduleManagementProps {
  user: User;
}

export default function ScheduleManagement({ user }: ScheduleManagementProps) {
  const [schedulesList, setSchedulesList] = useState<Schedule[]>(initialSchedules);
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Filter schedules
  const filteredSchedules = schedulesList.filter(schedule => {
    const matchDate = filterDate === '' || schedule.date === filterDate;
    const matchClass = filterClass === 'all' || schedule.classId === filterClass;
    const matchCampus = filterCampus === 'all' || schedule.campus === filterCampus;
    const matchStatus = filterStatus === 'all' || schedule.status === filterStatus;
    
    // Filter by role
    if (user.role === 'teacher') {
      return matchDate && matchClass && matchCampus && matchStatus && schedule.teacherId === user.id;
    }
    if (user.role === 'student') {
      const studentData = students.find(s => s.id === user.id);
      return matchDate && matchClass && matchCampus && matchStatus && 
             studentData?.currentClass && schedule.classId === studentData.currentClass;
    }
    
    return matchDate && matchClass && matchCampus && matchStatus;
  });

  // Statistics
  const stats = {
    total: filteredSchedules.length,
    scheduled: filteredSchedules.filter(s => s.status === 'scheduled').length,
    completed: filteredSchedules.filter(s => s.status === 'completed').length,
    cancelled: filteredSchedules.filter(s => s.status === 'cancelled').length,
  };

  // Get week schedules for calendar view
  const getWeekSchedules = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + (currentWeekOffset * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekSchedules = filteredSchedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });

    return { weekStart, weekEnd, weekSchedules };
  };

  const handleViewDetail = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSchedule(null);
    setShowAttendance(false);
  };

  const handleAttendance = () => {
    setShowAttendance(true);
  };

  const exportToExcel = () => {
    alert('Xuất lịch học thành công!');
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">
            {user.role === 'student' ? 'Lịch học của tôi' : 'Quản lý lịch học'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-600 text-sm">Tổng lịch</span>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Tổng số buổi học</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'var(--brand-primary-100)' }}
              >
                <Clock className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="text-gray-600 text-sm">Sắp diễn ra</span>
            </div>
            <p className="text-2xl text-gray-900">{stats.scheduled}</p>
            <p className="text-xs text-gray-500 mt-1">Chưa dạy/học</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-600 text-sm">Đã hoàn thành</span>
            </div>
            <p className="text-2xl text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Đã dạy/học xong</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-gray-600 text-sm">Đã hủy</span>
            </div>
            <p className="text-2xl text-gray-900">{stats.cancelled}</p>
            <p className="text-xs text-gray-500 mt-1">Bị hủy bỏ</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>

            {user.role !== 'student' && (
              <div>
                <label className="block text-gray-700 mb-2">Lớp học</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="all">Tất cả lớp</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Cơ sở</label>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả cơ sở</option>
                <option value="Cơ sở Long Biên">Cơ sở Long Biên</option>
                <option value="Cơ sở Hai Bà Trưng">Cơ sở Hai Bà Trưng</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả</option>
                <option value="scheduled">Sắp diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Ngày</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thời gian</th>
                  <th className="px-6 py-3 text-left text-gray-700">Lớp học</th>
                  <th className="px-6 py-3 text-left text-gray-700">Phòng học</th>
                  <th className="px-6 py-3 text-left text-gray-700">Giảng viên</th>
                  <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                  <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(schedule.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                        {schedule.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{schedule.room}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.teacher}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.campus}</td>
                    <td className="px-6 py-4">
                      {schedule.status === 'scheduled' && (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          Sắp diễn ra
                        </span>
                      )}
                      {schedule.status === 'completed' && (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                          Đã hoàn thành
                        </span>
                      )}
                      {schedule.status === 'cancelled' && (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#fee', color: '#d63031' }}>
                          Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(schedule)}
                          className="px-3 py-1 text-sm text-white rounded-lg hover:opacity-90"
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                          Xem chi tiết
                        </button>
                        {/* Button điểm danh cho lịch sắp diễn ra - chỉ giáo viên */}
                        {user.role === 'teacher' && schedule.status === 'scheduled' && (
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setViewMode('detail');
                              setTimeout(() => setShowAttendance(true), 100);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded-lg hover:opacity-90"
                            style={{ backgroundColor: '#00b894' }}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            Điểm danh
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSchedules.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy lịch học nào</p>
          </div>
        )}
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedSchedule) {
    const classStudents = students.filter(s => selectedSchedule.studentIds.includes(s.id));

    if (showAttendance && user.role === 'teacher') {
      return (
        <AttendanceView
          schedule={selectedSchedule}
          students={classStudents}
          onBack={() => setShowAttendance(false)}
          onSave={(attendanceData) => {
            // Update schedule with attendance
            setSchedulesList(prev => prev.map(s => 
              s.id === selectedSchedule.id ? { ...s, attendanceRecords: attendanceData } : s
            ));
            setShowAttendance(false);
            alert('Điểm danh thành công!');
          }}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-gray-900 mb-2">Chi tiết lịch học</h1>
                <p className="text-gray-600">
                  {new Date(selectedSchedule.date).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {selectedSchedule.status === 'scheduled' && (
                <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                  Sắp diễn ra
                </span>
              )}
              {selectedSchedule.status === 'completed' && (
                <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                  Đã hoàn thành
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-gray-900 mb-4">Thông tin lịch học</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-2">Lớp học</p>
                <p className="text-gray-900">{selectedSchedule.className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Thời gian</p>
                <p className="text-gray-900">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Phòng học</p>
                <p className="text-gray-900">{selectedSchedule.room}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Cơ sở</p>
                <p className="text-gray-900">{selectedSchedule.campus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Giảng viên</p>
                <p className="text-gray-900">{selectedSchedule.teacher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Số học viên</p>
                <p className="text-gray-900">{selectedSchedule.studentIds.length} học viên</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900">Danh sách học viên</h2>
                {user.role === 'teacher' && (
                  <button
                    onClick={handleAttendance}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Điểm danh
                  </button>
                )}
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Mã HV</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-gray-700">Số điện thoại</th>
                      {selectedSchedule.attendanceRecords && (
                        <th className="px-4 py-3 text-center text-gray-700">Trạng thái</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classStudents.map((student) => {
                      const attendance = selectedSchedule.attendanceRecords?.find(
                        a => a.studentId === student.id
                      );
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                              {student.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{student.fullName}</td>
                          <td className="px-4 py-3 text-gray-600">{student.email}</td>
                          <td className="px-4 py-3 text-gray-600">{student.phone}</td>
                          {attendance && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {attendance.status === 'present' && (
                                  <span className="flex items-center gap-1 px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                                    <CheckCircle className="w-4 h-4" />
                                    Có mặt
                                  </span>
                                )}
                                {attendance.status === 'absent' && (
                                  <span className="flex items-center gap-1 px-2 py-1 rounded text-sm" style={{ backgroundColor: '#fee', color: '#d63031' }}>
                                    <XCircle className="w-4 h-4" />
                                    Vắng
                                  </span>
                                )}
                                {attendance.status === 'late' && (
                                  <span className="flex items-center gap-1 px-2 py-1 rounded text-sm" style={{ backgroundColor: '#fff9e6', color: '#e67e22' }}>
                                    <AlertCircle className="w-4 h-4" />
                                    Muộn
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calendar View
  if (viewMode === 'calendar') {
    const { weekStart, weekEnd, weekSchedules } = getWeekSchedules();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">
            {user.role === 'student' ? 'Lịch học của tôi' : 'Quản lý lịch học'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>

            {user.role !== 'student' && (
              <div>
                <label className="block text-gray-700 mb-2">Lớp học</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="all">Tất cả lớp</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Cơ sở</label>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả cơ sở</option>
                <option value="Cơ sở Long Biên">Cơ sở Long Biên</option>
                <option value="Cơ sở Hai Bà Trưng">Cơ sở Hai Bà Trưng</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả</option>
                <option value="scheduled">Sắp diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-gray-900">
              {weekStart.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map(day => (
              <div key={day} className="text-center text-gray-700 font-bold">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }, (_, i) => {
              const date = new Date(weekStart);
              date.setDate(weekStart.getDate() + i);
              const isCurrentMonth = date.getMonth() === weekStart.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const daySchedules = weekSchedules.filter(s => new Date(s.date).toDateString() === date.toDateString());

              return (
                <div key={i} className={`p-2 ${isCurrentMonth ? '' : 'text-gray-400'}`}>
                  <div className="text-center">
                    <div className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  {daySchedules.map(schedule => (
                    <div key={schedule.id} className="mt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.room}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.teacher}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.studentIds.length} học viên
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Grid className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.campus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {schedule.status === 'scheduled' ? 'Sắp diễn ra' : 
                           schedule.status === 'completed' ? 'Đã hoàn thành' : 
                           schedule.status === 'cancelled' ? 'Đã hủy' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {filteredSchedules.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy lịch học nào</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Attendance View Component
function AttendanceView({ 
  schedule, 
  students, 
  onBack, 
  onSave 
}: {
  schedule: Schedule;
  students: typeof import('../../data/mockData').students;
  onBack: () => void;
  onSave: (attendanceData: Schedule['attendanceRecords']) => void;
}) {
  const [attendanceData, setAttendanceData] = useState<Schedule['attendanceRecords']>(
    schedule.attendanceRecords || students.map(s => ({
      studentId: s.id,
      status: 'present',
    }))
  );

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => 
      prev!.map(a => a.studentId === studentId ? { ...a, status } : a)
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev => 
      prev!.map(a => a.studentId === studentId ? { ...a, note } : a)
    );
  };

  const handleSubmit = () => {
    onSave(attendanceData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
          <h1 className="text-gray-900 mb-2">Điểm danh lớp {schedule.className}</h1>
          <p className="text-gray-600">
            {new Date(schedule.date).toLocaleDateString('vi-VN')} - {schedule.startTime} đến {schedule.endTime}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {students.map((student) => {
              const attendance = attendanceData?.find(a => a.studentId === student.id);
              
              return (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-900 mb-1">{student.fullName}</p>
                      <p className="text-sm text-gray-600">{student.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1 rounded text-sm ${
                          attendance?.status === 'present' 
                            ? 'text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        style={attendance?.status === 'present' ? { backgroundColor: '#00b894' } : {}}
                      >
                        Có mặt
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1 rounded text-sm ${
                          attendance?.status === 'late' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Muộn
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1 rounded text-sm ${
                          attendance?.status === 'absent' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Vắng
                      </button>
                    </div>
                  </div>
                  
                  {attendance?.status === 'absent' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Ghi chú</label>
                      <input
                        type="text"
                        value={attendance.note || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        placeholder="Lý do vắng..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Lưu điểm danh
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}