import fs from 'fs';
import path from 'path';

const srcPagesDir = path.join(process.cwd(), 'src', 'pages');
if (!fs.existsSync(srcPagesDir)) fs.mkdirSync(srcPagesDir, { recursive: true });

const prediksiCode = `
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah, toast, timestamp } from '../utils/store';

export default function Prediksi() {
  const { setMobileMenuOpen } = useOutletContext();
  const [s, setS] = useState(null);
  const [st, setSt] = useState(null);
  const [aiStamp, setAiStamp] = useState('Klik update untuk menyegarkan rekomendasi dari data terbaru.');

  useEffect(() => {
    const load = () => {
      const state = getState();
      setSt(state);
      setS(summary(state));
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, []);

  if (!s || !st) return null;

  const getStatus = () => {
    if (s.risk >= 100) return <><span className="badge danger">Over budget</span><p className="help">Prediksi pengeluaran melewati budget. Kurangi kategori terbesar sekarang.</p></>;
    if (s.risk >= 80) return <><span className="badge warn">Rawan boros</span><p className="help">Masih bisa diselamatkan kalau pengeluaran non-prioritas dikurangi minggu ini.</p></>;
    return <><span className="badge">Aman</span><p className="help">Budget masih sehat. Tetap catat transaksi supaya prediksi tidak ngawur.</p></>;
  };

  const recos = [
    \`Batasi kategori \${s.topCategory[0]} karena jadi pengeluaran terbesar bulan ini.\`,
    \`Gunakan batas harian \${rupiah(s.safe)} sebagai angka aman belanja hari ini.\`,
    \`Catat transaksi kecil juga. Kopi, parkir, dan jajan biasanya yang bikin prediksi meleset.\`,
    \`Sisihkan target tabungan \${rupiah(st.profile.savingTarget)} lebih awal, bukan menunggu sisa uang.\`
  ];

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Prediksi AI" 
        desc="Empat fitur utama: kategori otomatis, prediksi bulanan, over budget, dan safe-to-spend." 
        extraAction={<><button className="btn btn-primary" onClick={() => { setAiStamp(\`Rekomendasi terakhir diperbarui: \${timestamp()}.\`); toast('Prediksi AI diperbarui.'); }}>Update Prediksi</button><Link className="btn btn-ghost" to="/transaksi">Tambah Data</Link></>} 
      />
      <section className="feature-grid" style={{marginBottom: '20px'}}>
        <div className="feature-card"><i>🏷️</i><h3>Klasifikasi Otomatis</h3><p>Deskripsi transaksi dibaca lalu diarahkan ke kategori yang sesuai.</p></div>
        <div className="feature-card"><i>📈</i><h3>Prediksi Pengeluaran</h3><p>Riwayat transaksi dipakai untuk memperkirakan pengeluaran sampai akhir bulan.</p></div>
        <div className="feature-card"><i>🛡️</i><h3>Deteksi Over Budget</h3><p>Prediksi dibandingkan dengan budget untuk memberi sinyal dini.</p></div>
      </section>
      <section className="insight-board">
        <div className="prediction-card">
          <h3>Prediksi Akhir Bulan</h3><p className="help">Estimasi total pengeluaran jika pola harian tetap sama.</p>
          <div className="big-number">{rupiah(s.projected)}</div>
          <span className="badge">Budget: <b>{rupiah(st.profile.budget)}</b></span>
        </div>
        <div className="prediction-card">
          <h3>Safe-to-Spend Hari Ini</h3><p className="help">Batas belanja aman per hari agar budget tidak jebol.</p>
          <div className="big-number">{rupiah(s.safe)}</div>
          <span className="badge">Sisa hari dihitung otomatis</span>
        </div>
        <div className="prediction-card">
          <h3>Risiko Over Budget</h3><p className="help">Semakin tinggi, semakin besar peluang pengeluaran melewati budget.</p>
          <div className="big-number">{s.risk}%</div>
          <div className="progress warn"><span style={{width: \`\${Math.min(100, s.risk)}%\`}}></span></div>
          <div style={{marginTop: '14px'}}>{getStatus()}</div>
        </div>
        <div className="prediction-card">
          <h3>Rekomendasi MONIFY</h3><p className="help">{aiStamp}</p>
          <div className="reco-list">
            {recos.map((text, i) => <div className="reco" key={i}><i>{['🎯','🧮','🧾','💚'][i]}</i><span>{text}</span></div>)}
          </div>
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Prediksi.jsx'), prediksiCode);

const laporanCode = `
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah } from '../utils/store';

