import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const studentsByCampus = [
  { name: 'Cơ sở 1', students: 450, classes: 15 },
  { name: 'Cơ sở 2', students: 387, classes: 12 },
  { name: 'Cơ sở 3', students: 410, classes: 15 },
];

const enrollmentTrend = [
  { month: 'T7/2025', students: 1100, revenue: 550 },
  { month: 'T8/2025', students: 1150, revenue: 575 },
  { month: 'T9/2025', students: 1180, revenue: 590 },
  { month: 'T10/2025', students: 1200, revenue: 600 },
  { month: 'T11/2025', students: 1230, revenue: 615 },
  { month: 'T12/2025', students: 1247, revenue: 624 },
];

const gradeDistribution = [
  { name: 'Xuất sắc (9-10)', value: 28, color: '#10b981' },
  { name: 'Giỏi (8-9)', value: 35, color: '#3b82f6' },
  { name: 'Khá (7-8)', value: 25, color: '#f59e0b' },
  { name: 'Trung bình (6-7)', value: 10, color: '#ef4444' },
  { name: 'Yếu (<6)', value: 2, color: '#6b7280' },
];

const classPerformance = [
  { class: 'IELTS Beginner A1', avgGrade: 8.5, attendance: 95, completion: 90 },
  { class: 'IELTS Beginner A2', avgGrade: 8.2, attendance: 92, completion: 88 },
  { class: 'IELTS Intermediate B1', avgGrade: 8.8, attendance: 96, completion: 92 },
  { class: 'IELTS Advanced C1', avgGrade: 9.0, attendance: 97, completion: 95 },
  { class: 'IELTS Master', avgGrade: 9.3, attendance: 98, completion: 97 },
];

const teacherStats = [
  { name: 'Trần Thị B', classes: 3, students: 45, avgRating: 9.5, avgGrade: 8.7 },
  { name: 'Nguyễn Văn C', classes: 2, students: 30, avgRating: 9.2, avgGrade: 8.5 },
  { name: 'Lê Thị D', classes: 2, students: 27, avgRating: 9.0, avgGrade: 8.8 },
  { name: 'Phạm Văn E', classes: 3, students: 38, avgRating: 8.8, avgGrade: 8.4 },
  { name: 'Hoàng Thị F', classes: 2, students: 25, avgRating: 8.5, avgGrade: 8.2 },
];

export default function ReportStatistics() {
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const handleExport = () => {
    alert('Xuất báo cáo Excel thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Báo cáo - Thống kê</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Lọc theo cơ sở</label>
            <select
              value={filterCampus}
              onChange={(e) => setFilterCampus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả cơ sở</option>
              <option value="cs1">Cơ sở 1</option>
              <option value="cs2">Cơ sở 2</option>
              <option value="cs3">Cơ sở 3</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Lọc theo tháng</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả tháng</option>
              <option value="12/2025">Tháng 12/2025</option>
              <option value="11/2025">Tháng 11/2025</option>
              <option value="10/2025">Tháng 10/2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Tổng học viên</p>
          <p className="text-gray-900">1,247</p>
          <p className="text-green-600 text-sm mt-1">+12% so với tháng trước</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Tổng lớp học</p>
          <p className="text-gray-900">42</p>
          <p className="text-green-600 text-sm mt-1">+5% so với tháng trước</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Tổng giáo viên</p>
          <p className="text-gray-900">28</p>
          <p className="text-green-600 text-sm mt-1">+3% so với tháng trước</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Điểm TB toàn trung tâm</p>
          <p className="text-gray-900">8.6</p>
          <p className="text-green-600 text-sm mt-1">+0.3 so với tháng trước</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Xu hướng tăng trưởng học viên</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Số học viên" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students by Campus */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Học viên & Lớp học theo cơ sở</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByCampus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" name="Học viên" />
              <Bar dataKey="classes" fill="#10b981" name="Lớp học" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Phân bố điểm số (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Hiệu suất lớp học</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {classPerformance.map((classItem, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 mb-3">{classItem.class}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Điểm TB</p>
                    <p className="text-gray-900">{classItem.avgGrade}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Chuyên cần</p>
                    <p className="text-gray-900">{classItem.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Hoàn thành</p>
                    <p className="text-gray-900">{classItem.completion}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Thống kê giáo viên</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Giáo viên</th>
                <th className="px-6 py-3 text-center text-gray-700">Số lớp</th>
                <th className="px-6 py-3 text-center text-gray-700">Số học viên</th>
                <th className="px-6 py-3 text-center text-gray-700">Đánh giá TB</th>
                <th className="px-6 py-3 text-center text-gray-700">Điểm TB lớp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teacherStats.map((teacher, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{teacher.classes}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{teacher.students}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-900">{teacher.avgRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded ${
                      teacher.avgGrade >= 9 ? 'bg-green-100 text-green-700' :
                      teacher.avgGrade >= 8 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {teacher.avgGrade}
                    </span>
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
