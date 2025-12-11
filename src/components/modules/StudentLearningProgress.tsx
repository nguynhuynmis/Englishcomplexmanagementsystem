import { TrendingUp, BookOpen, CheckCircle, Clock, Award, MessageSquare, Target, Calendar } from 'lucide-react';
import type { Student } from '../../data/mockData';

interface LearningProgressProps {
  studentId: string;
}

// Mock data cho quá trình học
const mockLearningData = {
  // Thống kê tổng quan
  stats: {
    totalClasses: 2,
    currentClass: 'IELTS Foundation - LB01',
    attendanceRate: 92,
    totalLessons: 48,
    attendedLessons: 44,
    lateLessons: 2,
    absentLessons: 2,
    homeworkSubmitted: 38,
    homeworkTotal: 40,
    homeworkRate: 95,
  },
  
  // Lịch sử lớp học
  classHistory: [
    {
      id: 'CL001',
      name: 'IELTS Foundation - LB01',
      level: 'Foundation',
      startDate: '2024-09-01',
      endDate: null,
      status: 'active',
      teacher: 'Nguyễn Thị Mai Lan',
      progress: 75,
    },
    {
      id: 'CL000',
      name: 'Pre-IELTS - LB05',
      level: 'Pre-IELTS',
      startDate: '2024-06-01',
      endDate: '2024-08-28',
      status: 'completed',
      teacher: 'Trần Văn Bình',
      progress: 100,
    },
  ],
  
  // Kết quả học tập theo kỳ
  examResults: [
    {
      examType: 'Input Test',
      date: '2024-09-01',
      overall: 4.0,
      listening: 4.5,
      reading: 4.0,
      writing: 3.5,
      speaking: 4.0,
    },
    {
      examType: 'Giữa kỳ',
      date: '2024-10-15',
      overall: 5.0,
      listening: 5.5,
      reading: 5.0,
      writing: 4.5,
      speaking: 5.0,
    },
    {
      examType: 'Thi thử lần 1',
      date: '2024-11-20',
      overall: 5.5,
      listening: 6.0,
      reading: 5.5,
      writing: 5.0,
      speaking: 5.5,
    },
    {
      examType: 'Cuối kỳ (Dự kiến)',
      date: '2025-01-10',
      overall: null,
      listening: null,
      reading: null,
      writing: null,
      speaking: null,
    },
  ],
  
  // Mục tiêu
  goal: {
    targetBand: 6.5,
    currentBand: 5.5,
    deadline: '2025-03-01',
    progress: 65,
  },
  
  // Nhận xét giảng viên
  teacherComments: [
    {
      id: 1,
      date: '2024-11-28',
      teacher: 'Nguyễn Thị Mai Lan',
      comment: 'Em Minh có sự tiến bộ rõ rệt trong kỹ năng Listening và Reading. Tuy nhiên, em cần tập trung hơn vào Writing, đặc biệt là Task 2. Em nên luyện viết ít nhất 3 bài/tuần và nhờ thầy cô chấm.',
      skills: { listening: 'good', reading: 'good', writing: 'fair', speaking: 'good' },
    },
    {
      id: 2,
      date: '2024-10-25',
      teacher: 'Nguyễn Thị Mai Lan',
      comment: 'Em Minh tham gia tích cực trong lớp, luôn hoàn thành bài tập đầy đủ. Phát âm đã cải thiện đáng kể sau khi luyện tập theo hướng dẫn. Tiếp tục duy trì!',
      skills: { listening: 'fair', reading: 'good', writing: 'fair', speaking: 'fair' },
    },
    {
      id: 3,
      date: '2024-09-20',
      teacher: 'Nguyễn Thị Mai Lan',
      comment: 'Em có nền tảng ngữ pháp tốt nhưng còn e ngại khi Speaking. Em nên tham gia thêm các buổi Speaking Club để tự tin hơn.',
      skills: { listening: 'fair', reading: 'good', writing: 'fair', speaking: 'needs_improvement' },
    },
  ],
  
  // Bài tập gần đây
  recentHomework: [
    { id: 1, title: 'Unit 8 - Reading Practice', dueDate: '2024-12-08', submitDate: '2024-12-07', score: 8.5, status: 'graded' },
    { id: 2, title: 'Unit 8 - Writing Task 2', dueDate: '2024-12-08', submitDate: '2024-12-08', score: 7.0, status: 'graded' },
    { id: 3, title: 'Unit 9 - Vocabulary Quiz', dueDate: '2024-12-10', submitDate: '2024-12-09', score: 9.0, status: 'graded' },
    { id: 4, title: 'Unit 9 - Listening Practice', dueDate: '2024-12-12', submitDate: null, score: null, status: 'pending' },
    { id: 5, title: 'Unit 10 - Grammar Exercises', dueDate: '2024-12-15', submitDate: null, score: null, status: 'pending' },
  ],
};

