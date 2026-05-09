import fs from 'fs';
import path from 'path';

const srcPagesDir = path.join(process.cwd(), 'src', 'pages');
const srcDir = path.join(process.cwd(), 'src');
const componentsDir = path.join(srcDir, 'components');
const utilsDir = path.join(srcDir, 'utils');

// Create directories if they don't exist
[componentsDir, utilsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Create store.js
const storeCode = `
export const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

const seedTransactions = [
  { id: 1, date: '2026-05-01', title: 'Uang bulanan', type: 'income', category: 'Pemasukan', amount: 3500000, note: 'Saldo awal bulan' },
  { id: 2, date: '2026-05-02', title: 'Makan ayam geprek', type: 'expense', category: 'Makanan', amount: 28000, note: 'Makan siang' },
  { id: 3, date: '2026-05-03', title: 'Bensin motor', type: 'expense', category: 'Transport', amount: 35000, note: 'Isi bensin' },
  { id: 4, date: '2026-05-04', title: 'Top up kuota', type: 'expense', category: 'Internet', amount: 43000, note: 'Paket data' },
  { id: 5, date: '2026-05-05', title: 'Kopi dan camilan', type: 'expense', category: 'Makanan', amount: 24000, note: 'Nongkrong' },
  { id: 6, date: '2026-05-06', title: 'Langganan aplikasi', type: 'expense', category: 'Hiburan', amount: 49000, note: 'Subscription' },
  { id: 7, date: '2026-05-07', title: 'Belanja skincare', type: 'expense', category: 'Belanja', amount: 89000, note: 'Kebutuhan pribadi' },
  { id: 8, date: '2026-05-08', title: 'Gojek kampus', type: 'expense', category: 'Transport', amount: 22000, note: 'Transportasi' }
];

const defaultState = {
  user: { name: 'Indra Fata', email: 'indra@example.com', role: 'Full-Stack MONIFY' },
  profile: { income: 3500000, budget: 2200000, savingTarget: 500000 },
  budgets: {
    Makanan: 700000,
    Transport: 400000,
    Belanja: 450000,
    Hiburan: 250000,
    Internet: 180000,
    Lainnya: 220000
  },
  transactions: seedTransactions
};

export function clone(data) { return JSON.parse(JSON.stringify(data)); }

export function getState() {
  const raw = localStorage.getItem('monify_state');
  if (!raw) {
    localStorage.setItem('monify_state', JSON.stringify(defaultState));
    return clone(defaultState);
  }
  try {
    const parsed = JSON.parse(raw);
    parsed.budgets = { ...defaultState.budgets, ...(parsed.budgets || {}) };
    parsed.profile = { ...defaultState.profile, ...(parsed.profile || {}) };
    parsed.user = { ...defaultState.user, ...(parsed.user || {}) };
    parsed.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : clone(seedTransactions);
    return parsed;
  } catch {
    return clone(defaultState);
  }
}

export function setState(next) { localStorage.setItem('monify_state', JSON.stringify(next)); window.dispatchEvent(new Event('statechange')); }

export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2300);
}

export function classify(text = '') {
  const t = text.toLowerCase();
  if (/makan|ayam|kopi|nasi|bakso|mie|jajan|minum|food|resto|geprek/.test(t)) return 'Makanan';
  if (/gojek|grab|bensin|parkir|ojek|bus|kereta|transport|angkot/.test(t)) return 'Transport';
  if (/baju|skincare|sepatu|belanja|marketplace|shopee|tokopedia|barang/.test(t)) return 'Belanja';
  if (/netflix|game|spotify|bioskop|hiburan|nongkrong|langganan|top up game/.test(t)) return 'Hiburan';
  if (/kuota|internet|wifi|pulsa|indihome|paket data/.test(t)) return 'Internet';
  return 'Lainnya';
}

export function summary(state = getState(), transactions = state.transactions) {
  const today = new Date();
  const income = transactions.filter(x => x.type === 'income').reduce((a,b)=>a+Number(b.amount || 0),0);
  const expense = transactions.filter(x => x.type === 'expense').reduce((a,b)=>a+Number(b.amount || 0),0);
  const balance = income - expense;
  const day = Math.max(1, today.getDate());
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remaining = Math.max(1, daysInMonth - day);
  const projected = Math.round((expense / day) * daysInMonth);
  const risk = Math.min(140, Math.round((projected / Math.max(1, state.profile.budget)) * 100));
  const safe = Math.max(0, Math.floor((state.profile.budget - expense) / remaining));
  const byCategory = {};
  transactions.filter(x=>x.type==='expense').forEach(x => byCategory[x.category] = (byCategory[x.category] || 0) + Number(x.amount || 0));
  const topCategory = Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0] || ['Belum ada',0];
  return { income, expense, balance, day, daysInMonth, remaining, projected, risk, safe, byCategory, topCategory, total: transactions.length };
}

export function timestamp() {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
}
`;
fs.writeFileSync(path.join(utilsDir, 'store.js'), storeCode);

// 2. Read CSS files
const styleCss = fs.readFileSync(path.join(srcPagesDir, 'style.css'), 'utf8');
const stylesCss = fs.readFileSync(path.join(srcPagesDir, 'styles.css'), 'utf8');
const mergedCss = styleCss + '\n\n' + stylesCss;
fs.writeFileSync(path.join(srcDir, 'index.css'), mergedCss);

// 3. Delete old HTML, JS, CSS in pages
const oldFiles = fs.readdirSync(srcPagesDir);
oldFiles.forEach(file => {
  if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.txt')) {
    fs.unlinkSync(path.join(srcPagesDir, file));
  }
});
console.log('Old files deleted.');

