import { useState } from 'react';
import { Plus, Edit, Trash2, Download, Calendar } from 'lucide-react';

interface Schedule {
  id: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  topic: string;
  teacher: string;
  status: 'scheduled' | 'cancelled' | 'rescheduled';
}

const mockSchedules: Schedule[] = [
  { id: '1', className: 'IELTS Beginner A1', date: '03/12/2025', startTime: '08:00', endTime: '10:00', room: 'Phòng 101', topic: 'Unit 3: Family & Friends', teacher: 'Trần Thị B', status: 'scheduled' },
  { id: '2', className: 'IELTS Intermediate B1', date: '03/12/2025', startTime: '10:00', endTime: '12:00', room: 'Phòng 102', topic: 'Unit 5: Technology', teacher: 'Nguyễn Văn C', status: 'scheduled' },
  { id: '3', className: 'IELTS Advanced C1', date: '03/12/2025', startTime: '14:00', endTime: '16:00', room: 'Phòng 201', topic: 'IELTS Writing Task 2', teacher: 'Lê Thị D', status: 'scheduled' },
  { id: '4', className: 'IELTS Master', date: '03/12/2025', startTime: '16:00', endTime: '18:00', room: 'Phòng 202', topic: 'IELTS Speaking Part 3', teacher: 'Phạm Văn E', status: 'scheduled' },
  { id: '5', className: 'IELTS Beginner A2', date: '04/12/2025', startTime: '08:00', endTime: '10:00', room: 'Phòng 103', topic: 'Unit 2: Daily Routines', teacher: 'Hoàng Thị F', status: 'scheduled' },
];

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const filteredSchedules = schedules.filter(schedule => {
    const matchDate = !filterDate || schedule.date === filterDate;
    const matchClass = filterClass === 'all' || schedule.className === filterClass;
    return matchDate && matchClass;
  });

  const handleAdd = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn hủy buổi học này?')) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s));
    }
  };

  const handleExport = () => {
    alert('Xuất file Excel thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Quản lý lịch học</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm buổi học
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Ngày học</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Lớp học</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả lớp</option>
              <option value="IELTS Beginner A1">IELTS Beginner A1</option>
              <option value="IELTS Beginner A2">IELTS Beginner A2</option>
              <option value="IELTS Intermediate B1">IELTS Intermediate B1</option>
              <option value="IELTS Advanced C1">IELTS Advanced C1</option>
              <option value="IELTS Master">IELTS Master</option>
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
                <th className="px-6 py-3 text-left text-gray-700">Lớp học</th>
                <th className="px-6 py-3 text-left text-gray-700">Ngày học</th>
                <th className="px-6 py-3 text-left text-gray-700">Giờ học</th>
                <th className="px-6 py-3 text-left text-gray-700">Phòng học</th>
                <th className="px-6 py-3 text-left text-gray-700">Chủ đề</th>
                <th className="px-6 py-3 text-left text-gray-700">Giáo viên</th>
                <th className="px-6 py-3 text-left text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-right text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{schedule.className}</td>
                  <td className="px-6 py-4 text-gray-600">{schedule.date}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{schedule.room}</td>
                  <td className="px-6 py-4 text-gray-600">{schedule.topic}</td>
                  <td className="px-6 py-4 text-gray-600">{schedule.teacher}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-sm ${
                      schedule.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                      schedule.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {schedule.status === 'scheduled' ? 'Đã lên lịch' :
                       schedule.status === 'cancelled' ? 'Đã hủy' : 'Dời lịch'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
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
        <ScheduleModal
          schedule={editingSchedule}
          onClose={() => setShowModal(false)}
          onSave={(schedule) => {
            if (editingSchedule) {
              setSchedules(schedules.map(s => s.id === schedule.id ? schedule : s));
            } else {
              setSchedules([...schedules, { ...schedule, id: Date.now().toString() }]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function ScheduleModal({ schedule, onClose, onSave }: {
  schedule: Schedule | null;
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
}) {
  const [formData, setFormData] = useState<Schedule>(
    schedule || {
      id: '',
      className: '',
      date: '',
      startTime: '',
      endTime: '',
      room: '',
      topic: '',
      teacher: '',
      status: 'scheduled',
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
            {schedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Lớp học</label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn lớp học...</option>
                <option value="IELTS Beginner A1">IELTS Beginner A1</option>
                <option value="IELTS Beginner A2">IELTS Beginner A2</option>
                <option value="IELTS Intermediate B1">IELTS Intermediate B1</option>
                <option value="IELTS Advanced C1">IELTS Advanced C1</option>
                <option value="IELTS Master">IELTS Master</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Ngày học</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Phòng học</label>
              <input
                type="text"
                placeholder="VD: Phòng 101"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Giờ bắt đầu</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Giờ kết thúc</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2">Chủ đề buổi học</label>
              <input
                type="text"
                placeholder="VD: Unit 3: Family & Friends"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Giáo viên</label>
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

            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Schedule['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="cancelled">Đã hủy</option>
                <option value="rescheduled">Dời lịch</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {schedule ? 'Cập nhật' : 'Thêm mới'}
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
