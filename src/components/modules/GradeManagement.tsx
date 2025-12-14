import { useState, useEffect } from 'react';
import { Edit, Download, Search, Calendar, UserCheck, UserX, Plus, Filter, ChevronDown } from 'lucide-react';
import { User } from '../../App';
import StudentLearningProgress from './StudentLearningProgress';
import { gradesAPI, studentsAPI } from '../../utils/api';

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

interface GradeManagementProps {
  user: User;
}

const mockGrades: Grade[] = [
  { 
    id: '1', 
    studentId: 'HV001', 
    studentName: 'Nguyên Thị Khánh Huyền',  // Fixed: Nguyên (not Nguyễn)
    className: 'IELTS Beginner - LB02',
    attendance: { totalSessions: 24, attendedSessions: 22, absentSessions: 2 },
    midterm: { reading: 6.5, listening: 6.5, writing: 6.0, speaking: 6.0, overall: 6.0 }, // (6.5+6.5+6.0+6.0)/4 = 6.25 → 6.0
    final: { reading: 7.0, listening: 7.5, writing: 6.5, speaking: 7.0, overall: 7.0 }, // (7.0+7.5+6.5+7.0)/4 = 7.0
    average: 6.5 // 6.0*0.4 + 7.0*0.6 = 6.6 → 6.5
  },
  { 
    id: '2', 
    studentId: 'HV002', 
    studentName: 'Trần Minh Anh', 
    className: 'IELTS Advanced - HBT02',
    attendance: { totalSessions: 20, attendedSessions: 20, absentSessions: 0 },
    midterm: { reading: 7.5, listening: 7.0, writing: 7.0, speaking: 7.5, overall: 7.0 }, // (7.5+7.0+7.0+7.5)/4 = 7.25 → 7.0
    final: { reading: 8.0, listening: 8.0, writing: 7.5, speaking: 8.0, overall: 8.0 }, // (8.0+8.0+7.5+8.0)/4 = 7.875 → 8.0
    average: 7.5 // 7.0*0.4 + 8.0*0.6 = 7.6 → 7.5
  },
  { 
    id: '3', 
    studentId: 'HV003', 
    studentName: 'Lê Hoàng Nam', 
    className: 'IELTS Intermediate - LB01',
    attendance: { totalSessions: 24, attendedSessions: 23, absentSessions: 1 },
    midterm: { reading: 6.0, listening: 6.5, writing: 5.5, speaking: 6.0, overall: 6.0 }, // (6.0+6.5+5.5+6.0)/4 = 6.0
    final: { reading: 7.0, listening: 7.0, writing: 6.5, speaking: 7.0, overall: 7.0 }, // (7.0+7.0+6.5+7.0)/4 = 6.875 → 7.0
    average: 6.5 // 6.0*0.4 + 7.0*0.6 = 6.6 → 6.5
  },
  { 
    id: '4', 
    studentId: 'HV004', 
    studentName: 'Phạm Thu Hà', 
    className: 'IELTS Master - LB03',
    attendance: { totalSessions: 16, attendedSessions: 16, absentSessions: 0 },
    midterm: { reading: 7.5, listening: 8.0, writing: 7.0, speaking: 7.5, overall: 7.5 }, // (7.5+8.0+7.0+7.5)/4 = 7.5
    final: { reading: 8.0, listening: 8.5, writing: 7.5, speaking: 8.0, overall: 8.0 }, // (8.0+8.5+7.5+8.0)/4 = 8.0
    average: 7.5 // 7.5*0.4 + 8.0*0.6 = 7.8 → 8.0
  },
];

