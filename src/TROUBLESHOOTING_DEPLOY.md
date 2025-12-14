# 🔧 Troubleshooting Deploy - English Complex

## ❌ Vấn đề: Không truy cập được sau khi deploy

### 🔍 Bước 1: Kiểm tra cơ bản

#### 1.1. Kiểm tra files đã upload đúng chưa

Vào File Manager hosting, kiểm tra folder `/public_html/english-complex/` có:
```
english-complex/
  ├── index.html       ← PHẢI CÓ
  ├── assets/          ← PHẢI CÓ
  │   ├── index-*.js
  │   ├── index-*.css
  │   └── ...
  ├── .htaccess        ← QUAN TRỌNG (tạo nếu chưa có)
  └── ... (các file khác)
```

✅ **Nếu thiếu file:** Upload lại từ folder `build/`

---

#### 1.2. Kiểm tra URL truy cập

Bạn đang truy cập URL nào?

**Option A: Subfolder**
```
yoursite.com/english-complex
```

**Option B: Subdomain**  
```
english.yoursite.com
```

**Option C: Root domain**
```
yoursite.com
```

👉 **Mỗi option cần config khác nhau!**

---

### 🛠️ Giải pháp theo từng trường hợp

## TRƯỜNG HỢP 1: Deploy vào SUBFOLDER (/english-complex/)

### Bước 1: Cấu hình Vite

File `vite.config.ts`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/english-complex/',  // ← QUAN TRỌNG!
  build: {
    outDir: 'build',
  },
});
```

### Bước 2: Rebuild app
```bash
npm run build
```

### Bước 3: Tạo .htaccess

Trong folder `/public_html/english-complex/`, tạo file `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /english-complex/
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /english-complex/index.html [L]
</IfModule>
```

### Bước 4: Upload lại

Upload tất cả files từ `build/` (sau khi rebuild) vào `/public_html/english-complex/`

### Bước 5: Test

Truy cập: `yoursite.com/english-complex`

---

## TRƯỜNG HỢP 2: Deploy vào SUBDOMAIN (english.yoursite.com)

### Bước 1: Tạo subdomain trong Hostinger

1. Vào **Hostinger Control Panel**
2. **Domains** → **Subdomains**
3. Tạo subdomain: `english`
4. Document Root: `/public_html/english-complex`

### Bước 2: Cấu hình Vite

File `vite.config.ts`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',  // ← Root vì là subdomain
  build: {
    outDir: 'build',
  },
});
```

### Bước 3: Rebuild
```bash
npm run build
```

### Bước 4: Tạo .htaccess

Trong folder `/public_html/english-complex/`, tạo file `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</IfModule>
```

### Bước 5: Upload và test

Upload files, truy cập: `english.yoursite.com`

---

## TRƯỜNG HỢP 3: Deploy vào ROOT (yoursite.com)

### Bước 1: Cấu hình Vite
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'build',
  },
});
```

### Bước 2: Rebuild
```bash
npm run build
```

### Bước 3: Upload vào /public_html/

Upload tất cả files từ `build/` TRỰC TIẾP vào `/public_html/` (không tạo subfolder)

### Bước 4: Tạo .htaccess trong /public_html/

⚠️ **LUU Ý:** Nếu đã có WordPress, cần merge .htaccess cẩn thận!

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # WordPress rules (giữ nguyên nếu có)
  # ...
  
  # React app rules
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</IfModule>
```

---

## 🐛 Debug từng bước

### Debug 1: Kiểm tra index.html có load không

Mở browser, truy cập:
```
yoursite.com/english-complex/index.html
```

**✅ Nếu thấy app:** Vấn đề là .htaccess (React Router)
**❌ Nếu không thấy gì:** Vấn đề là file chưa upload đúng

---

### Debug 2: Kiểm tra Console (F12)

Mở Developer Tools (F12), xem tab **Console** có lỗi gì không:

**Lỗi thường gặp:**

#### ❌ "Failed to load module"
```
GET https://yoursite.com/assets/index-abc123.js 404
```

**Nguyên nhân:** Base path không đúng

**Giải pháp:** 
- Kiểm tra `vite.config.ts` có `base` đúng không
- Rebuild: `npm run build`
- Upload lại

---

#### ❌ "Uncaught SyntaxError: Unexpected token '<'"

**Nguyên nhân:** Server trả về HTML thay vì JS (do .htaccess)

**Giải pháp:**
- Tạo file `.htaccess` đúng như hướng dẫn trên
- Check `RewriteBase` có đúng không

---

#### ❌ CORS error