// Make components ...
const navbarCode = `
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ openAuth }) {
  return (
    <header className="site-header" id="top">
      <nav className="navbar container" aria-label="Navigasi utama">
        <Link className="brand" to="/" aria-label="Monify Beranda">
          <span className="brand-mark">
            <svg viewBox="0 0 28 28" aria-hidden="true">
              <rect x="3" y="4" width="22" height="20" rx="5"></rect>
              <path d="M8 18.2l4.3-4.4 3.3 3.1 4.7-6.4"></path>
              <circle cx="20.3" cy="10.5" r="1.4"></circle>
            </svg>
          </span>
          <span>Monify</span>
        </Link>
        <div className="nav-links" id="navLinks">
          <Link to="/" className="active">Beranda</Link>
          <a href="#tentang">Tentang</a>
          <Link to="/team">Team</Link>
          <a href="#kontak">Kontak</a>
        </div>
        <button className="login-btn" onClick={() => openAuth('login')} style={{border: 'none', cursor: 'pointer'}} aria-label="Masuk ke Monify">
          <span className="login-icon">●</span>
          Masuk
        </button>
      </nav>
    </header>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Navbar.jsx'), navbarCode);

const sidebarCode = `
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/transaksi', icon: '➕', label: 'Transaksi' },
    { path: '/budget', icon: '🎯', label: 'Budget' },
    { path: '/prediksi', icon: '🤖', label: 'Prediksi AI' },
    { path: '/laporan', icon: '📊', label: 'Laporan' },
    { path: '/profil', icon: '⚙️', label: 'Profil' },
  ];

  return (
    <aside className={"sidebar" + (mobileMenuOpen ? ' open' : '')}>
      <Link className="logo" to="/dashboard"><span className="logo-icon">↗</span><span>Monify<small>AI Finance</small></span></Link>
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
      <div className="side-card">
        <strong>Penting!</strong>
        <p>Catat transaksi kecil. Di situlah kebocoran uang biasanya kelihatan.</p>
      </div>
    </aside>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Sidebar.jsx'), sidebarCode);

const topbarCode = `
import React from 'react';
import { Link } from 'react-router-dom';

export default function Topbar({ setMobileMenuOpen, title, desc, extraAction }) {
  return (
    <header className="topbar">
      <div>
        <button className="icon-btn mobile-menu" onClick={() => setMobileMenuOpen(prev => !prev)}>☰</button>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="top-actions">
        {extraAction}
      </div>
    </header>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'Topbar.jsx'), topbarCode);

const appLayoutCode = `
import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('monify_logged_in') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-body">
      <div className="app-shell">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="main" onClick={() => { if(mobileMenuOpen) setMobileMenuOpen(false) }}>
          <Outlet context={{ setMobileMenuOpen }} />
        </main>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(componentsDir, 'AppLayout.jsx'), appLayoutCode);

console.log('Setup complete!');
