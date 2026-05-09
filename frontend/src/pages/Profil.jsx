import React, { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, toast } from '../utils/store';

export default function Profil() {
  const { setMobileMenuOpen } = useOutletContext();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    setUser(getState().user);
  }, []);

  const handleProfile = (e) => {
    e.preventDefault();
    const st = getState();
    st.user.name = user.name;
    st.user.email = user.email;
    setState(st);
    toast('Profil demo diperbarui.');
  };

  const handlePassword = (e) => {
    e.preventDefault();
    const newPass = e.target.elements.newPass.value;
    const confirmPass = e.target.elements.confirmPass.value;
    if (newPass !== confirmPass) return toast('Password baru dan konfirmasi belum sama.');
    e.target.reset();
    toast('Password demo berhasil diganti.');
  };

  const handleLogout = () => {
    localStorage.removeItem('monify_logged_in');
    navigate('/');
  };

  const handleReset = () => {
    localStorage.removeItem('monify_state');
    toast('Data demo direset.');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Profil & Pengaturan" 
        desc="Kelola akun demo dan navigasi keluar dari dashboard." 
        extraAction={<><Link className="btn btn-ghost" to="/">Landing Page</Link><button className="btn btn-primary" onClick={handleLogout}>Keluar</button></>} 
      />
      <section className="page-grid">
        <div className="panel profile-card">
          <div className="panel-head"><div><h2>Informasi Akun</h2><p>Di aplikasi final, bagian ini terhubung ke database dan sistem auth.</p></div></div>
          <form className="form-grid" onSubmit={handleProfile}>
            <div className="field"><label>Nama</label><div className="input-wrap"><input value={user.name} onChange={e=>setUser({...user, name: e.target.value})} /></div></div>
            <div className="field"><label>Email</label><div className="input-wrap"><input type="email" value={user.email} onChange={e=>setUser({...user, email: e.target.value})} /></div></div>
            <button className="btn btn-primary" type="submit">Simpan Profil</button>
          </form>
        </div>
        <div className="panel profile-card">
          <div className="panel-head"><div><h2>Ganti Password</h2><p>Prototype ini hanya simulasi frontend. Backend final tetap wajib validasi password lama.</p></div></div>
          <form className="form-grid" onSubmit={handlePassword}>
            <div className="field"><label>Password Lama</label><div className="input-wrap"><input type="password" placeholder="Password lama" required /></div></div>
            <div className="field"><label>Password Baru</label><div className="input-wrap"><input name="newPass" type="password" placeholder="Password baru" required /></div></div>
            <div className="field"><label>Konfirmasi Password</label><div className="input-wrap"><input name="confirmPass" type="password" placeholder="Ulangi password baru" required /></div></div>
            <button className="btn btn-primary" type="submit">Simpan Password</button>
          </form>
        </div>
      </section>
      <section className="panel account-actions">
        <div className="panel-head"><div><h2>Aksi Akun</h2><p>Pakai ini untuk pindah dari dashboard ke landing atau keluar dan membuka popup login lagi.</p></div></div>
        <div className="form-actions">
          <Link className="btn btn-ghost" to="/">Kembali ke Landing Page</Link>
          <button className="btn btn-primary" type="button" onClick={handleLogout}>Keluar dari Dashboard</button>
          <button className="btn btn-ghost" type="button" onClick={handleReset}>Reset Data Demo</button>
        </div>
      </section>
    </>
  );
}