import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
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
      toast(`Transaksi diperbarui. Kategori AI: ${category}.`);
    } else {
      st.transactions.unshift(trx);
      toast(form.type === 'expense' ? `Transaksi disimpan. AI mengklasifikasikan ke ${category}.` : 'Pemasukan berhasil disimpan.');
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
      <Topbar 
        setMobileMenuOpen={setMobileMenuOpen} 
        title="Catat Transaksi" 
        desc="Masukkan pemasukan atau pengeluaran. Kategori tidak diisi manual karena akan diprediksi otomatis." 
        extraAction={<Link className="btn btn-ghost" to="/dashboard">Kembali</Link>}
      />
      <section className="page-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-head"><div><h2>{form.id ? 'Edit Transaksi' : 'Form Transaksi'}</h2><p>Catat dulu. Kalau salah nominal, tanggal, atau catatan, pakai tombol edit di riwayat.</p></div></div>
          <div className="form-grid">
            <div className="field"><label>Judul Transaksi</label><div className="input-wrap"><input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Contoh: Makan ayam geprek" required /></div></div>
            <div className="field"><label>Nominal</label><div className="input-wrap"><input type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} placeholder="28000" required /></div></div>
            <div className="field"><label>Tipe</label><div className="input-wrap"><select value={form.type} onChange={e=>setForm({...form, type: e.target.value})}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></div></div>
            <div className="ai-category-preview"><span>Prediksi kategori AI</span><strong>{preview}</strong><p>Kategori akan berubah otomatis dari teks transaksi. Di sistem final, bagian ini datang dari model AI.</p></div>
            <div className="field"><label>Tanggal</label><div className="input-wrap"><input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} required /></div></div>
            <div className="field"><label>Catatan</label><div className="input-wrap"><textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} placeholder="Opsional, contoh: makan siang setelah kuliah"></textarea></div></div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">{form.id ? 'Simpan Perubahan' : 'Simpan Transaksi'}</button>
              {form.id && <button className="btn btn-ghost" type="button" onClick={handleCancel}>Batal Edit</button>}
            </div>
          </div>
        </form>
        <div className="table-card">
          <div className="panel-head" style={{padding:'22px 22px 0'}}><div><h2>Riwayat Terbaru</h2><p>Gunakan edit kalau ada kesalahan input. Jangan hapus data yang sebenarnya benar karena prediksi AI butuh riwayat.</p></div></div>
          <table>
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori AI</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {transactions.slice(0,12).map(x => (
                <tr key={x.id}>
                  <td>{x.date}</td>
                  <td><strong>{x.title}</strong><br/><small style={{color:'#6b7b74'}}>{x.note || '-'}</small></td>
                  <td><span className={`badge ${x.type==='income'?'':'warn'}`}>{x.category}</span></td>
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