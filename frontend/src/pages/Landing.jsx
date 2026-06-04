import React, { useEffect, useState } from 'react';
import { useStylesheet, useReveal } from '../utils/hooks';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BotPopup from '../components/ui/BotPopup';
import { apiLogin, apiRegister, setAuth } from '../utils/api';
import {
  Search,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  WalletCards,
  FileText,
  Flag,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Klasifikasi Otomatis',
    desc: 'Pengeluaran akan dikelompokkan ke dalam kategori yang sesuai agar pengguna lebih mudah membaca pola pengeluaran.',
  },
  {
    icon: BarChart3,
    title: 'Prediksi Pengeluaran',
    desc: 'Monify membantu memperkirakan pengeluaran bulanan berdasarkan data transaksi yang telah dicatat.',
  },
  {
    icon: ShieldCheck,
    title: 'Deteksi Over Budget',
    desc: 'Sistem memberikan peringatan ketika pengeluaran mulai melebihi batas budget yang telah ditentukan.',
  },
  {
    icon: CheckCircle2,
    title: 'Safe to Spend',
    desc: 'Pengguna dapat melihat perkiraan jumlah uang yang masih aman digunakan dalam satu hari.',
  },
];

const problems = [
  {
    no: '01',
    title: 'Transaksi kecil sulit dipantau',
    desc: 'Pengeluaran harian sering tidak tercatat sehingga pengguna sulit mengetahui total pengeluaran sebenarnya.',
  },
  {
    no: '02',
    title: 'Kategori pengeluaran tidak rapi',
    desc: 'Tanpa pengelompokan yang jelas, pengguna sulit mengetahui kategori mana yang paling banyak menghabiskan uang.',
  },
  {
    no: '03',
    title: 'Budget sering diketahui terlambat',
    desc: 'Pengguna biasanya baru sadar pengeluaran berlebih setelah saldo mulai menipis.',
  },
];

const steps = [
  {
    icon: WalletCards,
    title: 'Masukkan Penghasilan',
    desc: 'Pengguna mengisi saldo awal, income, dan target budget bulanan.',
  },
  {
    icon: FileText,
    title: 'Catat Transaksi',
    desc: 'Transaksi masuk bisa berupa makanan, transport, belanja, hiburan, dan kebutuhan lain.',
  },
  {
    icon: BarChart3,
    title: 'Menganalisis Data',
    desc: 'Monify mengolah data transaksi untuk melihat pola pengeluaran dan resiko over budget',
  },
  {
    icon: Flag,
    title: 'Mengambil Keputusan',
    desc: 'Hasil analisis membantu pengguna menentukan pengeluaran yang perlu diperhatikan.',
  },
];

