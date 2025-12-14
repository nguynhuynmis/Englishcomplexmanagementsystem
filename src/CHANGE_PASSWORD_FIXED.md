# ✅ ĐÃ FIX: TÍNH NĂNG ĐỔI MẬT KHẨU

## 🎯 VẤN ĐỀ BAN ĐẦU

Khi click "Đổi mật khẩu" trong dashboard, form chỉ **simulate** API call (dùng setTimeout), không thực sự gọi API để update password trong database.

---

## ✅ ĐÃ SỬA

### 1. **ChangePasswordModal.tsx** - UPDATED ✅

**Trước đây (dòng 58-63):**
```typescript
// Simulate API call
setTimeout(() => {
  setIsLoading(false);
  alert('✅ Đổi mật khẩu thành công!');
  handleClose();
}, 1000);
```

**Bây giờ:**
```typescript
try {
  console.log('🔐 [Change Password] Calling API...');
  const response = await authAPI.changePassword(
    userId, 
    formData.currentPassword, 
    formData.newPassword
  );
  
  console.log('🔐 [Change Password] API Response:', response);
  
  if (response.success) {
    alert('✅ Đổi mật khẩu thành công!');
    handleClose();
  } else {
    setErrors({ currentPassword: response.message || 'Đổi mật khẩu thất bại' });
  }
} catch (error: any) {
  const errorMsg = error?.message || 'Không thể kết nối đến server';
  setErrors({ currentPassword: errorMsg });
  alert('❌ Lỗi: ' + errorMsg);
}
```

**Thêm props `userId`:**
```typescript
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string; // ← Mới thêm
}
```

---

### 2. **DashboardLayout.tsx** - UPDATED ✅

**Pass userId vào modal (dòng 333-337):**
```typescript
<ChangePasswordModal
  isOpen={changePasswordModalOpen}
  onClose={() => setChangePasswordModalOpen(false)}
  userName={user.fullName}
  userId={user.id} // ← Mới thêm
/>
```

---

### 3. **Server Endpoint** - UPDATED ✅

**File: `/supabase/functions/server/index.tsx` (dòng 54-81)**

**Thêm logging và fix response format:**
```typescript
app.post("/make-server-e2861589/auth/change-password", async (c) => {
  try {
    console.log('🔐 [Server] Change password request received');
    const { userId, oldPassword, newPassword } = await c.req.json();
    console.log('🔐 [Server] UserId:', userId);
    
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      console.error('❌ [Server] User not found:', userId);
      return c.json({ success: false, message: "Không tìm thấy người dùng" }, 404);
    }
    
    if (users[userIndex].password !== oldPassword) {
      console.error('❌ [Server] Wrong old password for user:', userId);
      return c.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, 401);
    }
    
    users[userIndex].password = newPassword;
    await kv.set("users", users);
    
    console.log('✅ [Server] Password changed successfully for user:', userId);
    return c.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("❌ [Server] Change password error:", error);
    return c.json({ success: false, message: "Đã xảy ra lỗi khi đổi mật khẩu" }, 500);
  }
});
```

**Thay đổi chính:**
- ✅ Thêm `success: true/false` vào response
- ✅ Thêm console.log để debug
- ✅ Cải thiện error messages

---

### 4. **API Client** - ĐÃ CÓ SẴN ✅

**File: `/utils/api.ts` (dòng 39-44)**

API client đã có method `changePassword()`:
```typescript
export const authAPI = {
  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    });
  },
  // ...
};
```

---

## 🧪 CÁCH TEST

### Bước 1: Login vào hệ thống

Credentials test:
- Username: `huongvtt`
- Password: `123456`

### Bước 2: Mở Change Password Modal

1. Click vào avatar ở góc trên bên phải
2. Click "Đổi mật khẩu"

### Bước 3: Thử đổi mật khẩu

**Test Case 1: Đổi thành công ✅**
- Mật khẩu hiện tại: `123456`
- Mật khẩu mới: `newpass123`
- Xác nhận: `newpass123`
- Click "Cập nhật"

**Kết quả mong đợi:**
- Alert: "✅ Đổi mật khẩu thành công!"
- Modal đóng lại
- Console log:
  ```
  🔐 [Change Password] Starting password change for userId: user-001
  🔐 [Change Password] Calling API...
  🔐 [Server] Change password request received
  🔐 [Server] UserId: user-001
  ✅ [Server] Password changed successfully for user: user-001
  🔐 [Change Password] API Response: { success: true, message: "..." }
  ```