export default function Laporan() {
  const { setMobileMenuOpen } = useOutletContext();
  const [period, setPeriod] = useState('month');
  const [dateVal, setDateVal] = useState(new Date().toISOString().slice(0,10));
  const [monthVal, setMonthVal] = useState(\`\${new Date().getFullYear()}-\${String(new Date().getMonth()+1).padStart(2,'0')}\`);
  const [yearVal, setYearVal] = useState(new Date().getFullYear());
  
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [s, setS] = useState(null);

  useEffect(() => {
    const load = () => {
      const state = getState();
      const filtered = state.transactions.filter(item => {
        if (period === 'day') return item.date === dateVal;
        if (period === 'year') return item.date.slice(0,4) === String(yearVal);
        return item.date.slice(0,7) === monthVal;
      });
      setFilteredTransactions(filtered);
      setS(summary(state, filtered));
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, [period, dateVal, monthVal, yearVal]);

  if (!s) return null;

  const label = period === 'day' ? 'hari ini/tanggal terpilih' : period === 'year' ? 'tahun terpilih' : 'bulan terpilih';

  return (
    <>
      <Topbar setMobileMenuOpen={setMobileMenuOpen} title="Laporan Keuangan" desc="Lihat ringkasan harian, bulanan, dan tahunan tanpa pindah halaman." extraAction={<button className="btn btn-ghost" onClick={() => window.print()}>Cetak</button>} />
      <section className="panel report-filter-panel">
        <div className="panel-head"><div><h2>Periode Laporan</h2><p>Pilih tanggal harian, bulan, atau tahun. Angka di bawah akan otomatis berubah.</p></div></div>
        <div className="report-controls">
          <button className={\`btn \${period === 'day' ? 'btn-primary' : 'btn-ghost'}\`} onClick={() => setPeriod('day')}>Hari Ini</button>
          <button className={\`btn \${period === 'month' ? 'btn-primary' : 'btn-ghost'}\`} onClick={() => setPeriod('month')}>Bulan Ini</button>
          <button className={\`btn \${period === 'year' ? 'btn-primary' : 'btn-ghost'}\`} onClick={() => setPeriod('year')}>Tahun Ini</button>
          <div className="field"><label>Tanggal</label><div className="input-wrap"><input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)} /></div></div>
          <div className="field"><label>Bulan</label><div className="input-wrap"><input type="month" value={monthVal} onChange={e=>setMonthVal(e.target.value)} /></div></div>
          <div className="field"><label>Tahun</label><div className="input-wrap"><input type="number" value={yearVal} onChange={e=>setYearVal(e.target.value)} min="2020" max="2035" /></div></div>
        </div>
      </section>
      <section className="stats-grid report-stats">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">💸</div><span className="stat-pill">Keluar</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">💰</div><span className="stat-pill">Masuk</span></div><h3>{rupiah(s.income)}</h3><p>Total pemasukan</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🔥</div><span className="stat-pill">Terbesar</span></div><h3>{s.topCategory[0]}</h3><p>Kategori pengeluaran terbesar</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🧾</div><span className="stat-pill">Data</span></div><h3>{s.total}</h3><p>Jumlah transaksi</p></div>
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><div><h2>Kesimpulan Periode</h2></div></div>
          <div className="reco-list">
            <div className="reco"><i>📌</i><span>Pada {label}, pemasukan tercatat {rupiah(s.income)} dan pengeluaran {rupiah(s.expense)}.</span></div>
            <div className="reco"><i>🔥</i><span>Kategori terbesar adalah {s.topCategory[0]} dengan total {rupiah(s.topCategory[1])}.</span></div>
            <div className="reco"><i>🧠</i><span>Jumlah transaksi: {s.total}.</span></div>
          </div>
        </div>
        <div className="table-card">
          <div className="panel-head" style={{padding:'22px 22px 0'}}><div><h2>Transaksi Periode Ini</h2></div></div>
          <table>
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori</th><th>Nominal</th></tr></thead>
            <tbody>
              {filteredTransactions.length ? filteredTransactions.map(x => (
                <tr key={x.id}>
                  <td>{x.date}</td>
                  <td><strong>{x.title}</strong><br/><small style={{color:'#6b7b74'}}>{x.note || '-'}</small></td>
                  <td><span className={\`badge \${x.type==='income'?'':'warn'}\`}>{x.category}</span></td>
                  <td className={x.type==='income'?'amount-plus':'amount-minus'}>{x.type==='income'?'+':'-'} {rupiah(x.amount)}</td>
                </tr>
              )) : <tr><td colSpan="4"><div className="empty-state"><strong>Belum ada transaksi</strong>Ubah periode atau tambahkan data.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Laporan.jsx'), laporanCode);

const profilCode = `
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, toast } from '../utils/store';

export default function Profil() {
  const { setMobileMenuOpen } = useOutletContext();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    setUser(getState().user);
  }, []);

  const handleProfile = (e) => {
    e.preventDefault();
    const st = getState();
    st.user.name = user.name;
    st.user.email = user.email;
    setState(st);
    toast('Profil demo diperbarui.');
  };

  const handlePassword = (e) => {
    e.preventDefault();
    const newPass = e.target.elements.newPass.value;
    const confirmPass = e.target.elements.confirmPass.value;
    if (newPass !== confirmPass) return toast('Password baru dan konfirmasi belum sama.');
    e.target.reset();
    toast('Password demo berhasil diganti.');
  };

  const handleLogout = () => {
    localStorage.removeItem('monify_logged_in');
    navigate('/');
  };

  const handleReset = () => {
    localStorage.removeItem('monify_state');
    toast('Data demo direset.');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <Topbar setMobileMenuOpen={setMobileMenuOpen} title="Profil & Pengaturan" desc="Kelola akun demo dan navigasi keluar dari dashboard." extraAction={<><Link className="btn btn-ghost" to="/">Landing Page</Link><button className="btn btn-primary" onClick={handleLogout}>Keluar</button></>} />
      <section className="page-grid">
        <div className="panel profile-card">
          <div className="panel-head"><div><h2>Informasi Akun</h2></div></div>
          <form className="form-grid" onSubmit={handleProfile}>
            <div className="field"><label>Nama</label><div className="input-wrap"><input value={user.name} onChange={e=>setUser({...user, name: e.target.value})} /></div></div>
            <div className="field"><label>Email</label><div className="input-wrap"><input type="email" value={user.email} onChange={e=>setUser({...user, email: e.target.value})} /></div></div>
            <button className="btn btn-primary" type="submit">Simpan Profil</button>
          </form>
        </div>
        <div className="panel profile-card">
          <div className="panel-head"><div><h2>Ganti Password</h2></div></div>
          <form className="form-grid" onSubmit={handlePassword}>
            <div className="field"><label>Password Lama</label><div className="input-wrap"><input type="password" placeholder="Password lama" required /></div></div>
            <div className="field"><label>Password Baru</label><div className="input-wrap"><input name="newPass" type="password" placeholder="Password baru" required /></div></div>
            <div className="field"><label>Konfirmasi Password</label><div className="input-wrap"><input name="confirmPass" type="password" placeholder="Ulangi password baru" required /></div></div>
            <button className="btn btn-primary" type="submit">Simpan Password</button>
          </form>
        </div>
      </section>
      <section className="panel account-actions">
        <div className="panel-head"><div><h2>Aksi Akun</h2></div></div>
        <div className="form-actions">
          <Link className="btn btn-ghost" to="/">Kembali ke Landing Page</Link>
          <button className="btn btn-primary" type="button" onClick={handleLogout}>Keluar dari Dashboard</button>
          <button className="btn btn-ghost" type="button" onClick={handleReset}>Reset Data Demo</button>
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Profil.jsx'), profilCode);

const landingCode = `
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authView, setAuthView] = React.useState('login');

  const handleAuth = (e) => {
    e.preventDefault();
    localStorage.setItem('monify_logged_in', 'true');
    navigate('/dashboard');
  };

  const openAuth = (view) => {
    setAuthView(view);
    setAuthOpen(true);
    document.body.classList.add('auth-locked');
  };
  const closeAuth = () => {
    setAuthOpen(false);
    document.body.classList.remove('auth-locked');
  };

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.site-header');
      if (window.scrollY > 10) header?.classList.add('scrolled');
      else header?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar openAuth={openAuth} />
      <main>
        <section className="hero section-pad">
          <div className="container hero-grid">
            <div className="hero-copy reveal visible">
              <div className="eyebrow">Capstone Project • AI Finance Assistant</div>
              <h1>Kontrol <span>Keuanganmu</span> dengan AI</h1>
              <p>Catat, analisis, dan prediksi pengeluaranmu secara otomatis.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => openAuth('login')}>Login Sekarang</button>
                <a className="btn btn-outline" href="#fitur"><span className="play-dot">↓</span> Lihat Fitur</a>
              </div>
              <div className="hero-stats">
                <div><strong>4</strong><span>Fitur AI</span></div>
                <div><strong>24/7</strong><span>Insight</span></div>
                <div><strong>1</strong><span>Dashboard</span></div>
              </div>
            </div>
            <div className="phone-stage reveal delay-1 visible" id="demo">
              <div className="blob blob-one"></div>
              <div className="blob blob-two"></div>
              <div className="phone-card">
                <div className="phone-notch"></div>
                <div className="phone-top">
                  <div><span>Total Saldo</span><h3>Rp 12.450.000</h3></div>
                  <div className="mini-avatar">I</div>
                </div>
                <div className="balance-box">
                  <span>Pengeluaran Bulan Ini</span><strong>Rp 3.200.000</strong>
                  <div className="progress"><i style={{width:'72%'}}></i></div>
                </div>
                <div className="chart-box">
                  <div className="bars"><i style={{height:'34%'}}></i><i style={{height:'52%'}}></i><i style={{height:'41%'}}></i><i style={{height:'74%'}}></i></div>
                  <div className="predict-card">Prediksi</div>
                </div>
                <div className="ai-note"><span>✦</span><p>AI mendeteksi pengeluaran kopi naik 20% minggu ini.</p></div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="tools" id="fitur">
          <div className="container">
            <div className="section-title reveal visible">
              <span className="pill">Fitur Unggulan</span>
              <h2>Smart Tools untuk Uang Pintar</h2>
            </div>
            <div className="feature-grid">
              <article className="feature-card reveal visible">
                <div className="feature-icon">⌕</div><span className="feature-tag">Otomatis</span>
                <h3>Klasifikasi Otomatis</h3><p>Tiap transaksi langsung dikategorikan oleh AI.</p>
                <div className="chip-row"><span>Makanan</span><span>Transport</span><span>Hiburan</span></div>
              </article>
              <article className="feature-card reveal visible delay-1">
                <div className="feature-icon">▣</div><span className="feature-tag">Prediktif</span>
                <h3>Prediksi Pengeluaran</h3><p>Tahu sebelum kehabisan. AI memprediksi sisa saldo.</p>
                <div className="mini-bars"><i></i><i></i><i></i><i></i><b></b></div>
              </article>
              <article className="feature-card reveal visible delay-2">
                <div className="feature-icon">◇</div><span className="feature-tag">Proteksi</span>
                <h3>Deteksi Over Budget</h3><p>Dapat peringatan dini saat pengeluaran mulai melewati limit.</p>
                <div className="risk-meter"><span>Budget Makanan</span><strong>78%</strong><i></i></div>
              </article>
              <article className="feature-card reveal visible delay-3">
                <div className="feature-icon">✓</div><span className="feature-tag">Harian</span>
                <h3>Safe to Spend</h3><p>Lihat batas aman uang yang boleh dipakai hari ini.</p>
                <div className="safe-card"><b>Rp 42.000</b><span>Aman dipakai hari ini</span></div>
              </article>
            </div>
          </div>
        </section>
      </main>
      
      {authOpen && (
        <div className="auth-modal open">
          <div className="auth-modal-backdrop" onClick={closeAuth}></div>
          <section className="auth-modal-card">
            <aside className="auth-modal-brand">
              <div className="auth-modal-copy">
                <h2>Masuk dulu, baru uangmu bisa dibaca dengan rapi.</h2>
              </div>
            </aside>
            <div className="auth-modal-panel">
              <button className="auth-close" onClick={closeAuth}>×</button>
              <div className="auth-tabs">
                <button className={authView === 'login' ? 'active' : ''} onClick={() => setAuthView('login')}>Masuk</button>
                <button className={authView === 'register' ? 'active' : ''} onClick={() => setAuthView('register')}>Daftar</button>
              </div>
              <form className={\`auth-form \${authView === 'login' ? 'active' : ''}\`} onSubmit={handleAuth}>
                <div className="auth-heading"><h3>Selamat datang kembali</h3></div>
                <div className="auth-field"><input type="email" placeholder="nama@email.com" required /></div>
                <div className="auth-field"><input type="password" placeholder="Masukkan password" required /></div>
                <button className="btn btn-primary auth-submit" type="submit">Masuk ke Dashboard</button>
              </form>
              <form className={\`auth-form \${authView === 'register' ? 'active' : ''}\`} onSubmit={handleAuth}>
                <div className="auth-heading"><h3>Buat Akun</h3></div>
                <div className="auth-field"><input type="text" placeholder="Nama Lengkap" required /></div>
                <div className="auth-field"><input type="email" placeholder="nama@email.com" required /></div>
                <div className="auth-field"><input type="password" placeholder="Password" required /></div>
                <button className="btn btn-primary auth-submit" type="submit">Daftar & Masuk</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Landing.jsx'), landingCode);

const teamCode = `
import React from 'react';
import Navbar from '../components/Navbar';

export default function Team() {
  return (
    <>
      <Navbar openAuth={() => {}} />
      <main>
        <section className="team-hero section-pad">
          <div className="container team-hero-grid">
            <div className="reveal visible">
              <span className="pill">MONIFY TEAM</span>
              <h1>Tim kecil dengan tugas yang jelas.</h1>
              <p>Monify dikembangkan oleh 6 anggota dengan pembagian kerja Data Scientist, AI Engineer, dan Full-Stack Web Developer.</p>
            </div>
          </div>
        </section>
        <section className="members section-pad" style={{background:'#f7fbf9'}}>
          <div className="container">
            <div className="member-grid">
              <article className="member-card reveal visible">
                <div className="member-top"><div className="avatar avatar-green">KE</div></div>
                <h3>Kristina Ester</h3><p>Ketua Tim & Data Scientist</p>
              </article>
              <article className="member-card reveal visible">
                <div className="member-top"><div className="avatar avatar-mint">CV</div></div>
                <h3>Chenida Rira Verlyta</h3><p>Data Scientist</p>
              </article>
              <article className="member-card reveal visible">
                <div className="member-top"><div className="avatar avatar-blue">FO</div></div>
                <h3>Faradila Octavia Nabila</h3><p>AI Engineer</p>
              </article>
              <article className="member-card reveal visible">
                <div className="member-top"><div className="avatar avatar-purple">MF</div></div>
                <h3>Mohamad Fajar Mutaqin</h3><p>AI Engineer</p>
              </article>
              <article className="member-card reveal visible">
                <div className="member-top"><div className="avatar avatar-orange">PY</div></div>
                <h3>Purnomo Yusgiantoro</h3><p>Full-Stack Web Developer</p>
              </article>
              <article className="member-card reveal visible highlight-member">
                <div className="member-top"><div className="avatar avatar-dark">IF</div></div>
                <h3>Indra Fata Nizar Azizi</h3><p>Full-Stack Web / Backend Developer</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Team.jsx'), teamCode);

const appCode = `
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Budget from './pages/Budget';
import Prediksi from './pages/Prediksi';
import Laporan from './pages/Laporan';
import Profil from './pages/Profil';

function App() {
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
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/profil" element={<Profil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'App.jsx'), appCode);

console.log('Migrate 3 done');
