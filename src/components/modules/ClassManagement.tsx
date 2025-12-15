import { useState, useEffect } from 'react';
import { Plus, Edit, Users, UserPlus, Search, Eye, ArrowLeft } from 'lucide-react';
import { User } from '../../App';
import { students, classes as initialClasses, Class as ClassType, campusNames } from '../../data/mockData';
import ClassFormModal from './ClassFormModal';
import { classesAPI, studentsAPI } from '../../utils/api';

type ViewMode = 'list' | 'detail' | 'edit' | 'create';

// Màu cho mỗi trình độ
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Foundation':
      return { bg: '#e1f5fe', color: '#01579b' }; // Xanh dương rất nhạt
    case 'Beginner':
      return { bg: '#e3f2fd', color: '#1565c0' }; // Xanh dương nhạt
    case 'Intermediate':
      return { bg: '#fff3e0', color: '#e65100' }; // Cam nhạt
    case 'Advanced':
      return { bg: '#f3e5f5', color: '#6a1b9a' }; // Tím nhạt
    case 'Master':
      return { bg: '#fce4ec', color: '#c2185b' }; // Hồng nhạt
    default:
      return { bg: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' };
  }
};

interface ClassManagementProps {
  user: User;
}

export default function ClassManagement({ user }: ClassManagementProps) {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);
  const [enrollingClass, setEnrollingClass] = useState<ClassType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  // Chỉ học vụ mới được thêm/sửa/xóa lớp học
  const canModify = user.role === 'academic';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [ClassManagement] Loading data...');
      const response = await classesAPI.getAll();
      console.log('✅ [ClassManagement] Data loaded:', response);
      // API returns { classes: [...] }, unwrap it
      const classesArray = response?.classes || response || [];
      console.log('📊 [ClassManagement] Sample class status:', classesArray?.[0]?.status, 'Type:', typeof classesArray?.[0]?.status);
      setClasses(classesArray);
    } catch (err: any) {
      console.error('❌ [ClassManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const matchSearch = classItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchCampus = filterCampus === 'all' || classItem?.campus === filterCampus;
    const matchLevel = filterLevel === 'all' || classItem?.level === filterLevel;
    return matchSearch && matchCampus && matchLevel;
  });

  const handleAdd = () => {
    setEditingClass(null);
    setShowModal(true);
  };

  const handleEdit = (classItem: ClassType) => {
    setEditingClass(classItem);
    setShowModal(true);
  };

  const handleEnroll = (classItem: ClassType) => {
    setEnrollingClass(classItem);
  };

  const handleViewDetail = (classItem: ClassType) => {
    setSelectedClass(classItem);
    setViewMode('detail');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý lớp học</h1>
        {canModify && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Thêm lớp học
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button onClick={loadData} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            Thử lại
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            />
          </div>

          <select
            value={filterCampus}
            onChange={(e) => setFilterCampus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          >
            <option value="all">Tất cả cơ sở</option>
            {campusNames.map(campus => (
              <option key={campus} value={campus}>{campus}</option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          >
            <option value="all">Tất cả trình độ</option>
            <option value="Foundation">Foundation</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Tên lớp</th>
                <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                <th className="px-6 py-3 text-left text-gray-700">Trình độ</th>
                <th className="px-6 py-3 text-left text-gray-700">Sĩ số</th>
                <th className="px-6 py-3 text-left text-gray-700">Giảng viên</th>
                <th className="px-6 py-3 text-left text-gray-700">Lịch học</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{classItem.name}</td>
                  <td className="px-6 py-4 text-gray-600">{classItem.campus}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: getLevelColor(classItem.level).bg, color: getLevelColor(classItem.level).color }}
                    >
                      {classItem.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {classItem.totalStudents}/{classItem.maxStudents}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{classItem.teacher}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{classItem.schedule}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: 
                          classItem.status === 'active' ? 'var(--pastel-green-light)' : 
                          classItem.status === 'completed' ? '#fee' : 
                          '#fef3c7',
                        color: 
                          classItem.status === 'active' ? '#00b894' : 
                          classItem.status === 'completed' ? '#d63031' : 
                          '#d97706',
                      }}
                    >
                      {classItem.status === 'active' ? 'Đang hoạt động' : 
                       classItem.status === 'completed' ? 'Đã hoàn thành' : 
                       'Chưa bắt đầu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canModify && (
                        <>
                          <button
                            onClick={() => handleEnroll(classItem)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(classItem)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetail(classItem)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ClassFormModal
          classItem={editingClass}
          onClose={() => setShowModal(false)}
          onSave={async (classItem) => {
            try {
              console.log('[ClassManagement] Saving class:', classItem);
              if (editingClass) {
                await classesAPI.update(classItem.id, classItem);
              } else {
                await classesAPI.create(classItem);
              }
              // Reload data from server to get updated status and other fields
              await loadData();
              setShowModal(false);
            } catch (err: any) {
              console.error('[ClassManagement] Save error:', err);
              alert(`Lỗi: ${err.message || 'Không thể lưu lớp học'}`);
            }
          }}
        />
      )}

      {/* Enroll Modal */}
      {enrollingClass && (
        <EnrollModal
          classItem={enrollingClass}
          onClose={() => setEnrollingClass(null)}
          onEnroll={(studentIds) => {
            setClasses(classes.map(c =>
              c.id === enrollingClass.id
                ? { ...c, totalStudents: c.totalStudents + studentIds.length }
                : c
            ));
            setEnrollingClass(null);
          }}
        />
      )}

      {/* Detail View */}
      {viewMode === 'detail' && selectedClass && (
        <DetailView
          classItem={selectedClass}
          onClose={() => setViewMode('list')}
        />
      )}
        </>
      )}
    </div>
  );
}

