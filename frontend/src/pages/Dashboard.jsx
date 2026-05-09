import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah } from '../utils/store';
import { Wallet, CreditCard, Target, Sparkles, Utensils, Car, ShoppingBag, Gamepad2, Wifi, Paperclip, Search } from 'lucide-react';

export default function Dashboard() {
  const { setMobileMenuOpen } = useOutletContext();
  const [s, setS] = useState(null);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const load = () => {
      const st = getState();
      setS(summary(st));
      setBudget(st.profile.budget);
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, []);

  if (!s) return null;

  const data = [120000, 84000, 180000, 90000, 160000, 73000, 110000];
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  
  const icons = { Makanan:<Utensils size={20}/>, Transport:<Car size={20}/>, Belanja:<ShoppingBag size={20}/>, Hiburan:<Gamepad2 size={20}/>, Internet:<Wifi size={20}/>, Lainnya:<Paperclip size={20}/> };
  const rows = Object.entries(s.byCategory).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const topAction = (
    <>
      <div className="search-box"><Search size={18} /> <input placeholder="Cari transaksi..." /></div>
      <Link className="btn btn-primary" to="/transaksi"><span>Tambah Transaksi</span> +</Link>
    </>
  );

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Dashboard Utama" 
        desc="Ringkasan uang, budget, dan sinyal boros bulan ini." 
        extraAction={topAction}
      />
      <section className="hero-dashboard">
        <div className="balance-card">
          <span className="label">Saldo Saat Ini</span>
          <h2>{rupiah(s.balance)}</h2>
          <p>Angka ini dihitung dari pemasukan dikurangi semua pengeluaran yang sudah kamu catat. Kalau jarang input, dashboard ini akan menipu kamu sendiri.</p>
          <div className="balance-actions">
            <Link className="btn btn-ghost" to="/transaksi">Catat Pengeluaran</Link>
            <Link className="btn btn-ghost" to="/budget">Atur Budget</Link>
          </div>
        </div>
        <div className="ai-panel">
          <div className="ai-panel-head">
            <div className="ai-title"><Sparkles size={18} /> <h3>AI Budget Signal</h3></div>
            <span className={`badge ${s.risk >= 100 ? 'danger' : s.risk >= 70 ? 'warn' : 'safe'}`}>
              {s.risk >= 100 ? 'Bahaya' : s.risk >= 70 ? 'Waspada' : 'Aman'}
            </span>
          </div>
          <p className="ai-desc">{s.risk >= 100 ? 'Risiko tinggi. Pengeluaran diprediksi melewati budget.' : s.risk >= 70 ? 'Mulai rawan. Kurangi belanja non-prioritas minggu ini.' : 'Masih aman, tetap pantau transaksi.'}</p>
          <div className="risk-meter">
            <div className="meter-head"><span>Risiko over budget</span><b>{s.risk}%</b></div>
            <div className="meter"><span style={{width: `${Math.min(100, s.risk)}%`, background: s.risk >= 100 ? '#f45f5f' : s.risk >= 70 ? '#f4b740' : '#33e5a0'}}></span></div>
          </div>
          <div className="ai-note">
            <div className="ai-note-top">
              <div className="ai-note-label">Safe-to-spend hari ini</div>
              <div className="ai-note-value">{rupiah(s.safe)}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Wallet size={24}/></div><span className="stat-pill">Masuk</span></div><h3>{rupiah(s.income)}</h3><p>Total pemasukan bulan ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><CreditCard size={24}/></div><span className="stat-pill">Keluar</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran tercatat</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Target size={24}/></div><span className="stat-pill">Budget</span></div><h3>{rupiah(budget)}</h3><p>Limit pengeluaran bulanan</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Sparkles size={24}/></div><span className="stat-pill">Prediksi</span></div><h3>{rupiah(s.projected)}</h3><p>Estimasi pengeluaran akhir bulan</p></div>
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><div><h2>Pengeluaran Mingguan</h2><p>Visual sederhana untuk melihat hari yang paling boros.</p></div><span className="badge">Live Demo</span></div>
          <div className="bars">
            {days.map((d, i) => (
              <div className="bar-wrap" key={d}>
                <div className="bar" style={{height: `${Math.max(24, data[i]/2200)}px`}}></div>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h2>Kategori Teratas</h2><p>Fokus hemat dimulai dari kategori terbesar.</p></div><span className="badge">{s.topCategory[0]}</span></div>
          <div className="category-list">
            {rows.length ? rows.map(([cat, val]) => (
              <div className="cat-row" key={cat}>
                <div className="cat-icon">{icons[cat] || '📌'}</div>
                <div><strong>{cat}</strong><small>{Math.round((val / Math.max(1,s.expense))*100)}% dari pengeluaran</small></div>
                <em>{rupiah(val)}</em>
              </div>
            )) : <div className="empty-state"><strong>Belum ada data</strong>Tambah transaksi dulu.</div>}
          </div>
        </div>
      </section>
    </>
  );
}