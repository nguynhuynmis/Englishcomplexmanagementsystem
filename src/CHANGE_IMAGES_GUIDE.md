# 🖼️ HƯỚNG DẪN THAY ẢNH

## ✅ ĐÃ HOÀN THÀNH

Tôi đã setup hệ thống để bạn dễ dàng thay đổi logo và images!

### Files đã update:
- ✅ `/utils/images.ts` - Helper quản lý tất cả images
- ✅ `/components/LoginPage.tsx` - Dùng logo từ helper
- ✅ `/components/ForgotPasswordPage.tsx` - Dùng logo từ helper
- ✅ `/components/ResetPasswordPage.tsx` - Dùng logo từ helper
- ✅ `/components/DashboardLayout.tsx` - Dùng logo3D từ helper

---

## 🎯 CÁCH THAY ẢNH

Bạn có **2 OPTIONS** để thay logo và images:

---

### ⭐ OPTION 1: Dùng figma:asset (NẾU BẠN IMPORT TỪ FIGMA)

#### Bước 1: Tìm Hash ID của files

Từ screenshot bạn gửi, có 2 files trong folder `assets`:
- `2-removebg-pre view` (hoặc `2-removebg-preview.png`)
- `3-removebg-pre view` (hoặc `3-removebg-preview.png`)

Files này sẽ có hash ID dạng:
```
figma:asset/abc123xyz.png
```

#### Bước 2: Update `/utils/images.ts`

Mở file `/utils/images.ts` và tìm dòng ~18-23:

```typescript
// Logo - Thay hash này bằng hash của file "2-removebg-preview.png"
import logoDefault from 'figma:asset/dd0c38c752428dd137a2714c0bfc56ea8f160c00.png';

// Logo 3D - Dùng logo trong dashboard
import logo3DDefault from 'figma:asset/f622a5ebfd97d64a4d171316f8cb3731d4968ae8.png';
```

**THAY BẰNG:**

```typescript
// Logo - File 2-removebg-preview.png (logo của bạn)
import logoDefault from 'figma:asset/HASH_ID_CUA_FILE_2.png';

// Logo 3D - Dùng cùng logo
import logo3DDefault from 'figma:asset/HASH_ID_CUA_FILE_2.png';

// Ảnh mặc định - File 3-removebg-preview.png
import defaultImageImport from 'figma:asset/HASH_ID_CUA_FILE_3.png';
```

**Sau đó uncomment dòng export:**

```typescript
export const logo = logoDefault;
export const logo3D = logo3DDefault;
export const defaultImage = defaultImageImport; // Uncomment dòng này
```

#### Bước 3: Làm sao tìm Hash ID?

**Cách 1: Xem trong code imports hiện có**

Nếu bạn đã import 2 files này từ Figma, chúng sẽ có hash ID trong code imports.

Tìm trong project:
```bash
grep -r "figma:asset" .
```

**Cách 2: Check file explorer**

Mở project trong file explorer, tìm trong folder imports hoặc assets, xem tên file đầy đủ.

**Cách 3: Thử import trực tiếp**

Trong file `/utils/images.ts`, thử:
```typescript
import logo2 from 'figma:asset/2-removebg-preview.png';
import image3 from 'figma:asset/3-removebg-preview.png';
```

Nếu không được, Vite sẽ báo lỗi và hiển thị path đúng.

---

### ⭐⭐ OPTION 2: Dùng Local Files (DỄ NHẤT - KHUYẾN NGHỊ)

Đây là cách **đơn giản nhất** và **không cần biết hash ID**!

#### Bước 1: Tạo folder /public/images

```bash
mkdir -p public/images
```

#### Bước 2: Copy files vào

Copy 2 files từ folder assets của bạn:

```
Copy "2-removebg-preview.png" → /public/images/logo.png
Copy "3-removebg-preview.png" → /public/images/default.png
```

Hoặc nếu muốn giữ tên gốc:
```
/public/images/2-removebg-preview.png
/public/images/3-removebg-preview.png
```

#### Bước 3: Update `/utils/images.ts`

Mở file `/utils/images.ts`, tìm section **OPTION 2** (dòng ~35-45):

**COMMENT toàn bộ OPTION 1:**

