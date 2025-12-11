import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import logoHorizontal from 'figma:asset/dd0c38c752428dd137a2714c0bfc56ea8f160c00.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    // Simulate sending reset email
    // In production: Send email with link like:
    // https://yourapp.com/reset-password?token=abc123&email=user@example.com
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #e0f5f8, #f0f9fb)' }}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logoHorizontal} alt="English Complex Logo" className="h-16" />
            </div>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
              </div>
            </div>
            <h2 className="mb-2" style={{ color: 'var(--brand-primary-900)' }}>Kiểm tra email của bạn</h2>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Nếu bạn không nhận được email trong vài phút, vui lòng kiểm tra thư mục spam hoặc thử lại.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #e0f5f8, #f0f9fb)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoHorizontal} alt="English Complex Logo" className="h-16" />
          </div>
          <h1 className="mb-2" style={{ color: 'var(--brand-primary-900)' }}>Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Địa chỉ email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
                placeholder="email@example.com"
                required
              />
            </div>
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
            Lấy lại mật khẩu
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </form>
      </div>
    </div>
  );
}