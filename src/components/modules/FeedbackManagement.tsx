import { useState } from 'react';
import { Plus, MessageSquare, CheckCircle, ArrowLeft, Send, Clock, User as UserIcon } from 'lucide-react';
import { User } from '../../App';

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

const mockFeedbacks: Feedback[] = [
  { 
    id: '1', 
    sender: 'Nguyên Thị Khánh Huyền', 
    senderRole: 'Học viên', 
    type: 'course', 
    title: 'Đề nghị bổ sung tài liệu IELTS Writing', 
    content: 'Em muốn có thêm tài liệu luyện IELTS Writing Task 2 về các chủ đề Environment và Technology. Hiện tại tài liệu trên hệ thống còn ít và không đa dạng lắm ạ. Em cảm ơn thầy cô!', 
    status: 'responded', 
    createdDate: '2024-12-01', 
    response: 'Chào em Huyền! Cảm ơn em đã góp ý. Trung tâm đã cập nhật thêm 15 bài mẫu Writing Task 2 mới về các ch��� đề em yêu cầu vào mục Tài liệu. Em có thể tải xuống và tham khảo. Chúc em học tốt!', 
    responseDate: '2024-12-02',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '2', 
    title: 'Câu hỏi về lịch học', 
    content: 'Em muốn hỏi về lịch học bù vào thứ 7 ạ. Có phải em cần đăng ký trước không ạ?', 
    status: 'responded', 
    sender: 'Trần Văn Bình', 
    senderRole: 'Giảng viên', 
    type: 'technical', 
    createdDate: '2024-12-08', 
    response: 'Chào em Bình! Em có thể học bù vào buổi Thứ 7 tuần sau (21/12) cùng lớp IELTS Foundation - LB02 nhé. Em nhớ báo với giảng viên trước khi vào lớp.',
    responseDate: '2024-12-08',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '3', 
    sender: 'Lê Hoàng Nam', 
    senderRole: 'Học viên', 
    type: 'academic', 
    title: 'Xin nghỉ học buổi ngày 15/12', 
    content: 'Em xin phép được nghỉ học buổi ngày 15/12/2024 vì lý do gia đình có việc đột xuất. Em sẽ học bù vào buổi khác theo sắp xếp của thầy cô ạ. Em cảm ơn!', 
    status: 'responded', 
    createdDate: '2024-12-07', 
    response: 'Chào em Nam! Trung tâm đã ghi nhận đơn xin nghỉ của em. Em có thể học bù vào buổi Thứ 7 tuần sau (21/12) cùng lớp IELTS Foundation - LB02 nhé. Em nhớ báo với giảng viên trước khi vào lớp.',
    responseDate: '2024-12-07',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '4', 
    sender: 'Phạm Thu Trang', 
    senderRole: 'Học viên', 
    type: 'course', 
    title: 'Góp ý về tốc độ giảng dạy', 
    content: 'Em thấy giảng viên dạy hơi nhanh, em còn nhiều phần chưa hiểu rõ. Em hy vọng thầy cô có thể giảng chậm hơn một chút để các em có thời gian tiếp thu tốt hơn ạ.', 
    status: 'responded', 
    createdDate: '2024-12-05', 
    response: 'Cảm ơn em Trang đã góp ý! Trung tâm sẽ trao đổi với giảng viên để điều chỉnh tốc độ giảng dạy phù hợp hơn. Em cũng có thể hỏi giảng viên trực tiếp sau giờ học nếu có phần nào chưa rõ nhé!',
    responseDate: '2024-12-06',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '5', 
    sender: 'Lê Thị Phương Anh', 
    senderRole: 'Giảng viên', 
    type: 'academic', 
    title: 'Đề xuất tổ chức thêm lớp ôn thi', 
    content: 'Em đề xuất trung tâm nên mở thêm lớp ôn thi IELTS intensive vào cuối tuần cho các học viên cần thi gấp. Hiện có nhiều học viên hỏi về lớp này.', 
    status: 'pending', 
    createdDate: '2024-12-09' 
  },
  { 
    id: '6', 
    sender: 'Nguyễn Thị Mai Lan', 
    senderRole: 'Giảng viên', 
    type: 'technical', 
    title: 'Lỗi hệ thống nhập điểm', 
    content: 'Em gặp lỗi khi nhập điểm cho lớp IELTS Beginner - LB02. Hệ thống báo lỗi "Failed to save" khi em nhấn nút Lưu điểm. Em đã thử nhiều lần nhưng vẫn không được. Nhờ bộ phận kỹ thuật kiểm tra giúp em với ạ!', 
    status: 'responded', 
    createdDate: '2024-12-03',
    response: 'Chào cô Lan! Bộ phận kỹ thuật đã kiểm tra và khắc phục lỗi. Nguyên nhân do server database tạm thời quá tải. Hiện tại hệ thống đã hoạt động bình thường. Cô có thể thử lại nhé. Nếu còn gặp vấn đề, vui lòng liên hệ hotline: 0986922618.',
    responseDate: '2024-12-03',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '7', 
    sender: 'Trần Minh Anh', 
    senderRole: 'Giảng viên', 
    type: 'course', 
    title: 'Đề xuất cập nhật giáo trình Listening', 
    content: 'Em thấy giáo trình Listening hiện tại chưa có nhiều bài về Cambridge IELTS 18-19. Em đề xuất nên bổ sung thêm các bài test mới nhất để học viên làm quen với format thi hiện tại.', 
    status: 'responded', 
    createdDate: '2024-12-04',
    response: 'Cảm ơn thầy Anh đã góp ý! Trung tâm đã mua bản quyền Cambridge IELTS 18-19 và sẽ cập nhật vào hệ thống trong tuần này. Thầy sẽ nhận được thông báo khi tài liệu được upload lên.',
    responseDate: '2024-12-05',
    respondedBy: 'Vũ Thị Thanh Hương'
  },
  { 
    id: '8', 
    sender: 'Nguyễn Văn Đạt', 
    senderRole: 'Giảng viên', 
    type: 'academic', 
    title: 'Đề nghị điều chỉnh lịch dạy tháng 1/2025', 
    content: 'Em xin phép được điều chỉnh lịch dạy trong tháng 1/2025 vì có kế hoạch đi thi IELTS cá nhân. Em đề xuất hoán đổi với thầy Trần Minh Anh hoặc cô Lê Thị Phương Anh nếu được. Em cảm ơn!', 
    status: 'pending', 
    createdDate: '2024-12-10' 
  },
];

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

type ViewMode = 'list' | 'detail' | 'create';

export default function FeedbackManagement({ user }: FeedbackManagementProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

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
    setSelectedFeedback(feedback);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedFeedback(null);
  };

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleCreateFeedback = (feedback: Omit<Feedback, 'id'>) => {
    const newFeedback = {
      ...feedback,
      id: Date.now().toString(),
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setViewMode('list');
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
    if (selectedFeedback?.id === feedbackId) {
      setSelectedFeedback({
        ...selectedFeedback,
        status: 'responded',
        response,
        responseDate: new Date().toISOString().split('T')[0],
        respondedBy: user.fullName,
      });
    }
  };

  // List View
  if (viewMode === 'list') {
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
  if (viewMode === 'detail' && selectedFeedback) {
    return (
      <FeedbackDetailView
        feedback={selectedFeedback}
        canRespond={canRespond}
        onBack={handleBackToList}
        onRespond={handleRespondToFeedback}
      />
    );
  }

  // Create View
  if (viewMode === 'create') {
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
          <h1 className="text-gray-900">Gửi phản hồi mới</h1>
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