import { useState, useRef } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Upload, Save, Edit2, X } from 'lucide-react';
import { User } from '../App';
import { studentsAPI, teachersAPI } from '../utils/api';

interface ProfilePageProps {
  user: User;
  onUpdate?: (updatedUser: Partial<User>) => void;
}

export default function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || 'male',
    address: user.address || '',
    parentName: user.parentName || '',
    parentPhone: user.parentPhone || '',
    bio: user.bio || '',
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Save profile data
    const updatedUser: Partial<User> = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      bio: formData.bio,
      avatar: avatar,
    };

    try {
      if (user.role === 'student') {
        await studentsAPI.update(user.id, updatedUser);
      } else if (user.role === 'teacher') {
        await teachersAPI.update(user.id, updatedUser);
      }
      // Update user in the app state
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      // Show success message
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'male',
      address: user.address || '',
      parentName: user.parentName || '',
      parentPhone: user.parentPhone || '',
      bio: user.bio || '',
    });
    setAvatar(user.avatar || '');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'academic':
        return 'Bộ phận Học vụ';
      case 'teacher':
        return 'Giảng viên';
      case 'student':
        return 'Học viên';
      case 'director':
        return 'Ban Giám đốc';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Thông tin tài khoản</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow">
          {/* Header with Avatar */}
          <div className="relative h-32" style={{ background: 'linear-gradient(to right, var(--brand-primary-100), var(--brand-primary-200))' }}>
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={formData.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
                      <UserIcon className="w-16 h-16" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="mb-6">
              <h2 className="text-gray-900">{formData.fullName}</h2>
              <p className="text-gray-600">{getRoleLabel(user.role)}</p>
              {user.code && user.role === 'academic' && (
                <p className="text-sm text-gray-500">Mã nhân viên: {user.code}</p>
              )}
            </div>

            {/* Form Fields */}
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
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    required
                  />
                </div>
              </div>

              {/* Parent Info - Only for students */}
              {user.role === 'student' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-gray-900 mb-4">Thông tin phụ huynh</h3>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Họ tên phụ huynh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
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
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      required
                    />
                  </div>
                </>
              )}

              {/* Bio - Only for teachers */}
              {user.role === 'teacher' && (
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Tiểu sử</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600"
                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                    placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm giảng dạy..."
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}