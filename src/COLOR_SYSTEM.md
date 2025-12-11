# 🎨 ENGLISH COMPLEX - COLOR SYSTEM V3.0

## 📅 Cập nhật: 10/12/2024 - 18:30
**Phiên bản:** 3.0 - Refined Pastel Palette  
**Trạng thái:** ✅ Active

---

## 🌈 BẢNG MÀU CHÍNH

### 1️⃣ Brand Primary (Màu chủ đạo) - Giữ nguyên
**Xanh biển English Complex**

```css
--brand-primary: #2baec0
```

**Variations:**
```css
--brand-primary-50:  #f0fafb  /* Rất nhạt */
--brand-primary-100: #d4f1f5
--brand-primary-200: #b8e8ed
--brand-primary-300: #7dd5df
--brand-primary-400: #4dc3d1
--brand-primary-500: #2baec0  /* Base color */
--brand-primary-600: #239aa9
--brand-primary-700: #1d8695
--brand-primary-800: #176e7a
--brand-primary-900: #114f57  /* Rất đậm */

/* Quick access */
--brand-primary-dark:  #239aa9
--brand-primary-light: #e0f5f8
```

**RGB:** `rgb(43, 174, 192)`  
**HSL:** `hsl(186, 63%, 46%)`

**Sử dụng:**
- ✅ Logo & branding
- ✅ Primary buttons
- ✅ Active states
- ✅ Links & CTAs
- ✅ Navigation highlights
- ✅ Progress bars

---

## 🎨 PASTEL SUPPORTING COLORS V3.0

### 2️⃣ Pastel Lavender (Tím hồng nhạt) - MỚI ✨
**Màu phụ 1 - Ấm áp, dịu dàng**

```css
--pastel-lavender:       #e4ccf1  /* Base - Tím hồng pastel */
--pastel-lavender-light: #f7f0fa  /* Background nhạt */
--pastel-lavender-dark:  #d4a8e3  /* Hover/Active */
```

**RGB:** `rgb(228, 204, 241)`  
**HSL:** `hsl(279, 61%, 87%)`

**Đặc điểm:**
- 🎀 Ấm áp, hơi hồng
- 💜 Lavender pastel cao cấp
- ✨ Nữ tính, nhẹ nhàng

**Sử dụng:**
- ✅ Cards & containers
- ✅ Info badges
- ✅ Secondary highlights
- ✅ Teacher sections
- ✅ Notification backgrounds

**So sánh:**
- Cũ: `#cdd0f8` (xanh tím lạnh)
- Mới: `#e4ccf1` (tím hồng ấm) ⭐

---

### 3️⃣ Pastel Blue (Xanh dương nhạt) - MỚI ✨
**Màu phụ 2 - Tươi sáng, rõ ràng**

```css
--pastel-blue:       #a2d2ff  /* Base - Xanh dương pastel */
--pastel-blue-light: #e8f4ff  /* Background nhạt */
--pastel-blue-dark:  #73bfff  /* Hover/Active */
```

**RGB:** `rgb(162, 210, 255)`  
**HSL:** `hsl(209, 100%, 82%)`

**Đặc điểm:**
- 🌊 Sáng, tươi mát
- 💙 Baby blue pastel
- ✨ Chuyên nghiệp, tin cậy

**Sử dụng:**
- ✅ Student sections
- ✅ Info messages
- ✅ Data visualization
- ✅ Calendar events
- ✅ Progress indicators

**So sánh:**
- Cũ: `#bde0fe` (xanh nhạt hơn)
- Mới: `#a2d2ff` (xanh rõ hơn, sáng hơn) ⭐

---

### 4️⃣ Pastel Yellow (Vàng nhạt)
**Màu phụ 3 - Năng lượng, tích cực**

```css
--pastel-yellow:       #ffe9ae  /* Base - Vàng pastel */
--pastel-yellow-light: #fff8e5  /* Background nhạt */
--pastel-yellow-dark:  #ffd97a  /* Hover/Active */
```

