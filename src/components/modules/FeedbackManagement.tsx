import { useState, useEffect } from 'react';
import { Plus, MessageSquare, CheckCircle, ArrowLeft, Send, Clock, User as UserIcon } from 'lucide-react';
import { User } from '../../App';
import { feedbackAPI } from '../../utils/api';

interface Feedback {
  id: string;
  sender: string;
  senderRole: string;
  type: 'academic' | 'technical' | 'course';
  title: 'Đề nghị bổ sung tài liệu IELTS Writing' | 'Lỗi hệ thống nhập điểm' | 'Xin nghỉ học buổi ngày 15/12' | 'Góp ý về tốc độ giảng dạy' | 'Đề xuất tổ chức thêm lớp ôn thi' | 'Câu hỏi về lịch học';
  content: string;
  status: 'pending' | 'responded';
  createdDate: string;
  response?: string;
  responseDate?: string;
  respondedBy?: string;
}

const typeLabels = {
  academic: 'Học vụ',
  technical: 'Kỹ thuật',
  course: 'Khóa học',
};

const categoryColors = {
  academic: { bg: 'var(--brand-primary-100)', text: 'var(--brand-primary-700)' },
  technical: { bg: 'var(--pastel-pink-light)', text: '#d63031' },
  course: { bg: 'var(--pastel-green-light)', text: '#00b894' },
};

interface FeedbackManagementProps {
  user: User;
}

export default function FeedbackManagement({ user }: FeedbackManagementProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [FeedbackManagement] Loading data...');
      const response = await feedbackAPI.getAll();
      console.log('✅ [FeedbackManagement] Data loaded:', response);
      setFeedbacks(response.feedbacks || []);
    } catch (err: any) {
      console.error('❌ [FeedbackManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchType = filterType === 'all' || feedback.type === filterType;
    
    // Filter by user role
    if (user.role === 'student') {
      return matchStatus && matchType && feedback.sender === user.fullName;
    }
    if (user.role === 'teacher') {
      return matchStatus && matchType && feedback.sender === user.fullName;
    }
    
    return matchStatus && matchType;
  });

  const canRespond = user.role === 'academic';
  const canCreate = user.role === 'student' || user.role === 'teacher'; // Academic staff cannot create feedback

  const handleViewDetail = (feedback: Feedback) => {
    setViewingFeedback(feedback);
  };

  const handleBackToList = () => {
    setViewingFeedback(null);
    setShowCreateModal(false);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateFeedback = (feedback: Omit<Feedback, 'id'>) => {
    const newFeedback = {
      ...feedback,
      id: Date.now().toString(),
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setShowCreateModal(false);
  };

  const handleRespondToFeedback = (feedbackId: string, response: string) => {
    setFeedbacks(feedbacks.map(f =>
      f.id === feedbackId
        ? {
            ...f,
            status: 'responded' as const,
            response,
            responseDate: new Date().toISOString().split('T')[0],
            respondedBy: user.fullName,
          }
        : f
    ));
    
    // Update selected feedback if viewing
    if (viewingFeedback?.id === feedbackId) {
      setViewingFeedback({
        ...viewingFeedback,
        status: 'responded',
        response,
        responseDate: new Date().toISOString().split('T')[0],
        respondedBy: user.fullName,
      });
    }
  };

  // List View
  if (!viewingFeedback && !showCreateModal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-gray-900">Phản hồi - Hỗ trợ</h1>
          {canCreate && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Plus className="w-4 h-4" />
              Gửi phản hồi
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="responded">Đã phản hồi</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Loại phản hồi</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              >
                <option value="all">Tất cả loại</option>
                <option value="academic">Học vụ</option>
                <option value="technical">Kỹ thuật</option>
                <option value="course">Khóa học</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Chưa có phản hồi nào</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-gray-900">{feedback.title}</h3>
                        <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: categoryColors[feedback.type].bg,
                            color: categoryColors[feedback.type].text,
                          }}
                        >
                          {typeLabels[feedback.type]}
                        </span>
                        <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: feedback.status === 'pending' ? 'var(--pastel-yellow-light)' : 'var(--pastel-green-light)',
                            color: feedback.status === 'pending' ? '#ffd97a' : '#00b894',
                          }}
                        >
                          {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã phản hồi'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{feedback.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{feedback.sender} ({feedback.senderRole})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(feedback.createdDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {feedback.response && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                        <div className="flex-1">
                          <p className="text-sm mb-1" style={{ color: 'var(--brand-primary-900)' }}>
                            Phản hồi từ {feedback.respondedBy}:
                          </p>
                          <p className="text-gray-700 line-clamp-2">{feedback.response}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={() => handleViewDetail(feedback)}
                      className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Detail View
  if (viewingFeedback) {
    return (
      <FeedbackDetailView
        feedback={viewingFeedback}
        canRespond={canRespond}
        onBack={handleBackToList}
        onRespond={handleRespondToFeedback}
      />
    );
  }

  // Create View
  if (showCreateModal) {
    return (
      <CreateFeedbackView
        user={user}
        onBack={handleBackToList}
        onCreate={handleCreateFeedback}
      />
    );
  }

  return null;
}

