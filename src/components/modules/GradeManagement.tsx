import { useState } from 'react';
import { Edit, Download, Search, Calendar, UserCheck, UserX } from 'lucide-react';

interface IELTSScore {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  overall: number;
}

interface Attendance {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  attendance: Attendance;
  midterm: IELTSScore;
  final: IELTSScore;
  average: number;
}

const mockGrades: Grade[] = [
  { 
    id: '1', 
    studentId: '1', 
    studentName: 'Nguyễn Văn A', 
    className: 'IELTS Beginner A1',
    attendance: { totalSessions: 20, attendedSessions: 18, absentSessions: 2 },
    midterm: { reading: 6.0, listening: 6.5, writing: 5.5, speaking: 6.0, overall: 6.0 },
    final: { reading: 7.0, listening: 7.5, writing: 6.5, speaking: 7.0, overall: 7.0 },
    average: 6.5
  },
  { 
    id: '2', 
    studentId: '2', 
    studentName: 'Trần Thị B', 
    className: 'IELTS Beginner A1',
    attendance: { totalSessions: 20, attendedSessions: 20, absentSessions: 0 },
    midterm: { reading: 7.0, listening: 7.0, writing: 6.5, speaking: 7.5, overall: 7.0 },
    final: { reading: 7.5, listening: 8.0, writing: 7.0, speaking: 7.5, overall: 7.5 },
    average: 7.25
  },
  { 
    id: '3', 
    studentId: '3', 
    studentName: 'Lê Văn C', 
    className: 'IELTS Intermediate B1',
    attendance: { totalSessions: 24, attendedSessions: 22, absentSessions: 2 },
    midterm: { reading: 6.5, listening: 7.0, writing: 6.0, speaking: 6.5, overall: 6.5 },
    final: { reading: 7.5, listening: 8.0, writing: 7.0, speaking: 7.5, overall: 7.5 },
    average: 7.0
  },
];

