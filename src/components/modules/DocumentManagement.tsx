import { useState, useEffect } from 'react';
import { Plus, Download, FileText, Search, Upload, Bell, Users, MapPin, AlertCircle, Calendar, Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import { User } from '../../App';
import { documentsAPI } from '../../utils/api';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2861589`;

interface Document {
  id: string;
  title: string;
  type: 'textbook' | 'slide' | 'assignment' | 'supplementary';
  className: string;
  uploadDate: string;
  uploadBy: string;
  fileSize: string;
  isVisible?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedDate: string;
  targetAudience: 'all' | 'student' | 'teacher' | 'academic' | 'director';
  campus: 'all' | 'Long Biên' | 'Hai Bà Trưng';
  priority: 'normal' | 'high' | 'urgent';
  attachments?: string[];
  isVisible?: boolean;
}

const mockDocuments: Document[] = [
  { id: '1', title: 'Unit 3: Technology and Innovation', type: 'textbook', className: 'IELTS Beginner A1', uploadDate: '01/12/2025', uploadBy: 'Trần Thị B', fileSize: '2.5 MB' },
  { id: '2', title: 'IELTS Writing Band 8+ Samples', type: 'supplementary', className: 'IELTS Advanced C1', uploadDate: '28/11/2025', uploadBy: 'Lê Thị D', fileSize: '1.8 MB' },
  { id: '3', title: 'Vocabulary List - Unit 3', type: 'slide', className: 'IELTS Beginner A1', uploadDate: '27/11/2025', uploadBy: 'Trần Thị B', fileSize: '850 KB' },
  { id: '4', title: 'IELTS Listening Practice Test', type: 'assignment', className: 'IELTS Intermediate B1', uploadDate: '26/11/2025', uploadBy: 'Nguyễn Văn C', fileSize: '3.2 MB' },
  { id: '5', title: 'Grammar Review - Conditional Sentences', type: 'slide', className: 'IELTS Intermediate B1', uploadDate: '25/11/2025', uploadBy: 'Nguyễn Văn C', fileSize: '1.1 MB' },
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Thông báo nghỉ Tết Nguyên Đán 2025',
    content: 'Trung tâm English Complex thông báo lịch nghỉ Tết Nguyên Đán 2025 từ ngày 26/01/2025 đến 05/02/2025. Các lớp học sẽ được bù vào cuối khóa. Chúc các bạn và gia đình năm mới vui vẻ, hạnh phúc!',
    postedBy: 'Cấn Việt Đức',
    postedDate: '08/12/2025',
    targetAudience: 'all',
    campus: 'all',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Khai giảng lớp IELTS Advanced C1 - T01/2025',
    content: 'Trung tâm thông báo khai giảng lớp IELTS Advanced C1 (mã lớp: C1-LB-T01-2025) vào ngày 15/01/2025. Thời gian học: Thứ 2, 4, 6 (18:00-20:00). Giảng viên: Nguyễn Thị Mai Lan. Học phí đã bao gồm tài liệu và thi thử IELTS.',
    postedBy: 'Nguyễn Thị Mai Lan',
    postedDate: '05/12/2025',
    targetAudience: 'student',
    campus: 'Long Biên',
    priority: 'normal',
  },
  {
    id: '3',
    title: 'Họp giảng viên tháng 12/2025',
    content: 'Cuộc họp giảng viên định kỳ tháng 12/2025 sẽ được tổ chức vào 15h00 ngày 15/12/2025 tại cơ sở Long Biên. Nội dung: Đánh giá kết quả học tập học viên, kế hoạch Tết 2025, và phương pháp giảng dạy mới. Đề nghị các thầy cô sắp xếp tham dự đầy đủ.',
    postedBy: 'Phạm Thị C',
    postedDate: '03/12/2025',
    targetAudience: 'teacher',
    campus: 'all',
    priority: 'urgent',
  },
  {
    id: '4',
    title: 'Thi thử IELTS miễn phí - Tháng 01/2025',
    content: 'Trung tâm tổ chức kỳ thi thử IELTS miễn phí cho học viên đang theo học. Thời gian: 09:00 Chủ nhật 19/01/2025. Địa điểm: Cơ sở Hai Bà Trưng. Đăng ký trước ngày 15/01/2025 tại bộ phận học vụ. Giới hạn 30 học viên.',
    postedBy: 'Phạm Thị C',
    postedDate: '01/12/2025',
    targetAudience: 'student',
    campus: 'Hai Bà Trưng',
    priority: 'high',
  },
];

const typeLabels = {
  textbook: 'Giáo trình',
  slide: 'Slide',
  assignment: 'Bài tập',
  supplementary: 'Tài liệu bổ sung',
};

const typeColors = {
  textbook: 'bg-blue-100 text-blue-700',
  slide: 'bg-green-100 text-green-700',
  assignment: 'bg-orange-100 text-orange-700',
  supplementary: 'bg-purple-100 text-purple-700',
};

const audienceLabels: Record<Announcement['targetAudience'], string> = {
  all: 'Tất cả',
  student: 'Học viên',
  teacher: 'Giảng viên',
  academic: 'Học vụ',
  director: 'Giám đốc',
};

const priorityLabels = {
  normal: 'Bình thường',
  high: 'Quan trọng',
  urgent: 'Khẩn cấp',
};

const priorityColors = {
  normal: 'bg-gray-100 text-gray-700',
  high: 'bg-yellow-100 text-yellow-700',
  urgent: 'bg-red-100 text-red-700',
};

interface DocumentManagementProps {
  user: User;
}

export default function DocumentManagement({ user }: DocumentManagementProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'announcements'>('announcements');
  const [documents, setDocuments] = useState<Document[]>(mockDocuments.map(d => ({ ...d, isVisible: true })));
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements.map(a => ({ ...a, isVisible: true })));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [filterCampus, setFilterCampus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);

  const canManage = user.role === 'academic' || user.role === 'director';
  const canUpload = user.role === 'academic' || user.role === 'teacher';
  const canCreateAnnouncement = user.role === 'academic' || user.role === 'director' || user.role === 'teacher'; // ✅ Teacher can now create announcements

  // Load announcements from database
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        console.log('📢 [DocumentManagement] Loading announcements from database...');
        
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [DocumentManagement] Loaded announcements:', data.length);
          setAnnouncements(data);
        } else {
          console.error('❌ [DocumentManagement] Failed to load announcements');
        }
      } catch (error) {
        console.error('❌ [DocumentManagement] Error loading announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnnouncements();
  }, []);

  const handleDownload = (document: Document) => {
    alert(`Đã tải xuống: ${document.title}`);
  };

  const handleToggleDocVisibility = (docId: string) => {
    setDocuments(documents.map(d => 
      d.id === docId ? { ...d, isVisible: !d.isVisible } : d
    ));
  };

  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      setDocuments(documents.filter(d => d.id !== docId));
    }
  };
  
  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setShowUploadModal(true);
  };

  const handleToggleAnnVisibility = async (annId: string) => {
    try {
      const ann = announcements.find(a => a.id === annId);
      if (!ann) return;
      
      const newVisibility = !ann.isVisible;
      
      const response = await fetch(`${API_BASE}/notifications/${annId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ isVisible: newVisibility })
      });
      
      if (response.ok) {
        setAnnouncements(announcements.map(a => 
          a.id === annId ? { ...a, isVisible: newVisibility } : a
        ));
        console.log('✅ [DocumentManagement] Updated visibility');
      }
    } catch (error) {
      console.error('❌ [DocumentManagement] Error toggling visibility:', error);
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/notifications/${annId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== annId));
        console.log('✅ [DocumentManagement] Deleted notification');
      }
    } catch (error) {
      console.error('❌ [DocumentManagement] Error deleting notification:', error);
    }
  };
  
  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setShowAnnouncementModal(true);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || doc.type === filterType;
    const matchClass = filterClass === 'all' || doc.className === filterClass;
    const matchVisible = canManage || doc.isVisible !== false;
    return matchSearch && matchType && matchClass && matchVisible;
  });

  const filteredAnnouncements = announcements.filter(ann => {
    const matchSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAudience = filterAudience === 'all' || ann.targetAudience === filterAudience || ann.targetAudience === 'all';
    const matchCampus = filterCampus === 'all' || ann.campus === filterCampus || ann.campus === 'all';
    const matchVisible = canManage || ann.isVisible !== false;
    return matchSearch && matchAudience && matchCampus && matchVisible;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Tài liệu - Thông báo</h1>
        {activeTab === 'documents' && canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Tải tài liệu
          </button>
        )}
        {activeTab === 'announcements' && canCreateAnnouncement && (
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Tạo thông báo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'announcements'
                ? 'border-b-2 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === 'announcements' ? { borderBottomColor: 'var(--brand-primary)' } : {}}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Thông báo</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'documents'
                ? 'border-b-2 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === 'documents' ? { borderBottomColor: 'var(--brand-primary)' } : {}}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Tài liệu</span>
            </div>
          </button>
        </div>
      </div>

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả đối tượng</option>
                <option value="student">Học viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="academic">Học vụ</option>
                <option value="director">Giám đốc</option>
              </select>

              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả cơ sở</option>
                <option value="Long Biên">Long Biên</option>
                <option value="Hai Bà Trưng">Hai Bà Trưng</option>
              </select>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{ann.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${priorityColors[ann.priority]}`}>
                          {priorityLabels[ann.priority]}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{ann.content}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{ann.postedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{audienceLabels[ann.targetAudience]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ann.campus === 'all' ? 'Tất cả cơ sở' : ann.campus}</span>
                    </div>
                    <div className="ml-auto text-gray-600">
                      Đăng bởi: {ann.postedBy}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => handleToggleAnnVisibility(ann.id)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                          ann.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ann.isVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        {ann.isVisible ? 'Hiện' : 'Ẩn'}
                      </button>
                      <button
                        onClick={() => handleEditAnnouncement(ann)}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-100 text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-100 text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại</option>
                <option value="textbook">Giáo trình</option>
                <option value="slide">Slide</option>
                <option value="assignment">Bài tập</option>
                <option value="supplementary">Tài liệu bổ sung</option>
              </select>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả lớp</option>
                <option value="IELTS Beginner A1">IELTS Beginner A1</option>
                <option value="IELTS Intermediate B1">IELTS Intermediate B1</option>
                <option value="IELTS Advanced C1">IELTS Advanced C1</option>
              </select>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className={`px-2 py-1 rounded text-sm ${typeColors[doc.type]}`}>
                    {typeLabels[doc.type]}
                  </span>
                </div>

                <h3 className="text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-600 text-sm mb-1">{doc.className}</p>
                <p className="text-gray-500 text-xs mb-4">
                  Tải lên: {doc.uploadDate} • {doc.fileSize}
                </p>

                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4" />
                  Tải xuống
                </button>

                {canManage && (
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleToggleDocVisibility(doc.id)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                        doc.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {doc.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                      {doc.isVisible ? 'Hiện' : 'Ẩn'}
                    </button>
                    <button
                      onClick={() => handleEditDocument(doc)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-100 text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-100 text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => {
            setShowUploadModal(false);
            setEditingDocument(null);
          }}
          onUpload={(doc) => {
            if (editingDocument) {
              // Update existing document
              setDocuments(documents.map(d => d.id === editingDocument.id ? { ...doc, id: editingDocument.id } : d));
            } else {
              // Create new document
              setDocuments([...documents, { ...doc, id: Date.now().toString() }]);
            }
            setShowUploadModal(false);
            setEditingDocument(null);
          }}
          userName={user.fullName}
          editingDocument={editingDocument}
        />
      )}

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={async (ann) => {
            if (editingAnnouncement) {
              // Update existing announcement (local only for now)
              setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? { ...ann, id: editingAnnouncement.id } : a));
            } else {
              // Create new announcement via API
              try {
                console.log('📢 [DocumentManagement] Creating notification via API...');
                const response = await fetch(`${API_BASE}/notifications`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`
                  },
                  body: JSON.stringify({
                    content: ann.content,
                    targetClass: null, // Can add class selection later
                    teacherId: user.teacherId || null, // Use teacherId from logged in user
                    postedBy: user.fullName
                  })
                });
                
                if (response.ok) {
                  const newNotification = await response.json();
                  console.log('✅ [DocumentManagement] Created notification:', newNotification);
                  setAnnouncements([newNotification, ...announcements]);
                } else {
                  console.error('❌ [DocumentManagement] Failed to create notification');
                  alert('Lỗi khi tạo thông báo');
                }
              } catch (error) {
                console.error('❌ [DocumentManagement] Error creating notification:', error);
                alert('Lỗi khi tạo thông báo');
              }
            }
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
          userName={user.fullName}
          editingAnnouncement={editingAnnouncement}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload, userName, editingDocument }: {
  onClose: () => void;
  onUpload: (doc: Document) => void;
  userName: string;
  editingDocument: Document | null;
}) {
  const [formData, setFormData] = useState({
    title: editingDocument?.title || '',
    type: editingDocument?.type || 'textbook' as Document['type'],
    className: editingDocument?.className || '',
    uploadDate: new Date().toLocaleDateString('vi-VN'),
    uploadBy: userName,
    fileSize: '0 KB',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(formData as Document);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Tải lên tài liệu mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Tiêu đề tài liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Loại tài liệu <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Document['type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="textbook">Giáo trình</option>
              <option value="slide">Slide</option>
              <option value="assignment">Bài tập</option>
              <option value="supplementary">Tài liệu bổ sung</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Lớp học <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn lớp học...</option>
              <option value="IELTS Beginner A1">IELTS Beginner A1</option>
              <option value="IELTS Intermediate B1">IELTS Intermediate B1</option>
              <option value="IELTS Advanced C1">IELTS Advanced C1</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tệp đính kèm</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Kéo thả file hoặc click để chọn</p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
              >
                Chọn file
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Tải lên
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

function AnnouncementModal({ onClose, onSubmit, userName, editingAnnouncement }: {
  onClose: () => void;
  onSubmit: (ann: Announcement) => void;
  userName: string;
  editingAnnouncement: Announcement | null;
}) {
  const [formData, setFormData] = useState({
    title: editingAnnouncement?.title || '',
    content: editingAnnouncement?.content || '',
    targetAudience: editingAnnouncement?.targetAudience || 'all' as Announcement['targetAudience'],
    campus: editingAnnouncement?.campus || 'all' as Announcement['campus'],
    priority: editingAnnouncement?.priority || 'normal' as Announcement['priority'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...formData,
      postedBy: userName,
      postedDate: new Date().toLocaleDateString('vi-VN'),
    };
    onSubmit(newAnnouncement);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Tạo thông báo mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề thông báo"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Nhập nội dung thông báo chi tiết"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Đối tượng nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Announcement['targetAudience'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="student">Học viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="academic">Học vụ</option>
                <option value="director">Giám đốc</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Cơ sở <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value as Announcement['campus'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả cơ sở</option>
                <option value="Long Biên">Long Biên</option>
                <option value="Hai Bà Trưng">Hai Bà Trưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Độ ưu tiên <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Announcement['priority'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Bình thường</option>
              <option value="high">Quan trọng</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="mb-1">Thông báo sẽ được gửi đến:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Đối tượng: <strong>{audienceLabels[formData.targetAudience]}</strong></li>
                  <li>Cơ sở: <strong>{formData.campus === 'all' ? 'Tất cả cơ sở' : formData.campus}</strong></li>
                  <li>Độ ưu tiên: <strong>{priorityLabels[formData.priority]}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Đăng thông báo
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