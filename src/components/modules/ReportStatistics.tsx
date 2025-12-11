import { useState, useMemo } from 'react';
import { Download, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { students, teachers, classes, campuses } from '../../data/mockData';

export default function ReportStatistics() {
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Calculate real statistics from mock data
  const stats = useMemo(() => {
    const filteredStudents = filterCampus === 'all' 
      ? students 
      : students.filter(s => s.campus === filterCampus);
    
    const filteredClasses = filterCampus === 'all'
      ? classes
      : classes.filter(c => c.campus === (filterCampus === 'CS001' ? 'Cơ sở Long Biên' : 'Cơ sở Hai Bà Trưng'));

    const filteredTeachers = filterCampus === 'all'
      ? teachers
      : teachers.filter(t => t.campus === filterCampus);

    // Total statistics
    const totalStudents = filteredStudents.length;
    const totalClasses = filteredClasses.filter(c => c.status === 'active').length;
    const totalTeachers = filteredTeachers.length;
    const totalEnrolledInClasses = filteredClasses.reduce((sum, c) => sum + c.totalStudents, 0);

    // Students by campus
    const studentsByCampusData = campuses.map(campus => {
      const campusStudents = students.filter(s => s.campus === campus.id);
      const campusClasses = classes.filter(c => 
        c.campus === campus.name && c.status === 'active'
      );
      return {
        name: campus.name,
        students: campusStudents.length,
        classes: campusClasses.length,
      };
    });

    // Classes by level
    const classesByLevel = ['Foundation', 'Beginner', 'Intermediate', 'Advanced'].map(level => {
      const levelClasses = filteredClasses.filter(c => c.level === level);
      return {
        name: level,
        classes: levelClasses.length,
        students: levelClasses.reduce((sum, c) => sum + c.totalStudents, 0),
      };
    });

    // Teacher statistics
    const teacherStats = filteredTeachers.map(teacher => {
      const teacherClasses = filteredClasses.filter(c => c.teacher === teacher.fullName);
      const totalStudentsInClasses = teacherClasses.reduce((sum, c) => sum + c.totalStudents, 0);
      
      return {
        name: teacher.fullName,
        classes: teacherClasses.length,
        students: totalStudentsInClasses,
        ielts: teacher.ieltsScore || 0,
      };
    });

    // Class performance (capacity utilization)
    const classPerformance = filteredClasses
      .filter(c => c.status === 'active')
      .map(cls => ({
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
        value: students.filter(s => s.status === 'active').length, 
        color: 'var(--brand-primary)' 
      },
      { 
        name: 'Đã nghỉ', 
        value: students.filter(s => s.status === 'inactive').length, 
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
  }, [filterCampus]);

  const exportToExcel = () => {
    alert('Xuất báo cáo Excel thành công!');
  };

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

          <div>
            <label className="block text-gray-700 mb-2">Lọc theo lớp</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Lọc theo giảng viên</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            >
              <option value="all">Tất cả giảng viên</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Lọc theo thời gian</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              />
            </div>
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
          <h2 className="text-gray-900 mb-1">{stats.totalStudents}</h2>
          <p className="text-sm" style={{ color: '#00b894' }}>
            Đang học: {stats.statusDistribution[0].value}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Tổng lớp học</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-100)' }}>
              <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">{stats.totalClasses}</h2>
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
          <h2 className="text-gray-900 mb-1">{stats.totalTeachers}</h2>
          <p className="text-sm text-gray-600">
            Đang giảng dạy
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Sĩ số trung bình</p>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-yellow-light)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#ffd97a' }} />
            </div>
          </div>
          <h2 className="text-gray-900 mb-1">
            {stats.totalClasses > 0 
              ? Math.round(stats.totalEnrolledInClasses / stats.totalClasses) 
              : 0}
          </h2>
          <p className="text-sm text-gray-600">
            Học viên/lớp
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
        {/* Classes by Level */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Lớp học theo trình độ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.classesByLevel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="classes" fill="var(--brand-primary)" name="Số lớp" />
              <Bar dataKey="students" fill="#ffe9ae" name="Số học viên" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Phân bố trạng thái</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

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
              {stats.teacherStats.map((teacher, index) => (
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
              ))}
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
              {stats.classPerformance.map((cls, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}