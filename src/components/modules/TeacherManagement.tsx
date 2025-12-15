import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Search, Mail, Phone, Award, BookOpen, ArrowLeft, GraduationCap, Calendar, Upload, FileText, CheckCircle, Download, X, Trash2, UserPlus } from 'lucide-react';
import { teachers, classes } from '../../data/mockData';
import type { Teacher } from '../../data/mockData';
import { teachersAPI, classesAPI } from '../../utils/api';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';
type UploadType = 'ielts' | 'toeic' | 'toefl' | 'certificate';

interface TeacherManagementProps {
  onNavigateToUserManagement?: () => void;
}

export default function TeacherManagement({ onNavigateToUserManagement }: TeacherManagementProps) {
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>('ielts');
  const [certificateName, setCertificateName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [TeacherManagement] Loading data...');
      const [teachersResponse, classesResponse] = await Promise.all([
        teachersAPI.getAll(),
        classesAPI.getAll()
      ]);
      console.log('✅ [TeacherManagement] Data loaded:', { teachersResponse, classesResponse });
      setTeacherList(teachersResponse.teachers || []);
      setClassList(classesResponse.classes || []); // ✅ FIX: Unwrap classes from response object
    } catch (err: any) {
      console.error('❌ [TeacherManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teacherList.filter(teacher => {
    const matchSearch = (teacher.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || teacher.status === filterStatus;
    return matchSearch && matchStatus;
  });
  
  // Helper function to get teacher's campuses from their classes
  const getTeacherCampuses = (teacherId: string) => {
    const teacherClasses = classList.filter(c => c.teacherId === teacherId);
    const uniqueCampuses = [...new Set(teacherClasses.map(c => c.campus).filter(Boolean))];
    console.log(`🏫 [getTeacherCampuses] Teacher ${teacherId}:`, {
      totalClasses: classList.length,
      teacherClasses: teacherClasses.length,
      uniqueCampuses
    });
    return uniqueCampuses.length > 0 ? uniqueCampuses.join(', ') : 'Chưa có lớp';
  };

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode('detail');
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setSelectedTeacher(null);
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTeacher(null);
  };

  const handleSave = async (teacher: Teacher) => {
    try {
      console.log('[TeacherManagement] Saving teacher:', teacher);
      
      if (viewMode === 'edit' && selectedTeacher) {
        // Update existing teacher via API
        await teachersAPI.update(teacher.id, teacher);
        setTeacherList(teacherList.map(t => t.id === teacher.id ? teacher : t));
      } else {
        // Create new teacher via API
        const response = await teachersAPI.create(teacher);
        setTeacherList([...teacherList, response.teacher]);
      }
      
      setViewMode('list');
      setSelectedTeacher(null);
    } catch (err: any) {
      console.error('[TeacherManagement] Save error:', err);
      alert(`Lỗi: ${err.message || 'Không thể lưu giáo viên'}`);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa giáo viên ${teacher.fullName}?`)) {
      return;
    }
    
    try {
      console.log('[TeacherManagement] Deleting teacher:', teacher.id);
      await teachersAPI.delete(teacher.id);
      setTeacherList(teacherList.filter(t => t.id !== teacher.id));
      setViewMode('list');
      setSelectedTeacher(null);
    } catch (err: any) {
      console.error('[TeacherManagement] Delete error:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa giáo viên'}`);
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">Quản lý giáo viên</h1>
          {onNavigateToUserManagement && (
            <button
              onClick={onNavigateToUserManagement}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <UserPlus className="w-5 h-5" />
              Thêm giáo viên mới
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, mã GV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang giảng dạy</option>
                <option value="inactive">Đã nghỉ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teacher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {teacher.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{teacher.fullName}</h3>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                        {teacher.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{teacher.email}</p>
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: teacher.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                        color: teacher.status === 'active' ? '#00b894' : '#d63031',
                      }}
                    >
                      {teacher.status === 'active' ? 'Đang giảng dạy' : 'Đã nghỉ'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>{getTeacherCampuses(teacher.id)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  {teacher.ieltsScore && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">IELTS</p>
                      <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>{teacher.ieltsScore.toFixed(1)}</p>
                    </div>
                  )}
                  {teacher.toeicScore && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">TOEIC</p>
                      <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>{teacher.toeicScore}</p>
                    </div>
                  )}
                  {teacher.toeflScore && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">TOEFL</p>
                      <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>{teacher.toeflScore}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(teacher)}
                    className="flex-1 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy giáo viên nào</p>
          </div>
        )}
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedTeacher) {
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
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {selectedTeacher.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-gray-900">{selectedTeacher.fullName}</h1>
                    <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                      {selectedTeacher.code}
                    </span>
                  </div>
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: selectedTeacher.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                      color: selectedTeacher.status === 'active' ? '#00b894' : '#d63031',
                    }}
                  >
                    {selectedTeacher.status === 'active' ? 'Đang giảng dạy' : 'Đã nghỉ'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(selectedTeacher)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Tiểu sử */}
            <div>
              <h2 className="text-gray-900 mb-4">Tiểu sử</h2>
              <p className="text-gray-700 leading-relaxed">{selectedTeacher.bio}</p>
            </div>

            {/* Thông tin cá nhân */}
            <div>
              <h2 className="text-gray-900 mb-4">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Họ và tên</p>
                  <p className="text-gray-900">{selectedTeacher.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Ngày sinh</p>
                  <p className="text-gray-900">{new Date(selectedTeacher.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Giới tính</p>
                  <p className="text-gray-900">
                    {selectedTeacher.gender === 'male' ? 'Nam' : selectedTeacher.gender === 'female' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Email</p>
                  <p className="text-gray-900">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Số điện thoại</p>
                  <p className="text-gray-900">{selectedTeacher.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                  <p className="text-gray-900">{selectedTeacher.address}</p>
                </div>
              </div>
            </div>

            {/* Bằng cấp & Chứng chỉ */}
            <div>
              <h2 className="text-gray-900 mb-4">Bằng cấp & Chứng chỉ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {selectedTeacher.ieltsScore && (
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-50)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                      <h3 className="text-gray-900">IELTS</h3>
                    </div>
                    <p className="text-3xl mb-1" style={{ color: 'var(--brand-primary)' }}>{selectedTeacher.ieltsScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-600 mb-2">Điểm tổng</p>
                    {selectedTeacher.ieltsProof && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate">{selectedTeacher.ieltsProof.fileName}</p>
                            <p className="text-xs text-gray-500">{new Date(selectedTeacher.ieltsProof.uploadedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <button
                            onClick={() => alert(`Xem PDF: ${selectedTeacher.ieltsProof?.fileName}`)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="Xem file"
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedTeacher.toeicScore && (
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#00b894', backgroundColor: 'var(--pastel-green-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <h3 className="text-gray-900">TOEIC</h3>
                    </div>
                    <p className="text-3xl text-green-600 mb-1">{selectedTeacher.toeicScore}</p>
                    <p className="text-sm text-gray-600 mb-2">Điểm số</p>
                    {selectedTeacher.toeicProof && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate">{selectedTeacher.toeicProof.fileName}</p>
                            <p className="text-xs text-gray-500">{new Date(selectedTeacher.toeicProof.uploadedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <button
                            onClick={() => alert(`Xem PDF: ${selectedTeacher.toeicProof?.fileName}`)}
                            className="p-1 hover:bg-green-50 rounded"
                            title="Xem file"
                          >
                            <Download className="w-4 h-4 text-green-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedTeacher.toeflScore && (
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#ffe9ae', backgroundColor: 'var(--pastel-yellow-light)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      <h3 className="text-gray-900">TOEFL</h3>
                    </div>
                    <p className="text-3xl text-orange-600 mb-1">{selectedTeacher.toeflScore}</p>
                    <p className="text-sm text-gray-600 mb-2">Điểm số</p>
                    {selectedTeacher.toeflProof && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate">{selectedTeacher.toeflProof.fileName}</p>
                            <p className="text-xs text-gray-500">{new Date(selectedTeacher.toeflProof.uploadedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <button
                            onClick={() => alert(`Xem PDF: ${selectedTeacher.toeflProof?.fileName}`)}
                            className="p-1 hover:bg-orange-50 rounded"
                            title="Xem file"
                          >
                            <Download className="w-4 h-4 text-orange-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-gray-900 mb-3">Chứng chỉ khác</h3>
                <div className="space-y-2">
                  {(Array.isArray(selectedTeacher.certificates) 
                    ? selectedTeacher.certificates 
                    : (selectedTeacher.certificates && typeof selectedTeacher.certificates === 'string' && selectedTeacher.certificates.trim())
                      ? selectedTeacher.certificates.split(',').map(c => c.trim()).filter(Boolean)
                      : []
                  ).map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className="px-4 py-2 rounded-lg flex-1"
                        style={{ backgroundColor: 'var(--pastel-lavender-light)', color: 'var(--pastel-lavender-dark)' }}
                      >
                        {cert}
                      </span>
                      {selectedTeacher.certificateProofs?.[cert] && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2 w-64">
                          <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-700 truncate">{selectedTeacher.certificateProofs[cert].fileName}</p>
                            <p className="text-xs text-green-600">{new Date(selectedTeacher.certificateProofs[cert].uploadedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <button
                            onClick={() => alert(`Xem PDF: ${selectedTeacher.certificateProofs?.[cert]?.fileName}`)}
                            className="p-1 hover:bg-green-100 rounded flex-shrink-0"
                            title="Xem file"
                          >
                            <Download className="w-3.5 h-3.5 text-green-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chuyên môn */}
            <div>
              <h2 className="text-gray-900 mb-4">Lĩnh vực chuyên môn</h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(selectedTeacher.specialization)
                  ? selectedTeacher.specialization
                  : (selectedTeacher.specialization && typeof selectedTeacher.specialization === 'string' && selectedTeacher.specialization.trim())
                    ? selectedTeacher.specialization.split(',').map(s => s.trim()).filter(Boolean)
                    : []
                ).map((spec, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Thông tin công tác */}
            <div>
              <h2 className="text-gray-900 mb-4">Thông tin công tác</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Ngày vào làm</p>
                  <p className="text-gray-900">{selectedTeacher.joinDate ? new Date(selectedTeacher.joinDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tên đăng nhập</p>
                  <p className="text-gray-900">{selectedTeacher.username}</p>
                </div>
              </div>
            </div>

            {/* Lớp đang dạy */}
            <div>
              <h2 className="text-gray-900 mb-4">Lớp đang dạy</h2>
              {(() => {
                const teacherClasses = classes.filter(c => c.teacher === selectedTeacher.fullName && c.status === 'active');
                
                if (teacherClasses.length === 0) {
                  return (
                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                      Giáo viên hiện không phụ trách lớp nào
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        style={{ backgroundColor: 'var(--brand-primary-50)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{classItem.name}</h3>
                            <p className="text-sm text-gray-600">{classItem.code}</p>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              backgroundColor: classItem.level === 'Beginner' ? '#e3f2fd' : 
                                             classItem.level === 'Intermediate' ? '#fff3e0' :
                                             classItem.level === 'Advanced' ? '#f3e5f5' : '#fce4ec',
                              color: classItem.level === 'Beginner' ? '#1565c0' :
                                     classItem.level === 'Intermediate' ? '#e65100' :
                                     classItem.level === 'Advanced' ? '#6a1b9a' : '#c2185b'
                            }}
                          >
                            {classItem.level}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Sĩ số:</span>
                            <span className="text-gray-900">{classItem.totalStudents}/{classItem.maxStudents}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phòng:</span>
                            <span className="text-gray-900">{classItem.room}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Lịch:</span>
                            <span className="text-gray-900 text-xs">{classItem.schedule}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit View Only (Create removed - use UserManagement instead)
  if (viewMode === 'edit' && selectedTeacher) {
    return (
      <TeacherFormView
        teacher={selectedTeacher}
        onBack={handleBackToList}
        onSave={handleSave}
      />
    );
  }

  return null;
}

function TeacherFormView({
  teacher,
  onBack,
  onSave,
}: {
  teacher: Teacher | null;
  onBack: () => void;
  onSave: (teacher: Teacher) => void;
}) {
  const [formData, setFormData] = useState<Teacher>(() => {
    if (teacher) {
      // Convert string fields to arrays if needed
      return {
        ...teacher,
        certificates: Array.isArray(teacher.certificates) 
          ? teacher.certificates 
          : (teacher.certificates && typeof teacher.certificates === 'string' && teacher.certificates.trim())
            ? teacher.certificates.split(',').map(c => c.trim()).filter(Boolean)
            : [],
        specialization: Array.isArray(teacher.specialization)
          ? teacher.specialization
          : (teacher.specialization && typeof teacher.specialization === 'string' && teacher.specialization.trim())
            ? teacher.specialization.split(',').map(s => s.trim()).filter(Boolean)
            : [],
      };
    }
    
    // Default for new teacher
    return {
      id: '',
      code: '',
      fullName: '',
      username: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      bio: '',
      ieltsScore: undefined,
      toeicScore: undefined,
      toeflScore: undefined,
      certificates: [],
      specialization: [],
      joinDate: '', // Empty for new teacher, will be filled by user
      status: 'active',
      isFirstLogin: true,
    };
  });

  const [newCertificate, setNewCertificate] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleFileUpload = (type: 'ielts' | 'toeic' | 'toefl' | string, file: File | null) => {
    if (!file) return;
    
    // Validate PDF
    if (file.type !== 'application/pdf') {
      alert('Vui lòng chỉ upload file PDF');
      return;
    }

    // Simulate upload - in real app, this would upload to server
    const uploadedFile = {
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    };

    if (type === 'ielts') {
      setFormData({ ...formData, ieltsProof: uploadedFile });
    } else if (type === 'toeic') {
      setFormData({ ...formData, toeicProof: uploadedFile });
    } else if (type === 'toefl') {
      setFormData({ ...formData, toeflProof: uploadedFile });
    } else {
      // Certificate proof
      setFormData({
        ...formData,
        certificateProofs: {
          ...(formData.certificateProofs || {}),
          [type]: uploadedFile,
        },
      });
    }
  };

  const handleRemoveProof = (type: 'ielts' | 'toeic' | 'toefl' | string) => {
    if (type === 'ielts') {
      setFormData({ ...formData, ieltsProof: undefined });
    } else if (type === 'toeic') {
      setFormData({ ...formData, toeicProof: undefined });
    } else if (type === 'toefl') {
      setFormData({ ...formData, toeflProof: undefined });
    } else {
      // Certificate proof
      const newProofs = { ...(formData.certificateProofs || {}) };
      delete newProofs[type];
      setFormData({ ...formData, certificateProofs: newProofs });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format data for server
    const serverData = {
      ...formData,
      // Convert arrays to strings for server
      specialty: formData.specialization.join(', '), // specialization array → specialty string
      certifications: formData.certificates.join(', '), // certificates array → certifications string
    };
    
    // Auto-generate username if creating new teacher
    if (!teacher) {
      const username = generateUsername(formData.fullName);
      const code = `GV${String(Date.now()).slice(-3)}`;
      onSave({ ...serverData, username, code });
    } else {
      onSave(serverData);
    }
  };

  const generateUsername = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName.toLowerCase();
    
    const firstName = parts[parts.length - 1].toLowerCase();
    const middleAndLast = parts.slice(0, -1).map(p => p.charAt(0).toLowerCase()).join('');
    
    return `${firstName}${middleAndLast}`;
  };

  const addCertificate = () => {
    if (newCertificate.trim()) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, newCertificate.trim()],
      });
      setNewCertificate('');
    }
  };

  const removeCertificate = (index: number) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((_, i) => i !== index),
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, newSpecialization.trim()],
      });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((_, i) => i !== index),
    });
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
            {teacher ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin cá nhân */}
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
                  placeholder="VD: Nguyễn Thị Mai Lan"
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
                  placeholder="0981234567"
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

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Tiểu sử <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="Giới thiệu về bản thân, kinh nghiệm giảng dạy..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Số năm kinh nghiệm <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears || ''}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: 8"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bằng cấp */}
          <div>
            <h2 className="text-gray-900 mb-4">Bằng cấp & Chứng chỉ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">IELTS</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={formData.ieltsScore || ''}
                  onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 mb-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: 8.5"
                />
                {/* Upload PDF */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Minh chứng (PDF)</label>
                  {formData.ieltsProof ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 flex-1">{formData.ieltsProof.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProof('ielts')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('ielts', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">TOEIC</label>
                <input
                  type="number"
                  min="0"
                  max="990"
                  value={formData.toeicScore || ''}
                  onChange={(e) => setFormData({ ...formData, toeicScore: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 mb-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: 990"
                />
                {/* Upload PDF */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Minh chứng (PDF)</label>
                  {formData.toeicProof ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 flex-1">{formData.toeicProof.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProof('toeic')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('toeic', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">TOEFL</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.toeflScore || ''}
                  onChange={(e) => setFormData({ ...formData, toeflScore: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 mb-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: 115"
                />
                {/* Upload PDF */}
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Minh chứng (PDF)</label>
                  {formData.toeflProof ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 flex-1">{formData.toeflProof.fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProof('toefl')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload PDF</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('toefl', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Chứng chỉ khác</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertificate}
                  onChange={(e) => setNewCertificate(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificate())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="VD: TESOL, CELTA..."
                />
                <button
                  type="button"
                  onClick={addCertificate}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Thêm
                </button>
              </div>
              <div className="space-y-2">
                {formData.certificates.map((cert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span
                      className="px-3 py-1 rounded-lg flex items-center gap-2 flex-1"
                      style={{ backgroundColor: 'var(--pastel-lavender-light)', color: 'var(--pastel-lavender-dark)' }}
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="hover:text-red-600 ml-auto"
                      >
                        ×
                      </button>
                    </span>
                    {/* Upload PDF for this certificate */}
                    <div className="w-48">
                      {formData.certificateProofs?.[cert] ? (
                        <div className="flex items-center gap-1 p-1.5 bg-green-50 border border-green-200 rounded text-xs">
                          <FileText className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="text-green-700 truncate flex-1">{formData.certificateProofs[cert].fileName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProof(cert)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1 p-1.5 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs">
                          <Upload className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">Upload PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(cert, e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}</div>
            </div>
          </div>

          {/* Chuyên môn */}
          <div>
            <h2 className="text-gray-900 mb-4">Lĩnh vực chuyên môn</h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: IELTS Speaking, IELTS Writing..."
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialization.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Thông tin công tác */}
          <div>
            <h2 className="text-gray-900 mb-4">Thông tin công tác</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Ngày vào làm {!teacher?.joinDate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required={!teacher?.joinDate}
                />
                {teacher?.joinDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Giá trị hiện tại: {new Date(teacher.joinDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

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
                  <option value="active">Đang giảng dạy</option>
                  <option value="inactive">Đã nghỉ</option>
                </select>
              </div>
            </div>

            {!teacher && (
              <p className="text-sm text-gray-500 mt-4">
                * Tên đăng nhập sẽ được tạo tự động theo format: Tên + Họ tên đệm viết tắt
                <br />
                VD: Nguyễn Thị Mai Lan → lanntm
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {teacher ? 'Cập nhật' : 'Thêm mới'}
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