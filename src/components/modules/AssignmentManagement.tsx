import { useState } from 'react';
import { Plus, Eye, Edit, Download, Upload } from 'lucide-react';
import { User } from '../../App';

interface Assignment {
  id: string;
  title: string;
  description: string;
  className: string;
  teacher: string;
  dueDate: string;
  status: 'open' | 'closed';
  submissions?: number;
  totalStudents?: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  submittedDate: string;
  grade?: number;
  feedback?: string;
}

const mockAssignments: Assignment[] = [
  { id: '1', title: 'Bài tập Unit 3 - Writing Task 2', description: 'Viết bài luận 250 từ về chủ đề Technology', className: 'IELTS Beginner A1', teacher: 'Trần Thị B', dueDate: '05/12/2025', status: 'open', submissions: 15, totalStudents: 18 },
  { id: '2', title: 'Speaking Practice - Topic: Technology', description: 'Ghi âm bài nói Part 2 (2 phút)', className: 'IELTS Beginner A1', teacher: 'Trần Thị B', dueDate: '06/12/2025', status: 'open', submissions: 10, totalStudents: 18 },
  { id: '3', title: 'Essay Writing Practice', description: 'IELTS Writing Task 2 - Environment topic', className: 'IELTS Intermediate B1', teacher: 'Nguyễn Văn C', dueDate: '04/12/2025', status: 'open', submissions: 12, totalStudents: 15 },
];

const mockSubmissions: Submission[] = [
  { id: '1', assignmentId: '1', studentName: 'Nguyễn Văn A', submittedDate: '02/12/2025', grade: 8.5, feedback: 'Bài viết tốt, cần chú ý grammar' },
  { id: '2', assignmentId: '1', studentName: 'Trần Thị B', submittedDate: '02/12/2025', grade: 9.0, feedback: 'Xuất sắc!' },
  { id: '3', assignmentId: '1', studentName: 'Lê Văn C', submittedDate: '03/12/2025' },
];

interface AssignmentManagementProps {
  user: User;
}

export default function AssignmentManagement({ user }: AssignmentManagementProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);

  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">
          {isTeacher ? 'Quản lý bài tập' : 'Bài tập của tôi'}
        </h1>
        {isTeacher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Giao bài tập mới
          </button>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">Lớp: {assignment.className}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-orange-600">Hạn nộp: {assignment.dueDate}</span>
                  {isTeacher && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">
                        Đã nộp: {assignment.submissions}/{assignment.totalStudents}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded ${
                assignment.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {assignment.status === 'open' ? 'Đang mở' : 'Đã đóng'}
              </span>
            </div>

            <div className="flex gap-2">
              {isStudent && (
                <>
                  <button
                    onClick={() => setViewingAssignment(assignment)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                    <Upload className="w-4 h-4" />
                    Nộp bài
                  </button>
                </>
              )}
              {isTeacher && (
                <>
                  <button
                    onClick={() => setViewingSubmissions(assignment)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4" />
                    Xem bài nộp ({assignment.submissions})
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(assignment) => {
            setAssignments([...assignments, { ...assignment, id: Date.now().toString() }]);
            setShowCreateModal(false);
          }}
          userName={user.fullName}
        />
      )}

      {/* View Assignment Modal (Student) */}
      {viewingAssignment && (
        <ViewAssignmentModal
          assignment={viewingAssignment}
          onClose={() => setViewingAssignment(null)}
        />
      )}

      {/* View Submissions Modal (Teacher) */}
      {viewingSubmissions && (
        <SubmissionsModal
          assignment={viewingSubmissions}
          submissions={mockSubmissions.filter(s => s.assignmentId === viewingSubmissions.id)}
          onClose={() => setViewingSubmissions(null)}
        />
      )}
    </div>
  );
}

function CreateAssignmentModal({ onClose, onCreate, userName }: {
  onClose: () => void;
  onCreate: (assignment: Assignment) => void;
  userName: string;
}) {
  const [formData, setFormData] = useState<Assignment>({
    id: '',
    title: '',
    description: '',
    className: '',
    teacher: userName,
    dueDate: '',
    status: 'open',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Giao bài tập mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Tiêu đề bài tập</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-gray-700 mb-2">Hạn nộp</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">File đính kèm</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Kéo thả file hoặc click để chọn</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Giao bài tập
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

function ViewAssignmentModal({ assignment, onClose }: {
  assignment: Assignment;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">{assignment.title}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-600 mb-1">Mô tả:</p>
            <p className="text-gray-900">{assignment.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Lớp học:</p>
              <p className="text-gray-900">{assignment.className}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Hạn nộp:</p>
              <p className="text-orange-600">{assignment.dueDate}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 mb-2">File bài tập:</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <Download className="w-4 h-4" />
              assignment_unit3.pdf
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Nộp bài
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsModal({ assignment, submissions, onClose }: {
  assignment: Assignment;
  submissions: Submission[];
  onClose: () => void;
}) {
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Bài nộp - {assignment.title}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {submissions.length} bài đã nộp / {assignment.totalStudents} học viên
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">{submission.studentName}</p>
                    <p className="text-gray-600 text-sm mb-2">Nộp: {submission.submittedDate}</p>
                    {submission.grade && (
                      <div className="flex items-center gap-4">
                        <span className="text-green-600">Điểm: {submission.grade}</span>
                        {submission.feedback && (
                          <span className="text-gray-600 text-sm">Nhận xét: {submission.feedback}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm">
                      Xem bài
                    </button>
                    {!submission.grade && (
                      <button
                        onClick={() => setGradingSubmission(submission)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                      >
                        Chấm điểm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

      {/* Grading Modal */}
      {gradingSubmission && (
        <GradingModal
          submission={gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          onSave={() => setGradingSubmission(null)}
        />
      )}
    </div>
  );
}

function GradingModal({ submission, onClose, onSave }: {
  submission: Submission;
  onClose: () => void;
  onSave: () => void;
}) {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Chấm bài - {submission.studentName}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Điểm số (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Nhận xét</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nhận xét cho học viên..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu điểm
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
