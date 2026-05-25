import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar({ openAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isTeam = location.pathname === '/team';
  const navItems = [
    { label: 'Beranda', to: '/' },
    { label: 'Tentang', to: '/#tentang' },
    { label: 'Team', to: '/team' },
    { label: 'Kontak', to: '/#kontak' },
  ];

  return (
    <header className="site-header" id="top">
      <nav className="navbar container" aria-label="Navigasi utama">
        <Link className="brand brand-with-logo" to="/" aria-label="Monify Beranda">
          <img className="brand-image" src="/monify-logo.png" alt="Monify" />
        </Link>
        <div className="nav-links nav-desktop" id="navLinks">
          <Link to="/" className={location.pathname === '/' && !location.hash ? 'active' : ''}>Beranda</Link>
          <Link to="/#tentang" className={location.hash === '#tentang' ? 'active' : ''}>Tentang</Link>
          <Link to="/team" className={isTeam ? 'active' : ''}>Team</Link>
          <Link to="/#kontak" className={location.hash === '#kontak' ? 'active' : ''}>Kontak</Link>
        </div>
        <a className="login-btn login-desktop" href="#" onClick={(e) => { e.preventDefault(); openAuth('login'); }} aria-label="Masuk ke Monify">
          Masuk
        </a>
        <button type="button" className="mobile-nav-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu navigasi">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-nav-panel container">
          <div className="mobile-nav-list">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className="mobile-nav-login"
              onClick={() => {
                setMenuOpen(false);
                openAuth('login');
              }}
            >
              Masuk
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
