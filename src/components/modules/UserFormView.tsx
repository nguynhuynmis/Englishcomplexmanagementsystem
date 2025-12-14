import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usersAPI } from '../../utils/api';

interface SystemUser {
  id: string;
  code?: string;
  username: string;
  fullName: string;
  role: 'academic' | 'teacher' | 'student' | 'director';
  campus?: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
}

interface UserFormViewProps {
  user: SystemUser | null;
  initialRole?: 'student' | 'teacher';
  onBack: () => void;
  onSave: (user: SystemUser) => void;
}

export default function UserFormView({ user, initialRole, onBack, onSave }: UserFormViewProps) {
  const [formData, setFormData] = useState<any>(
    user || {
      id: '',
      username: '',
      fullName: '',
      role: initialRole || 'student',
      status: 'active',
      email: '',
      phone: '',
      // Student fields
      studentCode: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      parentName: '',
      parentPhone: '',
      enrollmentDate: '',
      campus: '',
      // Teacher fields
      teacherCode: '',
      specialization: '',
      salary: '',
      startDate: '',
      teachingCampus: '',
      // Password (only for new users)
      password: '',
    }
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic fields validation
    if (!formData.username.trim()) newErrors.username = 'Tên đăng nhập không được để trống';
    if (!user && !formData.password) newErrors.password = 'Mật khẩu không được để trống';
    if (!user && formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone format validation (Vietnam phone number: 10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0';
    }

    // Student-specific validation
    if (formData.role === 'student') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Ngày sinh không được để trống';
      if (!formData.enrollmentDate) newErrors.enrollmentDate = 'Ngày nhập học không được để trống';
      if (!formData.campus) newErrors.campus = 'Cơ sở không được để trống';
      
      // Parent phone validation if provided
      if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
        newErrors.parentPhone = 'SĐT phụ huynh phải có 10 chữ số và bắt đầu bằng 0';
      }
    }

    // Teacher-specific validation
    if (formData.role === 'teacher') {
      if (!formData.specialization) newErrors.specialization = 'Chuyên môn không được để trống';
      if (!formData.startDate) newErrors.startDate = 'Ngày bắt đầu không được để trống';
      if (!formData.salary) newErrors.salary = 'Lương không được để trống';
      if (formData.salary && parseFloat(formData.salary) <= 0) {
        newErrors.salary = 'Lương phải lớn hơn 0';
      }
      if (!formData.teachingCampus) newErrors.teachingCampus = 'Cơ sở không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin!');
      return;
    }
    
    // Build the complete user object based on role
    const userData: any = {
      username: formData.username,
      fullName: formData.fullName,
      role: formData.role,
      status: formData.status,
      email: formData.email,
      phone: formData.phone,
    };

    // Add password for new users
    if (!user) {
      userData.password = formData.password;
    }

    // Add role-specific data
    if (formData.role === 'student') {
      userData.studentData = {
        code: formData.studentCode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        enrollmentDate: formData.enrollmentDate,
        campus: formData.campus,
      };
    } else if (formData.role === 'teacher') {
      userData.teacherData = {
        code: formData.teacherCode,
        specialization: formData.specialization,
        salary: parseFloat(formData.salary) || 0,
        startDate: formData.startDate,
        campus: formData.teachingCampus,
      };
    }

    try {
      setLoading(true);
      if (user) {
        // Edit existing user
        console.log('🔄 [UserForm] Updating user:', userData);
        await usersAPI.update(user.id, userData);
        onSave({ ...user, ...userData });
      } else {
        // Create new user
        console.log('🔄 [UserForm] Creating user:', userData);
        const response = await usersAPI.create(userData);
        console.log('✅ [UserForm] User created:', response);
        onSave(response.user);
      }
    } catch (err: any) {
      console.error('❌ [UserForm] Error:', err);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!user;

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
            {isEditing ? 'Chỉnh sửa người dùng' : 'Tạo tài khoản mới'}
          </h1>
          {!isEditing && (
            <p className="text-sm text-gray-600 mt-1">
              Chọn vai trò để hiển thị form tương ứng (Học viên/Giáo viên sẽ có thêm thông tin chi tiết)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION 1: Thông tin tài khoản */}
          <div>
            <h2 className="text-gray-900 mb-4">Thông tin tài khoản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                  disabled={isEditing}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              {/* Password (only for new users) */}
              {!isEditing && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  disabled={isEditing}
                >
                  <option value="student">Học viên</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="academic">Bộ phận Học vụ</option>
                  <option value="director">Ban Giám đốc</option>
                </select>
                {!isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === 'student' && '→ Form học viên sẽ hiện bên dưới'}
                    {formData.role === 'teacher' && '→ Form giáo viên sẽ hiện bên dưới'}
                    {(formData.role === 'academic' || formData.role === 'director') && '→ Chỉ cần thông tin cơ bản'}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã vô hiệu hóa</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Thông tin cá nhân */}
          <div className="border-t pt-6">
            <h2 className="text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
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
                  required
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
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
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
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
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 3: Student-specific fields */}
          {formData.role === 'student' && (
            <div className="border-t pt-6" style={{ backgroundColor: 'var(--pastel-green-light)', margin: '-1.5rem', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h2 className="text-gray-900 mb-4">📚 Thông tin học viên</h2>
              <p className="text-sm text-gray-600 mb-4">
                💡 Mã học viên sẽ tự động được tạo (HV001, HV002, ...)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Địa chỉ thường trú"
                  />
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Tên phụ huynh
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    SĐT phụ huynh
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
                </div>

                {/* Enrollment Date */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ngày nhập học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.enrollmentDate && <p className="text-red-500 text-sm mt-1">{errors.enrollmentDate}</p>}
                </div>

                {/* Campus */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Cơ sở <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    <option value="Long Biên">Long Biên</option>
                    <option value="Hai Bà Trưng">Hai Bà Trưng</option>
                  </select>
                  {errors.campus && <p className="text-red-500 text-sm mt-1">{errors.campus}</p>}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Teacher-specific fields */}
          {formData.role === 'teacher' && (
            <div className="border-t pt-6" style={{ backgroundColor: 'var(--brand-primary-50)', margin: '-1.5rem', padding: '1.5rem', borderRadius: '0.5rem' }}>
              <h2 className="text-gray-900 mb-4">👨‍🏫 Thông tin giáo viên</h2>
              <p className="text-sm text-gray-600 mb-4">
                💡 Mã giáo viên sẽ tự động được tạo (GV001, GV002, ...)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Chuyên môn <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  >
                    <option value="">-- Chọn chuyên môn --</option>
                    <option value="IELTS Speaking">IELTS Speaking</option>
                    <option value="IELTS Writing">IELTS Writing</option>
                    <option value="IELTS Listening">IELTS Listening</option>
                    <option value="IELTS Reading">IELTS Reading</option>
                    <option value="IELTS Tổng hợp">IELTS Tổng hợp</option>
                  </select>
                  {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Lương (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                    placeholder="VD: 15000000"
                  />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                </div>

                {/* Campus */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Cơ sở <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teachingCampus}
                    onChange={(e) => setFormData({ ...formData, teachingCampus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    <option value="Long Biên">Long Biên</option>
                    <option value="Hai Bà Trưng">Hai Bà Trưng</option>
                  </select>
                  {errors.teachingCampus && <p className="text-red-500 text-sm mt-1">{errors.teachingCampus}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo tài khoản')}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}