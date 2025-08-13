// CACHE BUSTER V3 - Minimal React app to test React hook issues
function App() {
  console.log("✅ New App component loaded successfully - v3");
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          ProfitPad - Fixed! ✅
        </h1>
        <p style={{ color: '#64748b' }}>React is working correctly now!</p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Cache cleared - v3.0 - {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default App;
