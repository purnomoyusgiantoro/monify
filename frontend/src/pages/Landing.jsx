import React, { useEffect, useState } from 'react';
import { useStylesheet, useReveal } from '../utils/hooks';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, BarChart3, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  useStylesheet('/style.css');
  useReveal();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [showPass, setShowPass] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    localStorage.setItem('monify_logged_in', 'true');
    closeAuth();
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

  const location = useLocation();
  const { hash } = location;

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'login') openAuth('login');
    if (params.get('auth') === 'register') openAuth('register');

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
            <div className="hero-copy reveal">
              <div className="eyebrow">Capstone Project • AI Finance Assistant</div>
              <h1>Kontrol <span>Keuanganmu</span> dengan AI</h1>
              <p>
                Catat, analisis, dan prediksi pengeluaranmu secara otomatis. Gen Z bisa tahu uangnya lari ke mana tanpa ribet bikin tabel manual.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => openAuth('login')}>Login Sekarang</button>
                <a className="btn btn-outline" href="#fitur"><span className="play-dot">↓</span> Lihat Fitur</a>
              </div>
              <div className="hero-stats" aria-label="Ringkasan fitur Monify">
                <div><strong>4</strong><span>Fitur AI</span></div>
                <div><strong>24/7</strong><span>Insight</span></div>
                <div><strong>1</strong><span>Dashboard</span></div>
              </div>
            </div>

            <div className="phone-stage reveal delay-1 visible" id="demo">
              <div className="blob blob-one"></div>
              <div className="blob blob-two"></div>
              <div className="phone-card" aria-label="Preview aplikasi Monify">
                <div className="phone-notch"></div>
                <div className="phone-top">
                  <div>
                    <span>Total Saldo</span>
                    <h3>Rp 12.450.000</h3>
                  </div>
                  <div className="mini-avatar">I</div>
                </div>
                <div className="balance-box">
                  <span>Pengeluaran Bulan Ini</span>
                  <strong>Rp 3.200.000</strong>
                  <div className="progress"><i style={{width:'72%'}}></i></div>
                </div>
                <div className="chart-box">
                  <div className="bars">
                    <i style={{height:'34%'}}></i>
                    <i style={{height:'52%'}}></i>
                    <i style={{height:'41%'}}></i>
                    <i style={{height:'74%'}}></i>
                  </div>
                  <div className="predict-card">Prediksi</div>
                </div>
                <div className="ai-note">
                  <span>✦</span>
                  <p>AI mendeteksi pengeluaran kopi naik 20% minggu ini. Coba kurangi untuk capai target tabungan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tools" id="fitur">
          <div className="container">
            <div className="section-title reveal">
              <span className="pill">Fitur Unggulan</span>
              <h2>Smart Tools untuk Uang Pintar</h2>
              <p>Fitur dibuat langsung untuk masalah utama: boros tanpa sadar, salah kategori belanja, dan budget bocor di akhir bulan.</p>
            </div>

            <div className="feature-grid">
              <article className="feature-card reveal">
                <div className="feature-icon"><Search size={24}/></div>
                <span className="feature-tag">Otomatis</span>
                <h3>Klasifikasi Otomatis</h3>
                <p>Tiap transaksi langsung dikategorikan oleh AI tanpa input manual berulang.</p>
                <div className="chip-row">
                  <span>Makanan</span><span>Transport</span><span>Hiburan</span>
                </div>
              </article>

              <article className="feature-card reveal delay-1">
                <div className="feature-icon"><BarChart3 size={24}/></div>
                <span className="feature-tag">Prediktif</span>
                <h3>Prediksi Pengeluaran</h3>
                <p>Tahu sebelum kehabisan. AI memprediksi sisa saldo sampai akhir bulan.</p>
                <div className="mini-bars"><i></i><i></i><i></i><i></i><b></b></div>
              </article>

              <article className="feature-card reveal delay-2">
                <div className="feature-icon"><ShieldAlert size={24}/></div>
                <span className="feature-tag">Proteksi</span>
                <h3>Deteksi Over Budget</h3>
                <p>Dapat peringatan dini saat pengeluaran mulai melewati limit kategori.</p>
                <div className="risk-meter"><span>Budget Makanan</span><strong>78%</strong><i></i></div>
              </article>

              <article className="feature-card reveal delay-3">
                <div className="feature-icon"><CheckCircle size={24}/></div>
                <span className="feature-tag">Harian</span>
                <h3>Safe to Spend</h3>
                <p>Lihat batas aman uang yang boleh dipakai hari ini tanpa mengganggu target bulanan.</p>
                <div className="safe-card"><b>Rp 42.000</b><span>Aman dipakai hari ini</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="problem section-pad" id="tentang">
          <div className="container split-grid">
            <div className="reveal">
              <span className="pill light">Kenapa Monify?</span>
              <h2>Masalahnya bukan kurang uang. Seringnya, uang keluar tanpa sadar.</h2>
              <p className="lead">
                Banyak aplikasi pencatat keuangan berhenti di input transaksi. Monify dibuat untuk melanjutkan langkah berikutnya: membaca pola, memberi sinyal risiko, dan membantu ambil keputusan harian.
              </p>
            </div>
            <div className="problem-list">
              <div className="problem-item reveal delay-1">
                <span>01</span>
                <div><h3>Transaksi kecil diremehkan</h3><p>Kopi, jajan, ongkir, dan top up kecil terasa murah sampai totalnya membengkak.</p></div>
              </div>
              <div className="problem-item reveal delay-2">
                <span>02</span>
                <div><h3>Kategori belanja berantakan</h3><p>Tanpa kategori yang rapi, pengguna sulit tahu pos pengeluaran terbesar.</p></div>
              </div>
              <div className="problem-item reveal delay-3">
                <span>03</span>
                <div><h3>Budget sadar saat sudah telat</h3><p>Peringatan over budget harus muncul sebelum uang habis, bukan setelah akhir bulan.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="workflow section-pad">
          <div className="container">
            <div className="section-title reveal">
              <span className="pill">Alur Penggunaan</span>
              <h2>Dari catatan harian jadi keputusan finansial</h2>
            </div>
            <div className="steps">
              <article className="step-card reveal"><span>1</span><h3>Masukkan Penghasilan</h3><p>Pengguna mengisi saldo awal, income, dan target budget bulanan.</p></article>
              <article className="step-card reveal delay-1"><span>2</span><h3>Catat Transaksi</h3><p>Transaksi masuk bisa berupa makanan, transport, belanja, hiburan, dan kebutuhan lain.</p></article>
              <article className="step-card reveal delay-2"><span>3</span><h3>AI Membaca Pola</h3><p>Model memproses kategori, prediksi bulanan, risiko over budget, dan sisa aman harian.</p></article>
              <article className="step-card reveal delay-3"><span>4</span><h3>Ambil Keputusan</h3><p>Pengguna tahu kapan harus hemat, pos mana yang bocor, dan target mana yang realistis.</p></article>
            </div>
          </div>
        </section>

        <section className="insight section-pad">
          <div className="container insight-grid">
            <div className="dashboard reveal">
              <div className="dash-head"><b>Ringkasan Bulan Ini</b><span>Mei 2026</span></div>
              <div className="dash-total"><span>Prediksi pengeluaran</span><strong>Rp 4.850.000</strong></div>
              <div className="dash-bars"><i></i><i></i><i></i><i></i><i></i></div>
              <div className="dash-row"><span>Makanan</span><b>78%</b></div>
              <div className="dash-row"><span>Transport</span><b>42%</b></div>
              <div className="dash-alert">⚠ Budget makanan mulai mendekati batas.</div>
            </div>
            <div className="reveal delay-1">
              <span className="pill light">Dashboard Insight</span>
              <h2>Satu layar untuk melihat kondisi uangmu.</h2>
              <p className="lead">Dashboard Monify tidak cuma menampilkan angka. Setiap angka harus punya makna: aman, waspada, atau perlu dikurangi.</p>
              <div className="check-list">
                <p>✓ Total pemasukan dan pengeluaran lebih mudah dibaca.</p>
                <p>✓ Prediksi akhir bulan membantu menghindari keputusan impulsif.</p>
                <p>✓ Risiko over budget ditampilkan per kategori agar tindakannya jelas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="articles section-pad">
          <div className="container">
            <div className="section-title reveal">
              <span className="pill">Artikel Finansial</span>
              <h2>Konten pendek untuk kebiasaan uang yang lebih rapi</h2>
              <p>Bagian artikel dibuat untuk mendukung edukasi pengguna, bukan sekadar pemanis halaman.</p>
            </div>
            <div className="article-grid">
              <article className="article-card reveal">
                <span>Budgeting</span>
                <h3>Cara Atur Uang Bulanan ala Gen Z</h3>
                <p>Mulai dari membagi kebutuhan, keinginan, dan tabungan tanpa rumus yang ribet.</p>
                <a href="#">Baca ringkasan →</a>
              </article>
              <article className="article-card reveal delay-1">
                <span>Kebiasaan</span>
                <h3>Kenapa Pengeluaran Kecil Bikin Boros?</h3>
                <p>Biaya kecil sering tidak terasa karena tidak dilihat sebagai pola berulang.</p>
                <a href="#">Baca ringkasan →</a>
              </article>
              <article className="article-card reveal delay-2">
                <span>AI Insight</span>
                <h3>Apa Gunanya Prediksi Pengeluaran?</h3>
                <p>Prediksi membantu pengguna mengambil tindakan sebelum saldo benar-benar menipis.</p>
                <a href="#">Baca ringkasan →</a>
              </article>
            </div>
          </div>
        </section>

        <section className="cta section-pad">
          <div className="container cta-card reveal">
            <div>
              <span className="pill light">Mulai Lebih Sadar</span>
              <h2>Uang tidak akan rapi kalau cuma dicatat. Harus dianalisis.</h2>
            </div>
            <button className="btn btn-dark" onClick={() => openAuth('login')}>Login Sekarang</button>
          </div>
        </section>
      </main>

      <footer className="footer" id="kontak">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" to="/">
              <span>Monify</span>
            </Link>
            <p>Website pencatatan keuangan berbasis AI untuk membantu Gen Z memahami pola pengeluaran.</p>
          </div>
          <div>
            <h4>Produk</h4>
            <a href="#fitur">Fitur AI</a>
            <a href="#tentang">Tentang Monify</a>
            <a href="#demo">Demo Aplikasi</a>
          </div>
          <div>
            <h4>Edukasi</h4>
            <a href="#">Budgeting</a>
            <a href="#">Pengeluaran</a>
            <a href="#">AI Finance</a>
          </div>
          <div>
            <h4>Capstone</h4>
            <p>MONIFY • Coding Camp Capstone Project</p>
            <p className="muted">© 2026 Monify Team.</p>
          </div>
        </div>
      </footer>

      {authOpen && (
        <div className="auth-modal open">
          <div className="auth-modal-backdrop" onClick={closeAuth}></div>
          <section className="auth-modal-card">
            <aside className="auth-modal-brand">
              <Link className="brand auth-brand-logo" to="/" aria-label="Monify Beranda">
                <span>Monify</span>
              </Link>
              <div className="auth-modal-copy">
                <span>AI Finance Assistant</span>
                <h2>Masuk dulu, baru uangmu bisa dibaca dengan rapi.</h2>
                <p>Dashboard akan menampilkan transaksi, budget, prediksi pengeluaran, risiko over budget, dan safe-to-spend harian.</p>
              </div>
              <div className="auth-benefits">
                <p>✓ Kategori pengeluaran otomatis dari AI</p>
                <p>✓ Prediksi pengeluaran sampai akhir bulan</p>
                <p>✓ Rekomendasi kategori yang harus dikurangi</p>
              </div>
            </aside>
            <div className="auth-modal-panel">
              <button className="auth-close" onClick={closeAuth} aria-label="Tutup popup">×</button>
              <div className="auth-tabs" role="tablist" aria-label="Pilih autentikasi">
                <button className={authView === 'login' ? 'active' : ''} onClick={() => setAuthView('login')}>Masuk</button>
                <button className={authView === 'register' ? 'active' : ''} onClick={() => setAuthView('register')}>Daftar</button>
              </div>
              
              <form className={`auth-form ${authView === 'login' ? 'active' : ''}`} onSubmit={handleAuth}>
                <div className="auth-heading">
                  <small>Masuk Akun</small>
                  <h3>Selamat datang kembali</h3>
                  <p>Cek kondisi uangmu sebelum membuat keputusan belanja berikutnya.</p>
                </div>
                <label>Email</label>
                <div className="auth-field"><input type="email" placeholder="nama@email.com" required /></div>
                <label>Password</label>
                <div className="auth-field with-action">
                  <input type={showPass ? "text" : "password"} placeholder="Masukkan password" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "Tutup" : "Lihat"}</button>
                </div>
                <button className="btn btn-primary auth-submit" type="submit">Masuk ke Dashboard</button>
                <p className="auth-switcher">Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('register'); }}>Daftar sekarang</a></p>
              </form>
              
              <form className={`auth-form ${authView === 'register' ? 'active' : ''}`} onSubmit={handleAuth}>
                <div className="auth-heading">
                  <small>Buat Akun</small>
                  <h3>Mulai rapikan uangmu</h3>
                  <p>Daftar agar transaksi, budget, dan prediksi AI tersimpan di dashboard.</p>
                </div>
                <label>Nama Lengkap</label>
                <div className="auth-field"><input type="text" placeholder="Contoh: Indra Fata" required /></div>
                <label>Email</label>
                <div className="auth-field"><input type="email" placeholder="nama@email.com" required /></div>
                <label>Password</label>
                <div className="auth-field with-action">
                  <input type={showPass ? "text" : "password"} placeholder="Minimal 8 karakter" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "Tutup" : "Lihat"}</button>
                </div>
                <button className="btn btn-primary auth-submit" type="submit">Daftar & Masuk</button>
                <p className="auth-switcher">Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('login'); }}>Masuk di sini</a></p>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
