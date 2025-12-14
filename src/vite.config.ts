import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Nếu deploy vào subfolder, uncomment dòng dưới và sửa path
  // base: '/english-complex/',
  
  // Nếu deploy vào root hoặc subdomain, để base: '/'
  base: '/',
  
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: false,
  },
  
  server: {
    port: 3000,
  },
});
