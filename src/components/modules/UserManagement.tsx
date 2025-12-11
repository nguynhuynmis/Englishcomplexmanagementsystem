import { useState } from 'react';
import { Plus, Edit, Eye, Search, Shield, ArrowLeft, Save, X as XIcon, Users, Key, Trash2 } from 'lucide-react';
import { students, teachers, academicStaff, directors } from '../../data/mockData';

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

interface RolePermissions {
  id: string;
  roleName: string;
  roleLabel: string;
  permissions: string[];
  description: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const roleLabels = {
  academic: 'Bộ phận Học vụ',
  teacher: 'Giảng viên',
  student: 'Học viên',
  director: 'Ban Giám đốc',
};

const roleColors = {
  academic: { bg: 'var(--pastel-lavender-light)', text: 'var(--pastel-lavender-dark)' },
  teacher: { bg: 'var(--brand-primary-100)', text: 'var(--brand-primary-700)' },
  student: { bg: 'var(--pastel-green-light)', text: '#00b894' },
  director: { bg: 'var(--pastel-yellow-light)', text: '#e67e22' },
};

const defaultRolePermissions: RolePermissions[] = [
  {
    id: 'academic',
    roleName: 'academic',
    roleLabel: 'Bộ phận Học vụ',
    permissions: [
      'Quản lý cơ sở',
      'Quản lý học viên',
      'Quản lý giảng viên',
      'Quản lý lớp học',
      'Quản lý lịch học',
      'Quản lý điểm số',
      'Quản lý tài liệu-thông báo',
      'Quản lý bài tập',
      'Quản lý phản hồi',
      'Xem báo cáo-thống kê',
      'Quản lý người dùng',
    ],
    description: 'Toàn quyền quản lý trừ báo cáo tài chính',
  },
  {
    id: 'teacher',
    roleName: 'teacher',
    roleLabel: 'Giảng viên',
    permissions: [
      'Xem lớp học của mình',
      'Xem lịch dạy',
      'Điểm danh học viên (chỉ lớp mình dạy)',
      'Nhập điểm học viên',
      'Tải tài liệu lên',
      'Tạo bài tập',
      'Chấm bài tập',
      'Xem phản hồi',
    ],
    description: 'Quyền giảng dạy và quản lý lớp của mình',
  },
  {
    id: 'student',
    roleName: 'student',
    roleLabel: 'Học viên',
    permissions: [
      'Xem lịch học',
      'Xem điểm của mình',
      'Xem và tải tài liệu',
      'Xem bài tập',
      'Nộp bài tập',
      'Gửi phản hồi',
    ],
    description: 'Quyền học tập cơ bản',
  },
  {
    id: 'director',
    roleName: 'director',
    roleLabel: 'Ban Giám đốc',
    permissions: [
      'Xem tất cả báo cáo',
      'Xem thống kê tổng quan',
      'Xem thông tin các cơ sở',
      'Tạo thông báo chính thức',
      'Xem tất cả phản hồi',
    ],
    description: 'Quyền xem và báo cáo cấp cao',
  },
];

// All available permissions in the system
const ALL_SYSTEM_PERMISSIONS = [
  'Quản lý cơ sở',
  'Quản lý học viên',
  'Quản lý giảng viên',
  'Quản lý lớp học',
  'Quản lý lịch học',
  'Quản lý điểm số',
  'Quản lý tài liệu-thông báo',
  'Quản lý bài tập',
  'Quản lý phản hồi',
  'Quản lý người dùng',
  'Xem báo cáo-thống kê',
  'Xem tất cả báo cáo',
  'Xem thống kê tổng quan',
  'Xem thông tin các cơ sở',
  'Xem lớp học của mình',
  'Xem lịch dạy',
  'Xem lịch học',
  'Xem điểm của mình',
  'Xem và tải tài liệu',
  'Xem bài tập',
  'Xem phản hồi',
  'Xem tất cả phản hồi',
  'Điểm danh học viên (chỉ lớp mình dạy)',
  'Nhập điểm học viên',
  'Tải tài liệu lên',
  'Tạo bài tập',
  'Tạo thông báo chính thức',
  'Chấm bài tập',
  'Nộp bài tập',
  'Gửi phản hồi',
];

type ViewMode = 'list' | 'detail' | 'edit' | 'create';
type TabMode = 'users' | 'roles';

export default function UserManagement() {
  // Combine all users from mock data
  const getAllUsers = (): SystemUser[] => {
    const allUsers: SystemUser[] = [];
    
    students.forEach(s => allUsers.push({
      id: s.id,
      code: s.code,
      username: s.username,
      fullName: s.fullName,
      role: 'student',
      campus: s.campus,
      status: s.status,
      email: s.email,
      phone: s.phone,
    }));
    
    teachers.forEach(t => allUsers.push({
      id: t.id,
      code: t.code,
      username: t.username,
      fullName: t.fullName,
      role: 'teacher',
      campus: t.campus,
      status: t.status,
      email: t.email,
      phone: t.phone,
    }));
    
    academicStaff.forEach(a => allUsers.push({
      id: a.id,
      code: a.code,
      username: a.username,
      fullName: a.fullName,
      role: 'academic',
      status: a.status,
      email: a.email,
      phone: a.phone,
    }));
    
    directors.forEach(d => allUsers.push({
      id: d.id,
      username: d.username,
      fullName: d.fullName,
      role: 'director',
      status: 'active',
      email: d.email,
      phone: d.phone,
    }));
    
    return allUsers;
  };

  const [users, setUsers] = useState<SystemUser[]>(getAllUsers());
  const [roles, setRoles] = useState<RolePermissions[]>(defaultRolePermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tabMode, setTabMode] = useState<TabMode>('users');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolePermissions | null>(null);

  const filteredUsers = users.filter(user => {
    const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.code && user.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleViewDetail = (user: SystemUser) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
    setSelectedRole(null);
  };

  const handleSaveUser = (user: SystemUser) => {
    if (viewMode === 'edit' && selectedUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, { ...user, id: `U${Date.now()}` }]);
    }
    handleBackToList();
  };

