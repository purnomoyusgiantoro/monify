import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ openAuth }) {
  const location = useLocation();
  const isTeam = location.pathname === '/team';

  return (
    <header className="site-header" id="top">
      <nav className="navbar container" aria-label="Navigasi utama">
        <Link className="brand" to="/" aria-label="Monify Beranda">
          <span>Monify</span>
        </Link>
        <div className="nav-links" id="navLinks">
          <Link to="/" className={location.pathname === '/' && !location.hash ? 'active' : ''}>Beranda</Link>
          <Link to="/#tentang" className={location.hash === '#tentang' ? 'active' : ''}>Tentang</Link>
          <Link to="/team" className={isTeam ? 'active' : ''}>Team</Link>
          <Link to="/#kontak" className={location.hash === '#kontak' ? 'active' : ''}>Kontak</Link>
        </div>
        <a className="login-btn" href="#" onClick={(e) => { e.preventDefault(); openAuth('login'); }} aria-label="Masuk ke Monify">
          <span className="login-icon">●</span>
          Masuk
        </a>
      </nav>
    </header>
  );
}
