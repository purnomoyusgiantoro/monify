import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, summary, rupiah, toast, timestamp } from '../utils/store';
import { Target, CreditCard, Leaf, Bot, Flame, Calculator, CheckCircle } from 'lucide-react';

export default function Budget() {
  const { setMobileMenuOpen } = useOutletContext();
  const [s, setS] = useState(null);
  const [st, setSt] = useState(null);
  const [aiStamp, setAiStamp] = useState('Klik update untuk membaca ulang kondisi budget terbaru.');

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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const next = getState();
    next.profile.income = Number(data.get('income')) || next.profile.income;
    next.profile.budget = Number(data.get('budget')) || next.profile.budget;
    next.profile.savingTarget = Number(data.get('saving')) || next.profile.savingTarget;
    setState(next);
    toast('Target keuangan diperbarui.');
  };

  const handleLimitSubmit = (e, cat) => {
    e.preventDefault();
    const limit = Number(e.target.elements.limit.value);
    const next = getState();
    next.budgets[cat] = Math.max(1, limit || next.budgets[cat]);
    setState(next);
    toast(`Limit ${cat} diperbarui.`);
  };

  const rows = Object.entries(st.budgets).map(([cat, limit]) => {
    const used = s.byCategory[cat] || 0;
    return { cat, limit, used, pct: Math.round((used / Math.max(1, limit)) * 100) };
  });

  const risky = rows.filter(row => row.pct >= 70).sort((a,b)=>b.pct-a.pct).slice(0,3);
  const messages = risky.length ? risky.map(row => `Kurangi kategori ${row.cat}. Sudah terpakai ${row.pct}% dari limit ${rupiah(row.limit)}.`) : [
    `Belum ada kategori yang rawan. Tetap pantau ${s.topCategory[0]} karena menjadi pengeluaran terbesar saat ini.`,
    `Safe-to-spend hari ini sekitar ${rupiah(s.safe)}.`,
    `Target tabungan ${rupiah(st.profile.savingTarget)} sebaiknya dipisahkan di awal bulan.`
  ];

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Budget Bulanan" 
        desc="Atur batas total dan limit tiap kategori supaya rekomendasi AI lebih masuk akal." 
        extraAction={<button className="btn btn-primary" onClick={() => { setAiStamp(`Terakhir diperbarui: ${timestamp()}`); toast('Prediksi AI budget diperbarui dari data terbaru.'); }}>Update Prediksi AI</button>} 
      />
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Target size={24}/></div><span className="stat-pill">Target</span></div><h3>{rupiah(st.profile.budget)}</h3><p>Budget pengeluaran bulan ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><CreditCard size={24}/></div><span className="stat-pill">Terpakai</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran tercatat</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Leaf size={24}/></div><span className="stat-pill">Sisa</span></div><h3>{rupiah(Math.max(0, st.profile.budget - s.expense))}</h3><p>Sisa ruang pengeluaran</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Bot size={24}/></div><span className="stat-pill">AI</span></div><h3>{s.risk}%</h3><p>Risiko dari pola pengeluaran</p></div>
      </section>
      <section className="page-grid">
        <form className="panel" onSubmit={handleProfileSubmit}>
          <div className="panel-head"><div><h2>Target Keuangan</h2><p>Isi angka yang realistis. Budget terlalu kecil cuma bikin sistem terus-terusan memberi peringatan palsu.</p></div></div>
          <div className="form-grid">
            <div className="field"><label>Pemasukan Bulanan</label><div className="input-wrap"><input name="income" type="number" defaultValue={st.profile.income} /></div></div>
            <div className="field"><label>Budget Pengeluaran</label><div className="input-wrap"><input name="budget" type="number" defaultValue={st.profile.budget} /></div></div>
            <div className="field"><label>Target Tabungan</label><div className="input-wrap"><input name="saving" type="number" defaultValue={st.profile.savingTarget} /></div></div>
            <button className="btn btn-primary" type="submit">Simpan Target</button>
          </div>
        </form>
        <div className="panel">
          <div className="panel-head"><div><h2>Limit per Kategori</h2><p>Ubah limit sesuai kebutuhan. Angka ini dipakai untuk membaca kategori mana yang harus dikurangi.</p></div></div>
          <div className="budget-list">
            {rows.map(row => (
              <form key={row.cat} className="budget-item editable-budget" onSubmit={(e) => handleLimitSubmit(e, row.cat)}>
                <div className="budget-head"><span>{row.cat}</span><span>{rupiah(row.used)} / {rupiah(row.limit)}</span></div>
                <div className={`progress ${row.pct >= 90 ? 'danger' : row.pct >= 70 ? 'warn' : ''}`}><span style={{width: `${Math.min(100, row.pct)}%`}}></span></div>
                <p className="help">Terpakai {row.pct}%. {row.pct >= 90 ? 'Stop dulu kategori ini.' : row.pct >= 70 ? 'Mulai rem belanja kategori ini.' : 'Masih cukup aman.'}</p>
                <div className="budget-edit-row"><input type="number" name="limit" defaultValue={row.limit} /><button className="btn btn-ghost" type="submit">Ubah Limit</button></div>
              </form>
            ))}
          </div>
        </div>
      </section>
      <section className="panel ai-budget-panel">
        <div className="panel-head"><div><h2>Rekomendasi AI Budget</h2><p>{aiStamp}</p></div></div>
        <div className="reco-list">
          {messages.map((m, i) => (
            <div className="reco" key={i}><i>{[<Flame size={18}/>, <Target size={18}/>, <Calculator size={18}/>][i] || <CheckCircle size={18}/>}</i><span>{m}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}