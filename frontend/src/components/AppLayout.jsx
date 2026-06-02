
import React, { useState, useCallback } from 'react';
import { useStylesheet } from '../utils/hooks';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { isAuthenticated } from '../utils/api';
import Toast from './ui/Toast';
import BotPopup from './ui/BotPopup';

export default function AppLayout() {
  const isLoggedIn = isAuthenticated();
  useStylesheet('/styles.css');

  const [toast, setToast] = useState(null);

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
        <Outlet context={{ showToast }} />
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <BotPopup />
    </div>
  );
}
