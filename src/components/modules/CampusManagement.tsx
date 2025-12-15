import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import { campuses as mockDataCampuses } from '../../data/mockData';
import { campusesAPI, usersAPI } from '../../utils/api';

interface Campus {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  id_manager?: string;
  manager?: string;
  status: 'active' | 'inactive';
}

interface UserOption {
  id_user: string;
  full_name: string;
}

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

export default function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [CampusManagement] Loading data...');
      const response = await campusesAPI.getAll();
      console.log('✅ [CampusManagement] Data loaded:', response);
      setCampuses(response || []);
    } catch (err: any) {
      console.error('❌ [CampusManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampuses = campuses.filter(campus =>
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (campus: Campus) => {
    setSelectedCampus(campus);
    setViewMode('detail');
  };

  const handleEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setViewMode('edit');
  };

  const handleAdd = () => {
    setSelectedCampus(null);
    setViewMode('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cơ sở này?')) return;
    try {
      console.log('[CampusManagement] Deleting campus:', id);
      await campusesAPI.delete(id);
      setCampuses(campuses.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('[CampusManagement] Delete error:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa cơ sở'}`);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampus(null);
  };

  const handleSave = async (campus: Campus) => {
    try {
      console.log('[CampusManagement] Saving campus:', campus);
      if (viewMode === 'edit' && selectedCampus) {
        await campusesAPI.update(campus.id, campus);
        await loadData(); // Reload to get updated manager name
      } else {
        await campusesAPI.create(campus);
        await loadData(); // Reload to get new campus with manager name
      }
      setViewMode('list');
      setSelectedCampus(null);
    } catch (err: any) {
      console.error('[CampusManagement] Save error:', err);
      alert(`Lỗi: ${err.message || 'Không thể lưu cơ sở'}`);
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">Quản lý cơ sở</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Thêm cơ sở
          </button>
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
              <div className="text-red-600">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button onClick={loadData} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Thử lại</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Campus Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCampuses.map((campus) => (
            <div key={campus.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
                      <MapPin className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900">{campus.name}</h3>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {campus.code}
                        </span>
                      </div>
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: campus.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                          color: campus.status === 'active' ? '#00b894' : '#d63031',
                        }}
                      >
                        {campus.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{campus.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{campus.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Quản lý: {campus.manager || 'Chưa có'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(campus)}
                    className="flex-1 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleEdit(campus)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campus.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedCampus) {
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
                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
                  <MapPin className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-gray-900">{selectedCampus.name}</h1>
                    <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                      {selectedCampus.code}
                    </span>
                  </div>
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: selectedCampus.status === 'active' ? 'var(--pastel-green-light)' : '#fee',
                      color: selectedCampus.status === 'active' ? '#00b894' : '#d63031',
                    }}
                  >
                    {selectedCampus.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(selectedCampus)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Mã cơ sở</p>
                <p className="text-gray-900">{selectedCampus.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Người quản lý</p>
                <p className="text-gray-900">{selectedCampus.manager || 'Chưa có'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                <p className="text-gray-900">{selectedCampus.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Số điện thoại</p>
                <p className="text-gray-900">{selectedCampus.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Email</p>
                <p className="text-gray-900">{selectedCampus.email || 'Chưa có'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit View
  if ((viewMode === 'create' || viewMode === 'edit') && (selectedCampus || viewMode === 'create')) {
    return (
      <CampusFormView
        campus={selectedCampus}
        onBack={handleBackToList}
        onSave={handleSave}
      />
    );
  }

  return null;
}

function CampusFormView({
  campus,
  onBack,
  onSave,
}: {
  campus: Campus | null;
  onBack: () => void;
  onSave: (campus: Campus) => void;
}) {
  const [formData, setFormData] = useState<Campus>(
    campus || {
      id: '',
      code: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      id_manager: '',
      status: 'active',
    }
  );
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await usersAPI.getAll();
      console.log('👥 [CampusForm] Users loaded:', response);
      setUsers(response?.users || []);
    } catch (err) {
      console.error('❌ [CampusForm] Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

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
            {campus ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Tên cơ sở <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: Cơ sở Long Biên"
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
                placeholder="VD: 0986.922.618"
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

            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: longbien@englishcomplex.vn"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Người quản lý
              </label>
              {loadingUsers ? (
                <div className="text-gray-500 text-sm">Đang tải danh sách...</div>
              ) : (
                <select
                  value={formData.id_manager || ''}
                  onChange={(e) => setFormData({ ...formData, id_manager: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="">-- Chưa chọn --</option>
                  {users.map(user => (
                    <option key={user.id_user} value={user.id_user}>
                      {user.full_name} ({user.id_user})
                    </option>
                  ))}
                </select>
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {campus ? 'Cập nhật' : 'Thêm mới'}
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
