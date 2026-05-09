import fs from 'fs';
import path from 'path';

const srcPagesDir = path.join(process.cwd(), 'src', 'pages');
if (!fs.existsSync(srcPagesDir)) fs.mkdirSync(srcPagesDir, { recursive: true });

const dashboardCode = `
import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah } from '../utils/store';

export default function Dashboard() {
  const { setMobileMenuOpen } = useOutletContext();
  const [s, setS] = useState(null);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const load = () => {
      const st = getState();
      setS(summary(st));
      setBudget(st.profile.budget);
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, []);

  if (!s) return null;

  const data = [120000, 84000, 180000, 90000, 160000, 73000, 110000];
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  
  const icons = { Makanan:'🍜', Transport:'🛵', Belanja:'🛍️', Hiburan:'🎮', Internet:'📶', Lainnya:'📌' };
  const rows = Object.entries(s.byCategory).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Dashboard Utama" 
        desc="Ringkasan uang, budget, dan sinyal boros bulan ini." 
        extraAction={<Link className="btn btn-primary" to="/transaksi"><span>Tambah Transaksi</span> +</Link>}
      />
      <section className="hero-dashboard">
        <div className="balance-card">
          <span className="label">Saldo Saat Ini</span>
          <h2>{rupiah(s.balance)}</h2>
          <p>Angka ini dihitung dari pemasukan dikurangi semua pengeluaran yang sudah kamu catat.</p>
          <div className="balance-actions">
            <Link className="btn btn-ghost" to="/transaksi">Catat Pengeluaran</Link>
            <Link className="btn btn-ghost" to="/budget">Atur Budget</Link>
          </div>
        </div>
        <div className="ai-panel">
          <h3>AI Budget Signal</h3>
          <p>{s.risk >= 100 ? 'Risiko tinggi. Pengeluaran diprediksi melewati budget.' : s.risk >= 80 ? 'Mulai rawan. Kurangi belanja non-prioritas minggu ini.' : 'Masih aman, tetap pantau transaksi.'}</p>
          <div className="risk-meter">
            <div className="meter-head"><span>Risiko over budget</span><b>{s.risk}%</b></div>
            <div className="meter"><span style={{width: \`\${s.risk}%\`}}></span></div>
          </div>
          <div className="ai-note">Safe-to-spend hari ini: <strong>{rupiah(s.safe)}</strong>. Pakai angka ini sebagai batas belanja.</div>
        </div>
      </section>
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">💰</div><span className="stat-pill">Masuk</span></div><h3>{rupiah(s.income)}</h3><p>Total pemasukan bulan ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">💸</div><span className="stat-pill">Keluar</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran tercatat</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🎯</div><span className="stat-pill">Budget</span></div><h3>{rupiah(budget)}</h3><p>Limit pengeluaran bulanan</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🔮</div><span className="stat-pill">Prediksi</span></div><h3>{rupiah(s.projected)}</h3><p>Estimasi akhir bulan</p></div>
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><div><h2>Pengeluaran Mingguan</h2><p>Visual sederhana untuk melihat hari yang paling boros.</p></div><span className="badge">Live Demo</span></div>
          <div className="bars">
            {days.map((d, i) => (
              <div className="bar-wrap" key={d}>
                <div className="bar" style={{height: \`\${Math.max(24, data[i]/2200)}px\`}}></div>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h2>Kategori Teratas</h2><p>Fokus hemat dimulai dari kategori terbesar.</p></div><span className="badge">{s.topCategory[0]}</span></div>
          <div className="category-list">
            {rows.length ? rows.map(([cat, val]) => (
              <div className="cat-row" key={cat}>
                <div className="cat-icon">{icons[cat] || '📌'}</div>
                <div><strong>{cat}</strong><small>{Math.round((val / Math.max(1,s.expense))*100)}% dari pengeluaran</small></div>
                <em>{rupiah(val)}</em>
              </div>
            )) : <div className="empty-state"><strong>Belum ada data</strong>Tambah transaksi dulu.</div>}
          </div>
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Dashboard.jsx'), dashboardCode);

const transaksiCode = `
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, classify, rupiah, toast } from '../utils/store';

