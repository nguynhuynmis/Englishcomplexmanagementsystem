// 🧪 SIMPLE TEST VERSION
// Nếu npm run dev vẫn không hiện gì, hãy:
// 1. Đổi tên file này thành App.tsx
// 2. Backup App.tsx cũ thành App.backup.tsx
// 3. Test xem có hiện "IT WORKS!" không

function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '64px', 
        color: '#2baec0',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        🎉 IT WORKS!
      </h1>
      
      <p style={{
        fontSize: '24px',
        color: '#64748b',
        marginBottom: '40px'
      }}>
        Vite + React đang hoạt động!
      </p>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'left'
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>
          ✅ Bước tiếp theo:
        </h2>
        <ol style={{ color: '#475569', lineHeight: '1.8' }}>
          <li>Vite dev server đang chạy ✅</li>
          <li>React render thành công ✅</li>
          <li>Giờ restore App.tsx gốc</li>
          <li>Debug từng component một</li>
        </ol>
      </div>

      <div style={{ marginTop: '40px', color: '#94a3b8' }}>
        <p>Port: 3000 | Framework: React | Build Tool: Vite</p>
      </div>
    </div>
  );
}

export default App;
