import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usersAPI, studentsAPI, teachersAPI } from '../../utils/api';

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
  const [formData, setFormData] = useState<any>({
    id: user?.id || '',
    username: user?.username || '',
    fullName: user?.fullName || '',
    role: user?.role || initialRole || 'student',
    status: user?.status || 'active',
    email: user?.email || '',
    phone: user?.phone || '',
    // Student fields
    studentCode: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    parentName: '',
    parentPhone: '',
    campus: user?.campus || '',
    enrollmentDate: '',
    // Teacher fields
    teacherCode: '',
    specialization: '',
    bio: '',
    experienceYears: '',
    certifications: '',
    startDate: '',
    teachingCampus: user?.campus || '',
    // Password (only for new users)
    password: '123456',
  });

  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load additional data for edit mode
  useEffect(() => {
    if (user && user.id) {
      loadUserDetails();
    }
  }, [user]);

  const loadUserDetails = async () => {
    if (!user) return;

    try {
      setLoadingDetails(true);
      console.log('📝 [UserFormView] Loading details for user:', user.id, 'role:', user.role);

      // If user is a student, load student data
      if (user.role === 'student') {
        const students = await studentsAPI.getAll();
        const studentData = students.find((s: any) => s.id_user === user.id);
        
        if (studentData) {
          console.log('✅ [UserFormView] Student data loaded:', studentData);
          setFormData((prev: any) => ({
            ...prev,
            studentCode: studentData.id_student || '',
            parentName: studentData.parent_name || '',
            parentPhone: studentData.parent_phone || '',
            dateOfBirth: studentData.dob || '',
            gender: studentData.gender || 'male',
            address: studentData.address || '',
          }));
        }
      }
      // If user is a teacher, load teacher data
      else if (user.role === 'teacher') {
        const teachers = await teachersAPI.getAll();
        const teacherData = teachers.find((t: any) => t.id_user === user.id);
        
        if (teacherData) {
          console.log('✅ [UserFormView] Teacher data loaded:', teacherData);
          setFormData((prev: any) => ({
            ...prev,
            teacherCode: teacherData.id_teacher || '',
            specialization: teacherData.specialization || '',
            bio: teacherData.bio || '',
            experienceYears: teacherData.experience_years || '',
            certifications: teacherData.certifications || '',
            dateOfBirth: teacherData.dob || '',
            gender: teacherData.gender || 'male',
            address: teacherData.address || '',
          }));
        }
      }
    } catch (error) {
      console.error('❌ [UserFormView] Error loading user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ============================================
    // SECTION 1: THÔNG TIN TÀI KHOẢN
    // ============================================
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    // ============================================
    // SECTION 2: THÔNG TIN CÁ NHÂN
    // ============================================
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ (VD: example@gmail.com)';
      }
    }

    // Phone validation (Vietnam: 10 digits starting with 0)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0 (VD: 0987654321)';
      }
    }

    // ============================================
    // SECTION 3: THÔNG TIN HỌC VIÊN
    // ============================================
    
    if (formData.role === 'student') {
      // Date of Birth validation
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Ngày sinh không được để trống';
      } else {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (dob > today) {
          newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai';
        } else if (age < 5) {
          newErrors.dateOfBirth = 'Học viên phải từ 5 tuổi trở lên';
        } else if (age > 100) {
          newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
        }
      }
      
      // Address validation (REQUIRED for students)
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = 'Địa chỉ không được để trống';
      } else if (formData.address.trim().length < 5) {
        newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
      }
      
      // Parent Name validation (REQUIRED for students)
      if (!formData.parentName || !formData.parentName.trim()) {
        newErrors.parentName = 'Tên phụ huynh không được để trống';
      } else if (formData.parentName.trim().length < 2) {
        newErrors.parentName = 'Tên phụ huynh phải có ít nhất 2 ký tự';
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.parentName)) {
        newErrors.parentName = 'Tên phụ huynh chỉ được chứa chữ cái và khoảng trắng';
      }
      
      // Parent Phone validation (REQUIRED for students)
      if (!formData.parentPhone || !formData.parentPhone.trim()) {
        newErrors.parentPhone = 'SĐT phụ huynh không được để trống';
      } else {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(formData.parentPhone)) {
          newErrors.parentPhone = 'SĐT phụ huynh phải có 10 chữ số và bắt đầu bằng 0 (VD: 0987654321)';
        }
        
        // Parent phone must be different from student phone
        if (formData.parentPhone === formData.phone) {
          newErrors.parentPhone = 'SĐT phụ huynh không được trùng với SĐT học viên';
        }
      }
      
      // Enrollment Date validation
      if (!formData.enrollmentDate) {
        newErrors.enrollmentDate = 'Ngày nhập học không được để trống';
      } else {
        const enrollDate = new Date(formData.enrollmentDate);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        
        if (enrollDate > oneYearFromNow) {
          newErrors.enrollmentDate = 'Ngày nhập học không thể quá 1 năm trong tương lai';
        } else if (enrollDate < oneYearAgo) {
          newErrors.enrollmentDate = 'Ngày nhập học không thể quá 1 năm trong quá khứ';
        }
      }
      
      // NOTE: Campus/Center will be assigned when student enrolls in a class
      // No need to validate campus here
    }

    // ============================================
    // SECTION 4: THÔNG TIN GIÁO VIÊN
    // ============================================
    
    if (formData.role === 'teacher') {
      // Specialization validation
      if (!formData.specialization) {
        newErrors.specialization = 'Vui lòng chọn chuyên môn';
      }
      
      // Bio validation (optional but if provided, must be reasonable)
      if (formData.bio && formData.bio.trim().length > 0 && formData.bio.trim().length < 10) {
        newErrors.bio = 'Tiểu sử phải có ít nhất 10 ký tự nếu điền';
      }
      
      // Experience Years validation (optional but if provided, must be valid)
      if (formData.experienceYears) {
        const years = parseInt(formData.experienceYears);
        if (isNaN(years) || years < 0) {
          newErrors.experienceYears = 'Số năm kinh nghiệm phải là số không âm';
        } else if (years > 50) {
          newErrors.experienceYears = 'Số năm kinh nghiệm không hợp lệ';
        }
      }
      
      // Certifications validation (optional)
      if (formData.certifications && formData.certifications.trim().length > 0 && formData.certifications.trim().length < 5) {
        newErrors.certifications = 'Chứng chỉ phải có ít nhất 5 ký tự nếu điền';
      }
      
      // NOTE: Campus/Center will be assigned when teacher is assigned to a class
      // No need to validate teachingCampus here
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
        campus: formData.campus,
        enrollmentDate: formData.enrollmentDate, // Add enrollment date
      };
    } else if (formData.role === 'teacher') {
      userData.teacherData = {
        code: formData.teacherCode,
        specialization: formData.specialization,
        bio: formData.bio,
        experienceYears: formData.experienceYears,
        certifications: formData.certifications,
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
        console.log('🔄 [UserForm] Creating user:', JSON.stringify(userData, null, 2));
        const response = await usersAPI.create(userData);
        console.log('✅ [UserForm] User created - Full Response:', JSON.stringify(response, null, 2));
        onSave(response.user);
      }
    } catch (err: any) {
      console.error('❌ [UserForm] Error:', err);
      console.error('❌ [UserForm] Error message:', err.message);
      console.error('❌ [UserForm] Error stack:', err.stack);
      alert('Lỗi: ' + (err.message || JSON.stringify(err)));
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
            <>
              <p className="text-sm text-gray-600 mt-1">
                Chọn vai trò để hiển thị form tương ứng (Học viên/Giáo viên sẽ có thêm thông tin chi tiết)
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🔑 <strong>Mật khẩu mặc định:</strong> 123456 (sẽ được tự động gán cho tài khoản mới)
                </p>
              </div>
            </>
          )}
          {isEditing && loadingDetails && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-800">
                Đang tải thông tin chi tiết...
              </p>
            </div>
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
                  Tên đăng nhập<span style={{ color: 'red' }}> *</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                  disabled={isEditing}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              {/* Password field HIDDEN - using default "123456" */}

              {/* Role */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Vai trò<span style={{ color: 'red' }}> *</span>
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
                  Trạng thái<span style={{ color: 'red' }}> *</span>
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
                  Họ và tên<span style={{ color: 'red' }}> *</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Email<span style={{ color: 'red' }}> *</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Số điện thoại<span style={{ color: 'red' }}> *</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                  placeholder="VD: 0987654321"
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
                    Ngày sinh<span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Giới tính<span style={{ color: 'red' }}> *</span>
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
                    Địa chỉ<span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Địa chỉ thường trú"
                    required
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Tên phụ huynh<span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                      errors.parentName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    SĐT phụ huynh<span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                      errors.parentPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>}
                </div>

                {/* Enrollment Date */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ngày nhập học<span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                      errors.enrollmentDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                  {errors.enrollmentDate && <p className="text-red-500 text-sm mt-1">{errors.enrollmentDate}</p>}
                </div>

                {/* NOTE: Campus/Center will be assigned when student enrolls in a class
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
                </div> */}
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
                    Chuyên môn<span style={{ color: 'red' }}> *</span>
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

                {/* Bio */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Tiểu sử
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Nhập tiểu sử nếu có"
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Nhập số năm kinh nghiệm nếu có"
                  />
                  {errors.experienceYears && <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>}
                </div>

                {/* Certifications */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Chứng chỉ
                  </label>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Nhập thông tin chứng chỉ nếu có (VD: IELTS 8.0, TESOL, CELTA...)"
                    rows={3}
                  />
                  {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ngày bắt đầu<span style={{ color: 'red' }}> *</span>
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

                {/* NOTE: Campus/Center will be assigned when teacher is assigned to a class
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
                </div> */}
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