**Test Case 2: Mật khẩu cũ sai ❌**
- Mật khẩu hiện tại: `wrongpass`
- Mật khẩu mới: `newpass123`
- Xác nhận: `newpass123`

**Kết quả mong đợi:**
- Hiển thị lỗi: "Mật khẩu hiện tại không đúng"
- Console log:
  ```
  ❌ [Server] Wrong old password for user: user-001
  ❌ [Change Password] Failed: Mật khẩu hiện tại không đúng
  ```

**Test Case 3: Validation errors ❌**
- Mật khẩu mới < 6 ký tự
- Mật khẩu xác nhận không khớp
- Mật khẩu mới = mật khẩu cũ

**Kết quả mong đợi:**
- Hiển thị error message tương ứng
- Không gọi API

### Bước 4: Verify trong Database

Sau khi đổi mật khẩu thành công, thử logout và login lại:
- Username: `huongvtt`
- Password: `newpass123` (mật khẩu mới)

→ Phải login thành công!

---

## 🔍 DEBUG LOGGING

Tất cả console logs có emoji để dễ filter:

### Frontend logs:
```javascript
console.log('🔐 [Change Password] Starting password change for userId:', userId);
console.log('🔐 [Change Password] Calling API...');
console.log('🔐 [Change Password] API Response:', response);
console.error('❌ [Change Password] Failed:', response.message);
console.error('❌ [Change Password] Error:', error);
```

### Server logs:
```javascript
console.log('🔐 [Server] Change password request received');
console.log('🔐 [Server] UserId:', userId);
console.error('❌ [Server] User not found:', userId);
console.error('❌ [Server] Wrong old password for user:', userId);
console.log('✅ [Server] Password changed successfully for user:', userId);
console.error('❌ [Server] Change password error:', error);
```

**Filter trong Console:**
- Tìm "🔐" để xem tất cả change password logs
- Tìm "❌" để xem errors
- Tìm "✅" để xem success

---

## 📝 API FLOW

```
┌─────────────────────────────────────────────────────┐
│  1. User clicks "Đổi mật khẩu" button               │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  2. ChangePasswordModal opens                       │
│     Props: userName, userId                         │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  3. User fills form & clicks "Cập nhật"             │
│     - currentPassword: "123456"                     │
│     - newPassword: "newpass123"                     │
│     - confirmPassword: "newpass123"                 │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  4. Frontend validation                             │
│     ✓ All fields filled?                            │
│     ✓ New password >= 6 chars?                      │
│     ✓ Passwords match?                              │
│     ✓ New ≠ Current?                                │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  5. Call authAPI.changePassword()                   │
│     POST /auth/change-password                      │
│     Body: { userId, oldPassword, newPassword }      │
│     Headers: Authorization: Bearer <publicAnonKey>  │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  6. Server validates                                │
│     ✓ User exists?                                  │
│     ✓ Old password correct?                         │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  7. Server updates KV store                         │
│     users[userIndex].password = newPassword         │
│     await kv.set("users", users)                    │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  8. Server returns response                         │
│     { success: true, message: "..." }               │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│  9. Frontend shows success alert                    │
│     Alert: "✅ Đổi mật khẩu thành công!"            │
│     Modal closes                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ TÓM TẮT

**Files đã sửa:**
1. ✅ `/components/ChangePasswordModal.tsx` - Gọi API thật thay vì simulate
2. ✅ `/components/DashboardLayout.tsx` - Pass userId vào modal
3. ✅ `/supabase/functions/server/index.tsx` - Thêm logging và fix response format

**Files đã có sẵn (không cần sửa):**
- ✅ `/utils/api.ts` - API client method `changePassword()`
- ✅ KV Store integration - Lưu users vào database

**Tính năng:**
- ✅ Validation đầy đủ (frontend + backend)
- ✅ Error handling tốt
- ✅ Console logging để debug
- ✅ User-friendly error messages
- ✅ Update password trong database
- ✅ Password được persist (không mất sau reload)

---

## 🚀 NEXT STEPS

Sau khi test change password thành công, bạn có thể:

1. **Deploy lên production** và test trên hosting
2. **Thêm các tính năng:**
   - Email notification khi đổi mật khẩu
   - Password strength meter
   - Password history (không cho dùng lại mật khẩu cũ)
   - 2FA (Two-Factor Authentication)

---

**TEST NGAY VÀ CHO TÔI BIẾT KẾT QUẢ!** 🎉

Mở Console (F12) để xem logs khi đổi mật khẩu.
