import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import { getState, setState, toast } from '../utils/store';
import { apiLogout, apiUpdatePassword, apiUpdateProfile, apiGetMe } from '../utils/api';

export default function Setting() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiGetMe();
        if (res.ok && res.data.data) {
          setUser({
            name: res.data.data.name || '',
            email: res.data.data.email || '',
          });
          // Sync to local state
          const next = getState();
          next.user.name = res.data.data.name || next.user.name;
          next.user.email = res.data.data.email || next.user.email;
          setState(next);
          return;
        }
      } catch {
        // Fallback to local
      }
      const localUser = getState().user;
      setUser({
        name: localUser?.name || '',
        email: localUser?.email || '',
      });
    }
    fetchUser();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (savingProfile) return;

    try {
      setSavingProfile(true);
      const result = await apiUpdateProfile(user.name, user.email);
      if (!result.ok) {
        toast(result.data?.message || 'Gagal menyimpan profil.');
        return;
      }

      const next = getState();
      next.user.name = user.name;
      next.user.email = user.email;
      setState(next);
      toast('Profil berhasil diperbarui.');
    } catch {
      toast('Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (savingPassword) return;

    const oldPassword = event.currentTarget.oldPassword.value;
    const newPassword = event.currentTarget.newPassword.value;
    const confirmPassword = event.currentTarget.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      toast('Konfirmasi password tidak sama.');
      return;
    }

    try {
      setSavingPassword(true);
      const result = await apiUpdatePassword(oldPassword, newPassword);
      if (!result.ok) {
        toast(result.data?.message || 'Gagal mengubah password.');
        return;
      }

      event.currentTarget.reset();
      toast('Password berhasil diubah.');
    } catch {
      toast('Terjadi kesalahan saat mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await apiLogout();
    } catch {
      localStorage.removeItem('monify_logged_in');
      localStorage.removeItem('monify_token');
      localStorage.removeItem('monify_user');
    } finally {
      setLoggingOut(false);
      navigate('/');
    }
  }

  return (
    <main className="page-main setting-main">
      <Topbar
        title="Setting"
        description="Kelola profil, password, dan sesi akun"
        showDate={false}
      />

      <section className="setting-layout">
        <article className="setting-card">
          <h2>Profil Akun</h2>
          <form className="setting-form" onSubmit={handleProfileSubmit}>
            <label className="form-field">
              <span>Nama</span>
              <input
                type="text"
                value={user.name}
                onChange={(event) => setUser((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={user.email}
                onChange={(event) => setUser((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </label>
            <button type="submit" className="button button--primary" disabled={savingProfile}>
              {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </article>

        <article className="setting-card">
          <h2>Keamanan</h2>
          <form className="setting-form" onSubmit={handlePasswordSubmit}>
            <label className="form-field">
              <span>Password Lama</span>
              <input type="password" name="oldPassword" required />
            </label>
            <label className="form-field">
              <span>Password Baru</span>
              <input type="password" name="newPassword" required />
            </label>
            <label className="form-field">
              <span>Konfirmasi Password</span>
              <input type="password" name="confirmPassword" required />
            </label>
            <button type="submit" className="button button--primary" disabled={savingPassword}>
              {savingPassword ? 'Memproses...' : 'Simpan Password'}
            </button>
          </form>
        </article>
      </section>

      <section className="setting-actions">
        <button type="button" className="button button--secondary" onClick={() => navigate('/dashboard')}>
          Kembali ke Dashboard
        </button>
        <button type="button" className="button button--danger" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Keluar...' : 'Keluar Akun'}
        </button>
      </section>
    </main>
  );
}