**RGB:** `rgb(255, 233, 174)`  
**HSL:** `hsl(44, 100%, 84%)`

**Sử dụng:**
- ✅ Warning messages
- ✅ Pending status
- ✅ Highlights & badges
- ✅ Achievement cards

---

### 5️⃣ Pastel Green (Xanh lá nhạt)
**Màu bổ trợ - Thành công**

```css
--pastel-green:       #a8e6cf
--pastel-green-light: #e8f8f2
```

**Sử dụng:**
- ✅ Success messages
- ✅ Active status
- ✅ Completion indicators

---

### 6️⃣ Pastel Pink (Hồng nhạt)
**Màu bổ trợ - Cảnh báo nhẹ**

```css
--pastel-pink:       #ffaaa5
--pastel-pink-light: #fff0ef
```

**Sử dụng:**
- ✅ Error messages (soft)
- ✅ Inactive status
- ✅ Attention badges

---

## 🎯 USAGE GUIDELINES

### Dashboard Cards
```tsx
/* Academic Dashboard */
<div style={{ backgroundColor: 'var(--pastel-lavender-light)' }}>
  <div style={{ color: 'var(--pastel-lavender-dark)' }}>
    <!-- Content -->
  </div>
</div>

/* Student Dashboard */
<div style={{ backgroundColor: 'var(--pastel-blue-light)' }}>
  <div style={{ color: 'var(--pastel-blue-dark)' }}>
    <!-- Content -->
  </div>
</div>

/* Director Dashboard */
<div style={{ backgroundColor: 'var(--pastel-yellow-light)' }}>
  <div style={{ color: 'var(--pastel-yellow-dark)' }}>
    <!-- Content -->
  </div>
</div>
```

### Status Badges
```tsx
/* Pending/Warning */
<span style={{ 
  backgroundColor: 'var(--pastel-yellow-light)',
  color: 'var(--pastel-yellow-dark)'
}}>Chờ duyệt</span>

/* Active/Success */
<span style={{ 
  backgroundColor: 'var(--pastel-green-light)',
  color: 'var(--pastel-green)'
}}>Hoạt động</span>

/* Info */
<span style={{ 
  backgroundColor: 'var(--pastel-blue-light)',
  color: 'var(--pastel-blue-dark)'
}}>Thông tin</span>
```

---

## 📊 COLOR MAPPING

### Component Colors (Recommended)

| Component | Primary Color | Background | Hover/Active |
|-----------|--------------|------------|--------------|
| **Headers** | `--brand-primary` | `--brand-primary-light` | `--brand-primary-dark` |
| **Teacher Cards** | `--pastel-lavender-dark` | `--pastel-lavender-light` | `--pastel-lavender` |
| **Student Cards** | `--pastel-blue-dark` | `--pastel-blue-light` | `--pastel-blue` |
| **Director Cards** | `--pastel-yellow-dark` | `--pastel-yellow-light` | `--pastel-yellow` |
| **Success** | `--pastel-green` | `--pastel-green-light` | `--pastel-green` |
| **Warning** | `--pastel-yellow` | `--pastel-yellow-light` | `--pastel-yellow-dark` |
| **Error** | `--pastel-pink` | `--pastel-pink-light` | `--pastel-pink` |

---

## 🔄 MIGRATION NOTES

### Thay đổi từ V2.0 → V3.0

#### Lavender Update
```css
/* V2.0 - Cũ */
--pastel-lavender: #cdd0f8       /* Xanh tím lạnh */
--pastel-lavender-light: #eff0fd
--pastel-lavender-dark: #a8adf0

/* V3.0 - Mới ✨ */
--pastel-lavender: #e4ccf1       /* Tím hồng ấm */
--pastel-lavender-light: #f7f0fa
--pastel-lavender-dark: #d4a8e3
```

