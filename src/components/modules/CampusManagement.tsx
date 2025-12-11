import { useState } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import { campuses as mockDataCampuses } from '../../data/mockData';

interface Campus {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager?: string;
  status: 'active' | 'inactive';
  classrooms?: number;
  capacity?: number;
}

// Convert mockData campuses to Campus format with additional fields
const mockCampuses: Campus[] = mockDataCampuses.map(campus => ({
  ...campus,
  manager: campus.code === 'CS001' ? 'Cấn Việt Đức' : 'Nguyễn Thị Lan Anh',
  classrooms: campus.code === 'CS001' ? 8 : 6,
  capacity: campus.code === 'CS001' ? 120 : 90,
}));

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

export default function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>(mockCampuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

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

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa cơ sở này?')) {
      setCampuses(campuses.filter(c => c.id !== id));
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCampus(null);
  };

  const handleSave = (campus: Campus) => {
    if (viewMode === 'edit' && selectedCampus) {
      setCampuses(campuses.map(c => c.id === campus.id ? campus : c));
    } else {
      setCampuses([...campuses, { ...campus, id: Date.now().toString() }]);
    }
    setViewMode('list');
    setSelectedCampus(null);
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
                    <span className="text-sm">Quản lý: {campus.manager}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phòng học</p>
                    <p className="text-gray-900">{campus.classrooms} phòng</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sức chứa</p>
                    <p className="text-gray-900">{campus.capacity} học viên</p>
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
                <p className="text-gray-900">{selectedCampus.manager}</p>
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
                <p className="text-sm text-gray-500 mb-2">Số phòng học</p>
                <p className="text-gray-900">{selectedCampus.classrooms} phòng</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Sức chứa</p>
                <p className="text-gray-900">{selectedCampus.capacity} học viên</p>
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
      manager: '',
      status: 'active',
      classrooms: 0,
      capacity: 0,
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
            {campus ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Mã cơ sở <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: LB, HBT"
                required
              />
            </div>

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

            <div>
              <label className="block text-gray-700 mb-2">
                Người quản lý <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="Nhập tên người quản lý"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Số phòng học <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.classrooms}
                onChange={(e) => setFormData({ ...formData, classrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: 8"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Sức chứa (học viên) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="VD: 120"
                required
                min="1"
              />
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