export default function GradeManagement({ user }: GradeManagementProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'byClass'>('table');
  const [filterClass, setFilterClass] = useState('all');
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [GradeManagement] Loading data...');
      const response = await gradesAPI.getAll();
      console.log('✅ [GradeManagement] Data loaded:', response);
      setGrades(response.grades || []);
    } catch (err: any) {
      console.error('❌ [GradeManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Lọc điểm: Học viên chỉ xem được điểm của mình
  const availableGrades = user.role === 'student' 
    ? grades.filter(g => g.studentId === user.id)
    : grades;

  const filteredGrades = availableGrades.filter(grade => {
    return (
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const uniqueClasses = Array.from(new Set(availableGrades.map(g => g.className)));

  // Group grades by class
  const gradesByClass = uniqueClasses.reduce((acc, className) => {
    acc[className] = availableGrades.filter(g => g.className === className);
    return acc;
  }, {} as Record<string, Grade[]>);

  const handleExportPDF = () => {
    alert('Xuất Excel đang được phát triển');
  };

  const handleSaveGrade = () => {
    if (editingGrade) {
      setGrades(grades.map(g => g.id === editingGrade.id ? editingGrade : g));
      setEditingGrade(null);
      alert('Cập nhật điểm thành công!');
    }
  };

  // Tính điểm IELTS Overall Band theo chuẩn quốc tế
  const calculateOverall = (reading: number, listening: number, writing: number, speaking: number): number => {
    const avg = (reading + listening + writing + speaking) / 4;
    
    // Quy tắc làm tròn IELTS
    const decimal = avg - Math.floor(avg);
    if (decimal < 0.25) return Math.floor(avg);
    if (decimal < 0.75) return Math.floor(avg) + 0.5;
    return Math.ceil(avg);
  };

  const handleScoreChange = (type: 'midterm' | 'final', skill: keyof IELTSScore, value: string) => {
    if (!editingGrade) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 9) return;

    const updatedGrade = { ...editingGrade };
    updatedGrade[type] = { ...updatedGrade[type], [skill]: numValue };

    // Tự động tính Overall khi thay đổi bất kỳ kỹ năng nào
    if (skill !== 'overall') {
      const scores = updatedGrade[type];
      scores.overall = calculateOverall(scores.reading, scores.listening, scores.writing, scores.speaking);
    }

    // Tính lại average
    updatedGrade.average = calculateOverall(
      updatedGrade.midterm.overall * 0.4 + updatedGrade.final.overall * 0.6,
      updatedGrade.midterm.overall * 0.4 + updatedGrade.final.overall * 0.6,
      updatedGrade.midterm.overall * 0.4 + updatedGrade.final.overall * 0.6,
      updatedGrade.midterm.overall * 0.4 + updatedGrade.final.overall * 0.6
    );

    setEditingGrade(updatedGrade);
  };

  const pageTitle = user.role === 'student' ? 'Quá trình học tập' : 'Quản lý điểm';

  // Học viên xem giao diện Quá trình học tập
  if (user.role === 'student') {
    return (
      <div className="space-y-6">
        <h1 className="text-gray-900">{pageTitle}</h1>
        <StudentLearningProgress studentId={user.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-gray-900">{pageTitle}</h1>
        <div className="flex items-center gap-3">
          {(user.role === 'academic' || user.role === 'teacher') && (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'table' 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'table' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                Bảng điểm
              </button>
              <button
                onClick={() => setViewMode('byClass')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'byClass' 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'byClass' ? { backgroundColor: 'var(--brand-primary)' } : {}}
              >
                Theo lớp
              </button>
            </div>
          )}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          >
            <option value="all">Tất cả lớp học</option>
            {uniqueClasses.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {/* Grades Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Mã HV</th>
                    <th className="px-6 py-3 text-left text-gray-700">Họ và tên</th>
                    <th className="px-6 py-3 text-left text-gray-700">Lớp học</th>
                    <th className="px-6 py-3 text-center text-gray-700">Chuyên cần</th>
                    <th className="px-6 py-3 text-center text-gray-700">Điểm giữa kỳ</th>
                    <th className="px-6 py-3 text-center text-gray-700">Điểm cuối kỳ</th>
                    <th className="px-6 py-3 text-center text-gray-700">Điểm TB</th>
                    {(user.role === 'academic' || user.role === 'teacher') && (
                      <th className="px-6 py-3 text-center text-gray-700">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGrades.map(grade => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {grade.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{grade.studentName}</td>
                      <td className="px-6 py-4 text-gray-600">{grade.className}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-green-600">
                            <UserCheck className="w-4 h-4" />
                            <span className="text-sm">{grade.attendance.attendedSessions}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <UserX className="w-4 h-4" />
                            <span className="text-sm">{grade.attendance.absentSessions}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--pastel-yellow-light)', color: '#e67e22' }}>
                          {grade.midterm.overall}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                          {grade.final.overall}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {grade.average}
                        </div>
                      </td>
                      {(user.role === 'academic' || user.role === 'teacher') && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setEditingGrade(grade)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            style={{ color: 'var(--brand-primary)' }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredGrades.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy dữ liệu điểm</p>
            </div>
          )}
        </>
      )}

      {/* By Class View */}
      {viewMode === 'byClass' && (
        <>
          {/* Grades by Class */}
          <div className="space-y-6">
            {filterClass !== 'all' ? (
              gradesByClass[filterClass].map(grade => (
                <div key={grade.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                        {grade.studentId}
                      </span>
                      <span className="text-gray-900">{grade.studentName}</span>
                    </div>
                    {(user.role === 'academic' || user.role === 'teacher') && (
                      <button
                        onClick={() => setEditingGrade(grade)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: 'var(--brand-primary)' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Lớp học</span>
                      <span className="text-gray-600">{grade.className}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Chuyên cần</span>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-green-600">
                          <UserCheck className="w-4 h-4" />
                          <span className="text-sm">{grade.attendance.attendedSessions}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <UserX className="w-4 h-4" />
                          <span className="text-sm">{grade.attendance.absentSessions}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Điểm giữa kỳ</span>
                      <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--pastel-yellow-light)', color: '#e67e22' }}>
                        {grade.midterm.overall}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Điểm cuối kỳ</span>
                      <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                        {grade.final.overall}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-700">Điểm TB</span>
                      <div className="inline-flex px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                        {grade.average}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Chọn lớp học để xem điểm</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900">Nhập điểm - {editingGrade.studentName}</h2>
              <p className="text-gray-600 mt-1">{editingGrade.className}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Midterm Scores */}
              <div>
                <h3 className="text-gray-900 mb-4">Điểm giữa kỳ (40%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Reading</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.midterm.reading}
                      onChange={(e) => handleScoreChange('midterm', 'reading', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Listening</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.midterm.listening}
                      onChange={(e) => handleScoreChange('midterm', 'listening', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Writing</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.midterm.writing}
                      onChange={(e) => handleScoreChange('midterm', 'writing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Speaking</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.midterm.speaking}
                      onChange={(e) => handleScoreChange('midterm', 'speaking', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Overall</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {editingGrade.midterm.overall}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Scores */}
              <div>
                <h3 className="text-gray-900 mb-4">Điểm cuối kỳ (60%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Reading</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.final.reading}
                      onChange={(e) => handleScoreChange('final', 'reading', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Listening</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.final.listening}
                      onChange={(e) => handleScoreChange('final', 'listening', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Writing</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.final.writing}
                      onChange={(e) => handleScoreChange('final', 'writing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Speaking</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingGrade.final.speaking}
                      onChange={(e) => handleScoreChange('final', 'speaking', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Overall</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {editingGrade.final.overall}
                    </div>
                  </div>
                </div>
              </div>

              {/* Average */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Điểm trung bình (GK 40% + CK 60%)</span>
                  <span className="text-2xl" style={{ color: 'var(--brand-primary)' }}>
                    {editingGrade.average}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingGrade(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGrade}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Lưu điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}