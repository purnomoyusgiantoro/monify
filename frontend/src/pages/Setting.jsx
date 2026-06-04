import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import { getState, setState } from '../utils/store';
import { apiLogout, apiUpdatePassword, apiUpdateProfile, apiGetMe } from '../utils/api';

export default function Setting() {
  const { showToast = () => {} } = useOutletContext() ?? {};
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
          const next = getState();
          next.user.name = res.data.data.name || next.user.name;
          next.user.email = res.data.data.email || next.user.email;
          setState(next);
          return;
        }
      } catch {
        // Fallback to local state
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

    const name = user.name.trim();
    const email = user.email.trim();

    if (name.length < 3) {
      showToast('error', 'Gagal memperbarui profil. Nama lengkap minimal 3 karakter.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', 'Gagal memperbarui profil. Format email belum benar.');
      return;
    }

    try {
      setSavingProfile(true);
      const result = await apiUpdateProfile(name, email);
      if (!result.ok) {
        showToast('error', result.data?.message || 'Gagal memperbarui profil.');
        return;
      }

      const next = getState();
      next.user.name = name;
      next.user.email = email;
      setState(next);
      setUser((current) => ({ ...current, name, email }));
      showToast('success', 'Profil berhasil diperbarui.');
    } catch {
      showToast('error', 'Terjadi kesalahan saat memperbarui profil.');
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

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Gagal memperbarui password. Semua field wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'Gagal memperbarui password. Password baru minimal 8 karakter.');
      return;
    }

    if (oldPassword === newPassword) {
      showToast('error', 'Gagal memperbarui password. Password baru tidak boleh sama dengan password lama.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Gagal memperbarui password. Konfirmasi password tidak sama.');
      return;
    }

    try {
      setSavingPassword(true);
      const result = await apiUpdatePassword(oldPassword, newPassword);
      if (!result.ok) {
        showToast('error', result.data?.message || 'Gagal memperbarui password.');
        return;
      }

      event.currentTarget.reset();
      showToast('success', 'Password berhasil diperbarui.');
    } catch {
      showToast('error', 'Terjadi kesalahan saat memperbarui password.');
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
      window.location.href = '/';
      return;
    }

    window.location.href = '/';
  }

  return (
    <main className="page-main setting-main setting-page-compact">
      <Topbar
        title="Setting"
        description="Kelola akun dan keamanan Monify"
        showDate={false}
      />

      <section className="setting-compact-grid">
        <section className="setting-compact-card setting-compact-card--profile" aria-label="Profil pengguna">
          <img className="setting-compact-profile__avatar" src="/assets/setting-avatar.png" alt={`Avatar ${user.name || 'pengguna'}`} />
          <h2>{user.name || 'Pengguna'}</h2>
          <p>{user.email || 'user@example.com'}</p>
          <div className="setting-compact-profile__status">
            <span className="setting-compact-profile__status-dot" aria-hidden="true" />
            <span>Online</span>
          </div>
        </section>

        <article className="setting-compact-card setting-compact-card--form">
          <header className="setting-compact-card__header">
            <h2>Informasi Profile</h2>
            <p>Perbarui informasi dasar akun Anda</p>
          </header>

          <form className="setting-compact-form" onSubmit={handleProfileSubmit}>
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
                readOnly
              />
            </label>
            <div className="setting-compact-form__actions">
              <button type="submit" className="button button--primary" disabled={savingProfile}>
                {savingProfile ? 'Menyimpan...' : 'Simpan Profile'}
              </button>
            </div>
          </form>
        </article>

        <article className="setting-compact-card setting-compact-card--security">
          <header className="setting-compact-card__header">
            <h2>Keamanan Profile</h2>
            <p>Ubah password secara berkala untuk menjaga akun tetap aman</p>
          </header>

          <form className="setting-compact-security" onSubmit={handlePasswordSubmit}>
            <label className="form-field">
              <span>Password Lama</span>
              <input type="password" name="oldPassword" placeholder="Masukkan Password Lama" required />
            </label>
            <label className="form-field">
              <span>Password Baru</span>
              <input type="password" name="newPassword" placeholder="Masukkan Password Baru" required />
            </label>
            <label className="form-field setting-compact-security__confirm">
              <span>Konfirmasi Password Baru</span>
              <input type="password" name="confirmPassword" placeholder="Konfirmasi Password Baru" required />
            </label>
            <div className="setting-compact-security__actions">
              <button type="submit" className="button button--primary" disabled={savingPassword}>
                {savingPassword ? 'Memproses...' : 'Simpan Password'}
              </button>
            </div>
          </form>
        </article>

        <section className="setting-compact-card setting-compact-card--session">
          <div className="setting-compact-session__item">
            <div className="setting-compact-session__item-icon" aria-hidden="true">
              <LogOut size={16} />
            </div>
            <div className="setting-compact-session__item-copy">
              <strong>Keluar Akun</strong>
              <span>Kelola navigasi dan sesi akun yang sedang aktif</span>
            </div>
          </div>

          <div className="setting-compact-session__actions">
            <button type="button" className="button button--danger" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Keluar...' : 'Keluar Akun'}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
