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

      <section className="setting-grid">
        <section className="settings-profile-card" aria-label="Profil pengguna">
          <img className="settings-profile-card__avatar" src="/assets/setting-avatar.png" alt={`Avatar ${user.name || 'pengguna'}`} />
          <h2>{user.name || 'Pengguna'}</h2>
          <p>{user.email || 'user@example.com'}</p>
          <button type="button" className="button settings-profile-card__logout" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </section>

        <article className="settings-card settings-card--profile-form">
          <header>
            <h2>Informasi Profil</h2>
            <p>Perbarui informasi dasar akun Anda</p>
          </header>

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <label className="form-field">
              <span>Nama Lengkap</span>
              <input
                type="text"
                value={user.name}
                onChange={(event) => setUser((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="form-field">
              <span>E-mail</span>
              <input
                type="email"
                value={user.email}
                onChange={(event) => setUser((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </label>
            <div className="settings-form__actions">
              <button type="submit" className="button button--primary" disabled={savingProfile}>
                {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </article>

        <article className="settings-card settings-card--security">
          <header>
            <h2>Keamanan Akun</h2>
            <p>Ubah password secara berkala untuk menjaga akun tetap aman</p>
          </header>

          <form className="security-form" onSubmit={handlePasswordSubmit}>
            <label className="form-field">
              <span>Password Lama</span>
              <input type="password" name="oldPassword" required />
            </label>
            <label className="form-field">
              <span>Password Baru</span>
              <input type="password" name="newPassword" required />
            </label>
            <label className="form-field">
              <span>Konfirmasi Password Baru</span>
              <input type="password" name="confirmPassword" required />
            </label>

            <div className="security-form__actions">
              <button type="submit" className="button button--primary" disabled={savingPassword}>
                {savingPassword ? 'Memproses...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        </article>

        <section className="danger-zone setting-actions">
          <header className="danger-zone__header">
            <div className="danger-zone__icon" aria-hidden="true">
              <img src="/assets/icon-zona-akun.png" alt="" />
            </div>
            <div>
              <h2>Sesi Akun</h2>
              <p>Kelola navigasi dan sesi akun yang sedang aktif</p>
            </div>
          </header>

          <div className="setting-actions__buttons">
            <button type="button" className="button button--secondary" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </button>
            <button type="button" className="button button--danger danger-zone__button" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Keluar...' : 'Keluar Akun'}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
