
import React from 'react';
import { useStylesheet } from '../utils/hooks';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { isAuthenticated } from '../utils/api';

export default function AppLayout() {
  const isLoggedIn = isAuthenticated();
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
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
