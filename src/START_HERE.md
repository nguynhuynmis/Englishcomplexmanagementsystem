# 🚀 BẮT ĐẦU TỪ ĐÂY - ENGLISH COMPLEX

## ⚠️ QUAN TRỌNG: Bạn vừa gặp lỗi "npm run dev không hiện gì"

**Nguyên nhân:** Thiếu cấu trúc files cơ bản (index.html, main.tsx, package.json...)

**✅ ĐÃ FIX:** Tôi đã tạo tất cả files cần thiết!

---

## 📋 Các bước PHẢI LÀM ngay bây giờ:

### ✅ Bước 1: Install dependencies

```bash
npm install
```

**Nếu có lỗi, xóa và install lại:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### ✅ Bước 2: Chạy dev server

```bash
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

### ✅ Bước 3: Mở browser

Truy cập: **http://localhost:3000**

Bạn sẽ thấy:
1. Loading screen "Đang khởi tạo hệ thống..."
2. Sau đó là **trang login** 🎉

---

## 🎯 Test login

**Tài khoản Academic (Học vụ):**
- Username: `huongvtt`
- Password: `123456`

**Tài khoản Teacher:**
- Username: `lanntm`
- Password: `123456`

**Tài khoản Student:**
- Username: `huyenntk`
- Password: `123456`

**Tài khoản Director:**
- Username: `duccv`
- Password: `123456`

---

## 🐛 Nếu vẫn gặp lỗi

### Lỗi 1: "Cannot find module '@vitejs/plugin-react'"

```bash
npm install @vitejs/plugin-react --save-dev
```

### Lỗi 2: "Failed to resolve import"

```bash
npm install react react-dom react-router-dom
npm install -D @types/react @types/react-dom
```

### Lỗi 3: Trang trắng nhưng dev server chạy

Mở **F12 Console** xem lỗi gì, sau đó:

1. **Nếu lỗi Supabase/Database:**
   - Xem file `/utils/supabase/info.tsx`
   - Verify credentials có đúng không

2. **Nếu lỗi import:**
   - Check paths trong `/src/App.tsx`
   - Đảm bảo tất cả components tồn tại

3. **Tắt database init tạm thời:**
   Sửa `/src/App.tsx`, dòng 55:
   ```tsx
   // await checkDatabaseInitialization(); // Comment dòng này
   ```

### Lỗi 4: Port 3000 đã được sử dụng

```bash
npx kill-port 3000
# Hoặc
npm run dev -- --port 3001
```

---

## 📁 Cấu trúc Project

```
english-complex/
├── index.html              ← Entry point (vừa tạo)
├── package.json            ← Dependencies (vừa tạo)
├── vite.config.ts          ← Vite config (vừa tạo)
├── tsconfig.json           ← TS config (vừa tạo)
├── postcss.config.js       ← PostCSS config (vừa tạo)
├── src/
│   ├── main.tsx            ← React entry (vừa tạo)
│   └── App.tsx             ← Main component (vừa tạo)
├── components/             ← Tất cả React components
│   ├── LoginPage.tsx
│   ├── DashboardLayout.tsx
│   ├── dashboards/
│   ├── modules/
│   └── ui/
├── styles/
│   └── globals.css         ← Global styles
├── utils/
│   ├── api.ts              ← API functions
│   ├── initDatabase.ts     ← Database init
│   └── supabase/
│       └── info.tsx        ← Supabase config
├── data/
│   ├── mockData.ts
│   └── schedules.ts
└── supabase/
    └── functions/
        └── server/
            └── index.tsx    ← Backend server
```

---

## 🌐 Deploy sau khi local chạy được

### Option 1: Deploy vào Subdomain (KHUYẾN NGHỊ)

```bash
# 1. Tạo subdomain trong Hostinger: english.yoursite.com
# 2. Build
npm run build

# 3. Upload build/* vào /public_html/english/
# 4. Truy cập: english.yoursite.com
```

### Option 2: Deploy vào Subfolder

```bash
# 1. Sửa vite.config.ts
#    base: '/english-complex/',

# 2. Build
npm run build

# 3. Upload build/* vào /public_html/english-complex/
# 4. Copy /public/.htaccess vào /public_html/english-complex/
# 5. Truy cập: yoursite.com/english-complex
```

👉 **Xem chi tiết:** `/DEPLOY_GUIDE.md`

---

## 📚 Documentation

- **Bắt đầu:** `START_HERE.md` ← BẠN ĐANG Ở ĐÂY
- **Fix cấu trúc:** `FIX_STRUCTURE.md`
- **Database:** `QUICK_START_DATABASE.md`
- **Deploy:** `DEPLOY_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING_DEPLOY.md`
- **API:** `DATABASE_GUIDE.md`

---

## ✅ Checklist

- [ ] `npm install` - Cài dependencies
- [ ] `npm run dev` - Chạy dev server  
- [ ] Mở `localhost:3000` - Test local
- [ ] Login thành công - Verify app hoạt động
- [ ] `npm run build` - Build production
- [ ] Upload lên hosting - Deploy
- [ ] Test trên hosting - Verify deploy

---

## 💡 Tips

1. **Luôn test trên local trước khi deploy**
2. **Dùng F12 Console để debug**
3. **Check Network tab nếu có lỗi load**
4. **Xóa cache browser nếu không thấy thay đổi**
5. **Dùng incognito mode để test clean**

---

## 📞 Cần hỗ trợ?

Nếu vẫn gặp vấn đề, cung cấp:
1. Screenshot terminal khi chạy `npm run dev`
2. Screenshot F12 Console nếu có lỗi
3. Screenshot Network tab (F12)
4. Node version: `node -v`
5. npm version: `npm -v`

---

## 🎉 Tóm tắt

Tôi đã fix toàn bộ cấu trúc project! Bây giờ chỉ cần:

```bash
npm install
npm run dev
```

Sau đó mở `localhost:3000` và bạn sẽ thấy app! 🚀

---

**Chúc bạn thành công!** 🎊
