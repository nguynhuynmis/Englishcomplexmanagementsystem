import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Search, Mail, Phone, Calendar, MapPin, User, ArrowLeft, GraduationCap, Trash2, UserPlus } from 'lucide-react';
import { students, classes } from '../../data/mockData';
import type { Student } from '../../data/mockData';
import StudentLearningProgress from './StudentLearningProgress';
import { studentsAPI, classesAPI } from '../../utils/api';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

interface StudentManagementProps {
  onNavigateToUserManagement?: () => void;
}

export default function StudentManagement({ onNavigateToUserManagement }: StudentManagementProps) {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'progress'>('info'); // Tab cho detail view

  // Load students and classes from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [StudentManagement] Loading students and classes from API...');
      const [studentsResponse, classesResponse] = await Promise.all([
        studentsAPI.getAll(),
        classesAPI.getAll()
      ]);
      
      console.log('✅ [StudentManagement] API Response:', {
        students: studentsResponse,
        classes: classesResponse
      });
      
      // Ensure we always set arrays, even if response is malformed
      setStudentList(Array.isArray(studentsResponse.students) ? studentsResponse.students : []);
      setClassList(Array.isArray(classesResponse.classes) ? classesResponse.classes : []);
    } catch (err: any) {
      console.error('❌ [StudentManagement] Load data error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
      // Set empty arrays on error to prevent filter errors
      setStudentList([]);
      setClassList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = Array.isArray(studentList) ? studentList.filter(student => {
    const matchSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCampus = filterCampus === 'all' || student.campus === filterCampus || !student.campus; // Also match if campus is null
    const matchStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchSearch && matchCampus && matchStatus;
  }) : [];

  // DEBUG: Log filtering results
  console.log('🔍 [StudentManagement] Filter Debug:', {
    studentList,
    studentListLength: studentList.length,
    filteredStudents,
    filteredStudentsLength: filteredStudents.length,
    searchTerm,
    filterCampus,
    filterStatus,
    loading,
    error
  });

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setViewMode('detail');
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setSelectedStudent(null);
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStudent(null);
  };

  const handleSave = async (student: Student) => {
    try {
      console.log('[StudentManagement] Saving student:', student);
      
      if (viewMode === 'edit' && selectedStudent) {
        // Update existing student
        await studentsAPI.update(student.id, student);
        setStudentList(Array.isArray(studentList) ? studentList.map(s => s.id === student.id ? student : s) : [student]);
      } else {
        // Create new student
        const response = await studentsAPI.create(student);
        setStudentList(Array.isArray(studentList) ? [...studentList, response.student] : [response.student]);
      }
      
      setViewMode('list');
      setSelectedStudent(null);
    } catch (err: any) {
      console.error('[StudentManagement] Save error:', err);
      alert(`Lỗi: ${err.message || 'Không thể lưu học viên'}`);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa học viên ${student.fullName}?`)) {
      return;
    }
    
    try {
      console.log('[StudentManagement] Deleting student:', student.id);
      await studentsAPI.delete(student.id);
      setStudentList(Array.isArray(studentList) ? studentList.filter(s => s.id !== student.id) : []);
      setViewMode('list');
      setSelectedStudent(null);
    } catch (err: any) {
      console.error('[StudentManagement] Delete error:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa học viên'}`);
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">Quản lý học viên</h1>
          {onNavigateToUserManagement && (
            <button
              onClick={onNavigateToUserManagement}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <UserPlus className="w-5 h-5" />
              Thêm học viên mới
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
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Content (only show if not loading) */}
        {!loading && !error && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, mã HV..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  />
                </div>

                <div>
                  <select
                    value={filterCampus}
                    onChange={(e) => setFilterCampus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  >
                    <option value="all">Tất cả cơ sở</option>
                    <option value="CS001">Cơ sở Long Biên</option>
                    <option value="CS002">Cơ sở Hai Bà Trưng</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang học</option>
                    <option value="inactive">Đã nghỉ</option>
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
                      <th className="px-6 py-3 text-left text-gray-700">Mã HV</th>
                      <th className="px-6 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-6 py-3 text-left text-gray-700">Ngày sinh</th>
                      <th className="px-6 py-3 text-left text-gray-700">Liên hệ</th>
                      <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                      <th className="px-6 py-3 text-left text-gray-700">Lớp học</th>
                      <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                            {student.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{student.fullName}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{student.phone}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {student.campus || <span className="text-gray-400 text-sm italic">Chưa phân lớp</span>}
                        </td>
                        <td className="px-6 py-4">
                          {student.currentClass ? (
                            <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                              {classes.find(c => c.id === student.currentClass)?.name || student.currentClass}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Chưa xếp lớp</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(student)}
                              className="p-2 rounded-lg hover:bg-gray-100"
                              style={{ color: 'var(--brand-primary)' }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-2 text-red-600 rounded-lg hover:bg-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredStudents.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Không tìm thấy học viên nào</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedStudent) {
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
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-gray-900">{selectedStudent.fullName}</h1>
                    <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                      {selectedStudent.code}
                    </span>
                  </div>
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: selectedStudent.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                      color: selectedStudent.status === 'active' ? '#00b894' : '#d63031',
                    }}
                  >
                    {selectedStudent.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(selectedStudent)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === 'info' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Thông tin cá nhân</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === 'progress'
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === 'progress' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Quá trình học tập</span>
                </div>
              </button>
            </div>

            {activeTab === 'info' && (
              <div>
                <h2 className="text-gray-900 mb-4">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Họ và tên</p>
                    <p className="text-gray-900">{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ngày sinh</p>
                    <p className="text-gray-900">{new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Giới tính</p>
                    <p className="text-gray-900">
                      {selectedStudent.gender === 'male' ? 'Nam' : selectedStudent.gender === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Email</p>
                    <p className="text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Số điện thoại</p>
                    <p className="text-gray-900">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                    <p className="text-gray-900">{selectedStudent.address}</p>
                  </div>
                </div>

                <h2 className="text-gray-900 mb-4">Thông tin phụ huynh</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Họ tên phụ huynh</p>
                    <p className="text-gray-900">{selectedStudent.parentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">SĐT phụ huynh</p>
                    <p className="text-gray-900">{selectedStudent.parentPhone}</p>
                  </div>
                </div>

                <h2 className="text-gray-900 mb-4">Thông tin học tập</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Cơ sở</p>
                    <p className="text-gray-900">
                      {selectedStudent.campus || <span className="text-gray-500 italic">Chưa phân lớp</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Lớp đang theo học</p>
                    <p className="text-gray-900">
                      {selectedStudent.currentClass ? (
                        <span className="px-3 py-1 rounded" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {classes.find(c => c.id === selectedStudent.currentClass)?.name || selectedStudent.currentClass}
                        </span>
                      ) : (
                        <span className="text-gray-500">Chưa xếp lớp</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ngày nhập học</p>
                    <p className="text-gray-900">{new Date(selectedStudent.enrollDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tên đăng nhập</p>
                    <p className="text-gray-900">{selectedStudent.username}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <StudentLearningProgress studentId={selectedStudent.id} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit View Only (Create removed - use UserManagement instead)
  if (viewMode === 'edit' && selectedStudent) {
    return (
      <StudentFormView
        student={selectedStudent}
        onBack={handleBackToList}
        onSave={handleSave}
      />
    );
  }

  return null;
}

function StudentFormView({
  student,
  onBack,
  onSave,
}: {
  student: Student | null;
  onBack: () => void;
  onSave: (student: Student) => void;
}) {
  const [formData, setFormData] = useState<Student>(
    student || {
      id: '',
      code: '',
      fullName: '',
      username: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      parentName: '',
      parentPhone: '',
      campus: 'CS001',
      enrollDate: new Date().toISOString().split('T')[0],
      status: 'active',
      isFirstLogin: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate username if creating new student
    if (!student) {
      const username = generateUsername(formData.fullName);
      const code = `HV${String(Date.now()).slice(-3)}`;
      onSave({ ...formData, username, code });
    } else {
      onSave(formData);
    }
  };

  const generateUsername = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName.toLowerCase();
    
    const firstName = parts[parts.length - 1].toLowerCase();
    const middleAndLast = parts.slice(0, -1).map(p => p.charAt(0).toLowerCase()).join('');
    
    return `${firstName}${middleAndLast}`;
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
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-gray-900">
            {student ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: Nguyên Thị Khánh Huyền"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="0912345678"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="Nhập địa chỉ đầy đủ"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 mb-4">Thông tin phụ huynh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Họ tên phụ huynh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="Nhập họ tên phụ huynh"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  SĐT phụ huynh <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="0987654321"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-gray-900 mb-4">Thông tin học tập</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* REMOVED: Campus field - campus is determined by class enrollment */}
              {/* REMOVED: Enrollment date field - not needed in edit form */}

              <div>
                <label className="block text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="active">Đang học</option>
                  <option value="inactive">Đã nghỉ</option>
                </select>
              </div>
            </div>

            {!student && (
              <p className="text-sm text-gray-500 mt-4">
                * Tên đăng nhập sẽ được tạo tự động theo format: Tên + Họ tên đệm viết tắt
                <br />
                VD: Nguyên Thị Khánh Huyền → huyenntk
                <br />
                * Cơ sở sẽ được xác định khi phân lớp cho học viên
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {student ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}