import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { coursesAPI, teachersAPI } from '../../utils/api';

interface Class {
  id: string;
  name: string;
  campus: string;
  level: string;
  maxStudents: number; // Changed from capacity to match ClassManagement
  totalStudents: number; // Changed from currentStudents to match ClassManagement
  teacher: string;
  status: 'active' | 'completed' | 'inactive';
  schedule: string;
}

interface Course {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  fullName: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface ClassFormModalProps {
  classItem: Class | null;
  onClose: () => void;
  onSave: (classData: Class) => void;
}

export default function ClassFormModal({ classItem, onClose, onSave }: ClassFormModalProps) {
  const [formData, setFormData] = useState<Class>(
    classItem || {
      id: '',
      name: '',
      campus: 'Cơ sở Long Biên',
      level: 'Beginner',
      maxStudents: 20,
      totalStudents: 0,
      teacher: '',
      status: 'inactive',
      schedule: '',
    }
  );

  // NEW: State for courses and teachers
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule với mỗi thứ có thể chọn và nhập giờ riêng
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([
    { day: 'Thứ 2', enabled: false, startTime: '18:00', endTime: '20:00' },
    { day: 'Thứ 3', enabled: false, startTime: '18:00', endTime: '20:00' },
    { day: 'Thứ 4', enabled: false, startTime: '18:00', endTime: '20:00' },
    { day: 'Thứ 5', enabled: false, startTime: '18:00', endTime: '20:00' },
    { day: 'Thứ 6', enabled: false, startTime: '18:00', endTime: '20:00' },
    { day: 'Thứ 7', enabled: false, startTime: '08:00', endTime: '10:00' },
    { day: 'Chủ nhật', enabled: false, startTime: '08:00', endTime: '10:00' },
  ]);

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // NEW: Load courses and teachers from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses and teachers in parallel
        const [coursesData, teachersData] = await Promise.all([
          coursesAPI.getAll(),
          teachersAPI.getAll()
        ]);
        
        console.log('📖 [ClassFormModal] Courses loaded:', coursesData);
        console.log('👨‍🏫 [ClassFormModal] Teachers loaded:', teachersData);
        
        setCourses(coursesData || []);
        setTeachers(teachersData.teachers || []);
      } catch (error) {
        console.error('❌ [ClassFormModal] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Parse existing schedule when editing
  useEffect(() => {
    if (classItem && classItem.schedule) {
      // Parse "Thứ 2, 4, 6: 18h00 - 20h00" hoặc format mới
      const schedule = classItem.schedule;
      
      // Tạm thời parse format cũ
      const parts = schedule.split(':');
      if (parts.length >= 2) {
        const daysStr = parts[0].trim();
        const timeStr = parts.slice(1).join(':').trim();
        
        const days = daysStr.split(',').map(d => d.trim());
        const [start, end] = timeStr.split('-').map(t => t.trim().replace('h', ':'));
        
        setDaySchedules(prev => prev.map(ds => ({
          ...ds,
          enabled: days.some(d => ds.day.includes(d) || d.includes(ds.day.substring(ds.day.length - 1))),
          startTime: start || ds.startTime,
          endTime: end || ds.endTime,
        })));
      }
    }
  }, [classItem]);

  const toggleDay = (index: number) => {
    setDaySchedules(prev => prev.map((ds, i) => 
      i === index ? { ...ds, enabled: !ds.enabled } : ds
    ));
  };

  const updateDayTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setDaySchedules(prev => prev.map((ds, i) => {
      if (i === index) {
        if (field === 'startTime') {
          // Tự động tính endTime = startTime + 2 giờ
          const [hours, minutes] = value.split(':').map(Number);
          const endHours = hours + 2;
          const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          return { ...ds, startTime: value, endTime };
        }
        return { ...ds, [field]: value };
      }
      return ds;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build schedule string từ daySchedules
    const enabledDays = daySchedules.filter(ds => ds.enabled);
    if (enabledDays.length === 0) {
      alert('Vui lòng chọn ít nhất một ngày học');
      return;
    }

    // Format: "Thứ 2: 18:00-20:00, Thứ 4: 18:00-20:00"
    const scheduleStr = enabledDays
      .map(ds => `${ds.day}: ${ds.startTime}-${ds.endTime}`)
      .join(', ');
    
    const updatedFormData = {
      ...formData,
      schedule: scheduleStr,
    };
    
    onSave(updatedFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-gray-900">
            {classItem ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div>
            <h3 className="text-gray-900 mb-4">Thông tin lớp học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  placeholder="Ví dụ: IELTS Foundation - LB01"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Cơ sở <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                >
                  <option value="Cơ sở Long Biên">Cơ sở Long Biên</option>
                  <option value="Cơ sở Hai Bà Trưng">Cơ sở Hai Bà Trưng</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Trình độ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                  disabled={loading}
                >
                  <option value="">Chọn trình độ...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Sức chứa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Giảng viên phụ trách <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                >
                  <option value="">Chọn giảng viên...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.fullName}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                  required
                >
                  <option value="inactive">Chưa bắt đầu</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lịch học */}
          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-4">
              Lịch học <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Chọn các ngày trong tuần và nhập giờ bắt đầu (hệ thống tự động tính giờ kết thúc sau 2 tiếng)
            </p>
            
            <div className="space-y-3">
              {daySchedules.map((ds, index) => (
                <div key={ds.day} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={ds.enabled}
                      onChange={() => toggleDay(index)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--brand-primary)' }}
                    />
                    <label className="text-gray-700 w-24">{ds.day}:</label>
                  </div>
                  
                  {ds.enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Bắt đầu</label>
                        <input
                          type="time"
                          value={ds.startTime}
                          onChange={(e) => updateDayTime(index, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-gray-500 mt-5">→</span>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Kết thúc (tự động +2h)</label>
                        <input
                          type="time"
                          value={ds.endTime}
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {classItem ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
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