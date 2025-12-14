/**
 * Image Assets Helper
 * 
 * HƯỚNG DẪN THAY ẢNH:
 * 
 * 1. Nếu dùng figma:asset:
 *    - Tìm hash ID của file trong folder assets
 *    - Thay đổi import bên dưới
 * 
 * 2. Nếu dùng file local:
 *    - Copy file vào /public/images/
 *    - Uncomment dòng export const ... = '/images/...'
 *    - Comment dòng import figma:asset
 */

// ============================================
// OPTION 1: FIGMA ASSETS (Mặc định)
// ============================================

// Logo - Thay hash này bằng hash của file "2-removebg-preview.png"
// Ví dụ: import logo from 'figma:asset/abc123xyz.png';
import logoDefault from 'figma:asset/dd0c38c752428dd137a2714c0bfc56ea8f160c00.png';

// Logo 3D - Dùng logo trong dashboard
import logo3DDefault from 'figma:asset/f622a5ebfd97d64a4d171316f8cb3731d4968ae8.png';

// Ảnh mặc định - Thay hash này bằng hash của file "3-removebg-preview.png"
// import defaultImage from 'figma:asset/xyz789.png';

export const logo = logoDefault;
export const logo3D = logo3DDefault;
// export const defaultImage = defaultImageDefault;

// ============================================
// OPTION 2: LOCAL FILES (Uncomment để dùng)
// ============================================

// Nếu bạn muốn dùng files local trong /public/images/:
// 1. Copy "2-removebg-preview.png" vào /public/images/logo.png
// 2. Copy "3-removebg-preview.png" vào /public/images/default.png
// 3. Uncomment 2 dòng dưới đây:

// export const logo = '/images/logo.png';
// export const logo3D = '/images/logo.png';
// export const defaultImage = '/images/default.png';


// ============================================
// AVATAR & PLACEHOLDER HELPERS
// ============================================

export const getAvatarUrl = (avatar?: string): string => {
  if (!avatar) {
    // Return default avatar
    return '/images/default-avatar.png'; // Có thể dùng file 3
  }
  
  // Nếu avatar là URL đầy đủ (từ production)
  if (avatar.startsWith('http')) {
    // CORS issue - dùng default
    console.warn('Avatar from external URL may have CORS issue:', avatar);
    return '/images/default-avatar.png';
  }
  
  // Nếu avatar chỉ là filename
  if (!avatar.includes('/')) {
    return `/images/avatars/${avatar}`;
  }
  
  return avatar;
};

export const getImageUrl = (image?: string): string => {
  if (!image) {
    // Return default image - Có thể dùng file 3
    return '/images/default.png';
  }
  
  // Nếu là URL đầy đủ
  if (image.startsWith('http')) {
    console.warn('Image from external URL may have CORS issue:', image);
    return '/images/default.png';
  }
  
  return image;
};

// ============================================
// CONSTANTS
// ============================================

export const IMAGE_PATHS = {
  LOGO: logo,
  LOGO_3D: logo3D,
  DEFAULT_AVATAR: '/images/default-avatar.png',
  DEFAULT_IMAGE: '/images/default.png',
} as const;