export default function GradeManagement() {
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const filteredGrades = grades.filter(grade => {
    const matchSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === 'all' || grade.className === filterClass;
    return matchSearch && matchClass;
  });

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
  };

  const handleExport = () => {
    alert('Xuất báo cáo điểm Excel thành công!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'bg-green-100 text-green-700';
    if (score >= 6.5) return 'bg-blue-100 text-blue-700';
    if (score >= 5.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getAttendanceRate = (attendance: Attendance) => {
    return ((attendance.attendedSessions / attendance.totalSessions) * 100).toFixed(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý điểm học tập</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          />
        </div>

        <div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          >
            <option value="all">Tất cả lớp</option>
            <option value="IELTS Beginner A1">IELTS Beginner A1</option>
            <option value="IELTS Beginner A2">IELTS Beginner A2</option>
            <option value="IELTS Intermediate B1">IELTS Intermediate B1</option>
            <option value="IELTS Advanced C1">IELTS Advanced C1</option>
            <option value="IELTS Master">IELTS Master</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Học viên</th>
                <th className="px-6 py-3 text-left text-gray-700">Lớp</th>
                <th className="px-6 py-3 text-center text-gray-700">Chuyên cần</th>
                <th className="px-6 py-3 text-center text-gray-700">Giữa kỳ</th>
                <th className="px-6 py-3 text-center text-gray-700">Cuối kỳ</th>
                <th className="px-6 py-3 text-center text-gray-700">Điểm TB</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{grade.studentName}</td>
                  <td className="px-6 py-4 text-gray-600">{grade.className}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">{grade.attendance.attendedSessions}</span>
                        <UserX className="w-4 h-4 text-red-600" />
                        <span className="text-red-700">{grade.attendance.absentSessions}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        parseInt(getAttendanceRate(grade.attendance)) >= 90 
                          ? 'bg-green-100 text-green-700'
                          : parseInt(getAttendanceRate(grade.attendance)) >= 80
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getAttendanceRate(grade.attendance)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded ${getScoreColor(grade.midterm.overall)}`}>
                      {grade.midterm.overall.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded ${getScoreColor(grade.final.overall)}`}>
                      {grade.final.overall.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded ${getScoreColor(grade.average)}`}>
                      {grade.average.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(grade)}
                      className="hover:opacity-70"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGrade && (
        <GradeModal
          grade={editingGrade}
          onClose={() => setEditingGrade(null)}
          onSave={(updatedGrade) => {
            setGrades(grades.map(g => g.id === updatedGrade.id ? updatedGrade : g));
            setEditingGrade(null);
          }}
        />
      )}
    </div>
  );
}

function GradeModal({ grade, onClose, onSave }: {
  grade: Grade;
  onClose: () => void;
  onSave: (grade: Grade) => void;
}) {
  const [formData, setFormData] = useState<Grade>(grade);

  const calculateOverall = (scores: Omit<IELTSScore, 'overall'>): number => {
    return Number(((scores.reading + scores.listening + scores.writing + scores.speaking) / 4).toFixed(1));
  };

  const calculateAverage = (midterm: IELTSScore, final: IELTSScore) => {
    return Number(((midterm.overall * 0.4 + final.overall * 0.6)).toFixed(1));
  };

  const handleMidtermChange = (skill: keyof Omit<IELTSScore, 'overall'>, value: number) => {
    const newMidterm = { ...formData.midterm, [skill]: value };
    newMidterm.overall = calculateOverall(newMidterm);
    const newFormData = { ...formData, midterm: newMidterm };
    newFormData.average = calculateAverage(newFormData.midterm, newFormData.final);
    setFormData(newFormData);
  };

  const handleFinalChange = (skill: keyof Omit<IELTSScore, 'overall'>, value: number) => {
    const newFinal = { ...formData.final, [skill]: value };
    newFinal.overall = calculateOverall(newFinal);
    const newFormData = { ...formData, final: newFinal };
    newFormData.average = calculateAverage(newFormData.midterm, newFormData.final);
    setFormData(newFormData);
  };

  const handleAttendanceChange = (field: 'attendedSessions' | 'absentSessions', value: number) => {
    const newAttendance = { ...formData.attendance };
    if (field === 'attendedSessions') {
      newAttendance.attendedSessions = value;
      newAttendance.absentSessions = newAttendance.totalSessions - value;
    } else {
      newAttendance.absentSessions = value;
      newAttendance.attendedSessions = newAttendance.totalSessions - value;
    }
    setFormData({ ...formData, attendance: newAttendance });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Chỉnh sửa điểm - {grade.studentName}</h2>
          <p className="text-gray-600 text-sm mt-1">{grade.className}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Chuyên cần */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chuyên cần
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Tổng số buổi</label>
                <input
                  type="number"
                  min="1"
                  value={formData.attendance.totalSessions}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    attendance: { 
                      ...formData.attendance, 
                      totalSessions: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Số buổi đi học</label>
                <input
                  type="number"
                  min="0"
                  max={formData.attendance.totalSessions}
                  value={formData.attendance.attendedSessions}
                  onChange={(e) => handleAttendanceChange('attendedSessions', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Số buổi nghỉ</label>
                <input
                  type="number"
                  min="0"
                  max={formData.attendance.totalSessions}
                  value={formData.attendance.absentSessions}
                  onChange={(e) => handleAttendanceChange('absentSessions', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
              <p style={{ color: 'var(--brand-primary-900)' }}>
                Tỷ lệ tham gia: {((formData.attendance.attendedSessions / formData.attendance.totalSessions) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Điểm giữa kỳ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-900 mb-4">Điểm kiểm tra giữa kỳ (40%)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Reading</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.midterm.reading}
                  onChange={(e) => handleMidtermChange('reading', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Listening</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.midterm.listening}
                  onChange={(e) => handleMidtermChange('listening', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Writing</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.midterm.writing}
                  onChange={(e) => handleMidtermChange('writing', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Speaking</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.midterm.speaking}
                  onChange={(e) => handleMidtermChange('speaking', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--brand-primary-900)' }}>Điểm trung bình giữa kỳ</span>
                <span style={{ color: 'var(--brand-primary-900)' }}>{formData.midterm.overall.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Điểm cuối kỳ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-900 mb-4">Điểm kiểm tra cuối kỳ (60%)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Reading</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.final.reading}
                  onChange={(e) => handleFinalChange('reading', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Listening</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.final.listening}
                  onChange={(e) => handleFinalChange('listening', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Writing</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.final.writing}
                  onChange={(e) => handleFinalChange('writing', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Speaking</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.final.speaking}
                  onChange={(e) => handleFinalChange('speaking', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--brand-primary-900)' }}>Điểm trung bình cuối kỳ</span>
                <span style={{ color: 'var(--brand-primary-900)' }}>{formData.final.overall.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Điểm tổng kết */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
            <div className="flex items-center justify-between">
              <span className="text-lg" style={{ color: 'var(--brand-primary-900)' }}>Điểm trung bình tổng kết</span>
              <span className="text-xl" style={{ color: 'var(--brand-primary-900)' }}>{formData.average.toFixed(1)}</span>
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--brand-primary-700)' }}>
              Giữa kỳ 40% + Cuối kỳ 60%
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Lưu điểm
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
