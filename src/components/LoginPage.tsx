import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../App';
import { students, teachers, academicStaff, directors } from '../data/mockData';
import logoHorizontal from 'figma:asset/dd0c38c752428dd137a2714c0bfc56ea8f160c00.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock users mapping from data
const getAllUsers = () => {
  const allUsers: any[] = [];
  
  // Add students
  students.forEach(s => allUsers.push({
    ...s,
    role: 'student' as UserRole,
    password: s.username // password same as username for demo
  }));
  
  // Add teachers
  teachers.forEach(t => allUsers.push({
    ...t,
    role: 'teacher' as UserRole,
    password: t.username
  }));
  
  // Add academic staff
  academicStaff.forEach(a => allUsers.push({
    ...a,
    role: 'academic' as UserRole,
    password: a.username
  }));
  
  // Add directors
  directors.forEach(d => allUsers.push({
    ...d,
    role: 'director' as UserRole,
    password: d.username
  }));
  
  return allUsers;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = getAllUsers().find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        parentName: user.parentName,
        parentPhone: user.parentPhone,
        bio: user.bio,
        code: user.code,
        avatar: user.avatar,
      });
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #e0f5f8, #f0f9fb)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoHorizontal} alt="English Complex Logo" className="h-16" />
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