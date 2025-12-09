import { useState } from 'react';
import { Plus, Edit, Lock, UserX, Search } from 'lucide-react';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'academic' | 'teacher' | 'student' | 'director';
  campus: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
}

const mockUsers: User[] = [
  { id: '1', username: 'hocvu01', fullName: 'Nguyễn Văn A', role: 'academic', campus: 'Cơ sở 1', status: 'active', email: 'hocvu01@ec.com', phone: '0901234567' },
  { id: '2', username: 'gv01', fullName: 'Trần Thị B', role: 'teacher', campus: 'Cơ sở 1', status: 'active', email: 'tranthib@ec.com', phone: '0912345678' },
  { id: '3', username: 'gv02', fullName: 'Nguyễn Văn C', role: 'teacher', campus: 'Cơ sở 2', status: 'active', email: 'nguyenvanc@ec.com', phone: '0923456789' },
  { id: '4', username: 'hv01', fullName: 'Lê Văn D', role: 'student', campus: 'Cơ sở 1', status: 'active', email: 'levand@ec.com', phone: '0934567890' },
  { id: '5', username: 'gd01', fullName: 'Phạm Thị E', role: 'director', campus: 'Tất cả', status: 'active', email: 'phamthie@ec.com', phone: '0945678901' },
];

const roleLabels = {
  academic: 'Học vụ',
  teacher: 'Giáo viên',
  student: 'Học viên',
  director: 'Giám đốc',
};

const roleColors = {
  academic: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  director: 'bg-red-100 text-red-700',
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Bạn có chắc muốn đặt lại mật khẩu cho người dùng này?')) {
      alert('Mật khẩu mới đã được gửi qua email!');
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const }
        : u
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý người dùng - Phân quyền</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="academic">Học vụ</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học viên</option>
            <option value="director">Giám đốc</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Username</th>
                <th className="px-6 py-3 text-left text-gray-700">Họ tên</th>
                <th className="px-6 py-3 text-left text-gray-700">Vai trò</th>
                <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                <th className="px-6 py-3 text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.campus}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Đặt lại mật khẩu"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-red-600 hover:text-red-700"
                        title={user.status === 'active' ? 'Ngưng hoạt động' : 'Kích hoạt'}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={(user) => {
            if (editingUser) {
              setUsers(users.map(u => u.id === user.id ? user : u));
            } else {
              setUsers([...users, { ...user, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave }: {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const [formData, setFormData] = useState<User>(
    user || {
      id: '',
      username: '',
      fullName: '',
      role: 'student',
      campus: 'Cơ sở 1',
      status: 'active',
      email: '',
      phone: '',
    }
  );

  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!user}
              />
            </div>

            {!user && (
              <div>
                <label className="block text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className={!user ? 'col-span-2' : ''}>
              <label className="block text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="academic">Học vụ</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học viên</option>
                <option value="director">Giám đốc</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Cơ sở</label>
              <select
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cơ sở 1">Cơ sở 1</option>
                <option value="Cơ sở 2">Cơ sở 2</option>
                <option value="Cơ sở 3">Cơ sở 3</option>
                <option value="Tất cả">Tất cả</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {user ? 'Cập nhật' : 'Thêm mới'}
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
