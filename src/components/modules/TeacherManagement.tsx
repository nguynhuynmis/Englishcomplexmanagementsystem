import { useState } from 'react';
import { Plus, Edit, Eye, Search } from 'lucide-react';

interface Teacher {
  id: string;
  fullName: string;
  specialty: string;
  yearsOfExperience: number;
  certificates: string[];
  phone: string;
  email: string;
  campus: string;
  status: 'active' | 'inactive';
}

const mockTeachers: Teacher[] = [
  { id: '1', fullName: 'Trần Thị B', specialty: 'IELTS Speaking & Writing', yearsOfExperience: 5, certificates: ['IELTS 8.5', 'TESOL'], phone: '0901234568', email: 'tranthib@teacher.com', campus: 'Cơ sở 1', status: 'active' },
  { id: '2', fullName: 'Nguyễn Văn C', specialty: 'IELTS Listening & Reading', yearsOfExperience: 7, certificates: ['IELTS 9.0', 'CELTA'], phone: '0912345679', email: 'nguyenvanc@teacher.com', campus: 'Cơ sở 1', status: 'active' },
  { id: '3', fullName: 'Lê Thị D', specialty: 'IELTS Writing', yearsOfExperience: 4, certificates: ['IELTS 8.0', 'TESOL'], phone: '0923456780', email: 'lethid@teacher.com', campus: 'Cơ sở 2', status: 'active' },
  { id: '4', fullName: 'Phạm Văn E', specialty: 'IELTS Speaking', yearsOfExperience: 6, certificates: ['IELTS 8.5', 'DELTA'], phone: '0934567891', email: 'phamvane@teacher.com', campus: 'Cơ sở 2', status: 'active' },
  { id: '5', fullName: 'Hoàng Thị F', specialty: 'IELTS All Skills', yearsOfExperience: 8, certificates: ['IELTS 9.0', 'TESOL', 'CELTA'], phone: '0945678902', email: 'hoangthif@teacher.com', campus: 'Cơ sở 3', status: 'active' },
];

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(teacher => {
    const matchSearch = teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCampus = filterCampus === 'all' || teacher.campus === filterCampus;
    return matchSearch && matchCampus;
  });

  const handleAdd = () => {
    setEditingTeacher(null);
    setShowModal(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  const handleView = (teacher: Teacher) => {
    setViewingTeacher(teacher);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý giáo viên</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm giáo viên
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <select
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả cơ sở</option>
              <option value="Cơ sở 1">Cơ sở 1</option>
              <option value="Cơ sở 2">Cơ sở 2</option>
              <option value="Cơ sở 3">Cơ sở 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Họ tên</th>
                <th className="px-6 py-3 text-left text-gray-700">Chuyên môn</th>
                <th className="px-6 py-3 text-left text-gray-700">Kinh nghiệm</th>
                <th className="px-6 py-3 text-left text-gray-700">Chứng chỉ</th>
                <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{teacher.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.specialty}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.yearsOfExperience} năm</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.certificates.slice(0, 2).map((cert, i) => (
                        <span key={i} className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                          {cert}
                        </span>
                      ))}
                      {teacher.certificates.length > 2 && (
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          +{teacher.certificates.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{teacher.campus}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleView(teacher)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <TeacherModal
          teacher={editingTeacher}
          onClose={() => setShowModal(false)}
          onSave={(teacher) => {
            if (editingTeacher) {
              setTeachers(teachers.map(t => t.id === teacher.id ? teacher : t));
            } else {
              setTeachers([...teachers, { ...teacher, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* View Modal */}
      {viewingTeacher && (
        <TeacherViewModal
          teacher={viewingTeacher}
          onClose={() => setViewingTeacher(null)}
        />
      )}
    </div>
  );
}

function TeacherModal({ teacher, onClose, onSave }: {
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}) {
  const [formData, setFormData] = useState<Teacher>(
    teacher || {
      id: '',
      fullName: '',
      specialty: '',
      yearsOfExperience: 0,
      certificates: [],
      phone: '',
      email: '',
      campus: 'Cơ sở 1',
      status: 'active',
    }
  );

  const [certificateInput, setCertificateInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCertificate = () => {
    if (certificateInput.trim()) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, certificateInput.trim()]
      });
      setCertificateInput('');
    }
  };

  const removeCertificate = (index: number) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">
            {teacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
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
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Chuyên môn</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Năm kinh nghiệm</label>
              <input
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Chứng chỉ</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={certificateInput}
                  onChange={(e) => setCertificateInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificate())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập chứng chỉ..."
                />
                <button
                  type="button"
                  onClick={addCertificate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certificates.map((cert, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Đang giảng dạy</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {teacher ? 'Cập nhật' : 'Thêm mới'}
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

function TeacherViewModal({ teacher, onClose }: {
  teacher: Teacher;
  onClose: () => void;
}) {
  const mockClasses = [
    { name: 'IELTS Beginner A1', students: 18, schedule: 'T2, T4, T6: 08:00-10:00' },
    { name: 'IELTS Intermediate B1', students: 15, schedule: 'T3, T5, T7: 14:00-16:00' },
    { name: 'IELTS Advanced C1', students: 12, schedule: 'T2, T4: 16:00-18:00' },
  ];

  const mockSchedule = [
    { day: 'Thứ 2', time: '08:00 - 10:00', class: 'IELTS Beginner A1', room: 'Phòng 101' },
    { day: 'Thứ 2', time: '16:00 - 18:00', class: 'IELTS Advanced C1', room: 'Phòng 201' },
    { day: 'Thứ 3', time: '14:00 - 16:00', class: 'IELTS Intermediate B1', room: 'Phòng 102' },
    { day: 'Thứ 4', time: '08:00 - 10:00', class: 'IELTS Beginner A1', room: 'Phòng 101' },
    { day: 'Thứ 4', time: '16:00 - 18:00', class: 'IELTS Advanced C1', room: 'Phòng 201' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Hồ sơ giáo viên</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-gray-900 mb-3">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Họ và tên</p>
                <p className="text-gray-900">{teacher.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Điện thoại</p>
                <p className="text-gray-900">{teacher.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Email</p>
                <p className="text-gray-900">{teacher.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Cơ sở</p>
                <p className="text-gray-900">{teacher.campus}</p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="text-gray-900 mb-3">Chuyên môn</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm mb-1">Lĩnh vực</p>
                <p className="text-gray-900">{teacher.specialty}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Năm kinh nghiệm</p>
                <p className="text-gray-900">{teacher.yearsOfExperience} năm</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Chứng chỉ</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.certificates.map((cert, i) => (
                    <span key={i} className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Classes */}
          <div>
            <h3 className="text-gray-900 mb-3">Lớp đang dạy</h3>
            <div className="space-y-2">
              {mockClasses.map((classItem, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">{classItem.name}</p>
                    <span className="text-gray-600 text-sm">{classItem.students} HV</span>
                  </div>
                  <p className="text-gray-600 text-sm">{classItem.schedule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-gray-900 mb-3">Lịch dạy</h3>
            <div className="space-y-2">
              {mockSchedule.map((schedule, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">{schedule.day}, {schedule.time}</p>
                      <p className="text-gray-600 text-sm">{schedule.class}</p>
                    </div>
                    <span className="text-gray-600 text-sm">{schedule.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
