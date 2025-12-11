import { useState } from 'react';
import { Calendar as CalendarIcon, Check, X as XIcon, Clock, Users, Save, ArrowLeft, ClipboardList, CalendarDays } from 'lucide-react';
import { User } from '../../App';
import { classes, students, schedules } from '../../data/mockData';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

interface ClassSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  attendanceRecords: AttendanceRecord[];
  isSaved: boolean;
}

// Convert schedules from mockData to ClassSession format
const convertSchedulesToSessions = (): ClassSession[] => {
  return schedules.map(schedule => {
    // Get student names from IDs
    const attendanceRecords: AttendanceRecord[] = schedule.studentIds.map(studentId => {
      const student = students.find(s => s.id === studentId);
      
      // If attendance records exist in schedule, use them
      const existingRecord = schedule.attendanceRecords?.find(r => r.studentId === studentId);
      
      return {
        studentId,
        studentName: student?.fullName || 'Học viên không xác định',
        status: existingRecord?.status || 'present',
        note: existingRecord?.note || '',
      };
    });

    return {
      id: schedule.id,
      classId: schedule.classId,
      className: schedule.className,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      teacher: schedule.teacher,
      attendanceRecords,
      isSaved: schedule.status === 'completed' && !!schedule.attendanceRecords,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

interface AttendanceManagementProps {
  user: User;
}

export default function AttendanceManagement({ user }: AttendanceManagementProps) {
  const [sessions, setSessions] = useState<ClassSession[]>(convertSchedulesToSessions());
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [viewMode, setViewMode] = useState<'bySchedule' | 'byClass'>('bySchedule'); // Thêm mode

  // Filter sessions by teacher and filters
  const filteredSessions = sessions.filter(session => {
    if (user.role === 'teacher' && session.teacher !== user.fullName) {
      return false;
    }
    
    const matchDate = !filterDate || session.date === filterDate;
    const matchClass = filterClass === 'all' || session.classId === filterClass;
    
    return matchDate && matchClass;
  });

  const handleSelectSession = (session: ClassSession) => {
    setSelectedSession(session);
  };

  const handleBackToList = () => {
    setSelectedSession(null);
  };

  const handleUpdateAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!selectedSession) return;
    
    setSelectedSession({
      ...selectedSession,
      attendanceRecords: selectedSession.attendanceRecords.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      ),
    });
  };

  const handleUpdateNote = (studentId: string, note: string) => {
    if (!selectedSession) return;
    
    setSelectedSession({
      ...selectedSession,
      attendanceRecords: selectedSession.attendanceRecords.map(record =>
        record.studentId === studentId ? { ...record, note } : record
      ),
    });
  };

  const handleSaveAttendance = () => {
    if (!selectedSession) return;
    
    setSessions(sessions.map(s =>
      s.id === selectedSession.id ? { ...selectedSession, isSaved: true } : s
    ));
    
    alert('Lưu điểm danh thành công!');
    setSelectedSession(null);
  };

  // List view
  if (!selectedSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">
            {user.role === 'teacher' ? 'Điểm danh lớp học' : 'Quản lý điểm danh'}
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Ngày học</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>

            {user.role !== 'teacher' && (
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
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const presentCount = session.attendanceRecords.filter(r => r.status === 'present').length;
            const totalCount = session.attendanceRecords.length;
            const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
            
            return (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectSession(session)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{session.className}</h3>
                        {session.isSaved ? (
                          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                            Đã điểm danh
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--pastel-orange-light)', color: '#e67e22' }}>
                            Chưa điểm danh
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">Giảng viên: {session.teacher}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(session.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{session.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--brand-primary)' }}>
                        Có mặt: {presentCount}/{totalCount} ({attendanceRate}%)
                      </span>
                    </div>
                  </div>

                  {session.isSaved && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${attendanceRate}%`,
                            backgroundColor: attendanceRate >= 80 ? '#00b894' : attendanceRate >= 60 ? '#e67e22' : '#e74c3c',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không có buổi học nào</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Attendance marking view
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">{selectedSession.className}</h1>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(selectedSession.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{selectedSession.room}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Save className="w-4 h-4" />
              Lưu điểm danh
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {selectedSession.attendanceRecords.map((record) => (
              <div
                key={record.studentId}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2">{record.studentName}</h3>
                  
                  {/* Attendance Status Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleUpdateAttendance(record.studentId, 'present')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        record.status === 'present'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={record.status === 'present' ? { backgroundColor: '#00b894' } : {}}
                    >
                      <Check className="w-4 h-4" />
                      <span>Có mặt</span>
                    </button>
                    
                    <button
                      onClick={() => handleUpdateAttendance(record.studentId, 'absent')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        record.status === 'absent'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <XIcon className="w-4 h-4" />
                      <span>Vắng</span>
                    </button>
                    
                    <button
                      onClick={() => handleUpdateAttendance(record.studentId, 'late')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        record.status === 'late'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={record.status === 'late' ? { backgroundColor: '#e67e22' } : {}}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Đi muộn</span>
                    </button>
                    
                    <button
                      onClick={() => handleUpdateAttendance(record.studentId, 'excused')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        record.status === 'excused'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={record.status === 'excused' ? { backgroundColor: '#8b5cf6' } : {}}
                    >
                      <span>Có phép</span>
                    </button>
                  </div>

                  {/* Note input */}
                  <input
                    type="text"
                    value={record.note || ''}
                    onChange={(e) => handleUpdateNote(record.studentId, e.target.value)}
                    placeholder="Ghi chú (nếu có)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Có mặt</p>
                <p className="text-gray-900">
                  {selectedSession.attendanceRecords.filter(r => r.status === 'present').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Vắng</p>
                <p className="text-gray-900">
                  {selectedSession.attendanceRecords.filter(r => r.status === 'absent').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Đi muộn</p>
                <p className="text-gray-900">
                  {selectedSession.attendanceRecords.filter(r => r.status === 'late').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Có phép</p>
                <p className="text-gray-900">
                  {selectedSession.attendanceRecords.filter(r => r.status === 'excused').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}