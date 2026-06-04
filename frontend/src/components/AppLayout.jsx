
import React, { useState, useCallback } from 'react';
import { useStylesheet } from '../utils/hooks';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from './ui/Toast';
import { isAuthenticated } from '../utils/api';

export default function AppLayout() {
  const isLoggedIn = isAuthenticated();
  useStylesheet('/styles.css');
  const [toast, setToast] = useState(null);
  const setMobileMenuOpen = useCallback(() => {}, []);
  const showToast = useCallback((type, message) => {
    setToast({ id: Date.now(), type, message });
  }, []);

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
        <Outlet context={{ setMobileMenuOpen, showToast }} />
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