const articles = [
  {
    tag: 'Budgeting',
    title: 'Cara Atur Uang Bulanan ala Gen Z',
    desc: 'Mulai dari membagi kebutuhan, keinginan, dan tabungan tanpa rumus yang ribet.',
  },
  {
    tag: 'Kebiasaan',
    title: 'Kenapa Pengeluaran Kecil Bikin Boros',
    desc: 'Biaya kecil sering tidak terasa karena tidak dilihat sebagai pola berulang.',
  },
  {
    tag: 'AI Insight',
    title: 'Apa Gunanya Prediksi Pengeluaran',
    desc: 'Prediksi membantu pengguna mengambil tindakan sebelum saldo benar-benar menipis.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  useStylesheet('/style.css');
  useReveal();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [showPass, setShowPass] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authView === 'login') {
        const { ok, data } = await apiLogin(email, password);
        if (ok && data.success) {
          setAuth(data.data.token, data.data.user);
          closeAuth();
          navigate('/dashboard');
        } else {
          setErrorMsg(data.message || 'Login gagal.');
        }
      } else {
        if (password !== confirmPassword) {
          setErrorMsg('Password dan konfirmasi password tidak cocok.');
          setLoading(false);
          return;
        }
        const { ok, data } = await apiRegister(name, email, password);
        if (ok && data.success) {
          setAuth(data.data.token, data.data.user);
          closeAuth();
          navigate('/dashboard');
        } else {
          setErrorMsg(data.message || 'Registrasi gagal.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (view) => {
    setAuthView(view);
    setAuthOpen(true);
    setErrorMsg('');
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
      <main className="landing-page">
        <section id="beranda" className="landing-hero">
          <div className="container landing-hero-grid">
            <div className="landing-hero-copy reveal">
              <h1>
                Kelola Keuangan
                <br />
                Lebih Mudah
                <br />
                dengan <span>Monify</span>
              </h1>
              <p>
                Monify adalah aplikasi pencatatan dan analisis keuangan berbasis AI yang membantu Gen Z memahami pola pengeluaran, mengatur budget, dan memantau kondisi keuangan secara lebih efisien.
              </p>
              <div className="landing-hero-actions">
                <button className="landing-btn-primary" onClick={() => openAuth('login')}>Mulai Sekarang</button>
                <a className="landing-btn-secondary" href="#fitur">Lihat Fitur</a>
              </div>
            </div>

            <div className="landing-phone-wrap reveal delay-1">
              <div className="landing-phone">
                <div className="landing-phone-notch"></div>
                <div className="landing-phone-inner">
                  <div className="landing-phone-head">
                    <div>
                      <p>Total Saldo</p>
                      <h4>Rp 12.450.000</h4>
                    </div>
                    <div className="landing-phone-spark">
                      <Sparkles size={15} />
                    </div>
                  </div>

                  <div className="landing-phone-balance">
                    <div className="landing-phone-balance-head">
                      <p>Pengeluaran Bulan Ini</p>
                      <span>*</span>
                    </div>
                    <h4>Rp 3.200.000</h4>
                    <div className="landing-phone-progress">
                      <i style={{ width: '65%' }}></i>
                    </div>
                  </div>

                  <div className="landing-phone-chart">
                    {[42, 62, 84, 54].map((height, index) => (
                      <i key={index} style={{ height: `${height}%` }}></i>
                    ))}
                    <b>
                      <span>Prediksi</span>
                    </b>
                  </div>

                  <div className="landing-phone-note">
                    <span>*</span>
                    <p>AI mendeteksi pengeluaran kopi naik 20% minggu ini. Coba kurangi untuk capai target tabungan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="landing-features">
          <div className="container">
            <div className="landing-section-head reveal">
              <p className="landing-head-kicker">Fitur Utama</p>
              <h2>Fitur yang Membantu Mengelola Keuangan</h2>
              <p className="landing-head-desc">
                Monify menyediakan beberapa fitur utama untuk membantu pengguna mencatat transaksi, melihat ringkasan keuangan, dan mendapatkan gambaran pengeluaran secara lebih jelas.
              </p>
            </div>
            <div className="landing-feature-grid">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className={`landing-feature-card reveal ${idx === 0 ? '' : `delay-${Math.min(idx, 3)}`}`}>
                    <div className="landing-feature-icon"><Icon size={24} strokeWidth={2.5} /></div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tentang" className="landing-problems">
          <div className="container landing-problem-grid">
            <div className="reveal">
              <p className="landing-head-kicker landing-kicker-left">Kenapa Monify?</p>
              <h2>Membantu Pengguna Lebih Sadar terhadap Pengeluaran</h2>
              <p className="landing-problem-desc">
                Banyak pengguna tidak menyadari ke mana uang mereka digunakan setiap hari. Pengeluaran kecil seperti makanan, transportasi, belanja online, dan hiburan sering terlihat sepele, tetapi dapat memengaruhi kondisi keuangan jika tidak dipantau dengan baik.
              </p>
            </div>
            <div className="landing-problem-list">
              {problems.map((problem, idx) => (
                <article key={problem.no} className={`landing-problem-card reveal ${idx === 0 ? 'delay-1' : idx === 1 ? 'delay-2' : 'delay-3'}`}>
                  <span>{problem.no}</span>
                  <div>
                    <h3>{problem.title}</h3>
                    <p>{problem.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-workflow">
          <div className="container">
            <div className="landing-section-head reveal">
              <p className="landing-head-kicker">Cara Kerja</p>
              <h2>Dari Pencatatan Harian Menjadi Insight Keuangan</h2>
            </div>
            <div className="landing-workflow-grid">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <article key={`${step.title}-${idx}`} className={`landing-workflow-item reveal ${idx === 0 ? '' : `delay-${Math.min(idx, 3)}`}`}>
                    <span className="landing-workflow-num">{idx + 1}</span>
                    <div className="landing-workflow-iconbox">
                      <Icon size={44} strokeWidth={2} />
                      {idx < steps.length - 1 && <ArrowRight className="landing-workflow-arrow" size={48} strokeWidth={1.2} />}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-articles">
          <div className="container">
            <div className="landing-section-head reveal">
              <p className="landing-head-kicker">Artikel</p>
              <h2>Artikel Seputar Pengelola Keuangan</h2>
            </div>
            <div className="landing-article-grid">
              {articles.map((article, idx) => (
                <article key={article.title} className={`landing-article-card reveal ${idx === 0 ? '' : `delay-${Math.min(idx, 3)}`}`}>
                  <span>{article.tag}</span>
                  <h3>{article.title}</h3>
                  <p>{article.desc}</p>
                  <button type="button">Baca ringkasan</button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="kontak" className="footer">
        <div className="container footer-grid">
          <div>
            <h3>Monify</h3>
            <p>Website pencatatan keuangan berbasis AI untuk membantu Gen Z memahami pola pengeluaran.</p>
          </div>
          <div>
            <h4>Beranda</h4>
            <a href="#tentang">Tentang Monify</a>
            <Link to="/team">Team</Link>
          </div>
          <div>
            <h4>Kontak</h4>
            <p>Email: monify.team@gmail.com</p>
            <p>Telepon: +62 812-3456-7890</p>
            <p>Lokasi: Jakarta, Indonesia</p>
          </div>
          <div>
            <h4>Perusahaan</h4>
            <a href="#">Karir</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat &amp; Ketentuan</a>
          </div>
        </div>
      </footer>

      {authOpen && (
        <div className="auth-modal open" onMouseDown={closeAuth}>
          <div className="auth-modal-backdrop"></div>
          <div className="auth-modal-shell" onMouseDown={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={closeAuth} aria-label="Tutup popup"><X size={18} /></button>

            <section className={`auth-modal-card ${authView === 'register' ? 'is-register' : 'is-login'}`}>
              <Link className="auth-brand-logo" to="/" aria-label="Monify Beranda">
                <img className="auth-logo-image" src="/monify-logo.png" alt="Monify" />
              </Link>

              <div className="auth-heading">
                <h3>{authView === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}</h3>
                <p>{authView === 'login' ? 'Masuk ke dashboard keuanganmu' : 'Mulai kelola keuanganmu dengan AI'}</p>
              </div>

              {/* Login Form */}
              <form className={`auth-form ${authView === 'login' ? 'active auth-login' : ''}`} onSubmit={handleAuth}>
                {errorMsg && authView === 'login' && <div className="auth-error" style={{color: '#ff4d4f', background: '#ffe5e5', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px'}}>{errorMsg}</div>}
                <div className="auth-field-group">
                  <label>Email</label>
                  <div className="auth-field"><input type="email" placeholder="Jhon@Example.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="auth-field-group">
                  <label>Password</label>
                  <div className="auth-field with-toggle">
                    <input type={showPass ? 'text' : 'password'} placeholder="Masukan Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} aria-label="Lihat password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
                <p className="auth-switcher">Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('register'); setShowPass(false); setErrorMsg(''); }}>Daftar Sekarang</a></p>
              </form>

              {/* Register Form */}
              <form className={`auth-form ${authView === 'register' ? 'active auth-register' : ''}`} onSubmit={handleAuth}>
                {errorMsg && authView === 'register' && <div className="auth-error" style={{color: '#ff4d4f', background: '#ffe5e5', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px'}}>{errorMsg}</div>}
                <div className="auth-field-group">
                  <label>Nama Lengkap</label>
                  <div className="auth-field"><input type="text" placeholder="Jhon sena" required value={name} onChange={(e) => setName(e.target.value)} /></div>
                </div>
                <div className="auth-field-group">
                  <label>Email</label>
                  <div className="auth-field"><input type="email" placeholder="Jhon@Example.com" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="auth-field-group">
                  <label>Password</label>
                  <div className="auth-field with-toggle">
                    <input type={showPass ? 'text' : 'password'} placeholder="Masukan Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} aria-label="Lihat password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="auth-field-group">
                  <label>Konfirmasi Password</label>
                  <div className="auth-field with-toggle">
                    <input type={showPass ? 'text' : 'password'} placeholder="Ulangi Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPass(!showPass)} aria-label="Lihat password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Daftar'}</button>
                <p className="auth-switcher">Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('login'); setShowPass(false); setErrorMsg(''); }}>Masuk</a></p>
              </form>
            </section>
          </div>
        </div>
      )}
      <BotPopup />
    </>
  );
}