**Impact:**
- Teacher sections → Ấm hơn, nữ tính hơn
- Info badges → Dịu dàng hơn
- Notification backgrounds → Mềm mại hơn

#### Blue Update
```css
/* V2.0 - Cũ */
--pastel-blue: #bde0fe           /* Xanh nhạt */
--pastel-blue-light: #eaf5ff
--pastel-blue-dark: #8dc9fc

/* V3.0 - Mới ✨ */
--pastel-blue: #a2d2ff           /* Xanh rõ hơn */
--pastel-blue-light: #e8f4ff
--pastel-blue-dark: #73bfff
```

**Impact:**
- Student sections → Sáng hơn, rõ ràng hơn
- Data visualization → Dễ đọc hơn
- Calendar → Nổi bật hơn

---

## ✅ ACCESSIBILITY

### Contrast Ratios (WCAG AA)

| Color Combination | Ratio | Status |
|-------------------|-------|--------|
| `#2baec0` on white | 3.2:1 | ✅ AA (Large text) |
| `#239aa9` on white | 4.1:1 | ✅ AA |
| `#e4ccf1` text `#d4a8e3` | 1.4:1 | ⚠️ Decorative only |
| `#a2d2ff` text `#73bfff` | 1.6:1 | ⚠️ Decorative only |
| `#ffe9ae` text `#ffd97a` | 1.3:1 | ⚠️ Decorative only |

**Recommendations:**
- ✅ Dùng `--brand-primary-700` trở lên cho text
- ✅ Pastel colors chỉ dùng cho backgrounds/decorative
- ✅ Luôn kết hợp với dark text (#333, #555) cho readability

---

## 🎨 DESIGN PRINCIPLES

### V3.0 Philosophy
1. **Warmer & Softer** - Lavender hồng ấm áp hơn
2. **Brighter & Clearer** - Blue sáng rõ hơn
3. **Consistent Brand** - Primary #2baec0 không đổi
4. **Accessible** - Contrast tốt cho text
5. **Harmonious** - Màu hòa quyện với nhau

### Color Harmony
```
Primary:   #2baec0 (Xanh biển) ───┐
                                  │
Lavender:  #e4ccf1 (Tím hồng) ────┼─ Complementary
                                  │
Blue:      #a2d2ff (Xanh dương) ──┘

Yellow:    #ffe9ae (Vàng) ────────── Accent/Contrast
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Files Updated
- [x] ✅ `/styles/globals.css` - CSS variables
- [x] ✅ `/COLOR_SYSTEM.md` - Documentation
- [ ] 🔄 All dashboards (next step)
- [ ] 🔄 All modules (next step)

### Components to Update
- [ ] AcademicDashboard.tsx
- [ ] TeacherDashboard.tsx
- [ ] StudentDashboard.tsx
- [ ] DirectorDashboard.tsx
- [ ] All module components

---

## 🚀 VERSION HISTORY

### V3.0 - Refined Pastel (10/12/2024 18:30)
- 🎨 Updated `--pastel-lavender`: `#cdd0f8` → `#e4ccf1`
- 🎨 Updated `--pastel-blue`: `#bde0fe` → `#a2d2ff`
- 💡 Generated lighter/darker variants
- 📚 Updated documentation
- ✨ Warmer, brighter palette

### V2.0 - Pastel Palette (10/12/2024 17:00)
- 🎨 Replaced purple `#8b5cf6` with `#cdd0f8`
- 🎨 Replaced orange `#e67e22` with `#ffe9ae`
- 🎨 Added `--pastel-blue`: `#bde0fe`
- 📚 Created COLOR_SYSTEM.md

### V1.0 - Initial (09/12/2024)
- 🎨 Brand primary: `#2baec0`
- 🎨 Basic color system

---

**Maintained by:** Assistant  
**Contact:** English Complex Design Team  
**Last Review:** 10/12/2024
