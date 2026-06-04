import React from 'react';
import { useStylesheet, useReveal } from '../utils/hooks';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const stats = [
  { value: '6', label: 'Anggota Aktif' },
  { value: '3', label: 'Role Utama' },
  { value: '4', label: 'Fitur AI' },
];

const roles = [
  {
    no: '01',
    title: 'Data Scientist',
    desc: 'Mengolah data transaksi, membersihkan dataset, menyiapkan fitur, dan membaca pola pengeluaran.',
  },
  {
    no: '02',
    title: 'AI Engineer',
    desc: 'Membangun model klasifikasi dan prediksi agar hasil analisis bisa dipakai di aplikasi.',
  },
  {
    no: '03',
    title: 'Full-Stack Web',
    desc: 'Mengerjakan tampilan, backend API, database, autentikasi, dan integrasi service AI.',
  },
];

const members = [
  {
    name: 'Kristina Ester',
    id: 'CDCC245D6X1272',
    role: 'Ketua Tim & Data Scientist',
    university: 'Universitas Kristen Satya Wacana',
    major: 'Teknik Informatika',
    skills: ['Data', 'EDA', 'Leadership'],
    img: 'kristina.jpg',
    photoPosition: 'center 18%',
    photoFit: 'cover',
    photoFrameClass: 'team-photo-box-portrait',
  },
  {
    name: 'Chenida Rira Verlyta',
    id: 'CDCC427D6X2669',
    role: 'Data Scientist',
    university: 'Universitas Bina Insan',
    major: 'Informatika',
    skills: ['Data', 'Analysis', 'Feature'],
    img: 'chenida.jpg',
    photoPosition: 'center center',
    photoFit: 'cover',
    photoFrameClass: '',
  },
  {
    name: 'Faradila Octavia Nabila',
    id: 'CACC245D6X1982',
    role: 'AI Engineer',
    university: 'Universitas Kristen Satya Wacana',
    major: 'Teknik Komputer',
    skills: ['Model', 'Training', 'Inference'],
    img: 'faradila.jpg',
    photoPosition: 'center 18%',
    photoFit: 'cover',
    photoFrameClass: '',
  },
  {
    name: 'Mohamad Fajar Mutaqin',
    id: 'CACC452D6Y1178',
    role: 'AI Engineer',
    university: 'Universitas Muhammadiyah Jakarta',
    major: 'Teknik Informatika',
    skills: ['Data', 'EDA', 'Leadership'],
    img: 'fajar.jpg',
    photoPosition: 'center center',
    photoFit: 'cover',
    photoFrameClass: '',
  },
  {
    name: 'Purnomo Yusgiantoro',
    id: 'CFCC702D6Y1121',
    role: 'Full-Stack Web Developer',
    university: 'Universitas Putra Bangsa',
    major: 'Ilmu Komputer',
    skills: ['React', 'API', 'Database'],
    img: 'purnomo.jpg',
    photoPosition: 'center 28%',
    photoFit: 'cover',
    photoFrameClass: 'team-photo-box-portrait',
  },
  {
    name: 'Indra Fata Nizar Azizi',
    id: 'CFCC702D6Y1551',
    role: 'Full-Stack Web Developer',
    university: 'Universitas Putra Bangsa',
    major: 'Ilmu Komputer',
    skills: ['Backend', 'Express', 'Integrasi AI'],
    img: 'indra.jpg',
    photoPosition: 'center 26%',
    photoFit: 'cover',
    photoFrameClass: 'team-photo-box-portrait',
  },
];

export default function Team() {
  useStylesheet('/team.css');
  useReveal();
  const navigate = useNavigate();

  return (
    <>
      <Navbar openAuth={() => navigate('/?auth=login')} />

      <main className="team-page">
        <section className="team-hero">
          <div className="container team-hero-grid">
            <div className="reveal">
              <span className="team-kicker">TIM MONIFY</span>
              <h1>Tim dibalik Monify</h1>
              <p>
                Monify dikembangkan oleh 6 anggota dengan pembagian kerja Data Scientist, AI Engineer,
                dan Full-Stack Web Developer. Fokusnya bukan hanya fitur, tapi fitur yang nyambung dari
                data, model AI, sampai antarmuka pengguna.
              </p>
            </div>

            <div className="team-stats reveal delay-1">
              {stats.map((stat) => (
                <article key={stat.label} className="team-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="team-roles">
          <div className="container">
            <div className="team-role-grid">
              {roles.map((role, index) => (
                <article
                  key={role.no}
                  className={`team-role-card reveal ${index > 0 ? `delay-${Math.min(index, 3)}` : ''}`}
                >
                  <span className="team-role-number">{role.no}</span>
                  <h2>{role.title}</h2>
                  <p>{role.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="team-members" id="team">
          <div className="container">
            <div className="team-members-head reveal">
              <span>Anggota Tim</span>
            </div>

            <div className="team-member-grid">
              {members.map((member, index) => (
                <article
                  key={member.id}
                  className={`team-member-card reveal ${index > 0 ? `delay-${index % 4 || 1}` : ''}`}
                >
                  <div className={`team-photo-box ${member.photoFrameClass}`.trim()}>
                    <img
                      src={`/TeamImages/${member.img}`}
                      alt={member.name}
                      style={{
                        objectFit: member.photoFit,
                        objectPosition: member.photoPosition,
                      }}
                      onError={(e) => {
                        e.currentTarget.classList.add('image-fallback');
                      }}
                    />
                  </div>
                  <span className="team-photo-source">Monify Team</span>
                  <h3>{member.name}</h3>
                  <p className="team-member-id">ID : {member.id}</p>
                  <span className="team-person-role">{member.role}</span>
                  <p className="team-university">{member.university}</p>
                  <p className="team-major">{member.major}</p>
                  <div className="team-skills">
                    {member.skills.map((skill) => (
                      <span key={skill} className="team-skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="kontak" className="team-footer">
        <div className="container team-footer-grid">
          <div>
            <Link className="team-footer-brand" to="/">
              Monify
            </Link>
            <p>
              Website pencatat keuangan berbasis
              <br />
              AI untuk membantu Gen Z memahami
              <br />
              pola pengeluaran
            </p>
          </div>

          <div>
            <h4>Beranda</h4>
            <a href="/#tentang">Tentang Monify</a>
            <a href="#team">Team</a>
          </div>

          <div>
            <h4>Kontak</h4>
            <p>Email: monify.team@gmail.com</p>
            <p>Telepon: +62 812-3456-7890</p>
            <p>Lokasi: Jakarta, Indonesia</p>
          </div>

          <div>
            <h4>Perusahaan</h4>
            <a href="#">Karir</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat &amp; Ketentuan</a>
          </div>
        </div>
      </footer>
    </>
  );
}
