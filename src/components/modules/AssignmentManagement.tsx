import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Download, Upload } from 'lucide-react';
import { User } from '../../App';
import { assignmentsAPI } from '../../utils/api';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2861589`;

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
  studentId: string;
  submittedDate?: string;
  content?: string; // Text submission
  fileUrl?: string; // File upload
  fileName?: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}

const mockAssignments: Assignment[] = [
  { id: '1', title: 'Bài tập Unit 3 - Writing Task 2', description: 'Viết bài luận 250 từ về chủ đề Technology', className: 'IELTS Beginner A1', teacher: 'Trần Thị B', dueDate: '05/12/2025', status: 'open', submissions: 15, totalStudents: 18 },
  { id: '2', title: 'Speaking Practice - Topic: Technology', description: 'Ghi âm bài nói Part 2 (2 phút)', className: 'IELTS Beginner A1', teacher: 'Trần Thị B', dueDate: '06/12/2025', status: 'open', submissions: 10, totalStudents: 18 },
  { id: '3', title: 'Essay Writing Practice', description: 'IELTS Writing Task 2 - Environment topic', className: 'IELTS Intermediate B1', teacher: 'Nguyễn Văn C', dueDate: '04/12/2025', status: 'open', submissions: 12, totalStudents: 15 },
];

const mockSubmissions: Submission[] = [
  { id: '1', assignmentId: '1', studentName: 'Nguyễn Văn A', studentId: '101', submittedDate: '02/12/2025', grade: 8.5, feedback: 'Bài viết tốt, cần chú ý grammar' },
  { id: '2', assignmentId: '1', studentName: 'Trần Thị B', studentId: '102', submittedDate: '02/12/2025', grade: 9.0, feedback: 'Xuất sắc!' },
  { id: '3', assignmentId: '1', studentName: 'Lê Văn C', studentId: '103', submittedDate: '03/12/2025' },
];

interface AssignmentManagementProps {
  user: User;
}

export default function AssignmentManagement({ user }: AssignmentManagementProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  // Debug log
  console.log('👤 [AssignmentManagement] User:', user);
  console.log('🔑 [AssignmentManagement] user.role:', user.role);
  console.log('👨‍🏫 [AssignmentManagement] isTeacher:', isTeacher);
  console.log('👨‍🎓 [AssignmentManagement] isStudent:', isStudent);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [AssignmentManagement] Loading data...');
      const response = await assignmentsAPI.getAll();
      console.log('✅ [AssignmentManagement] Data loaded:', response);
      setAssignments(response.assignments || []);
    } catch (err: any) {
      console.error('❌ [AssignmentManagement] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      console.log('🔄 [AssignmentManagement] Loading submissions for assignment:', assignmentId);
      const response = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AssignmentManagement] Submissions loaded:', data);
        setSubmissions(data);
      }
    } catch (error) {
      console.error('❌ [AssignmentManagement] Error loading submissions:', error);
    }
  };
  
  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      console.log('📝 [AssignmentManagement] Creating assignment:', assignmentData);
      
      // Call API to create assignment
      const response = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          title: assignmentData.title,
          description: assignmentData.description,
          classId: assignmentData.classId,
          dueDate: assignmentData.dueDate,
          fileUrl: assignmentData.fileUrl || null,
          createdBy: user.id // User ID from logged in user
        })
      });
      
      if (response.ok) {
        console.log('✅ [AssignmentManagement] Assignment created');
        // Reload assignments
        await loadData();
        setShowCreateModal(false);
      } else {
        console.error('❌ [AssignmentManagement] Failed to create assignment');
      }
    } catch (error) {
      console.error('❌ [AssignmentManagement] Error creating assignment:', error);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        console.log('✅ [AssignmentManagement] Assignment deleted');
        await loadData();
      }
    } catch (error) {
      console.error('❌ [AssignmentManagement] Error deleting assignment:', error);
    }
  };
  
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
                  <button
                    onClick={() => setSubmittingAssignment(assignment)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  >
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
          onCreate={handleCreateAssignment}
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
          submissions={submissions.filter(s => s.assignmentId === viewingSubmissions.id)}
          onClose={() => setViewingSubmissions(null)}
          onOpen={() => loadSubmissions(viewingSubmissions.id)}
          onGraded={loadSubmissions}
        />
      )}

      {/* Submit Assignment Modal (Student) */}
      {submittingAssignment && (
        <SubmitAssignmentModal
          assignment={submittingAssignment}
          studentId={user.id}
          onClose={() => setSubmittingAssignment(null)}
          onSubmitted={loadData}
        />
      )}
    </div>
  );
}

function CreateAssignmentModal({ onClose, onCreate, userName }: {
  onClose: () => void;
  onCreate: (assignment: any) => void;
  userName: string;
}) {
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    className: '',
    dueDate: '',
    fileUrl: ''
  });

  useEffect(() => {
    // Load classes from database
    const loadClasses = async () => {
      try {
        const response = await fetch(`${API_BASE}/classes`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadClasses();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = classes.find(c => c.id === e.target.value);
    setFormData({
      ...formData,
      classId: e.target.value,
      className: selectedClass?.name || ''
    });
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
                value={formData.classId}
                onChange={handleClassChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn lớp học...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
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

function SubmissionsModal({ assignment, submissions, onClose, onOpen, onGraded }: {
  assignment: Assignment;
  submissions: Submission[];
  onClose: () => void;
  onOpen: () => void;
  onGraded: (assignmentId: string) => void;
}) {
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    onOpen();
  }, [onOpen]);

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
          onSave={() => {
            setGradingSubmission(null);
            onGraded(assignment.id);
          }}
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
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      console.log('📝 [GradingModal] Grading submission:', submission.id);
      
      const response = await fetch(`${API_BASE}/submissions/${submission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          feedback: feedback
        })
      });
      
      if (response.ok) {
        console.log('✅ [GradingModal] Submission graded');
        onSave();
      } else {
        console.error('❌ [GradingModal] Failed to grade submission');
      }
    } catch (error) {
      console.error('❌ [GradingModal] Error grading submission:', error);
    } finally {
      setSaving(false);
    }
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
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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

function SubmitAssignmentModal({ assignment, studentId, onClose, onSubmitted }: {
  assignment: Assignment;
  studentId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      console.log('📝 [SubmitAssignmentModal] Submitting assignment:', assignment.id);
      
      const response = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentId: studentId,
          fileUrl: null // TODO: Implement file upload later
        })
      });
      
      if (response.ok) {
        console.log('✅ [SubmitAssignmentModal] Assignment submitted');
        onClose();
        onSubmitted();
      } else {
        console.error('❌ [SubmitAssignmentModal] Failed to submit assignment');
      }
    } catch (error) {
      console.error('❌ [SubmitAssignmentModal] Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Nộp bài tập - {assignment.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Nội dung bài tập</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nội dung bài tập..."
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">File đính kèm</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Kéo thả file hoặc click để chọn</p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
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