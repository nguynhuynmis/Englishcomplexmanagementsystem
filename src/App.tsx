import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import TestResetPasswordFlow from './components/TestResetPasswordFlow';
import ProfilePage from './components/ProfilePage';
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
import AttendanceManagement from './components/modules/AttendanceManagement';
import { checkDatabaseInitialization } from './utils/initDatabase';

export type UserRole = 'academic' | 'teacher' | 'student' | 'director';

export interface User {
  id: string;
  username: string;
  fullName: string; // Changed from fullname to match backend response
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // Changed from dateofbirth for consistency
  gender?: 'male' | 'female' | 'other';
  address?: string;
  parentName?: string; // Changed from parentname
  parentPhone?: string; // Changed from parentphone
  bio?: string;
  code?: string;
  teacherId?: number; // ID from teachers table
  studentId?: number; // ID from students table
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize database and check for logged in user
    const initialize = async () => {
      try {
        // Initialize database if needed
        await checkDatabaseInitialization();
        
        // Check if user is logged in from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Show loading while initializing database
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2baec0] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang khởi tạo hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/test-reset-password-flow" element={<TestResetPasswordFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
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

  // Wrapper components with navigation
  const StudentManagementWithNav = () => {
    const navigate = useNavigate();
    return <StudentManagement onNavigateToUserManagement={() => navigate('/dashboard/users?role=student&create=true')} />;
  };

  const TeacherManagementWithNav = () => {
    const navigate = useNavigate();
    return <TeacherManagement onNavigateToUserManagement={() => navigate('/dashboard/users?role=teacher&create=true')} />;
  };

  const UserManagementWithParams = () => {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') as 'student' | 'teacher' | null;
    const shouldCreate = params.get('create') === 'true';

    return (
      <UserManagement 
        initialRole={role || undefined} 
        initialViewMode={shouldCreate ? 'create' : 'list'}
      />
    );
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
          
          {/* Profile Page */}
          <Route path="profile" element={
            <ProfilePage 
              user={currentUser} 
              onUpdate={(updatedUser) => {
                const newUser = { ...currentUser, ...updatedUser };
                setCurrentUser(newUser);
                localStorage.setItem('currentUser', JSON.stringify(newUser));
              }}
            />
          } />
          
          {/* Management Modules */}
          <Route path="campus" element={<CampusManagement />} />
          <Route path="students" element={<StudentManagementWithNav />} />
          <Route path="teachers" element={<TeacherManagementWithNav />} />
          <Route path="classes" element={<ClassManagement user={currentUser} />} />
          <Route path="schedule" element={<ScheduleManagement user={currentUser} />} />
          <Route path="attendance" element={<AttendanceManagement user={currentUser} />} />
          <Route path="grades" element={<GradeManagement user={currentUser} />} />
          <Route path="documents" element={<DocumentManagement user={currentUser} />} />
          <Route path="assignments" element={<AssignmentManagement user={currentUser} />} />
          <Route path="feedback" element={<FeedbackManagement user={currentUser} />} />
          <Route path="reports" element={<ReportStatistics />} />
          <Route path="users" element={<UserManagementWithParams />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;