export default function Transaksi() {
  const { setMobileMenuOpen } = useOutletContext();
  const [transactions, setTransactions] = useState([]);
  
  const [form, setForm] = useState({ id: '', title: '', amount: '', type: 'expense', date: new Date().toISOString().slice(0,10), note: '' });

  useEffect(() => {
    const load = () => setTransactions(getState().transactions);
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, []);

  const preview = form.type === 'income' ? 'Pemasukan' : (form.title.trim() ? classify(form.title) : 'Isi judul transaksi dulu');

  const handleSubmit = (e) => {
    e.preventDefault();
    const st = getState();
    const category = form.type === 'income' ? 'Pemasukan' : classify(form.title);
    const trx = { id: form.id ? Number(form.id) : Date.now(), date: form.date, title: form.title.trim(), type: form.type, category, amount: Number(form.amount), note: form.note.trim() };
    
    if (form.id) {
      st.transactions = st.transactions.map(item => item.id === Number(form.id) ? trx : item);
      toast(\`Transaksi diperbarui. Kategori AI: \${category}.\`);
    } else {
      st.transactions.unshift(trx);
      toast(form.type === 'expense' ? \`Transaksi disimpan. AI mengklasifikasikan ke \${category}.\` : 'Pemasukan berhasil disimpan.');
    }
    setState(st);
    handleCancel();
  };

  const handleEdit = (trx) => {
    setForm({ id: trx.id, title: trx.title, amount: trx.amount, type: trx.type, date: trx.date, note: trx.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const st = getState();
    st.transactions = st.transactions.filter(item => item.id !== id);
    setState(st);
    toast('Transaksi dihapus dari data demo.');
  };

  const handleCancel = () => {
    setForm({ id: '', title: '', amount: '', type: 'expense', date: new Date().toISOString().slice(0,10), note: '' });
  };

  return (
    <>
      <Topbar setMobileMenuOpen={setMobileMenuOpen} title="Catat Transaksi" desc="Masukkan pemasukan atau pengeluaran. Kategori diprediksi otomatis." />
      <section className="page-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-head"><div><h2>{form.id ? 'Edit Transaksi' : 'Form Transaksi'}</h2><p>Catat dulu. Kalau salah nominal, tanggal, atau catatan, pakai tombol edit di riwayat.</p></div></div>
          <div className="form-grid">
            <div className="field"><label>Judul Transaksi</label><div className="input-wrap"><input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Contoh: Makan ayam geprek" required /></div></div>
            <div className="field"><label>Nominal</label><div className="input-wrap"><input type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} placeholder="28000" required /></div></div>
            <div className="field"><label>Tipe</label><div className="input-wrap"><select value={form.type} onChange={e=>setForm({...form, type: e.target.value})}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></div></div>
            <div className="ai-category-preview"><span>Prediksi kategori AI</span><strong>{preview}</strong><p>Kategori berubah otomatis dari teks transaksi.</p></div>
            <div className="field"><label>Tanggal</label><div className="input-wrap"><input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} required /></div></div>
            <div className="field"><label>Catatan</label><div className="input-wrap"><textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} placeholder="Opsional"></textarea></div></div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">{form.id ? 'Simpan Perubahan' : 'Simpan Transaksi'}</button>
              {form.id && <button className="btn btn-ghost" type="button" onClick={handleCancel}>Batal Edit</button>}
            </div>
          </div>
        </form>
        <div className="table-card">
          <div className="panel-head" style={{padding:'22px 22px 0'}}><div><h2>Riwayat Terbaru</h2><p>Gunakan edit kalau ada kesalahan input.</p></div></div>
          <table>
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori AI</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {transactions.slice(0,12).map(x => (
                <tr key={x.id}>
                  <td>{x.date}</td>
                  <td><strong>{x.title}</strong><br/><small style={{color:'#6b7b74'}}>{x.note || '-'}</small></td>
                  <td><span className={\`badge \${x.type==='income'?'':'warn'}\`}>{x.category}</span></td>
                  <td className={x.type==='income'?'amount-plus':'amount-minus'}>{x.type==='income'?'+':'-'} {rupiah(x.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleEdit(x)}>Edit</button>
                      <button type="button" onClick={() => handleDelete(x.id)} className="danger">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Transaksi.jsx'), transaksiCode);

const budgetCode = `
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, summary, rupiah, toast, timestamp } from '../utils/store';

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
    toast(\`Limit \${cat} diperbarui.\`);
  };

  const rows = Object.entries(st.budgets).map(([cat, limit]) => {
    const used = s.byCategory[cat] || 0;
    return { cat, limit, used, pct: Math.round((used / Math.max(1, limit)) * 100) };
  });

  const risky = rows.filter(row => row.pct >= 70).sort((a,b)=>b.pct-a.pct).slice(0,3);
  const messages = risky.length ? risky.map(row => \`Kurangi kategori \${row.cat}. Sudah terpakai \${row.pct}% dari limit \${rupiah(row.limit)}.\`) : [
    \`Belum ada kategori yang rawan. Tetap pantau \${s.topCategory[0]} karena menjadi pengeluaran terbesar saat ini.\`,
    \`Safe-to-spend hari ini sekitar \${rupiah(s.safe)}.\`,
    \`Target tabungan \${rupiah(st.profile.savingTarget)} sebaiknya dipisahkan di awal bulan.\`
  ];

  return (
    <>
      <Topbar setMobileMenuOpen={setMobileMenuOpen} title="Budget Bulanan" desc="Atur batas total dan limit tiap kategori supaya rekomendasi AI lebih masuk akal." extraAction={<button className="btn btn-primary" onClick={() => { setAiStamp(\`Terakhir diperbarui: \${timestamp()}\`); toast('Prediksi AI budget diperbarui dari data terbaru.'); }}>Update Prediksi AI</button>} />
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🎯</div><span className="stat-pill">Target</span></div><h3>{rupiah(st.profile.budget)}</h3><p>Budget pengeluaran bulan ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">💸</div><span className="stat-pill">Terpakai</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran tercatat</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🧘</div><span className="stat-pill">Sisa</span></div><h3>{rupiah(Math.max(0, st.profile.budget - s.expense))}</h3><p>Sisa ruang pengeluaran</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon">🤖</div><span className="stat-pill">AI</span></div><h3>{s.risk}%</h3><p>Risiko dari pola pengeluaran</p></div>
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
          <div className="panel-head"><div><h2>Limit per Kategori</h2><p>Ubah limit sesuai kebutuhan.</p></div></div>
          <div className="budget-list">
            {rows.map(row => (
              <form key={row.cat} className="budget-item editable-budget" onSubmit={(e) => handleLimitSubmit(e, row.cat)}>
                <div className="budget-head"><span>{row.cat}</span><span>{rupiah(row.used)} / {rupiah(row.limit)}</span></div>
                <div className={\`progress \${row.pct >= 90 ? 'danger' : row.pct >= 70 ? 'warn' : ''}\`}><span style={{width: \`\${Math.min(100, row.pct)}%\`}}></span></div>
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
            <div className="reco" key={i}><i>{['🔥','🎯','🧮'][i] || '✅'}</i><span>{m}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}
`;
fs.writeFileSync(path.join(srcPagesDir, 'Budget.jsx'), budgetCode);

console.log('Migrate 2 done');
