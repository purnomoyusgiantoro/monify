
import React, { useState } from 'react';
import { useStylesheet } from '../utils/hooks';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('monify_logged_in') === 'true';
  useStylesheet('/styles.css');

  React.useEffect(() => {
    document.body.classList.remove('auth-locked');
  }, []);

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
