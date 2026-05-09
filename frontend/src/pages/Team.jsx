import React from 'react';
import { useStylesheet, useReveal } from '../utils/hooks';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

export default function Team() {
  useStylesheet('/style.css');
  useReveal();
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar openAuth={() => navigate('/?auth=login')} />
      <main>
        <section className="team-hero section-pad">
          <div className="container team-hero-grid">
            <div className="reveal">
              <span className="pill">MONIFY TEAM</span>
              <h1>Tim kecil dengan tugas yang jelas.</h1>
              <p>
                Monify dikembangkan oleh 6 anggota dengan pembagian kerja Data Scientist, AI Engineer, dan Full-Stack Web Developer. Fokusnya bukan banyak fitur, tapi fitur yang nyambung dari data, model AI, sampai antarmuka pengguna.
              </p>
            </div>
            <div className="team-summary reveal delay-1">
              <div><strong>6</strong><span>Anggota aktif</span></div>
              <div><strong>3</strong><span>Role utama</span></div>
              <div><strong>4</strong><span>Fitur AI</span></div>
            </div>
          </div>
        </section>

        <section className="role-section">
          <div className="container role-grid">
            <article className="role-card reveal">
              <span>01</span>
              <h3>Data Scientist</h3>
              <p>Mengolah data transaksi, membersihkan dataset, menyiapkan fitur, dan membaca pola pengeluaran.</p>
            </article>
            <article className="role-card reveal delay-1">
              <span>02</span>
              <h3>AI Engineer</h3>
              <p>Membangun model klasifikasi dan prediksi agar hasil analisis bisa dipakai di aplikasi.</p>
            </article>
            <article className="role-card reveal delay-2">
              <span>03</span>
              <h3>Full-Stack Web</h3>
              <p>Mengerjakan tampilan, backend API, database, autentikasi, dan integrasi service AI.</p>
            </article>
          </div>
        </section>

        <section className="members section-pad">
          <div className="container">
            <div className="section-title reveal">
              <span className="pill">Anggota Tim</span>
              <h2>Orang di balik Monify</h2>
              <p>Setiap anggota dibuat jelas posisinya supaya halaman tim tidak cuma berisi nama.</p>
            </div>

            <div className="member-grid">
              {[
                { name: "Kristina Ester", role: "Ketua Tim & Data Scientist", initials: "KE", color: "green", img: "kristina.jpg", skills: ["Data", "EDA", "Leadership"] },
                { name: "Chenida Rira Verlyta", role: "Data Scientist", initials: "CV", color: "mint", img: "chenida.jpg", skills: ["Dataset", "Analysis", "Feature"] },
                { name: "Faradila Octavia Nabila", role: "AI Engineer", initials: "FO", color: "blue", img: "faradila.jpg", skills: ["Model", "Training", "Inference"] },
                { name: "Mohamad Fajar Mutaqin", role: "AI Engineer", initials: "MF", color: "purple", img: "fajar.jpg", skills: ["AI Service", "Predict", "Testing"] },
                { name: "Purnomo Yusgiantoro", role: "Full-Stack Web Developer", initials: "PY", color: "orange", img: "purnomo.jpg", skills: ["React", "API", "Database"] },
                { name: "Indra Fata Nizar Azizi", role: "Full-Stack Web Developer / Backend Developer", initials: "IF", color: "dark", img: "indra.jpg", skills: ["Backend", "Express", "Integrasi AI"], highlight: true },
              ].map((m, i) => (
                <article key={i} className={`member-card reveal ${i > 0 ? `delay-${i % 4}` : ''} ${m.highlight ? 'highlight-member' : ''}`}>
                  <div className="member-top">
                    <div className={`avatar avatar-${m.color}`}>
                      <img 
                        src={`/TeamImages/${m.img}`} 
                        alt={m.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', position: 'absolute', inset: 0 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {m.initials}
                    </div>
                    <span className="status">Aktif</span>
                  </div>
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                  <div className="member-skills">
                    {m.skills.map(s => <span key={s}>{s}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="collab section-pad">
          <div className="container collab-card reveal">
            <div>
              <span className="pill light">Cara Kerja Tim</span>
              <h2>Frontend tidak berdiri sendiri. Data, AI, dan backend harus nyambung.</h2>
              <p>Alur kerja Monify: Data Scientist menyiapkan data, AI Engineer membangun model, Full-Stack Web menghubungkan model ke fitur pengguna.</p>
            </div>
            <div className="flow-mini">
              <span>Data</span><i></i><span>AI</span><i></i><span>API</span><i></i><span>Web</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="kontak">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" to="/">
              <span>Monify</span>
            </Link>
            <p>Capstone project pencatatan keuangan berbasis AI.</p>
          </div>
          <div>
            <h4>Role</h4>
            <a href="#">Data Scientist</a>
            <a href="#">AI Engineer</a>
            <a href="#">Full-Stack Web</a>
          </div>
          <div>
            <h4>Fitur</h4>
            <a href="/#fitur">Klasifikasi</a>
            <a href="/#fitur">Prediksi</a>
            <a href="/#fitur">Over Budget</a>
          </div>
          <div>
            <h4>Capstone</h4>
            <p>MONIFY • Coding Camp Capstone Project</p>
            <p className="muted">© 2026 Monify Team.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
