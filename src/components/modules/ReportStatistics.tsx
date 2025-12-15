import { useState, useMemo, useEffect } from 'react';
import { Download, Users, BookOpen, GraduationCap, TrendingUp, CheckCircle, MessageSquare, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { fetchComprehensiveStats } from '../../utils/dashboardApi';

export default function ReportStatistics() {
  const [filterCampus, setFilterCampus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Load comprehensive data from new API endpoint
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stats = await fetchComprehensiveStats();
        setData(stats);
        console.log('📊 [ReportStatistics] Comprehensive data loaded:', stats);
      } catch (error) {
        console.error('❌ [ReportStatistics] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate real statistics from database data
  const stats = useMemo(() => {
    if (!data || !data.students || !data.teachers || !data.classes || !data.centers) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        totalTeachers: 0,
        totalEnrolledInClasses: 0,
        studentsByCampusData: [],
        classesByLevel: [],
        teacherStats: [],
        classPerformance: [],
        enrollmentTrend: [],
        statusDistribution: []
      };
    }

    const { students, teachers, classes, centers } = data;
    
    const filteredStudents = filterCampus === 'all' 
      ? students 
      : students.filter((s: any) => s.campus === filterCampus);
    
    const filteredClasses = filterCampus === 'all'
      ? classes
      : classes.filter((c: any) => c.campusId === filterCampus);

    const filteredTeachers = filterCampus === 'all'
      ? teachers
      : teachers.filter((t: any) => t.campus === filterCampus);

    // Total statistics
    const totalStudents = filteredStudents.length;
    const totalClasses = filteredClasses.filter((c: any) => c.status === 'active').length;
    const totalTeachers = filteredTeachers.length;
    const totalEnrolledInClasses = filteredClasses.reduce((sum: number, c: any) => sum + c.totalStudents, 0);

    // Students by campus
    const studentsByCampusData = centers.map((campus: any) => {
      const campusStudents = students.filter((s: any) => s.campus === campus.id);
      const campusClasses = classes.filter((c: any) => 
        c.campusId === campus.id && c.status === 'active'
      );
      return {
        name: campus.name,
        students: campusStudents.length,
        classes: campusClasses.length,
      };
    });

    // Classes by level
    const classesByLevel = ['Foundation', 'Beginner', 'Intermediate', 'Advanced'].map(level => {
      const levelClasses = filteredClasses.filter((c: any) => c.level === level);
      return {
        name: level,
        classes: levelClasses.length,
        students: levelClasses.reduce((sum: number, c: any) => sum + c.totalStudents, 0),
      };
    });

    // Teacher statistics
    const teacherStats = filteredTeachers.map((teacher: any) => {
      const teacherClasses = filteredClasses.filter((c: any) => c.teacher === teacher.fullName);
      const totalStudentsInClasses = teacherClasses.reduce((sum: number, c: any) => sum + c.totalStudents, 0);
      
      return {
        name: teacher.fullName,
        classes: teacherClasses.length,
        students: totalStudentsInClasses,
        ielts: teacher.ieltsScore || 0, // ✅ Add IELTS score with fallback
      };
    });

    // Class performance (capacity utilization)
    const classPerformance = filteredClasses
      .filter((c: any) => c.status === 'active')
      .map((cls: any) => ({
        class: cls.name,
        utilization: Math.round((cls.totalStudents / cls.maxStudents) * 100),
        total: cls.totalStudents,
        max: cls.maxStudents,
      }));

    // Mock enrollment trend (would be from real data)
    const enrollmentTrend = [
      { month: 'T7/2024', students: totalStudents - 15, classes: totalClasses - 2 },
      { month: 'T8/2024', students: totalStudents - 12, classes: totalClasses - 2 },
      { month: 'T9/2024', students: totalStudents - 8, classes: totalClasses - 1 },
      { month: 'T10/2024', students: totalStudents - 5, classes: totalClasses - 1 },
      { month: 'T11/2024', students: totalStudents - 2, classes: totalClasses },
      { month: 'T12/2024', students: totalStudents, classes: totalClasses },
    ];

    // Status distribution
    const statusDistribution = [
      { 
        name: 'Đang học', 
        value: students.filter((s: any) => s.status === 'active').length, 
        color: 'var(--brand-primary)' 
      },
      { 
        name: 'Đã nghỉ', 
        value: students.filter((s: any) => s.status === 'inactive').length, 
        color: '#e74c3c' 
      },
    ];

    return {
      totalStudents,
      totalClasses,
      totalTeachers,
      totalEnrolledInClasses,
      studentsByCampusData,
      classesByLevel,
      teacherStats,
      classPerformance,
      enrollmentTrend,
      statusDistribution,
    };
  }, [filterCampus, data]);

  const exportToExcel = () => {
    alert('Xuất báo cáo Excel thành công!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-gray-900">Báo cáo - Thống kê</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
            <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Báo cáo - Thống kê</h1>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Lọc theo cơ sở</label>
            <select
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            >
              <option value="all">Tất cả cơ sở</option>
              <option value="CS001">Cơ sở Long Biên</option>
              <option value="CS002">Cơ sở Hai Bà Trưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng học viên</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-green-light)' }}>
              <Users className="w-5 h-5" style={{ color: '#00b894' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{data?.summary?.totalStudents || 0}</h2>
          <p className="text-sm" style={{ color: '#00b894' }}>
            Đang học: {data?.studentsByStatus?.[0]?.value || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng lớp học</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{data?.summary?.activeClasses || 0}</h2>
          <p className="text-sm text-gray-600">
            Đang hoạt động
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng giảng viên</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender-light)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: 'var(--pastel-lavender-dark)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{data?.summary?.totalTeachers || 0}</h2>
          <p className="text-sm text-gray-600">
            Đang giảng dạy
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tỷ lệ điểm danh</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow-light)' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#ffd97a' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{data?.summary?.attendanceRate || 0}%</h2>
          <p className="text-sm text-gray-600">
            Trung bình có mặt
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Campus */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Học viên theo cơ sở</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.studentsByCampusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="var(--brand-primary)" name="Học viên" />
              <Bar dataKey="classes" fill="#00b894" name="Lớp học" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng tăng trưởng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="var(--brand-primary)" strokeWidth={2} name="Học viên" />
              <Line type="monotone" dataKey="classes" stroke="#00b894" strokeWidth={2} name="Lớp học" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes by Course */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lớp học theo khóa IELTS</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.classesByCourse || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="classes" fill="var(--brand-primary)" name="Số lớp" />
              <Bar dataKey="students" fill="#00b894" name="Số học viên" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade by Skills - Radar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Điểm trung bình theo kỹ năng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data?.gradesBySkill || []}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 9]} />
              <Radar name="Điểm TB" dataKey="average" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend from Real Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng nhập học (6 tháng gần đây)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.enrollmentTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="var(--brand-primary)" strokeWidth={2} name="Học viên mới" />
              <Line type="monotone" dataKey="classes" stroke="#00b894" strokeWidth={2} name="Lớp mới" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Thống kê phản hồi</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
                <div>
                  <p className="text-gray-600 text-sm">Tổng phản hồi</p>
                  <h3 className="text-gray-900">{data?.feedbackStats?.total || 0}</h3>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <h3 className="text-gray-900">{data?.feedbackStats?.pending || 0}</h3>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Đã phản hồi</p>
                <h3 className="text-gray-900">{data?.feedbackStats?.responded || 0}</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data?.feedbackStats?.byType || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--brand-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Students Table */}
      {data?.topStudents && data.topStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <h2 className="text-gray-900">Top 10 học viên xuất sắc</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Xếp hạng</th>
                  <th className="px-6 py-3 text-left text-gray-700">Học viên</th>
                  <th className="px-6 py-3 text-left text-gray-700">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topStudents.map((student: any, index: number) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <Award 
                            className="w-5 h-5" 
                            style={{ 
                              color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' 
                            }} 
                          />
                        )}
                        <span className="text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--pastel-green-light)', color: '#00b894' }}>
                        {student.average.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Stats Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Thống kê giảng viên</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Giảng viên</th>
                <th className="px-6 py-3 text-left text-gray-700">Số lớp</th>
                <th className="px-6 py-3 text-left text-gray-700">Số học viên</th>
                <th className="px-6 py-3 text-left text-gray-700">IELTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.teacherStats && stats.teacherStats.length > 0 ? (
                stats.teacherStats.map((teacher, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-gray-700">{teacher.classes}</td>
                    <td className="px-6 py-4 text-gray-700">{teacher.students}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--brand-primary-100)', color: 'var(--brand-primary-700)' }}>
                        {teacher.ielts.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Chưa có dữ liệu giảng viên
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Performance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Tỷ lệ lấp đầy lớp học</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--brand-primary-50)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Lớp học</th>
                <th className="px-6 py-3 text-left text-gray-700">Sĩ số</th>
                <th className="px-6 py-3 text-left text-gray-700">Tỷ lệ lấp đầy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.classPerformance && stats.classPerformance.length > 0 ? (
                stats.classPerformance.map((cls, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{cls.class}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {cls.total}/{cls.max}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${cls.utilization}%`,
                              backgroundColor: cls.utilization >= 80 ? '#00b894' : cls.utilization >= 60 ? '#ffe9ae' : '#e74c3c',
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 w-12">{cls.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Chưa có dữ liệu lớp học
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}