import { useState } from 'react';
import { Plus, Download, FileText, Search, Upload } from 'lucide-react';
import { User } from '../../App';

interface Document {
  id: string;
  title: string;
  type: 'textbook' | 'slide' | 'assignment' | 'supplementary';
  className: string;
  uploadDate: string;
  uploadBy: string;
  fileSize: string;
}

const mockDocuments: Document[] = [
  { id: '1', title: 'Unit 3: Technology and Innovation', type: 'textbook', className: 'IELTS Beginner A1', uploadDate: '01/12/2025', uploadBy: 'Trần Thị B', fileSize: '2.5 MB' },
  { id: '2', title: 'IELTS Writing Band 8+ Samples', type: 'supplementary', className: 'IELTS Advanced C1', uploadDate: '28/11/2025', uploadBy: 'Lê Thị D', fileSize: '1.8 MB' },
  { id: '3', title: 'Vocabulary List - Unit 3', type: 'slide', className: 'IELTS Beginner A1', uploadDate: '27/11/2025', uploadBy: 'Trần Thị B', fileSize: '850 KB' },
  { id: '4', title: 'IELTS Listening Practice Test', type: 'assignment', className: 'IELTS Intermediate B1', uploadDate: '26/11/2025', uploadBy: 'Nguyễn Văn C', fileSize: '3.2 MB' },
  { id: '5', title: 'Grammar Review - Conditional Sentences', type: 'slide', className: 'IELTS Intermediate B1', uploadDate: '25/11/2025', uploadBy: 'Nguyễn Văn C', fileSize: '1.1 MB' },
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

interface DocumentManagementProps {
  user: User;
}

export default function DocumentManagement({ user }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || doc.type === filterType;
    const matchClass = filterClass === 'all' || doc.className === filterClass;
    return matchSearch && matchType && matchClass;
  });

  const canUpload = user.role === 'academic' || user.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Tài liệu - Thông báo</h1>
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Tải lên tài liệu
          </button>
        )}
      </div>

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

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <Download className="w-4 h-4" />
              Tải xuống
            </button>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(doc) => {
            setDocuments([...documents, { ...doc, id: Date.now().toString() }]);
            setShowUploadModal(false);
          }}
          userName={user.fullName}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload, userName }: {
  onClose: () => void;
  onUpload: (doc: Document) => void;
  userName: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'textbook' as Document['type'],
    className: '',
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
            <label className="block text-gray-700 mb-2">Tiêu đề tài liệu</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Loại tài liệu</label>
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
            <label className="block text-gray-700 mb-2">Lớp học</label>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