function EnrollModal({ classItem, onClose, onEnroll }: {
  classItem: ClassType;
  onClose: () => void;
  onEnroll: (studentIds: string[]) => void;
}) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false); // NEW: Track enrollment in progress

  // Load available students from API
  useEffect(() => {
    loadAvailableStudents();
  }, []);

  const loadAvailableStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAvailable();
      setAvailableStudents(response?.students || []);
    } catch (error) {
      console.error('❌ [EnrollModal] Error loading students:', error);
      setAvailableStudents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredStudents = availableStudents.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleEnroll = async () => { // Make async
    if (selectedStudents.length === 0) {
      alert('Vui lòng chọn ít nhất 1 học viên');
      return;
    }

    // Kiểm tra lớp đầy
    const availableSlots = classItem.maxStudents - classItem.totalStudents;
    if (selectedStudents.length > availableSlots) {
      alert(`Lớp chỉ còn ${availableSlots} chỗ trống. Bạn đang chọn ${selectedStudents.length} học viên. Vui lòng giảm số lượng học viên hoặc chọn lớp khác.`);
      return;
    }

    try {
      setEnrolling(true);
      console.log('📝 [EnrollModal] Enrolling students:', { classId: classItem.id, studentIds: selectedStudents });
      
      // Call API to enroll students
      const response = await classesAPI.enroll(classItem.id, selectedStudents);
      
      console.log('✅ [EnrollModal] Enrollment successful:', response);
      alert(`Đã ghi danh thành công ${response.enrolled} học viên!`);
      
      // Call parent callback to update UI
      onEnroll(selectedStudents);
    } catch (error: any) {
      console.error('❌ [EnrollModal] Enrollment error:', error);
      alert(`Lỗi: ${error.message || 'Không thể ghi danh học viên'}`);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Ghi danh học viên - {classItem.name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            Sức chứa: {classItem.totalStudents}/{classItem.maxStudents} | Còn trống: {classItem.maxStudents - classItem.totalStudents} chỗ
          </p>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>
          </div>

          <p className="text-gray-700 mb-3">Chọn học viên cần ghi danh ({filteredStudents.length} khả dụng):</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--brand-primary)' }}></div>
                <p className="text-gray-600 text-sm">Đang tải danh sách học viên...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">Không có học viên khả dụng</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--brand-primary-50)' }} className="sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(filteredStudents.map(s => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 text-sm">Mã HV</th>
                      <th className="px-4 py-3 text-left text-gray-700 text-sm">Họ tên</th>
                      <th className="px-4 py-3 text-left text-gray-700 text-sm">Email</th>
                      <th className="px-4 py-3 text-left text-gray-700 text-sm">Số ĐT</th>
                      <th className="px-4 py-3 text-left text-gray-700 text-sm">Lớp hiện tại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-sm">{student.code}</td>
                        <td className="px-4 py-3 text-gray-900">{student.fullName}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{student.phone}</td>
                        <td className="px-4 py-3 text-sm">
                          {student.currentClass ? (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              Đã có lớp
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Chưa xếp lớp</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
              <p style={{ color: 'var(--brand-primary)' }}>
                ✓ Đã chọn {selectedStudents.length} học viên
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleEnroll}
            disabled={enrolling || selectedStudents.length === 0 || selectedStudents.length > (classItem.maxStudents - classItem.totalStudents)}
            className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: (enrolling || selectedStudents.length === 0) ? '#ccc' : 'var(--brand-primary)' }}
          >
            {enrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Đang ghi danh...</span>
              </>
            ) : (
              <span>Ghi danh ({selectedStudents.length})</span>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={enrolling}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailView({ classItem, onClose }: {
  classItem: ClassType;
  onClose: () => void;
}) {
  // Get students in this class from mock data
  const classStudents = students.filter(s => s.currentClass === classItem.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">Chi tiết lớp học</h2>
              <p className="text-sm text-gray-600 mt-1">{classItem.name}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Class Information */}
          <div>
            <h3 className="text-gray-900 mb-4">Thông tin lớp học</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cơ sở</p>
                <p className="text-gray-900">{classItem.campus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trình độ</p>
                <p className="text-gray-900">
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: getLevelColor(classItem.level).bg, color: getLevelColor(classItem.level).color }}
                  >
                    {classItem.level}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Giảng viên</p>
                <p className="text-gray-900">{classItem.teacher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Sĩ số</p>
                <p className="text-gray-900">{classItem.totalStudents}/{classItem.maxStudents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Lịch học</p>
                <p className="text-gray-900">{classItem.schedule}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 
                      classItem.status === 'active' ? 'var(--pastel-green-light)' : 
                      classItem.status === 'completed' ? '#fee' : 
                      '#fef3c7',
                    color: 
                      classItem.status === 'active' ? '#00b894' : 
                      classItem.status === 'completed' ? '#d63031' : 
                      '#d97706',
                  }}
                >
                  {classItem.status === 'active' ? 'Đang hoạt động' : 
                   classItem.status === 'completed' ? 'Đã hoàn thành' : 
                   'Chưa bắt đầu'}
                </span>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div>
            <h3 className="text-gray-900 mb-4">Danh sách học viên ({classStudents.length})</h3>
            {classStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có học viên nào trong lớp
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Mã HV</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-gray-700">Số điện thoại</th>
                      <th className="px-4 py-3 text-left text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{student.code}</td>
                        <td className="px-4 py-3 text-gray-900">{student.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{student.email}</td>
                        <td className="px-4 py-3 text-gray-600">{student.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-3 py-1 rounded-full text-sm"
                            style={{
                              backgroundColor: student.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                              color: student.status === 'active' ? '#00b894' : '#d63031',
                            }}
                          >
                            {student.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}