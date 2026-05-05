import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    // Cek koneksi ke backend
    axios.get('/api/health')
      .then(res => setHealthStatus(res.data.status))
      .catch(() => setHealthStatus('Backend belum berjalan'));
  }, []);

  return (
    <div className="container dashboard">
      {/* Hero Section */}
      <section className="hero animate-fade-in">
        <h1 className="hero-title">
          Kelola Keuanganmu
          <br />
          <span className="gradient-text">dengan AI Cerdas</span>
        </h1>
        <p className="hero-subtitle">
          MONIFY membantu Anda mengelola keuangan pribadi secara otomatis
          menggunakan teknologi Deep Learning untuk kategorisasi dan prediksi pengeluaran.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="glass-card stat-card animate-fade-in-delay-1">
          <div className="stat-icon income">📈</div>
          <div className="stat-info">
            <span className="stat-label">Total Pemasukan</span>
            <span className="stat-value">Rp 0</span>
          </div>
        </div>

        <div className="glass-card stat-card animate-fade-in-delay-2">
          <div className="stat-icon expense">📉</div>
          <div className="stat-info">
            <span className="stat-label">Total Pengeluaran</span>
            <span className="stat-value">Rp 0</span>
          </div>
        </div>

        <div className="glass-card stat-card animate-fade-in-delay-3">
          <div className="stat-icon balance">💎</div>
          <div className="stat-info">
            <span className="stat-label">Saldo</span>
            <span className="stat-value">Rp 0</span>
          </div>
        </div>
      </section>

      {/* Backend Status */}
      <section className="glass-card status-card animate-fade-in-delay-3">
        <h2>🔗 Status Koneksi</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className={`status-dot ${healthStatus ? 'online' : 'offline'}`}></span>
            <span>Express Backend: <strong>{healthStatus || 'Mengecek...'}</strong></span>
          </div>
          <div className="status-item">
            <span className="status-dot offline"></span>
            <span>AI Service: <strong>Belum terkoneksi</strong></span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
