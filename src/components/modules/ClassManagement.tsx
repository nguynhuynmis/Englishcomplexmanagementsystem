import { useState } from 'react';
import { Plus, Edit, Users, UserPlus, Search } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  campus: string;
  level: string;
  capacity: number;
  currentStudents: number;
  teacher: string;
  status: 'active' | 'completed';
  schedule: string;
}

const mockClasses: Class[] = [
  { id: '1', name: 'IELTS Beginner A1', campus: 'Cơ sở 1', level: 'Beginner', capacity: 20, currentStudents: 18, teacher: 'Trần Thị B', status: 'active', schedule: 'T2, T4, T6: 08:00-10:00' },
  { id: '2', name: 'IELTS Beginner A2', campus: 'Cơ sở 1', level: 'Beginner', capacity: 20, currentStudents: 16, teacher: 'Nguyễn Văn C', status: 'active', schedule: 'T3, T5, T7: 10:00-12:00' },
  { id: '3', name: 'IELTS Intermediate B1', campus: 'Cơ sở 2', level: 'Intermediate', capacity: 18, currentStudents: 15, teacher: 'Lê Thị D', status: 'active', schedule: 'T2, T4: 14:00-16:00' },
  { id: '4', name: 'IELTS Advanced C1', campus: 'Cơ sở 2', level: 'Advanced', capacity: 15, currentStudents: 12, teacher: 'Phạm Văn E', status: 'active', schedule: 'T3, T5: 16:00-18:00' },
  { id: '5', name: 'IELTS Master', campus: 'Cơ sở 3', level: 'Master', capacity: 12, currentStudents: 10, teacher: 'Hoàng Thị F', status: 'active', schedule: 'T2, T4, T6: 18:00-20:00' },
];

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [enrollingClass, setEnrollingClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter(classItem => {
    const matchSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCampus = filterCampus === 'all' || classItem.campus === filterCampus;
    const matchLevel = filterLevel === 'all' || classItem.level === filterLevel;
    return matchSearch && matchCampus && matchLevel;
  });

  const handleAdd = () => {
    setEditingClass(null);
    setShowModal(true);
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setShowModal(true);
  };

  const handleEnroll = (classItem: Class) => {
    setEnrollingClass(classItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý lớp học</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Thêm lớp học
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={filterCampus}
            onChange={(e) => setFilterCampus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả cơ sở</option>
            <option value="Cơ sở 1">Cơ sở 1</option>
            <option value="Cơ sở 2">Cơ sở 2</option>
            <option value="Cơ sở 3">Cơ sở 3</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trình độ</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Master">Master</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Tên lớp</th>
                <th className="px-6 py-3 text-left text-gray-700">Cơ sở</th>
                <th className="px-6 py-3 text-left text-gray-700">Trình độ</th>
                <th className="px-6 py-3 text-left text-gray-700">Sức chứa</th>
                <th className="px-6 py-3 text-left text-gray-700">Giáo viên</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{classItem.name}</p>
                    <p className="text-gray-600 text-sm">{classItem.schedule}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{classItem.campus}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {classItem.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{classItem.currentStudents}/{classItem.capacity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{classItem.teacher}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${
                      classItem.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {classItem.status === 'active' ? 'Đang học' : 'Kết thúc'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEnroll(classItem)}
                      className="text-purple-600 hover:text-purple-700 mr-3"
                      title="Ghi danh học viên"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="text-blue-600 hover:text-blue-700"
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
        <ClassModal
          classItem={editingClass}
          onClose={() => setShowModal(false)}
          onSave={(classItem) => {
            if (editingClass) {
              setClasses(classes.map(c => c.id === classItem.id ? classItem : c));
            } else {
              setClasses([...classes, { ...classItem, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* Enroll Modal */}
      {enrollingClass && (
        <EnrollModal
          classItem={enrollingClass}
          onClose={() => setEnrollingClass(null)}
          onEnroll={(studentIds) => {
            setClasses(classes.map(c =>
              c.id === enrollingClass.id
                ? { ...c, currentStudents: c.currentStudents + studentIds.length }
                : c
            ));
            setEnrollingClass(null);
          }}
        />
      )}
    </div>
  );
}

function ClassModal({ classItem, onClose, onSave }: {
  classItem: Class | null;
  onClose: () => void;
  onSave: (classItem: Class) => void;
}) {
  const [formData, setFormData] = useState<Class>(
    classItem || {
      id: '',
      name: '',
      campus: 'Cơ sở 1',
      level: 'Beginner',
      capacity: 20,
      currentStudents: 0,
      teacher: '',
      status: 'active',
      schedule: '',
    }
  );

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Danh sách học viên mẫu
  const availableStudents = [
    { id: '10', name: 'Nguyễn Văn X', level: 'Beginner' },
    { id: '11', name: 'Trần Thị Y', level: 'Beginner' },
    { id: '12', name: 'Lê Văn Z', level: 'Intermediate' },
    { id: '13', name: 'Phạm Thị W', level: 'Beginner' },
    { id: '14', name: 'Hoàng Văn Q', level: 'Advanced' },
    { id: '15', name: 'Vũ Thị R', level: 'Beginner' },
  ];

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Cập nhật số học viên hiện tại dựa trên số học viên được chọn
    const updatedFormData = {
      ...formData,
      currentStudents: classItem ? formData.currentStudents : selectedStudents.length
    };
    onSave(updatedFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">
            {classItem ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Tên lớp</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label className="block text-gray-700 mb-2">Trình độ</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Sức chứa</label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Giáo viên phụ trách</label>
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn giáo viên...</option>
                <option value="Trần Thị B">Trần Thị B</option>
                <option value="Nguyễn Văn C">Nguyễn Văn C</option>
                <option value="Lê Thị D">Lê Thị D</option>
                <option value="Phạm Văn E">Phạm Văn E</option>
                <option value="Hoàng Thị F">Hoàng Thị F</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Lịch học</label>
              <input
                type="text"
                placeholder="VD: T2, T4, T6: 08:00-10:00"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Đang học</option>
                <option value="completed">Kết thúc</option>
              </select>
            </div>

            {/* Thêm học viên vào lớp */}
            {!classItem && (
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Thêm học viên ban đầu</label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-900">{student.name}</span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {student.level}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedStudents.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-900 text-sm">
                      Đã chọn {selectedStudents.length} học viên {' '}
                      (Sức chứa còn lại: {formData.capacity - selectedStudents.length}/{formData.capacity})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {classItem ? 'Cập nhật' : 'Thêm mới'}
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

function EnrollModal({ classItem, onClose, onEnroll }: {
  classItem: Class;
  onClose: () => void;
  onEnroll: (studentIds: string[]) => void;
}) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const availableStudents = [
    { id: '10', name: 'Nguyễn Văn X', level: 'Beginner' },
    { id: '11', name: 'Trần Thị Y', level: 'Beginner' },
    { id: '12', name: 'Lê Văn Z', level: 'Beginner' },
    { id: '13', name: 'Phạm Thị W', level: 'Beginner' },
  ];

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleEnroll = () => {
    if (selectedStudents.length > 0) {
      onEnroll(selectedStudents);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Ghi danh học viên - {classItem.name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            Sức chứa: {classItem.currentStudents}/{classItem.capacity}
          </p>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">Chọn học viên cần ghi danh:</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="text-gray-900">{student.name}</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {student.level}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-900">
                Đã chọn {selectedStudents.length} học viên
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleEnroll}
            disabled={selectedStudents.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Ghi danh ({selectedStudents.length})
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}