import React from 'react';
import Topbar from '../components/Topbar.jsx';
import { Award, Download, Lock } from 'lucide-react';

export default function Sertifikat() {
  return (
    <main className="page-main sertifikat-main">
      <Topbar
        title="Sertifikat"
        description="Lihat dan unduh sertifikat pencapaian keuangan Anda"
        showDate={false}
      />

      <section className="setting-layout" style={{ marginTop: '20px' }}>
        <article className="setting-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '50%', color: '#4caf50' }}>
              <Award size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Sertifikat Master Keuangan</h2>
              <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.9rem' }}>Diberikan karena berhasil mencapai target budget 3 bulan berturut-turut.</p>
            </div>
          </div>
          <button className="button button--primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            Unduh Sertifikat
          </button>
        </article>

        <article className="setting-card" style={{ opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '50%', color: '#9e9e9e' }}>
              <Lock size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Sertifikat Investor Pemula</h2>
              <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.9rem' }}>Selesaikan modul edukasi investasi untuk mendapatkan sertifikat ini.</p>
            </div>
          </div>
          <button className="button button--secondary" disabled style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Terkunci
          </button>
        </article>
      </section>
    </main>
  );
}
