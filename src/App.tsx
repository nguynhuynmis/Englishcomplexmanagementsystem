import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import AcademicDashboard from './components/dashboards/AcademicDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import DirectorDashboard from './components/dashboards/DirectorDashboard';
import StudentManagement from './components/modules/StudentManagement';
import TeacherManagement from './components/modules/TeacherManagement';
import ClassManagement from './components/modules/ClassManagement';
import ScheduleManagement from './components/modules/ScheduleManagement';
import GradeManagement from './components/modules/GradeManagement';
import DocumentManagement from './components/modules/DocumentManagement';
import AssignmentManagement from './components/modules/AssignmentManagement';
import FeedbackManagement from './components/modules/FeedbackManagement';
import ReportStatistics from './components/modules/ReportStatistics';
import UserManagement from './components/modules/UserManagement';
import CampusManagement from './components/modules/CampusManagement';

export type UserRole = 'academic' | 'teacher' | 'student' | 'director';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const getDashboardRoute = () => {
    switch (currentUser.role) {
      case 'academic':
        return '/dashboard/academic';
      case 'teacher':
        return '/dashboard/teacher';
      case 'student':
        return '/dashboard/student';
      case 'director':
        return '/dashboard/director';
      default:
        return '/dashboard/academic';
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
        
        <Route path="/dashboard/*" element={<DashboardLayout user={currentUser} onLogout={handleLogout} />}>
          {/* Academic Dashboard */}
          <Route path="academic" element={<AcademicDashboard />} />
          
          {/* Teacher Dashboard */}
          <Route path="teacher" element={<TeacherDashboard user={currentUser} />} />
          
          {/* Student Dashboard */}
          <Route path="student" element={<StudentDashboard user={currentUser} />} />
          
          {/* Director Dashboard */}
          <Route path="director" element={<DirectorDashboard />} />
          
          {/* Management Modules */}
          <Route path="campus" element={<CampusManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="schedule" element={<ScheduleManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="documents" element={<DocumentManagement user={currentUser} />} />
          <Route path="assignments" element={<AssignmentManagement user={currentUser} />} />
          <Route path="feedback" element={<FeedbackManagement user={currentUser} />} />
          <Route path="reports" element={<ReportStatistics />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
