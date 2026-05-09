import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, summary, rupiah } from '../utils/store';
import { CreditCard, Wallet, Flame, Receipt, Paperclip, Brain } from 'lucide-react';

export default function Laporan() {
  const { setMobileMenuOpen } = useOutletContext();
  const [period, setPeriod] = useState('month');
  const [dateVal, setDateVal] = useState(new Date().toISOString().slice(0,10));
  const [monthVal, setMonthVal] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`);
  const [yearVal, setYearVal] = useState(new Date().getFullYear());
  
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [s, setS] = useState(null);

  useEffect(() => {
    const load = () => {
      const state = getState();
      const filtered = state.transactions.filter(item => {
        if (period === 'day') return item.date === dateVal;
        if (period === 'year') return item.date.slice(0,4) === String(yearVal);
        return item.date.slice(0,7) === monthVal;
      });
      setFilteredTransactions(filtered);
      setS(summary(state, filtered));
    };
    load();
    window.addEventListener('statechange', load);
    return () => window.removeEventListener('statechange', load);
  }, [period, dateVal, monthVal, yearVal]);

  if (!s) return null;

  const label = period === 'day' ? 'hari ini/tanggal terpilih' : period === 'year' ? 'tahun terpilih' : 'bulan terpilih';

  return (
    <>
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Laporan Keuangan" 
        desc="Lihat ringkasan harian, bulanan, dan tahunan tanpa pindah halaman." 
        extraAction={<button className="btn btn-ghost" onClick={() => window.print()}>Cetak</button>} 
      />
      <section className="panel report-filter-panel">
        <div className="panel-head"><div><h2>Periode Laporan</h2><p>Pilih tanggal harian, bulan, atau tahun. Angka di bawah akan otomatis berubah.</p></div></div>
        <div className="report-controls">
          <button className={`btn ${period === 'day' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('day')}>Hari Ini</button>
          <button className={`btn ${period === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('month')}>Bulan Ini</button>
          <button className={`btn ${period === 'year' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('year')}>Tahun Ini</button>
          <div className="field"><label>Tanggal</label><div className="input-wrap"><input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)} /></div></div>
          <div className="field"><label>Bulan</label><div className="input-wrap"><input type="month" value={monthVal} onChange={e=>setMonthVal(e.target.value)} /></div></div>
          <div className="field"><label>Tahun</label><div className="input-wrap"><input type="number" value={yearVal} onChange={e=>setYearVal(e.target.value)} min="2020" max="2035" /></div></div>
        </div>
      </section>
      <section className="stats-grid report-stats">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><CreditCard size={24}/></div><span className="stat-pill">Keluar</span></div><h3>{rupiah(s.expense)}</h3><p>Total pengeluaran periode ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Wallet size={24}/></div><span className="stat-pill">Masuk</span></div><h3>{rupiah(s.income)}</h3><p>Total pemasukan periode ini</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Flame size={24}/></div><span className="stat-pill">Terbesar</span></div><h3>{s.topCategory[0]}</h3><p>Kategori pengeluaran terbesar</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Receipt size={24}/></div><span className="stat-pill">Data</span></div><h3>{s.total}</h3><p>Jumlah transaksi periode ini</p></div>
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><div><h2>Kesimpulan Periode</h2><p>Bahasa dibuat manusiawi supaya user tahu tindakan berikutnya.</p></div></div>
          <div className="reco-list">
            <div className="reco"><i><Paperclip size={18}/></i><span>Pada {label}, pemasukan tercatat {rupiah(s.income)} dan pengeluaran {rupiah(s.expense)}.</span></div>
            <div className="reco"><i><Flame size={18}/></i><span>Kategori terbesar adalah {s.topCategory[0]} dengan total {rupiah(s.topCategory[1])}.</span></div>
            <div className="reco"><i><Brain size={18}/></i><span>Jumlah transaksi: {s.total}.</span></div>
          </div>
        </div>
        <div className="table-card">
          <div className="panel-head" style={{padding:'22px 22px 0'}}><div><h2>Transaksi Periode Ini</h2><p>Daftar transaksi sesuai filter laporan.</p></div></div>
          <table>
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori</th><th>Nominal</th></tr></thead>
            <tbody>
              {filteredTransactions.length ? filteredTransactions.map(x => (
                <tr key={x.id}>
                  <td>{x.date}</td>
                  <td><strong>{x.title}</strong><br/><small style={{color:'#6b7b74'}}>{x.note || '-'}</small></td>
                  <td><span className={`badge ${x.type==='income'?'':'warn'}`}>{x.category}</span></td>
                  <td className={x.type==='income'?'amount-plus':'amount-minus'}>{x.type==='income'?'+':'-'} {rupiah(x.amount)}</td>
                </tr>
              )) : <tr><td colSpan="4"><div className="empty-state"><strong>Belum ada transaksi</strong>Ubah periode atau tambahkan data.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}