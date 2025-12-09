import { useState } from 'react';
import { Plus, Edit, Eye, Search, Filter } from 'lucide-react';

interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  level: string;
  currentClass: string;
  campus: string;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
}

const mockStudents: Student[] = [
  { id: '1', fullName: 'Nguyễn Văn A', dateOfBirth: '15/03/2000', level: 'IELTS Beginner', currentClass: 'IELTS Beginner A1', campus: 'Cơ sở 1', status: 'active', phone: '0901234567', email: 'nguyenvana@email.com' },
  { id: '2', fullName: 'Trần Thị B', dateOfBirth: '20/05/1999', level: 'IELTS Intermediate', currentClass: 'IELTS Intermediate B1', campus: 'Cơ sở 1', status: 'active', phone: '0912345678', email: 'tranthib@email.com' },
  { id: '3', fullName: 'Lê Văn C', dateOfBirth: '10/08/2001', level: 'IELTS Advanced', currentClass: 'IELTS Advanced C1', campus: 'Cơ sở 2', status: 'active', phone: '0923456789', email: 'levanc@email.com' },
  { id: '4', fullName: 'Phạm Thị D', dateOfBirth: '05/12/2000', level: 'IELTS Beginner', currentClass: 'IELTS Beginner A2', campus: 'Cơ sở 2', status: 'active', phone: '0934567890', email: 'phamthid@email.com' },
  { id: '5', fullName: 'Hoàng Văn E', dateOfBirth: '25/07/1998', level: 'IELTS Master', currentClass: 'IELTS Master', campus: 'Cơ sở 3', status: 'active', phone: '0945678901', email: 'hoangvane@email.com' },
];

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student => {
    const matchSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCampus = filterCampus === 'all' || student.campus === filterCampus;
    const matchStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchSearch && matchCampus && matchStatus;
  });

  const handleAdd = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý học viên</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm học viên
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
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

          <div className="flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="inactive">Ngưng học</option>
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
                <th className="px-6 py-3 text-left text-gray-700">Ngày sinh</th>
                <th className="px-6 py-3 text-left text-gray-700">Trình độ</th>
                <th className="px-6 py-3 text-left text-gray-700">Lớp hiện tại</th>
                <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{student.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{student.dateOfBirth}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {student.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.currentClass}</td>
                  <td className="px-6 py-4 text-gray-600">{student.campus}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status === 'active' ? 'Đang học' : 'Ngưng học'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleView(student)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(student)}
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
        <StudentModal
          student={editingStudent}
          onClose={() => setShowModal(false)}
          onSave={(student) => {
            if (editingStudent) {
              setStudents(students.map(s => s.id === student.id ? student : s));
            } else {
              setStudents([...students, { ...student, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* View Modal */}
      {viewingStudent && (
        <StudentViewModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  );
}

function StudentModal({ student, onClose, onSave }: {
  student: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}) {
  const [formData, setFormData] = useState<Student>(
    student || {
      id: '',
      fullName: '',
      dateOfBirth: '',
      level: 'IELTS Beginner',
      currentClass: '',
      campus: 'Cơ sở 1',
      status: 'active',
      phone: '',
      email: '',
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
            {student ? 'Chỉnh sửa học viên' : 'Thêm học viên mới'}
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
              <label className="block text-gray-700 mb-2">Ngày sinh</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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

            <div className="col-span-2">
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
              <label className="block text-gray-700 mb-2">Trình độ</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IELTS Beginner">IELTS Beginner</option>
                <option value="IELTS Intermediate">IELTS Intermediate</option>
                <option value="IELTS Advanced">IELTS Advanced</option>
                <option value="IELTS Master">IELTS Master</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Lớp hiện tại</label>
              <input
                type="text"
                value={formData.currentClass}
                onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
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

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Đang học</option>
                <option value="inactive">Ngưng học</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {student ? 'Cập nhật' : 'Thêm mới'}
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

function StudentViewModal({ student, onClose }: {
  student: Student;
  onClose: () => void;
}) {
  const mockGrades = {
    attendance: 9.5,
    midterm: 8.5,
    final: 9.0,
    average: 9.0,
  };

  const classHistory = [
    { class: 'IELTS Foundation', period: '01/2024 - 03/2024', grade: 8.5 },
    { class: 'IELTS Beginner A1', period: '04/2024 - 06/2024', grade: 9.0 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Hồ sơ học viên</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-gray-900 mb-3">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Họ và tên</p>
                <p className="text-gray-900">{student.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Ngày sinh</p>
                <p className="text-gray-900">{student.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Điện thoại</p>
                <p className="text-gray-900">{student.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Email</p>
                <p className="text-gray-900">{student.email}</p>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-gray-900 mb-3">Thông tin học tập</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Lớp hiện tại</p>
                <p className="text-gray-900">{student.currentClass}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Trình độ</p>
                <p className="text-gray-900">{student.level}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Cơ sở</p>
                <p className="text-gray-900">{student.campus}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Trạng thái</p>
                <p className="text-gray-900">{student.status === 'active' ? 'Đang học' : 'Ngưng học'}</p>
              </div>
            </div>
          </div>

          {/* Grades */}
          <div>
            <h3 className="text-gray-900 mb-3">Điểm tổng hợp</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Chuyên cần</p>
                <p className="text-gray-900">{mockGrades.attendance}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Giữa kỳ</p>
                <p className="text-gray-900">{mockGrades.midterm}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Cuối kỳ</p>
                <p className="text-gray-900">{mockGrades.final}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-900 text-sm mb-1">Điểm TB</p>
                <p className="text-blue-900">{mockGrades.average}</p>
              </div>
            </div>
          </div>

          {/* Class History */}
          <div>
            <h3 className="text-gray-900 mb-3">Lịch sử lớp học</h3>
            <div className="space-y-2">
              {classHistory.map((item, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">{item.class}</p>
                      <p className="text-gray-600 text-sm">{item.period}</p>
                    </div>
                    <p className="text-gray-900">Điểm: {item.grade}</p>
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
