import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Budget from './pages/Budget';
import Prediksi from './pages/Prediksi';
import Setting from './pages/Setting';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tahan render selama 1.2 detik agar semua aset dan font termuat sempurna
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c0f1a',
        zIndex: 9999,
        color: '#fff'
      }}>
        <div style={{
          width: '45px',
          height: '45px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#5c5cff',
          borderRadius: '50%',
          animation: 'monifySpin 1s linear infinite'
        }} />
        <h2 style={{ 
          marginTop: '20px', 
          fontFamily: '"Outfit", sans-serif', 
          fontWeight: 600, 
          letterSpacing: '2px',
          color: '#fff'
        }}>Monify</h2>
        <style>
          {`
            @keyframes monifySpin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/team" element={<Team />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/prediksi" element={<Prediksi />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/profil" element={<Navigate to="/setting" replace />} />
          <Route path="/laporan" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
