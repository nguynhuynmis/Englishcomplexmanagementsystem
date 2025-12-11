/**
 * TEST PAGE - Chỉ để demo flow Quên mật khẩu
 * 
 * Flow hoàn chỉnh:
 * 1. User vào trang Login -> Click "Quên mật khẩu?"
 * 2. Nhập email -> Gửi yêu cầu
 * 3. Hệ thống gửi email với link chứa token
 * 4. User click link từ email: /reset-password?token=xxx&email=user@example.com
 * 5. Nhập mật khẩu mới -> Hoàn tất
 * 
 * Link test:
 * - Có token: /reset-password?token=demo123&email=test@englishcomplex.edu.vn
 * - Không có token: /reset-password (sẽ báo lỗi)
 */

import { Link } from 'react-router-dom';

export default function TestResetPasswordFlow() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-8 text-gray-900">Test Flow: Quên mật khẩu</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl mb-3 text-gray-900">Các bước test:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click vào <Link to="/" className="text-blue-600 hover:underline">Trang đăng nhập</Link></li>
              <li>Click "Quên mật khẩu?"</li>
              <li>Nhập email bất kỳ và submit</li>
              <li>Xem thông báo đã gửi email</li>
              <li>Test link reset password:</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg mb-3 text-gray-900">Demo Links:</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">✅ Link hợp lệ (có token và email):</p>
                <Link
                  to="/reset-password?token=demo_reset_token_12345&email=huyenntk@gmail.com"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  /reset-password?token=demo_reset_token_12345&email=huyenntk@gmail.com
                </Link>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">❌ Link không hợp lệ (thiếu token):</p>
                <Link
                  to="/reset-password"
                  className="text-blue-600 hover:underline text-sm"
                >
                  /reset-password
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  → Sẽ hiển thị thông báo lỗi và tự động chuyển về trang login sau 3 giây
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg mb-3 text-gray-900">Validation mật khẩu:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Ít nhất 8 ký tự</li>
              <li>Có ít nhất 1 chữ hoa (A-Z)</li>
              <li>Có ít nhất 1 chữ thường (a-z)</li>
              <li>Có ít nhất 1 chữ số (0-9)</li>
              <li>Mật khẩu xác nhận phải khớp</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                Ví dụ mật khẩu hợp lệ: <code className="bg-white px-2 py-1 rounded">Password123</code>
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg mb-3 text-gray-900">Production Implementation:</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>Trong production, cần implement:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Backend API để gửi email với token ngẫu nhiên</li>
                <li>Token có thời gian hết hạn (thường 15-60 phút)</li>
                <li>Lưu token vào database với timestamp</li>
                <li>Validate token khi user submit form đổi mật khẩu</li>
                <li>Hash mật khẩu mới và lưu vào database</li>
                <li>Xóa token sau khi sử dụng</li>
              </ol>
            </div>
          </div>

          <div className="pt-6">
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
