import { useState } from 'react';
import { User, UserRole } from '../App';
import { GraduationCap } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock users for demo
const mockUsers = [
  { id: '1', username: 'hocvu01', password: 'hocvu123', fullName: 'Nguyễn Văn A', role: 'academic' as UserRole },
  { id: '2', username: 'gv01', password: 'gv123', fullName: 'Trần Thị B', role: 'teacher' as UserRole },
  { id: '3', username: 'hv01', password: 'hv123', fullName: 'Lê Văn C', role: 'student' as UserRole },
  { id: '4', username: 'gd01', password: 'gd123', fullName: 'Phạm Thị D', role: 'director' as UserRole },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      });
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #e0f5f8, #f0f9fb)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2" style={{ color: 'var(--brand-primary-900)' }}>English Complex</h1>
          <p className="text-gray-600">Hệ thống quản lý trung tâm Anh ngữ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Đăng nhập
          </button>

          <button
            type="button"
            className="w-full hover:opacity-70"
            style={{ color: 'var(--brand-primary)' }}
          >
            Quên mật khẩu?
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Tài khoản demo:</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Học vụ:</span> hocvu01 / hocvu123</p>
            <p><span className="font-medium">Giáo viên:</span> gv01 / gv123</p>
            <p><span className="font-medium">Học viên:</span> hv01 / hv123</p>
            <p><span className="font-medium">Giám đốc:</span> gd01 / gd123</p>
          </div>
        </div>
      </div>
    </div>
  );
}