# 🖼️ Cách Thêm Ảnh Của Bạn

## 📋 BẠN CÓ 2 FILES:

Từ screenshot:
1. **2-removebg-pre view** (hoặc 2-removebg-preview.png) → Logo
2. **3-removebg-pre view** (hoặc 3-removebg-preview.png) → Ảnh chung

---

## 🎯 OPTION 1: Dùng figma:asset (NẾU BẠN IMPORT TỪ FIGMA)

Nếu 2 files này được import từ Figma, bạn cần hash ID của chúng.

### Bước 1: Tìm Hash ID

Mở file explorer trong project, tìm file và xem hash ID.
Ví dụ: `figma:asset/abc123xyz.png`

### Bước 2: Update Code

Thay thế trong các files sau:

#### File 1: `/components/LoginPage.tsx`
```tsx
// Dòng 5 - Thay thế:
import logoHorizontal from 'figma:asset/YOUR_LOGO_HASH_ID.png';
```

#### File 2: `/components/DashboardLayout.tsx`
```tsx
// Dòng 28 - Thay thế:
import logo3D from 'figma:asset/YOUR_LOGO_HASH_ID.png';
```

#### File 3: `/components/ForgotPasswordPage.tsx`
```tsx
// Dòng 4 - Thay thế:
import logoHorizontal from 'figma:asset/YOUR_LOGO_HASH_ID.png';
```

#### File 4: `/components/ResetPasswordPage.tsx`
```tsx
// Dòng 4 - Thay thế:
import logoHorizontal from 'figma:asset/YOUR_LOGO_HASH_ID.png';
```

---

## 🎯 OPTION 2: Upload Vào /public (KHUYẾN NGHỊ - DỄ NHẤT)

### Bước 1: Tạo Folder

Tạo folder `/public/images/` trong project.

### Bước 2: Copy Files

Copy 2 files vào:
```
/public/images/logo.png              ← File 2 (logo)
/public/images/default-image.png     ← File 3 (ảnh chung)
```

### Bước 3: Update Code

#### File 1: `/components/LoginPage.tsx`
```tsx
// XÓA dòng 5:
// import logoHorizontal from 'figma:asset/...';

// SỬA dòng sử dụng (khoảng dòng ~30):
<img src="/images/logo.png" alt="English Complex Logo" className="h-16" />
```

#### File 2: `/components/DashboardLayout.tsx`
```tsx
// XÓA dòng 28:
// import logo3D from 'figma:asset/...';

// SỬA dòng sử dụng (khoảng dòng ~190):
<img src="/images/logo.png" alt="English Complex" className="h-10" />
```

#### File 3: `/components/ForgotPasswordPage.tsx`
```tsx
// XÓA dòng 4:
// import logoHorizontal from 'figma:asset/...';

// SỬA dòng sử dụng (khoảng dòng ~36 và ~72):
<img src="/images/logo.png" alt="English Complex Logo" className="h-16" />
```

#### File 4: `/components/ResetPasswordPage.tsx`
```tsx
// XÓA dòng 4:
// import logoHorizontal from 'figma:asset/...';

// SỬA dòng sử dụng:
<img src="/images/logo.png" alt="English Complex Logo" className="h-16" />
```

---

## 🎯 OPTION 3: Tôi Tự Động Fix (NHANH NHẤT)

Bạn cho tôi biết:

### 1. Hash ID của 2 files

Ví dụ:
- Logo: `figma:asset/abc123.png`
- Image: `figma:asset/xyz789.png`

### 2. Hoặc cho tôi path đầy đủ

Ví dụ từ screenshot bạn gửi trước:
```
figma:asset/b031e8eebab42821b07e27d216b96e51370a91d5.png
```

Tôi sẽ tự động update tất cả files cho bạn!

---

## 📝 CÁC FILE CẦN THAY:

### Logo (file 2-removebg-preview):
- ✅ `/components/LoginPage.tsx` - dòng 5
- ✅ `/components/DashboardLayout.tsx` - dòng 28
- ✅ `/components/ForgotPasswordPage.tsx` - dòng 4
- ✅ `/components/ResetPasswordPage.tsx` - dòng 4

### Ảnh chung (file 3-removebg-preview):
- Chưa có nơi nào dùng, nhưng có thể thêm vào:
  - Default avatar cho users
  - Background images
  - Placeholder images

---

## 🚀 QUICK START

### Nếu bạn muốn tôi fix ngay:

Hãy cho tôi:

1. **Tên chính xác của 2 files:**
   - File logo: `______________.png`
   - File ảnh: `______________.png`

2. **Hash ID (nếu là figma:asset):**
   - Logo: `figma:asset/______________.png`
   - Image: `figma:asset/______________.png`

Hoặc đơn giản là copy 2 files vào `/public/images/` và tôi sẽ update code để dùng từ public folder!

---

**Cho tôi biết bạn muốn làm theo Option nào, tôi sẽ giúp ngay!** 🎨
