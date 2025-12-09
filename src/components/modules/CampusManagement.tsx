import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Campus {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

const mockCampuses: Campus[] = [
  { id: '1', name: 'Cơ sở 1 - Quận 1', address: '123 Nguyễn Huệ, Quận 1, TP.HCM', phone: '028 1234 5678', manager: 'Nguyễn Văn A', status: 'active' },
  { id: '2', name: 'Cơ sở 2 - Quận 3', address: '456 Lê Văn Sỹ, Quận 3, TP.HCM', phone: '028 2345 6789', manager: 'Trần Thị B', status: 'active' },
  { id: '3', name: 'Cơ sở 3 - Quận 7', address: '789 Nguyễn Văn Linh, Quận 7, TP.HCM', phone: '028 3456 7890', manager: 'Lê Văn C', status: 'active' },
];

export default function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>(mockCampuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  const filteredCampuses = campuses.filter(campus =>
    campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingCampus(null);
    setShowModal(true);
  };

  const handleEdit = (campus: Campus) => {
    setEditingCampus(campus);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa cơ sở này?')) {
      setCampuses(campuses.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý cơ sở</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm cơ sở
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Tên cơ sở</th>
                <th className="px-6 py-3 text-left text-gray-700">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-gray-700">Điện thoại</th>
                <th className="px-6 py-3 text-left text-gray-700">Người quản lý</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCampuses.map((campus) => (
                <tr key={campus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{campus.name}</td>
                  <td className="px-6 py-4 text-gray-600">{campus.address}</td>
                  <td className="px-6 py-4 text-gray-600">{campus.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{campus.manager}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${
                      campus.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campus.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(campus)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(campus.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CampusModal
          campus={editingCampus}
          onClose={() => setShowModal(false)}
          onSave={(campus) => {
            if (editingCampus) {
              setCampuses(campuses.map(c => c.id === campus.id ? campus : c));
            } else {
              setCampuses([...campuses, { ...campus, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function CampusModal({ campus, onClose, onSave }: {
  campus: Campus | null;
  onClose: () => void;
  onSave: (campus: Campus) => void;
}) {
  const [formData, setFormData] = useState<Campus>(
    campus || {
      id: '',
      name: '',
      address: '',
      phone: '',
      manager: '',
      status: 'active',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">
            {campus ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Tên cơ sở</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Địa chỉ</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              <label className="block text-gray-700 mb-2">Người quản lý</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
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
              {campus ? 'Cập nhật' : 'Thêm mới'}
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