  const handleDeleteUser = (user: SystemUser) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.fullName}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  // Users Tab - List View
  if (tabMode === 'users' && viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900 text-[16px]">Quản lý người dùng</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setTabMode('users')}
                className={`flex-1 px-6 py-3 border-b-2 transition-colors ${
                  tabMode === 'users'
                    ? 'text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={tabMode === 'users' ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Danh sách người dùng
                </div>
              </button>
              <button
                onClick={() => setTabMode('roles')}
                className={`flex-1 px-6 py-3 border-b-2 transition-colors ${
                  tabMode === 'roles'
                    ? 'text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={tabMode === 'roles' ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <Key className="w-4 h-4" />
                  Phân quyền vai trò
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, username, mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>

            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="academic">Bộ phận Học vụ</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học viên</option>
                <option value="director">Ban Giám đốc</option>
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
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã vô hiệu hóa</option>
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
                  <th className="px-6 py-3 text-left text-gray-700">Mã</th>
                  <th className="px-6 py-3 text-left text-gray-700">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-gray-700">Vai trò</th>
                  <th className="px-6 py-3 text-left text-gray-700">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {user.code ? (
                        <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {user.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{user.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: roleColors[user.role].bg,
                          color: roleColors[user.role].text,
                        }}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: user.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                          color: user.status === 'active' ? '#00b894' : '#d63031',
                        }}
                      >
                        {user.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                          style={{ color: 'var(--brand-primary)' }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 rounded-lg hover:bg-red-50"
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

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>
    );
  }

  // Users Tab - Detail View
  if (tabMode === 'users' && viewMode === 'detail' && selectedUser) {
    const userRole = roles.find(r => r.roleName === selectedUser.role);
    
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
                <h1 className="text-gray-900 mb-2">{selectedUser.fullName}</h1>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: roleColors[selectedUser.role].bg,
                    color: roleColors[selectedUser.role].text,
                  }}
                >
                  {roleLabels[selectedUser.role]}
                </span>
              </div>
              <button
                onClick={() => handleEdit(selectedUser)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-2">Mã người dùng</p>
                <p className="text-gray-900">{selectedUser.code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Tên đăng nhập</p>
                <p className="text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Email</p>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Số điện thoại</p>
                <p className="text-gray-900">{selectedUser.phone}</p>
              </div>
              {selectedUser.campus && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cơ sở</p>
                  <p className="text-gray-900">{selectedUser.campus}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
                <span
                  className="inline-flex px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: selectedUser.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                    color: selectedUser.status === 'active' ? '#00b894' : '#d63031',
                  }}
                >
                  {selectedUser.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu'}
                </span>
              </div>
            </div>

            {userRole && (
              <div className="border-t pt-6">
                <h2 className="text-gray-900 mb-4">Phân quyền</h2>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <h3 className="text-gray-900">{userRole.roleLabel}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{userRole.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {userRole.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }} />
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Users Tab - Edit/Create View
  if (tabMode === 'users' && (viewMode === 'edit' || viewMode === 'create')) {
    return (
      <UserFormView
        user={selectedUser}
        onBack={handleBackToList}
        onSave={handleSaveUser}
      />
    );
  }

  // Roles Tab
  if (tabMode === 'roles') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900 text-[16px]">Quản lý người dùng</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setTabMode('users')}
                className={`flex-1 px-6 py-3 border-b-2 transition-colors ${
                  tabMode === 'users'
                    ? 'text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={tabMode === 'users' ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Danh sách người dùng
                </div>
              </button>
              <button
                onClick={() => setTabMode('roles')}
                className={`flex-1 px-6 py-3 border-b-2 transition-colors ${
                  tabMode === 'roles'
                    ? 'text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={tabMode === 'roles' ? { borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <Key className="w-4 h-4" />
                  Phân quyền vai trò
                </div>
              </button>
            </div>
          </div>
        </div>

        <RolesManagementView
          roles={roles}
          users={users}
          onUpdateRole={(roleId, updatedRole) => {
            setRoles(roles.map(r => r.id === roleId ? updatedRole : r));
          }}
          onAssignRole={(userId, newRole) => {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Gán vai trò thành công!');
          }}
        />
      </div>
    );
  }

  return null;
}

// User Form View Component
function UserFormView({
  user,
  onBack,
  onSave,
}: {
  user: SystemUser | null;
  onBack: () => void;
  onSave: (user: SystemUser) => void;
}) {
  const [formData, setFormData] = useState<SystemUser>(
    user || {
      id: '',
      username: '',
      fullName: '',
      role: 'student',
      status: 'active',
      email: '',
      phone: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-gray-900 mb-4">Thông tin người dùng</h2>
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
                  required
                />
              </div>

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
                  disabled={!!user}
                />
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
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as SystemUser['role'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="student">Học viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="academic">Bộ phận Học vụ</option>
                  <option value="director">Ban Giám đốc</option>
                </select>
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
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã vô hiệu hóa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {user ? 'Cập nhật' : 'Thêm mới'}
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

// Roles Management View Component
function RolesManagementView({
  roles,
  users,
  onUpdateRole,
  onAssignRole,
}: {
  roles: RolePermissions[];
  users: SystemUser[];
  onUpdateRole: (roleId: string, updatedRole: RolePermissions) => void;
  onAssignRole: (userId: string, newRole: SystemUser['role']) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<RolePermissions | null>(roles[0] || null);
  const [editMode, setEditMode] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [newPermission, setNewPermission] = useState('');

  const handleEditRole = (role: RolePermissions) => {
    setEditedPermissions([...role.permissions]);
    setEditMode(true);
  };

  const handleSaveRole = () => {
    if (selectedRole) {
      onUpdateRole(selectedRole.id, {
        ...selectedRole,
        permissions: editedPermissions,
      });
    }
    setEditMode(false);
    alert('Cập nhật quyền thành công!');
  };

  const handleAddPermission = () => {
    if (newPermission && !editedPermissions.includes(newPermission)) {
      setEditedPermissions([...editedPermissions, newPermission]);
      setNewPermission('');
    }
  };

  // Get available permissions that are not already in the role
  const availablePermissions = ALL_SYSTEM_PERMISSIONS.filter(
    p => !editedPermissions.includes(p)
  );

  const roleUsers = users.filter(u => u.role === selectedRole?.roleName);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
            <h2 className="text-gray-900">Danh sách vai trò</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  setEditMode(false);
                  setNewPermission('');
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedRole?.id === role.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900">{role.roleLabel}</h3>
                  <span className="text-xs text-gray-500">
                    {users.filter(u => u.role === role.roleName).length} người
                  </span>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Role Details & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRole && (
            <>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-gray-900 mb-1">{selectedRole.roleLabel}</h2>
                      <p className="text-sm text-gray-600">{selectedRole.description}</p>
                    </div>
                    {!editMode ? (
                      <button
                        onClick={() => handleEditRole(selectedRole)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        Chỉnh sửa quyền
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveRole}
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                          <Save className="w-4 h-4" />
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setNewPermission('');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-gray-900 mb-4">Quyền hạn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editMode ? (
                      editedPermissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded border border-gray-300">
                          <span className="flex-1 px-2 py-1 text-sm text-gray-700">{permission}</span>
                          <button
                            onClick={() => {
                              setEditedPermissions(editedPermissions.filter((_, i) => i !== index));
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      selectedRole.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }} />
                          <span className="text-sm text-gray-700">{permission}</span>
                        </div>
                      ))
                    )}
                  </div>
                  {editMode && availablePermissions.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      <select
                        value={newPermission}
                        onChange={(e) => setNewPermission(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      >
                        <option value="">-- Chọn quyền để thêm --</option>
                        {availablePermissions.map((perm, idx) => (
                          <option key={idx} value={perm}>{perm}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddPermission}
                        disabled={!newPermission}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Thêm
                      </button>
                    </div>
                  )}
                  {editMode && availablePermissions.length === 0 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Đã thêm tất cả các quyền có sẵn
                    </p>
                  )}
                </div>
              </div>

              {/* Users with this role */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  <h3 className="text-gray-900">
                    Người dùng có vai trò này ({roleUsers.length})
                  </h3>
                </div>
                <div className="p-4">
                  {roleUsers.length > 0 ? (
                    <div className="space-y-2">
                      {roleUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="text-sm text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.username}</p>
                          </div>
                          <select
                            value={user.role}
                            onChange={(e) => onAssignRole(user.id, e.target.value as SystemUser['role'])}
                            className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                          >
                            <option value="student">Học viên</option>
                            <option value="teacher">Giảng viên</option>
                            <option value="academic">Học vụ</option>
                            <option value="director">Giám đốc</option>
                          </select>
                        </div>
                      ))}
                      {roleUsers.length > 5 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          và {roleUsers.length - 5} người khác...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có người dùng nào có vai trò này
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}