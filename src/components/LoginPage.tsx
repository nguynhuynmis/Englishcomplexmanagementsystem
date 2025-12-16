import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../App';
import { authAPI } from '../utils/api';
import { logo } from '../utils/images';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 [LoginPage] Attempting login with:', { username, password });

    try {
      const response = await authAPI.login(username, password);
      
      console.log('✅ [LoginPage] Login response:', response);
      
      if (response.user) {
        console.log('✅ [LoginPage] User data received:', response.user);
        console.log('🆔 [LoginPage] User ID:', response.user.id);
        console.log('🎭 [LoginPage] User role:', response.user.role);
        console.log('👨‍🏫 [LoginPage] Teacher ID:', response.user.teacherId, `(type: ${typeof response.user.teacherId})`);
        console.log('👨‍🎓 [LoginPage] Student ID:', response.user.studentId, `(type: ${typeof response.user.studentId})`);
        onLogin(response.user);
      } else {
        console.error('❌ [LoginPage] No user data in response');
        setError('Không nhận được thông tin người dùng');
      }
    } catch (err: any) {
      console.error('❌ [LoginPage] Login error:', err);
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #e0f5f8, #f0f9fb)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="English Complex Logo" className="h-16" />
          </div>
          <p className="text-gray-600">Let your feedback do the talking</p>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <Link
            to="/forgot-password"
            className="block w-full text-center hover:opacity-70"
            style={{ color: 'var(--brand-primary)' }}
          >
            Quên mật khẩu?
          </Link>
        </form>
      </div>
    </div>
  );
}