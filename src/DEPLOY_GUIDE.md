# 🚀 Hướng dẫn Deploy lên WordPress Hosting (Hostinger)

## 📋 Tổng quan

Hệ thống English Complex sử dụng:
- **Frontend:** React app (static files)
- **Backend:** Supabase (on cloud)
- **Database:** Supabase KV Store (on cloud)

👉 **Bạn CHỈ cần upload static files lên hosting, không cần setup MySQL hay PHP!**

---

## 🎯 Các bước Deploy

### Bước 1: Build React App

```bash
npm run build
```

Output sẽ tạo folder `build/` (hoặc `dist/` nếu dùng Vite) chứa:
- `index.html`
- `assets/` (CSS, JS, images)
- Các file static khác

### Bước 2: Truy cập Hostinger

1. Đăng nhập vào **Hostinger Control Panel**
2. Vào **File Manager** hoặc dùng **FTP/SFTP**

### Bước 3: Tạo folder trên hosting

Trong `/public_html/`, tạo folder mới:
```
/public_html/english-complex/
```

### Bước 4: Upload files

Upload **TẤT CẢ** files từ folder `build/` vào `/public_html/english-complex/`

```
/public_html/english-complex/
  ├── index.html
  ├── assets/
  │   ├── index-abc123.js
  │   ├── index-def456.css
  │   └── ...
  └── ... (các file khác)
```

### Bước 5: Cấu hình (nếu cần)

#### Option 1: Truy cập qua subfolder
URL: `yoursite.com/english-complex`

✅ Không cần cấu hình gì thêm!

#### Option 2: Truy cập qua subdomain
Muốn: `english.yoursite.com`

1. Tạo subdomain `english` trong Hostinger
2. Point subdomain đến folder `/public_html/english-complex/`
3. Truy cập: `english.yoursite.com`

### Bước 6: Test

Mở browser và truy cập:
```
yoursite.com/english-complex
```

hoặc

```
english.yoursite.com
```

✅ Bạn sẽ thấy trang login!

---

## 🔧 Troubleshooting

### ❌ Issue: Trang trắng (blank page)

**Nguyên nhân:** React Router không tìm thấy đúng base path

**Giải pháp:**

Nếu deploy vào subfolder `/english-complex/`, cần cấu hình base path:

1. Tạo/sửa file `vite.config.js` (nếu dùng Vite):
```javascript
export default {
  base: '/english-complex/'
}
```

2. Hoặc trong `package.json` (nếu dùng Create React App):
```json
{
  "homepage": "/english-complex"
}
```

3. Rebuild:
```bash
npm run build
```

4. Upload lại

---

### ❌ Issue: 404 khi refresh trang

**Nguyên nhân:** React Router dùng History API, server không biết route

**Giải pháp:** Tạo file `.htaccess` trong folder `/public_html/english-complex/`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /english-complex/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /english-complex/index.html [L]
</IfModule>
```

**Nếu deploy vào subdomain (root):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

### ❌ Issue: API không hoạt động

**Nguyên nhân:** Supabase credentials không đúng

**Kiểm tra:**

1. Mở file `/utils/supabase/info.tsx`
2. Verify `projectId` và `publicAnonKey` có đúng không
3. Test API trực tiếp:

```javascript
// Mở Console (F12) và chạy:
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e2861589/health')
  .then(r => r.json())
  .then(console.log);
```

✅ Phải trả về: `{ status: "ok", ... }`

---

### ❌ Issue: CORS error

**Nguyên nhân:** Backend chưa enable CORS cho domain của bạn

**Giải pháp:**

Backend đã enable CORS cho `*` (all domains), nên không nên có vấn đề này.

Nếu vẫn gặp, kiểm tra:
1. Backend server có đang chạy không
2. URL API có đúng không
3. Browser cache - thử hard refresh (Ctrl+F5)

---

## 📁 File Structure trên Hosting

```
yoursite.com/
├── public_html/
│   ├── index.html          (WordPress site)
│   ├── wp-content/
│   ├── wp-admin/
│   └── english-complex/    ← React app ở đây
│       ├── index.html
│       ├── assets/
│       │   ├── index-abc123.js
│       │   ├── index-def456.css
│       │   └── images/
│       └── .htaccess       (nếu cần)
```

---

## 🔒 Bảo mật

### 1. Đổi mật khẩu mặc định
Tất cả user có password `123456`. Đổi ngay sau khi deploy!

### 2. HTTPS
Hostinger thường tự động cấp SSL certificate. Đảm bảo:
- ✅ HTTPS enabled
- ✅ Force HTTPS redirect

### 3. File permissions
```
Folders: 755
Files: 644
```

### 4. Hide sensitive files
Trong `.htaccess`:
```apache
<FilesMatch "\.(env|json|md)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

---

## 🎯 Checklist Deploy

- [ ] Build app: `npm run build`
- [ ] Tạo folder: `/public_html/english-complex/`
- [ ] Upload files từ `build/` lên hosting
- [ ] Tạo `.htaccess` cho React Router (nếu cần)
- [ ] Test truy cập: `yoursite.com/english-complex`
- [ ] Test login với tài khoản demo
- [ ] Test CRUD operations (thêm/sửa/xóa data)
- [ ] Verify data persistence (refresh không mất data)
- [ ] Đổi mật khẩu mặc định
- [ ] Enable HTTPS
- [ ] Test trên mobile

---

## 📊 Performance Tips

### 1. Enable Gzip Compression
Trong `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 day"
</IfModule>
```

### 3. CDN (Optional)
Hostinger có tích hợp Cloudflare CDN miễn phí. Enable nó để tăng tốc!

---

## 🔄 Update App sau này

Khi có thay đổi code:

1. **Rebuild:**
   ```bash
   npm run build
   ```

2. **Backup cũ** (optional):
   Rename folder `english-complex` → `english-complex-backup`

3. **Upload mới:**
   Upload files mới vào `english-complex/`

4. **Test:**
   Kiểm tra lại mọi tính năng

5. **Xóa backup** (nếu mọi thứ OK):
   ```bash
   rm -rf english-complex-backup
   ```

---

## 💡 Pro Tips

### 1. Sử dụng FTP Client
Thay vì File Manager, dùng **FileZilla** hoặc **WinSCP** để upload nhanh hơn.

### 2. Git Deployment (Advanced)
Setup Git auto-deploy để update code tự động:
- Push code lên GitHub
- Hostinger auto pull và rebuild

### 3. Custom Domain
Muốn domain riêng? Mua domain và point về hosting:
```
english-complex.com → Hostinger
```

### 4. Monitoring
Setup uptime monitoring với:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 📞 Support

### Hostinger Support
- Live chat 24/7
- Email: support@hostinger.com
- Knowledge base: support.hostinger.com

### App Support
- Check Console (F12) cho errors
- Xem `/DATABASE_GUIDE.md` cho API issues
- Xem `/TEST_DATABASE.md` cho debugging

---

## ✅ Kết luận

Deploy hệ thống English Complex lên WordPress hosting rất đơn giản:
1. ✅ Build app
2. ✅ Upload static files
3. ✅ Done!

**Không cần:**
- ❌ Setup MySQL database
- ❌ Viết PHP code
- ❌ Configure server
- ❌ Install dependencies

**Supabase backend tự động hoạt động từ cloud!** 🚀

---

**Chúc bạn deploy thành công! 🎉**
