# 🔧 FIX: Cấu trúc Project

## ❌ Vấn đề: `npm run dev` không hiện gì

**Nguyên nhân:** Thiếu files cấu trúc cơ bản của Vite + React

---

## ✅ Đã Fix

Tôi đã tạo các files sau:

### 1. Files cơ bản
- ✅ `/index.html` - Entry point HTML
- ✅ `/src/main.tsx` - Entry point React
- ✅ `/src/App.tsx` - Main component
- ✅ `/package.json` - Dependencies
- ✅ `/tsconfig.json` - TypeScript config
- ✅ `/tsconfig.node.json` - TypeScript config for Vite
- ✅ `/vite.config.ts` - Vite config

### 2. Cấu trúc folder
```
/
├── index.html           ← Entry point
├── package.json         ← Dependencies
├── vite.config.ts       ← Vite config
├── tsconfig.json        ← TS config
├── src/
│   ├── main.tsx         ← React entry
│   └── App.tsx          ← Main component
├── components/          ← Tất cả components
├── styles/              ← CSS
├── utils/               ← Utils
└── ...
```

---

## 🚀 Bước tiếp theo

### Bước 1: Install dependencies

```bash
npm install
```

Hoặc nếu đã có `node_modules`:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Bước 2: Chạy dev server

```bash
npm run dev
```

Bạn sẽ thấy:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Bước 3: Mở browser

Truy cập: `http://localhost:3000`

✅ Bạn sẽ thấy trang login!

---

## 🐛 Nếu vẫn lỗi

### Lỗi: "Cannot find module"

**Nguyên nhân:** Dependencies chưa cài đặt

**Giải pháp:**
```bash
npm install
```

---

### Lỗi: "Failed to resolve import"

**Nguyên nhân:** Import path không đúng

**Kiểm tra:**
1. File `/src/App.tsx` import từ `../components/...`
2. File `/src/main.tsx` import từ `./App` và `./styles/globals.css`

**Giải pháp:** Đã fix trong code rồi, chỉ cần `npm install`

---

### Lỗi: TypeScript errors

**Giải pháp:**
```bash
# Ignore TypeScript errors tạm thời
npm run dev -- --force
```

Hoặc sửa `vite.config.ts`:
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  // Ignore TS errors
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
```

---

### Lỗi: "Port 3000 already in use"

**Giải pháp:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Hoặc dùng port khác
npm run dev -- --port 3001
```

---

### Lỗi: Trang trắng (blank page) nhưng dev server chạy

**Nguyên nhân:** Lỗi trong code hoặc database init

**Debug:**

1. **Mở Console (F12)** xem lỗi gì:
   ```javascript
   // Nếu thấy lỗi Supabase, tạm thời disable database init:
   ```

2. **Tắt database init tạm thời:**
   
   Sửa `/src/App.tsx`:
   ```tsx
   useEffect(() => {
     const initialize = async () => {
       try {
         // COMMENT dòng này tạm thời
         // await checkDatabaseInitialization();
         
         const savedUser = localStorage.getItem('currentUser');
         if (savedUser) {
           setCurrentUser(JSON.parse(savedUser));
         }
       } catch (error) {
         console.error('Initialization error:', error);
       } finally {
         setIsInitializing(false);
       }
     };
     initialize();
   }, []);
   ```

3. **Test lại:**
   ```bash
   npm run dev
   ```

4. **Nếu thấy login page:** Database init là nguyên nhân
   - Check Supabase credentials trong `/utils/supabase/info.tsx`
   - Verify backend server đang chạy

---

## 📁 Files quan trọng

### `/index.html`
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>English Complex</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `/src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### `/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // Change to '/english-complex/' for subfolder
  build: {
    outDir: 'build',
  },
});
```

---

## ✅ Checklist

- [ ] Đã tạo `/index.html`
- [ ] Đã tạo `/src/main.tsx`
- [ ] Đã tạo `/src/App.tsx`
- [ ] Đã tạo `/package.json`
- [ ] Đã tạo config files (tsconfig, vite.config)
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `npm run dev`
- [ ] Đã mở `http://localhost:3000`
- [ ] Thấy trang login ✅

---

## 🎯 Deploy sau khi fix

Sau khi local dev đã chạy được:

```bash
# 1. Build
npm run build

# 2. Kiểm tra folder build/
ls -la build/
# Phải có: index.html, assets/, ...

# 3. Upload build/* lên hosting

# 4. Xem DEPLOY_GUIDE.md cho chi tiết
```

---

**Chúc bạn thành công! 🚀**
