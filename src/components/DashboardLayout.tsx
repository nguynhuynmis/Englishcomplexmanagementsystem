import { Outlet, Link, useLocation } from 'react-router-dom';
import { User } from '../App';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    path: '/dashboard/academic',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['academic'],
  },
  {
    path: '/dashboard/teacher',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['teacher'],
  },
  {
    path: '/dashboard/student',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['student'],
  },
  {
    path: '/dashboard/director',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['director'],
  },
  {
    path: '/dashboard/campus',
    label: 'Quản lý cơ sở',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['academic'],
  },
  {
    path: '/dashboard/students',
    label: 'Quản lý học viên',
    icon: <Users className="w-5 h-5" />,
    roles: ['academic'],
  },
  {
    path: '/dashboard/teachers',
    label: 'Quản lý giáo viên',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['academic'],
  },
  {
    path: '/dashboard/classes',
    label: 'Quản lý lớp học',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['academic', 'teacher'],
  },
  {
    path: '/dashboard/schedule',
    label: 'Quản lý lịch học',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['academic', 'teacher', 'student'],
  },
  {
    path: '/dashboard/grades',
    label: 'Quản lý điểm',
    icon: <FileText className="w-5 h-5" />,
    roles: ['academic', 'teacher', 'student'],
  },
  {
    path: '/dashboard/documents',
    label: 'Tài liệu - Thông báo',
    icon: <FileText className="w-5 h-5" />,
    roles: ['academic', 'teacher', 'student'],
  },
  {
    path: '/dashboard/assignments',
    label: 'Bài tập',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['teacher', 'student'],
  },
  {
    path: '/dashboard/feedback',
    label: 'Phản hồi - Hỗ trợ',
    icon: <MessageSquare className="w-5 h-5" />,
    roles: ['academic', 'teacher', 'student'],
  },
  {
    path: '/dashboard/reports',
    label: 'Báo cáo - Thống kê',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['academic', 'director'],
  },
  {
    path: '/dashboard/users',
    label: 'Quản lý người dùng',
    icon: <Settings className="w-5 h-5" />,
    roles: ['academic'],
  },
];

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span style={{ color: 'var(--brand-primary-900)' }}>English Complex</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  location.pathname === item.path
                    ? 'border-r-2'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={location.pathname === item.path ? { 
                  backgroundColor: 'var(--brand-primary-light)', 
                  color: 'var(--brand-primary)',
                  borderRightColor: 'var(--brand-primary)'
                } : {}}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate">{user.fullName}</p>
                <p className="text-gray-500 text-sm">
                  {user.role === 'academic' && 'Học vụ'}
                  {user.role === 'teacher' && 'Giáo viên'}
                  {user.role === 'student' && 'Học viên'}
                  {user.role === 'director' && 'Giám đốc'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}