import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
      capacity: 20,
      currentStudents: 0,
      teacher: '',
      status: 'active',
      schedule: '',
    }
  );

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
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

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
    setDaySchedules(prev => prev.map((ds, i) => 
      i === index ? { ...ds, [field]: value } : ds
    ));
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
                >
                  <option value="Foundation">Foundation</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
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
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
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
                  <option value="Nguyễn Thị Mai Lan">Nguyễn Thị Mai Lan</option>
                  <option value="Trần Văn Bình">Trần Văn Bình</option>
                  <option value="Lê Thị Thu Hà">Lê Thị Thu Hà</option>
                  <option value="Phạm Minh Tuấn">Phạm Minh Tuấn</option>
                  <option value="Hoàng Văn Đức">Hoàng Văn Đức</option>
                  <option value="Đỗ Thị Hương">Đỗ Thị Hương</option>
                  <option value="Vũ Quốc Anh">Vũ Quốc Anh</option>
                  <option value="Bùi Thị Lan">Bùi Thị Lan</option>
                  <option value="Trương Minh Khang">Trương Minh Khang</option>
                  <option value="Lê Thị Phương Anh">Lê Thị Phương Anh</option>
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
              Chọn các ngày trong tuần và thiết lập giờ học cho từng ngày
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
                      <select
                        value={ds.startTime}
                        onChange={(e) => updateDayTime(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">-</span>
                      <select
                        value={ds.endTime}
                        onChange={(e) => updateDayTime(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
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