// Detail View Component
function FeedbackDetailView({
  feedback,
  canRespond,
  onBack,
  onRespond,
}: {
  feedback: Feedback;
  canRespond: boolean;
  onBack: () => void;
  onRespond: (feedbackId: string, response: string) => void;
}) {
  const [response, setResponse] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onRespond(feedback.id, response);
      setShowResponseForm(false);
      setResponse('');
    }
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-gray-900 mb-3">{feedback.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: categoryColors[feedback.type].bg,
                    color: categoryColors[feedback.type].text,
                  }}
                >
                  {typeLabels[feedback.type]}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: feedback.status === 'pending' ? 'var(--pastel-yellow-light)' : 'var(--pastel-green-light)',
                    color: feedback.status === 'pending' ? '#ffd97a' : '#00b894',
                  }}
                >
                  {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã phản hồi'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Người gửi</p>
              <p className="text-gray-900">{feedback.sender}</p>
              <p className="text-gray-600 text-sm">{feedback.senderRole}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày gửi</p>
              <p className="text-gray-900">{new Date(feedback.createdDate).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Nội dung</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{feedback.content}</p>
            </div>
          </div>

          {/* Response */}
          {feedback.response && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Phản hồi</p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                  <div className="flex-1">
                    <p className="text-sm mb-1" style={{ color: 'var(--brand-primary-900)' }}>
                      {feedback.respondedBy}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback.response}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Ngày phản hồi: {new Date(feedback.responseDate!).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}

          {/* Response Form */}
          {canRespond && feedback.status === 'pending' && (
            <div>
              {!showResponseForm ? (
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <Send className="w-4 h-4" />
                  Gửi phản hồi
                </button>
              ) : (
                <form onSubmit={handleSubmitResponse} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Nội dung phản hồi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                      placeholder="Nhập nội dung phản hồi..."
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                      Gửi phản hồi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponse('');
                      }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create View Component
function CreateFeedbackView({
  user,
  onBack,
  onCreate,
}: {
  user: User;
  onBack: () => void;
  onCreate: (feedback: Omit<Feedback, 'id'>) => void;
}) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'academic': return 'Học vụ';
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Học viên';
      case 'director': return 'Giám đốc';
      default: return role;
    }
  };

  const [formData, setFormData] = useState({
    sender: user.fullName,
    senderRole: getRoleLabel(user.role),
    type: 'academic' as Feedback['type'],
    title: '',
    content: '',
    status: 'pending' as const,
    createdDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
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
          <h1 className="text-gray-900">G��i phản hồi mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Loại phản hồi <span className="text-red-500">*</span></label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Feedback['type'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                required
              >
                <option value="academic">Học vụ</option>
                <option value="technical">Kỹ thuật</option>
                <option value="course">Khóa học</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Người gửi</label>
              <input
                type="text"
                value={formData.sender}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              placeholder="Nhập tiêu đề phản hồi..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Nội dung <span className="text-red-500">*</span></label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              placeholder="Nhập nội dung chi tiết..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Gửi phản hồi
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