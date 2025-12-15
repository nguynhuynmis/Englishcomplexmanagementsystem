import { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { gradesAPI } from '../../utils/api';

interface Student {
  id: string;
  studentId: string;
  studentName: string;
  midtermScore: number;
  finalScore: number;
  averageScore: number;
  attendanceScore: number;
}

interface ClassSummary {
  classId: string;
  className: string;
  classStatus: string;
  totalStudents: number;
  averageMidterm: number;
  averageFinal: number;
  averageOverall: number;
  students: Student[];
}

export default function GradesByClass() {
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [GradesByClass] Loading data...');
      const response = await gradesAPI.getByClass();
      console.log('✅ [GradesByClass] Data loaded:', response);
      const summaries = response?.classSummaries || [];
      setClassSummaries(summaries);
    } catch (err: any) {
      console.error('❌ [GradesByClass] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Lỗi: {error}
      </div>
    );
  }

  if (classSummaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Chưa có dữ liệu điểm theo lớp</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classSummaries.map((classData) => (
        <div key={classData.classId} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Class Header - Clickable */}
          <button
            onClick={() => toggleClass(classData.classId)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-gray-900">{classData.className}</h3>
                <span 
                  className={`px-2 py-1 rounded text-xs ${
                    classData.classStatus === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {classData.classStatus === 'active' ? 'Đang học' : 'Kết thúc'}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Học viên</div>
                    <div className="text-gray-900">{classData.totalStudents}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <div>
                    <div className="text-xs text-gray-600">TB Giữa kỳ</div>
                    <div style={{ color: 'var(--brand-primary)' }}>
                      {classData.averageMidterm.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-600">TB Cuối kỳ</div>
                    <div className="text-green-600">
                      {classData.averageFinal.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-600">TB Tổng kết</div>
                    <div className="text-purple-600">
                      {classData.averageOverall.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-4">
              {expandedClass === classData.classId ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Student List - Expandable */}
          {expandedClass === classData.classId && (
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">STT</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Mã HV</th>
                      <th className="px-6 py-3 text-left text-sm text-gray-700">Họ và tên</th>
                      <th className="px-6 py-3 text-center text-sm text-gray-700">Chuyên cần</th>
                      <th className="px-6 py-3 text-center text-sm text-gray-700">Giữa kỳ</th>
                      <th className="px-6 py-3 text-center text-sm text-gray-700">Cuối kỳ</th>
                      <th className="px-6 py-3 text-center text-sm text-gray-700">Trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classData.students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-3">
                          <span 
                            className="px-2 py-1 rounded text-xs" 
                            style={{ 
                              backgroundColor: 'var(--brand-primary-100)', 
                              color: 'var(--brand-primary-700)' 
                            }}
                          >
                            {student.studentId}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">{student.studentName}</td>
                        <td className="px-6 py-3 text-center text-sm">
                          <span className="text-gray-600">{student.attendanceScore}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span 
                            className="inline-flex px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: 'var(--pastel-yellow-light)', color: '#e67e22' }}
                          >
                            {student.midtermScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span 
                            className="inline-flex px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}
                          >
                            {student.finalScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span 
                            className="inline-flex px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                          >
                            {student.averageScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
