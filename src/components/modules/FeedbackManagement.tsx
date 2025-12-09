import { useState } from 'react';
import { Plus, MessageSquare, CheckCircle } from 'lucide-react';
import { User } from '../../App';

interface Feedback {
  id: string;
  sender: string;
  senderRole: string;
  type: 'academic' | 'technical' | 'course';
  title: string;
  content: string;
  status: 'pending' | 'responded';
  createdDate: string;
  response?: string;
  responseDate?: string;
}

const mockFeedbacks: Feedback[] = [
  { id: '1', sender: 'Nguyễn Văn A', senderRole: 'Học viên', type: 'course', title: 'Đề nghị bổ sung tài liệu', content: 'Em muốn có thêm tài liệu luyện IELTS Writing Task 2', status: 'responded', createdDate: '01/12/2025', response: 'Tài liệu đã được cập nhật vào hệ thống', responseDate: '02/12/2025' },
  { id: '2', sender: 'Trần Thị B', senderRole: 'Giáo viên', type: 'technical', title: 'Lỗi hệ thống chấm điểm', content: 'Không thể nhập điểm cho lớp IELTS Beginner A1', status: 'pending', createdDate: '02/12/2025' },
  { id: '3', sender: 'Lê Văn C', senderRole: 'Học viên', type: 'academic', title: 'Xin nghỉ học', content: 'Em xin nghỉ học buổi ngày 05/12 vì lý do gia đình', status: 'responded', createdDate: '03/12/2025', response: 'Đã ghi nhận. Bạn vui lòng học bù vào thứ 7', responseDate: '03/12/2025' },
];

const typeLabels = {
  academic: 'Học vụ',
  technical: 'Kỹ thuật',
  course: 'Khóa học',
};

const typeColors = {
  academic: 'bg-blue-100 text-blue-700',
  technical: 'bg-red-100 text-red-700',
  course: 'bg-green-100 text-green-700',
};

interface FeedbackManagementProps {
  user: User;
}

export default function FeedbackManagement({ user }: FeedbackManagementProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchType = filterType === 'all' || feedback.type === filterType;
    return matchStatus && matchType;
  });

  const canRespond = user.role === 'academic';
  const canCreate = true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Phản hồi - Hỗ trợ</h1>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Gửi phản hồi
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="responded">Đã phản hồi</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="academic">Học vụ</option>
            <option value="technical">Kỹ thuật</option>
            <option value="course">Khóa học</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-gray-900">{feedback.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${typeColors[feedback.type]}`}>
                    {typeLabels[feedback.type]}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    feedback.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã phản hồi'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{feedback.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{feedback.sender} ({feedback.senderRole})</span>
                  <span>•</span>
                  <span>{feedback.createdDate}</span>
                </div>
              </div>
            </div>

            {feedback.response && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-900 mb-1">Phản hồi:</p>
                    <p className="text-blue-800">{feedback.response}</p>
                    <p className="text-blue-600 text-sm mt-2">{feedback.responseDate}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setViewingFeedback(feedback)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                Xem chi tiết
              </button>
              {canRespond && feedback.status === 'pending' && (
                <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                  Phản hồi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Feedback Modal */}
      {showCreateModal && (
        <CreateFeedbackModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(feedback) => {
            setFeedbacks([...feedbacks, { ...feedback, id: Date.now().toString() }]);
            setShowCreateModal(false);
          }}
          userName={user.fullName}
          userRole={user.role}
        />
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <ViewFeedbackModal
          feedback={viewingFeedback}
          onClose={() => setViewingFeedback(null)}
          canRespond={canRespond}
          onRespond={(response) => {
            setFeedbacks(feedbacks.map(f =>
              f.id === viewingFeedback.id
                ? { ...f, status: 'responded' as const, response, responseDate: new Date().toLocaleDateString('vi-VN') }
                : f
            ));
            setViewingFeedback(null);
          }}
        />
      )}
    </div>
  );
}

function CreateFeedbackModal({ onClose, onCreate, userName, userRole }: {
  onClose: () => void;
  onCreate: (feedback: Feedback) => void;
  userName: string;
  userRole: string;
}) {
  const [formData, setFormData] = useState({
    sender: userName,
    senderRole: userRole === 'academic' ? 'Học vụ' : userRole === 'teacher' ? 'Giáo viên' : userRole === 'student' ? 'Học viên' : 'Giám đốc',
    type: 'academic' as Feedback['type'],
    title: '',
    content: '',
    status: 'pending' as const,
    createdDate: new Date().toLocaleDateString('vi-VN'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData as Feedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Gửi phản hồi mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Loại phản hồi</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Feedback['type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="academic">Học vụ</option>
              <option value="technical">Kỹ thuật</option>
              <option value="course">Khóa học</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề phản hồi..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Nội dung</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nội dung chi tiết..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gửi phản hồi
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

function ViewFeedbackModal({ feedback, onClose, canRespond, onRespond }: {
  feedback: Feedback;
  onClose: () => void;
  canRespond: boolean;
  onRespond: (response: string) => void;
}) {
  const [response, setResponse] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    onRespond(response);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">{feedback.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-sm ${typeColors[feedback.type]}`}>
              {typeLabels[feedback.type]}
            </span>
            <span className={`px-2 py-1 rounded text-sm ${
              feedback.status === 'pending'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã phản hồi'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">Người gửi:</p>
            <p className="text-gray-900">{feedback.sender} ({feedback.senderRole})</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-1">Ngày gửi:</p>
            <p className="text-gray-900">{feedback.createdDate}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Nội dung:</p>
            <p className="text-gray-900">{feedback.content}</p>
          </div>

          {feedback.response && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 mb-2">Phản hồi:</p>
              <p className="text-blue-800 mb-2">{feedback.response}</p>
              <p className="text-blue-600 text-sm">{feedback.responseDate}</p>
            </div>
          )}

          {canRespond && feedback.status === 'pending' && !showResponseForm && (
            <button
              onClick={() => setShowResponseForm(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Phản hồi
            </button>
          )}

          {showResponseForm && (
            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nội dung phản hồi</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung phản hồi..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi phản hồi
                </button>
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
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