**Nguyên nhân:** Backend Supabase bị block

**Giải pháp:**
- Check internet connection
- Verify Supabase credentials trong `/utils/supabase/info.tsx`
- Test API: Mở Console chạy:
```javascript
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e2861589/health')
  .then(r => r.json())
  .then(console.log);
```

---

### Debug 3: Kiểm tra Network (F12)

Mở tab **Network**, reload trang:

**Xem:**
1. `index.html` - Status: 200 ✅
2. `index-*.js` - Status: 200 ✅
3. `index-*.css` - Status: 200 ✅

**Nếu có status 404:**
- Base path không đúng
- Files chưa upload đúng vị trí

---

## 📁 Cấu trúc files chuẩn

### Subfolder deployment:
```
public_html/
  ├── (WordPress files...)
  └── english-complex/
      ├── index.html
      ├── .htaccess          ← PHẢI CÓ
      ├── assets/
      │   ├── index-*.js
      │   └── index-*.css
      └── figma:asset/       ← Images
```

### Subdomain deployment:
```
public_html/
  ├── (WordPress files...)
  └── english-complex/       ← Document root của subdomain
      ├── index.html
      ├── .htaccess          ← PHẢI CÓ
      └── assets/
```

---

## 🔄 Quy trình deploy lại từ đầu

Nếu bạn muốn làm lại từ đầu:

### 1. Clean hosting
```bash
# Xóa folder cũ trên hosting
rm -rf /public_html/english-complex
```

### 2. Cấu hình local

**Chọn 1 trong 3:**

**A. Subfolder (/english-complex/)**
```javascript
// vite.config.ts
base: '/english-complex/'
```

**B. Subdomain (english.yoursite.com)**
```javascript
// vite.config.ts
base: '/'
```

**C. Root (yoursite.com)**
```javascript
// vite.config.ts
base: '/'
```

### 3. Build
```bash
# Clean cache trước
rm -rf node_modules/.vite
rm -rf build

# Build lại
npm run build
```

### 4. Verify build output

Kiểm tra folder `build/`:
```bash
ls -la build/

# Phải có:
- index.html
- assets/
- figma:asset/ (hoặc tương tự)
```

### 5. Upload

**Dùng FTP (FileZilla) hoặc File Manager:**
- Upload TẤT CẢ files từ `build/` lên hosting
- Đảm bảo cấu trúc folder giống y hệt

### 6. Tạo .htaccess

Tạo file `.htaccess` trong folder deploy, nội dung tùy theo trường hợp (xem trên)

### 7. Set permissions

```bash
# Folders
chmod 755 english-complex
chmod 755 english-complex/assets

# Files
chmod 644 english-complex/index.html
chmod 644 english-complex/.htaccess
chmod 644 english-complex/assets/*
```

### 8. Test

Mở browser (incognito mode để tránh cache):
```
yoursite.com/english-complex
```

hoặc

```
english.yoursite.com
```

---

## 🎯 Quick Fix - Giải pháp nhanh nhất

Nếu bạn muốn **giải pháp đơn giản nhất**:

### 1. Deploy vào ROOT của subdomain

```bash
# Bước 1: Tạo subdomain trong Hostinger
# Tên: english
# Document Root: /public_html/english

# Bước 2: Config
# vite.config.ts
base: '/'

# Bước 3: Build
npm run build

# Bước 4: Upload build/* vào /public_html/english/

# Bước 5: Tạo .htaccess (xem TRƯỜNG HỢP 2)

# Bước 6: Truy cập
# english.yoursite.com
```

✅ Đây là cách đơn giản nhất, ít lỗi nhất!

---

## 📞 Cần hỗ trợ thêm?

Hãy cung cấp thông tin:
1. Bạn đang deploy theo cách nào? (subfolder/subdomain/root)
2. URL bạn đang truy cập là gì?
3. Lỗi gì hiển thị trên browser? (F12 Console)
4. Screenshot nếu có

---

## ✅ Checklist cuối cùng

- [ ] Đã chọn đúng cách deploy (subfolder/subdomain/root)
- [ ] `vite.config.ts` có `base` đúng
- [ ] Đã rebuild: `npm run build`
- [ ] Đã upload TẤT CẢ files từ `build/`
- [ ] Đã tạo file `.htaccess` đúng
- [ ] Đã set permissions: 755 folders, 644 files
- [ ] Đã clear browser cache (Ctrl+Shift+R)
- [ ] Đã test trên incognito mode

---

**Hãy làm theo hướng dẫn trên và cho tôi biết bạn gặp vấn đề gì cụ thể! 🚀**
