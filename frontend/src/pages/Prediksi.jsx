import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah, toast, timestamp } from '../utils/store';
import { Tags, TrendingUp, ShieldAlert, Target, Calculator, Receipt, Heart } from 'lucide-react';

export default function Prediksi() {
  const { setMobileMenuOpen } = useOutletContext();
  const [s, setS] = useState(null);
  const [st, setSt] = useState(null);
  const [aiStamp, setAiStamp] = useState('Klik update untuk menyegarkan rekomendasi dari data terbaru.');

  useEffect(() => {
    const load = () => {
      const state = getState();
      setSt(state);
      setS(summary(state));
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, []);

  if (!s || !st) return null;

  const getStatus = () => {
    if (s.risk >= 100) return <><span className="badge danger">Over budget</span><p className="help">Prediksi pengeluaran melewati budget. Kurangi kategori terbesar sekarang.</p></>;
    if (s.risk >= 80) return <><span className="badge warn">Rawan boros</span><p className="help">Masih bisa diselamatkan kalau pengeluaran non-prioritas dikurangi minggu ini.</p></>;
    return <><span className="badge">Aman</span><p className="help">Budget masih sehat. Tetap catat transaksi supaya prediksi tidak ngawur.</p></>;
  };

  const recos = [
    `Batasi kategori ${s.topCategory[0]} karena jadi pengeluaran terbesar bulan ini.`,
    `Gunakan batas harian ${rupiah(s.safe)} sebagai angka aman belanja hari ini.`,
    `Catat transaksi kecil juga. Kopi, parkir, dan jajan biasanya yang bikin prediksi meleset.`,
    `Sisihkan target tabungan ${rupiah(st.profile.savingTarget)} lebih awal, bukan menunggu sisa uang.`
  ];

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Prediksi AI" 
        desc="Empat fitur utama: kategori otomatis, prediksi bulanan, over budget, dan safe-to-spend." 
        extraAction={<><button className="btn btn-primary" onClick={() => { setAiStamp(`Rekomendasi terakhir diperbarui: ${timestamp()}.`); toast('Prediksi AI diperbarui.'); }}>Update Prediksi</button><Link className="btn btn-ghost" to="/transaksi">Tambah Data</Link></>} 
      />
      <section className="feature-grid" style={{marginBottom: '20px'}}>
        <div className="feature-card"><i><Tags size={24}/></i><h3>Klasifikasi Otomatis</h3><p>Deskripsi transaksi dibaca lalu diarahkan ke kategori seperti makanan, transport, belanja, hiburan, internet, atau lainnya.</p></div>
        <div className="feature-card"><i><TrendingUp size={24}/></i><h3>Prediksi Pengeluaran</h3><p>Riwayat transaksi dipakai untuk memperkirakan pengeluaran sampai akhir bulan.</p></div>
        <div className="feature-card"><i><ShieldAlert size={24}/></i><h3>Deteksi Over Budget</h3><p>Prediksi dibandingkan dengan budget. Kalau risiko tinggi, user diberi sinyal sebelum uang keburu habis.</p></div>
      </section>
      <section className="insight-board">
        <div className="prediction-card">
          <h3>Prediksi Akhir Bulan</h3><p className="help">Estimasi total pengeluaran jika pola harian tetap sama.</p>
          <div className="big-number">{rupiah(s.projected)}</div>
          <span className="badge">Budget: <b>{rupiah(st.profile.budget)}</b></span>
        </div>
        <div className="prediction-card">
          <h3>Safe-to-Spend Hari Ini</h3><p className="help">Batas belanja aman per hari agar budget tidak jebol.</p>
          <div className="big-number">{rupiah(s.safe)}</div>
          <span className="badge">Sisa hari dihitung otomatis</span>
        </div>
        <div className="prediction-card">
          <h3>Risiko Over Budget</h3><p className="help">Semakin tinggi, semakin besar peluang pengeluaran melewati budget.</p>
          <div className="big-number">{s.risk}%</div>
          <div className="progress warn"><span style={{width: `${Math.min(100, s.risk)}%`}}></span></div>
          <div style={{marginTop: '14px'}}>{getStatus()}</div>
        </div>
        <div className="prediction-card">
          <h3>Rekomendasi MONIFY</h3><p className="help">{aiStamp}</p>
          <div className="reco-list">
            {recos.map((text, i) => <div className="reco" key={i}><i>{[<Target size={18}/>, <Calculator size={18}/>, <Receipt size={18}/>, <Heart size={18}/>][i]}</i><span>{text}</span></div>)}
          </div>
        </div>
      </section>
    </>
  );
}