export default function StudentLearningProgress({ studentId }: LearningProgressProps) {
  const { stats, classHistory, examResults, goal, teacherComments, recentHomework } = mockLearningData;

  const getSkillBadgeColor = (skill: string) => {
    switch (skill) {
      case 'good':
        return { bg: 'var(--pastel-green-light)', color: '#00b894' };
      case 'fair':
        return { bg: 'var(--pastel-yellow-light)', color: '#f39c12' };
      case 'needs_improvement':
        return { bg: '#fee', color: '#d63031' };
      default:
        return { bg: '#f0f0f0', color: '#666' };
    }
  };

  const getSkillLabel = (skill: string) => {
    switch (skill) {
      case 'good': return 'Tốt';
      case 'fair': return 'Khá';
      case 'needs_improvement': return 'Cần cải thiện';
      default: return skill;
    }
  };

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Tỷ lệ điểm danh</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-gray-900 mb-1">{stats.attendanceRate}%</p>
          <p className="text-xs text-gray-500">{stats.attendedLessons}/{stats.totalLessons} buổi</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Bài tập</p>
            <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
          </div>
          <p className="text-2xl text-gray-900 mb-1">{stats.homeworkRate}%</p>
          <p className="text-xs text-gray-500">{stats.homeworkSubmitted}/{stats.homeworkTotal} bài</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Điểm hiện tại</p>
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-1">{goal.currentBand.toFixed(1)}</p>
          <p className="text-xs text-gray-500">IELTS Overall</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Mục tiêu</p>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl text-gray-900 mb-1">{goal.targetBand.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Target band</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Biểu đồ & Lịch sử */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tiến độ học tập */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                Tiến độ học tập
              </h2>
            </div>
            <div className="p-6">
              {/* Biểu đồ tiến độ điểm */}
              <div className="mb-6">
                <div className="flex items-end justify-between h-48 gap-3">
                  {examResults.map((exam, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                      {exam.overall !== null ? (
                        <>
                          <div 
                            className="w-full rounded-t-lg transition-all hover:opacity-80"
                            style={{ 
                              backgroundColor: 'var(--brand-primary)',
                              height: `${(exam.overall / 9) * 100}%`,
                              minHeight: '30px'
                            }}
                          />
                          <p className="mt-2 text-sm" style={{ color: 'var(--brand-primary)' }}>
                            {exam.overall.toFixed(1)}
                          </p>
                        </>
                      ) : (
                        <div className="w-full h-8 rounded-t-lg border-2 border-dashed border-gray-300 mb-2" />
                      )}
                      <p className="text-xs text-gray-600 text-center mt-2 line-clamp-2">
                        {exam.examType}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(exam.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Điểm 4 kỹ năng gần nhất */}
              <div className="grid grid-cols-4 gap-3">
                {['Listening', 'Reading', 'Writing', 'Speaking'].map((skill, idx) => {
                  const latestScore = examResults.filter(e => e.overall !== null).slice(-1)[0];
                  const scores = [latestScore?.listening, latestScore?.reading, latestScore?.writing, latestScore?.speaking];
                  const score = scores[idx];
                  
                  return (
                    <div key={skill} className="p-3 rounded-lg border" style={{ borderColor: 'var(--brand-primary-200)' }}>
                      <p className="text-xs text-gray-600 mb-1">{skill}</p>
                      <p className="text-xl" style={{ color: 'var(--brand-primary)' }}>
                        {score?.toFixed(1) || '-'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lịch sử lớp học */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                Lịch sử lớp học
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {classHistory.map((cls) => (
                <div key={cls.id} className="border-l-4 pl-4" style={{ borderColor: cls.status === 'active' ? 'var(--brand-primary)' : '#ccc' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-600">Giảng viên: {cls.teacher}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: cls.status === 'active' ? 'var(--pastel-green-light)' : '#f0f0f0',
                        color: cls.status === 'active' ? '#00b894' : '#666',
                      }}
                    >
                      {cls.status === 'active' ? 'Đang học' : 'Đã hoàn thành'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>{new Date(cls.startDate).toLocaleDateString('vi-VN')}</span>
                    <span>-</span>
                    <span>{cls.endDate ? new Date(cls.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ backgroundColor: 'var(--brand-primary)', width: `${cls.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng điểm chi tiết */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Bảng điểm chi tiết
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Kỳ thi</th>
                    <th className="px-4 py-3 text-left text-gray-700">Ngày thi</th>
                    <th className="px-4 py-3 text-center text-gray-700">Overall</th>
                    <th className="px-4 py-3 text-center text-gray-700">Listening</th>
                    <th className="px-4 py-3 text-center text-gray-700">Reading</th>
                    <th className="px-4 py-3 text-center text-gray-700">Writing</th>
                    <th className="px-4 py-3 text-center text-gray-700">Speaking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examResults.map((exam, index) => (
                    <tr key={index} className={exam.overall === null ? 'opacity-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{exam.examType}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(exam.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                          {exam.overall?.toFixed(1) || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{exam.listening?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{exam.reading?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{exam.writing?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{exam.speaking?.toFixed(1) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cột phải - Nhận xét & Bài tập */}
        <div className="space-y-6">
          {/* Mục tiêu */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Mục tiêu
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Target band</span>
                  <span className="text-gray-900">{goal.targetBand.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Điểm hiện tại</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{goal.currentBand.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Thời hạn</span>
                  <span className="text-gray-900">{new Date(goal.deadline).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tiến độ</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ backgroundColor: 'var(--brand-primary)', width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nhận xét giảng viên */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                Nhận xét giảng viên
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {teacherComments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-900">{comment.teacher}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{comment.comment}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(comment.skills).map(([skill, level]) => {
                      const colors = getSkillBadgeColor(level);
                      return (
                        <div
                          key={skill}
                          className="px-2 py-1 rounded text-xs text-center"
                          style={{ backgroundColor: colors.bg, color: colors.color }}
                        >
                          {skill === 'listening' && 'L'}{skill === 'reading' && 'R'}
                          {skill === 'writing' && 'W'}{skill === 'speaking' && 'S'}: {getSkillLabel(level)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bài tập gần đây */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                Bài tập gần đây
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {recentHomework.map((hw) => (
                <div key={hw.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {hw.status === 'graded' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{hw.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Hạn: {new Date(hw.dueDate).toLocaleDateString('vi-VN')}</span>
                      {hw.score !== null && (
                        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                          {hw.score}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}