import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser } from '../utils/api';
import { getState } from '../utils/store';

const sidebarMenus = [
  { label: 'Dashboard', icon: '/assets/icon-dashboard.png', path: '/dashboard' },
  { label: 'Transaksi', icon: '/assets/icon-transaksi.png', path: '/transaksi' },
  { label: 'Budget', icon: '/assets/icon-budget.png', path: '/budget' },
  { label: 'Prediksi AI', icon: '/assets/icon-prediksi-ai.png', path: '/prediksi' },
  { label: 'Sertifikat', icon: '/assets/icon-target.png', path: '/sertifikat' },
  { label: 'Setting', icon: '/assets/icon-setting.png', path: '/setting' },
];

function resolveUser() {
  const authUser = getUser();
  if (authUser) {
    return {
      name: authUser.name || 'Pengguna',
      email: authUser.email || 'user@example.com',
      avatar: '/assets/icon-profile.png',
    };
  }

  const localUser = getState().user;
  return {
    name: localUser?.name || 'Pengguna',
    email: localUser?.email || 'user@example.com',
    avatar: '/assets/icon-profile.png',
  };
}

export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState(resolveUser());

  useEffect(() => {
    const syncUser = () => setUser(resolveUser());
    syncUser();
    window.addEventListener('statechange', syncUser);
    return () => window.removeEventListener('statechange', syncUser);
  }, []);

  return (
    <aside className="sidebar" aria-label="Menu utama">
      <div className="sidebar__brand">
        <img src="/assets/logo-monify.png" alt="Monify" />
      </div>

      <nav className="sidebar__nav">
        {sidebarMenus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            className={`sidebar__item ${location.pathname === menu.path ? 'is-active' : ''}`}
          >
            <img src={menu.icon} alt="" aria-hidden="true" />
            <span>{menu.label}</span>
          </Link>
        ))}
      </nav>

      <section className="sidebar__profile" aria-label="Profil pengguna">
        <img src={user.avatar} alt="Avatar pengguna" />
        <div>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      </section>
    </aside>
  );
}