```typescript
// ============================================
// OPTION 1: FIGMA ASSETS (Mặc định)
// ============================================

// COMMENT tất cả phần này:
// import logoDefault from 'figma:asset/dd0c38c752428dd137a2714c0bfc56ea8f160c00.png';
// import logo3DDefault from 'figma:asset/f622a5ebfd97d64a4d171316f8cb3731d4968ae8.png';

// export const logo = logoDefault;
// export const logo3D = logo3DDefault;
```

**UNCOMMENT OPTION 2:**

```typescript
// ============================================
// OPTION 2: LOCAL FILES (ĐANG SỬ DỤNG)
// ============================================

export const logo = '/images/logo.png';
export const logo3D = '/images/logo.png';
export const defaultImage = '/images/default.png';
```

**Hoặc nếu giữ tên gốc:**

```typescript
export const logo = '/images/2-removebg-preview.png';
export const logo3D = '/images/2-removebg-preview.png';
export const defaultImage = '/images/3-removebg-preview.png';
```

#### Bước 4: Restart dev server

```bash
npm run dev
```

**DONE! Logo của bạn sẽ hiện ra!** 🎉

---

## 🔍 KIỂM TRA

Sau khi thay đổi, check các trang:

### 1. Trang Login
```
http://localhost:3000/
```
→ Phải thấy logo mới ở giữa trang

### 2. Trang Forgot Password
```
http://localhost:3000/forgot-password
```
→ Phải thấy logo mới

### 3. Dashboard
Login vào và vào dashboard → Logo nhỏ ở sidebar bên trái phải là logo mới

---

## 💡 TIPS

### Nếu logo quá lớn hoặc nhỏ:

#### Trong LoginPage, ForgotPasswordPage, ResetPasswordPage:
Tìm dòng:
```tsx
<img src={logo} alt="English Complex Logo" className="h-16" />
```

Thay `h-16` thành:
- `h-12` - Nhỏ hơn
- `h-20` - Lớn hơn
- `h-24` - Rất lớn

#### Trong DashboardLayout:
Tìm dòng:
```tsx
<img src={logo3D} alt="English Complex" className="h-10 w-10 object-contain" />
```

Thay `h-10 w-10` thành:
- `h-8 w-8` - Nhỏ hơn
- `h-12 w-12` - Lớn hơn

### Nếu logo bị méo:

Thêm `object-contain`:
```tsx
<img src={logo} alt="Logo" className="h-16 object-contain" />
```

Hoặc `object-cover`:
```tsx
<img src={logo} alt="Logo" className="h-16 w-16 object-cover" />
```

---

## 🎨 DÙNG ẢNH 3 (default image)

File `3-removebg-preview.png` có thể dùng cho:

### 1. Default Avatar cho users

Trong file `/utils/images.ts`, function `getAvatarUrl()` đã setup:

```typescript
export const getAvatarUrl = (avatar?: string): string => {
  if (!avatar) {
    return '/images/default-avatar.png'; // Thay thành file 3
  }
  // ...
};
```

**Update thành:**

```typescript
export const getAvatarUrl = (avatar?: string): string => {
  if (!avatar) {
    return '/images/default.png'; // Hoặc '/images/3-removebg-preview.png'
  }
  // ...
};
```

### 2. Background hoặc placeholder images

Import từ `utils/images`:

```typescript
import { defaultImage } from '../utils/images';

// Dùng:
<img src={defaultImage} alt="Placeholder" />
```

---

## 📝 TÓM TẮT NHANH

### Nếu bạn muốn cách NHA:

1. Copy `2-removebg-preview.png` → `/public/images/logo.png`
2. Copy `3-removebg-preview.png` → `/public/images/default.png`
3. Mở `/utils/images.ts`
4. Comment OPTION 1 (dòng import figma:asset)
5. Uncomment OPTION 2 (dòng export với `/images/...`)
6. Restart: `npm run dev`
7. **DONE!** ✅

---

## 🆘 NẾU CÓ VẤN ĐỀ

### Lỗi: Cannot find module '/images/logo.png'

→ Kiểm tra file có đúng path: `/public/images/logo.png`

### Logo không hiện

1. Check console (F12) có lỗi 404 không
2. Verify file tồn tại: `ls public/images/`
3. Restart dev server: `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)

### Logo vẫn là logo cũ

→ Clear cache browser và reload

---

**Hãy thử và cho tôi biết kết quả!** 🎨

Nếu bạn gặp khó khăn, cho tôi biết:
1. Hash ID của 2 files (nếu có)
2. Hoặc screenshot folder `/public/images/` sau khi copy
3. Console errors (nếu có)
