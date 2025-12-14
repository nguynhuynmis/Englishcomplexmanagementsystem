# 🔍 DEBUG: npm run dev không hiện gì

## Các bước debug từng bước:

### Bước 1: Kiểm tra Terminal Output

Khi bạn chạy `npm run dev`, bạn thấy gì?

#### Case A: Báo lỗi rõ ràng
```bash
npm run dev
# Error: Cannot find module 'vite'
# Error: Cannot find module 'react'
# etc.
```

**→ Giải pháp:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

#### Case B: Dev server chạy thành công
```bash
npm run dev

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Nhưng browser vẫn trắng** → Đi đến Bước 2

---

#### Case C: Không có output gì cả
```bash
npm run dev
# ... (im lặng, không có gì)
```

**→ Giải pháp:**
```bash
# Kiểm tra npm có hoạt động không
npm -v

# Kiểm tra node version
node -v

# Nếu OK, xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

---

### Bước 2: Kiểm tra Browser Console (F12)

Mở browser → F12 → Tab **Console**

#### Lỗi 1: Failed to fetch dynamically imported module
```
Failed to fetch dynamically imported module: http://localhost:3000/src/main.tsx
```

**Nguyên nhân:** File không tồn tại hoặc path sai

**Giải pháp:**
```bash
# Kiểm tra file có tồn tại không
ls -la src/main.tsx
ls -la index.html

# Nếu thiếu, tôi đã tạo rồi, hãy verify:
cat src/main.tsx
cat index.html
```

---

#### Lỗi 2: Cannot find module '../styles/globals.css'
```
Error: Cannot find module '../styles/globals.css'
```

**Nguyên nhân:** File CSS không tồn tại

**Giải pháp:**
```bash
# Kiểm tra
ls -la styles/globals.css

# Nếu không có, tạo file tạm:
mkdir -p styles
echo "@tailwind base; @tailwind components; @tailwind utilities;" > styles/globals.css
```

---

#### Lỗi 3: Failed to resolve import "react"
```
Failed to resolve import "react" from "src/main.tsx"
```

**Nguyên nhân:** Dependencies chưa cài

