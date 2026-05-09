import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Target, Bot, BarChart2, Settings } from 'lucide-react';
import { getState } from '../utils/store';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setUser(getState().user);
    const handleState = () => setUser(getState().user);
    window.addEventListener('statechange', handleState);
    return () => window.removeEventListener('statechange', handleState);
  }, []);

  const navs = [
    { path: '/dashboard', icon: <Home size={22} strokeWidth={2.5} />, label: 'Dashboard' },
    { path: '/transaksi', icon: <PlusCircle size={22} strokeWidth={2.5} />, label: 'Transaksi' },
    { path: '/budget', icon: <Target size={22} strokeWidth={2.5} />, label: 'Budget' },
    { path: '/prediksi', icon: <Bot size={22} strokeWidth={2.5} />, label: 'Prediksi AI' },
    { path: '/laporan', icon: <BarChart2 size={22} strokeWidth={2.5} />, label: 'Laporan' },
    { path: '/profil', icon: <Settings size={22} strokeWidth={2.5} />, label: 'Profil' },
  ];

  let sideCard = null;
  switch (location.pathname) {
    case '/dashboard': sideCard = <><strong>Jangan cuma lihat saldo.</strong><p>Catat transaksi kecil. Di situlah kebocoran uang biasanya kelihatan.</p></>; break;
    case '/transaksi': sideCard = <><strong>Fitur inti Monify.</strong><p>User cukup input transaksi. Kategori pengeluaran diprediksi otomatis oleh AI, lalu bisa diedit kalau nominal atau catatannya salah.</p></>; break;
    case '/budget': sideCard = <><strong>Budget harus fleksibel.</strong><p>Limit per kategori bisa diubah sesuai kebutuhan user. Kalau angka tidak realistis, prediksi AI juga ikut menipu.</p></>; break;
    case '/prediksi': sideCard = <><strong>Ini bagian AI utama.</strong><p>Di backend asli, angka ini harus datang dari service Python/FastAPI, bukan cuma JS.</p></>; break;
    case '/laporan': sideCard = <><strong>Filter laporan.</strong><p>Pilih harian, bulan ini, atau tahun ini. Laporan akan menampilkan total pengeluaran dan kategori terbesar.</p></>; break;
    case '/profil': sideCard = <><strong>Pengaturan akun.</strong><p>Profil, ganti password, kembali ke landing page, dan keluar dari dashboard.</p></>; break;
    default: sideCard = <><strong>Penting!</strong><p>Catat transaksi kecil.</p></>;
  }

  return (
    <aside className={"sidebar" + (mobileMenuOpen ? ' open' : '')}>
      <Link className="logo" to="/dashboard"><span>Monify<small>AI Finance</small></span></Link>
      <div className="profile-mini">
        <div className="avatar">IF</div>
        <div><strong>{user?.name || 'Indra Fata'}</strong><span>Gen Z Finance User</span></div>
      </div>
      <nav className="nav-menu">
        {navs.map(nav => (
          <Link key={nav.path} to={nav.path} className={"nav-link" + (location.pathname === nav.path ? ' active' : '')} onClick={() => setMobileMenuOpen(false)}>
            <i>{nav.icon}</i> {nav.label}
          </Link>
        ))}
      </nav>
      <div className="side-card">{sideCard}</div>
    </aside>
  );
}