**Giải pháp:**
```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

---

#### Lỗi 4: Initialization error
```
Initialization error: [Object object]
```

**Nguyên nhân:** Database initialization failed (Supabase)

**Giải pháp - TẮT DATABASE INIT TẠM THỜI:**

Sửa `/src/App.tsx`:
```tsx
useEffect(() => {
  const initialize = async () => {
    try {
      // COMMENT dòng này
      // await checkDatabaseInitialization();
      
      setIsInitializing(false); // Thêm dòng này
      
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

---

### Bước 3: Kiểm tra Network Tab (F12)

Mở browser → F12 → Tab **Network** → Reload page

#### Kiểm tra các file:

1. **localhost:3000/** → Status: **200** ✅
   - Nếu 404 → index.html không load được

2. **src/main.tsx** → Status: **200** ✅
   - Nếu 404 → File không tồn tại

3. **@vite/client** → Status: **200** ✅
   - Nếu lỗi → Vite không chạy đúng

---

### Bước 4: Test Simple Version

Tạo file test đơn giản để verify Vite hoạt động:

**Tạo `/src/App.tsx` tạm thời:**
```tsx
function App() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#2baec0' }}>
        🎉 IT WORKS!
      </h1>
      <p>Nếu bạn thấy text này, Vite đã hoạt động!</p>
    </div>
  );
}

export default App;
```

**Sửa `/src/main.tsx` tạm thời:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import '../styles/globals.css'; // Comment tạm thời

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Chạy lại:**
```bash
npm run dev
```

**Nếu thấy "IT WORKS!" →** Vite hoạt động, vấn đề là ở code phức tạp

**Nếu vẫn trắng →** Vấn đề cơ bản hơn

---

### Bước 5: Kiểm tra Files Structure

```bash
# Kiểm tra structure
ls -la
ls -la src/
ls -la components/
ls -la styles/
```

**Cần có:**
```
/
├── index.html          ← PHẢI CÓ
├── package.json        ← PHẢI CÓ
├── vite.config.ts      ← PHẢI CÓ
├── src/
│   ├── main.tsx        ← PHẢI CÓ
│   └── App.tsx         ← PHẢI CÓ
├── styles/
│   └── globals.css     ← PHẢI CÓ
└── node_modules/       ← PHẢI CÓ (sau npm install)
```

---

### Bước 6: Check Dependencies

```bash
# Xem package.json
cat package.json

# Verify node_modules tồn tại
ls -la node_modules/react
ls -la node_modules/vite
```

**Nếu không có node_modules:**
```bash
npm install
```

---

### Bước 7: Port đã được sử dụng?

```bash
# Kill process trên port 3000
npx kill-port 3000

# Hoặc dùng port khác
npm run dev -- --port 3001
```

---

### Bước 8: Clear Cache

```bash
# Xóa Vite cache
rm -rf node_modules/.vite

# Xóa browser cache
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Hoặc dùng Incognito mode
```

---

## 🎯 GIẢI PHÁP NHANH NHẤT

Nếu bạn muốn **fix nhanh nhất**, làm theo:

### 1. Clean Everything
```bash
rm -rf node_modules package-lock.json
rm -rf node_modules/.vite
rm -rf build
```

### 2. Install Fresh
```bash
npm install
```

### 3. Verify Files
```bash
# Check các file quan trọng
cat index.html
cat src/main.tsx
cat src/App.tsx
cat package.json
```

### 4. Test Simple App
Sử dụng App.tsx đơn giản (xem Bước 4)

### 5. Run Dev
```bash
npm run dev
```

### 6. Mở browser
```
http://localhost:3000
```

---

## 📋 CHECKLIST DEBUG

- [ ] `npm install` đã chạy thành công
- [ ] `node_modules/` folder tồn tại
- [ ] `index.html` tồn tại ở root
- [ ] `src/main.tsx` tồn tại
- [ ] `src/App.tsx` tồn tại
- [ ] `styles/globals.css` tồn tại
- [ ] `npm run dev` chạy không lỗi
- [ ] Terminal hiển thị "ready in xxx ms"
- [ ] Browser đã mở http://localhost:3000
- [ ] F12 Console không có lỗi đỏ
- [ ] F12 Network tab: index.html status 200

---

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

Hãy cung cấp cho tôi:

### 1. Terminal Output
```bash
npm run dev
# Copy toàn bộ output
```

### 2. Browser Console (F12)
- Screenshot tab Console
- Copy toàn bộ lỗi màu đỏ

### 3. Network Tab (F12)
- Screenshot tab Network
- Xem file nào status 404 hoặc failed

### 4. System Info
```bash
node -v
npm -v
pwd
ls -la
```

### 5. File Check
```bash
cat index.html
cat src/main.tsx
cat package.json
```

---

## 🔧 QUICK FIX SCRIPT

Tạo file `fix.sh` và chạy:

```bash
#!/bin/bash

echo "🧹 Cleaning..."
rm -rf node_modules package-lock.json node_modules/.vite build

echo "📦 Installing..."
npm install

echo "🔍 Verifying files..."
if [ ! -f "index.html" ]; then
  echo "❌ Missing index.html"
  exit 1
fi

if [ ! -f "src/main.tsx" ]; then
  echo "❌ Missing src/main.tsx"
  exit 1
fi

if [ ! -f "src/App.tsx" ]; then
  echo "❌ Missing src/App.tsx"
  exit 1
fi

echo "✅ All files exist"

echo "🚀 Starting dev server..."
npm run dev
```

Chạy:
```bash
chmod +x fix.sh
./fix.sh
```

---

## 🎯 CÁC NGUYÊN NHÂN PHỔ BIẾN

1. **Dependencies chưa cài** → `npm install`
2. **Port 3000 đã dùng** → `npx kill-port 3000`
3. **File path sai** → Check imports
4. **Cache cũ** → Xóa `node_modules/.vite`
5. **Database init lỗi** → Comment `checkDatabaseInitialization()`
6. **Tailwind chưa setup** → Check `globals.css`
7. **Node version cũ** → Update Node >= 18

---

**Hãy thử từng bước và cho tôi biết bạn gặp lỗi gì cụ thể!** 🔍
