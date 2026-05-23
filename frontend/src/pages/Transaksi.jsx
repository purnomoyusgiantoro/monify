import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { rupiah, toast } from '../utils/store';
import { Search } from 'lucide-react';
import {
  apiGetTransactions,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiGetIncomeCategories,
  apiGetExpenseCategories,
  apiClassify
} from '../utils/api';

export default function Transaksi() {
  const { setMobileMenuOpen } = useOutletContext();
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [incomeCats, setIncomeCats] = useState([]);
  const [expenseCats, setExpenseCats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({ id: '', title: '', amount: '', type: 'expense', date: new Date().toISOString().slice(0, 10), note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trxRes, incRes, expRes] = await Promise.all([
        apiGetTransactions({ limit: 12 }),
        apiGetIncomeCategories(),
        apiGetExpenseCategories()
      ]);

      if (trxRes.ok) setTransactions(trxRes.data.data);
      if (incRes.ok) setIncomeCats(incRes.data.data);
      if (expRes.ok) setExpenseCats(expRes.data.data);
    } catch (err) {
      toast('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // For preview only, we use a simple local guess to avoid spamming the API on every keystroke
  const guessLocal = (text) => {
    const t = text.toLowerCase();
    if (/makan|ayam|kopi|nasi|bakso|mie|jajan|minum|food|resto|geprek/.test(t)) return 'Makanan';
    if (/gojek|grab|bensin|parkir|ojek|bus|kereta|transport|angkot/.test(t)) return 'Transport';
    if (/baju|skincare|sepatu|belanja|marketplace|shopee|tokopedia|barang/.test(t)) return 'Belanja';
    if (/netflix|game|spotify|bioskop|hiburan|nongkrong|langganan|top up/.test(t)) return 'Hiburan';
    if (/kuota|internet|wifi|pulsa|indihome|paket data/.test(t)) return 'Internet';
    return 'Lainnya';
  };

  const preview = form.type === 'income' ? 'Pemasukan' : (form.title.trim() ? guessLocal(form.title) : 'Isi judul transaksi dulu');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let income_category_id = null;
      let expense_category_id = null;
      let predictedCategoryName = '';

      if (form.type === 'income') {
        // Find default income category
        const defaultInc = incomeCats.find(c => c.name.toLowerCase() === 'gaji') || incomeCats[0];
        if (defaultInc) income_category_id = defaultInc.id;
        predictedCategoryName = defaultInc ? defaultInc.name : 'Pemasukan';
      } else {
        // Call AI API
        toast('Sedang mengklasifikasikan transaksi dengan AI...');
        const aiRes = await apiClassify(form.title, Number(form.amount));
        let aiCategoryName = 'Lainnya';
        if (aiRes.ok && aiRes.data.data) {
          aiCategoryName = aiRes.data.data.kategori_ai;
        }

        // Map AI result to database ID
        let cat = expenseCats.find(c => c.name.toLowerCase() === aiCategoryName.toLowerCase());
        if (!cat) {
          cat = expenseCats.find(c => c.name.toLowerCase() === 'lainnya') || expenseCats[0];
        }
        if (cat) {
          expense_category_id = cat.id;
          predictedCategoryName = cat.name;
        }
      }

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        description: form.title.trim(),
        transactions_date: form.date,
        income_category_id,
        expense_category_id,
        category_method: 'ai',
        note: form.note.trim()
      };

      if (form.id) {
        const res = await apiUpdateTransaction(form.id, payload);
        if (res.ok) {
          toast(`Transaksi diperbarui. Kategori: ${predictedCategoryName}.`);
          handleCancel();
        } else {
          toast(res.data?.message || 'Gagal memperbarui');
        }
      } else {
        const res = await apiCreateTransaction(payload);
        if (res.ok) {
          toast(`Transaksi disimpan. AI: ${predictedCategoryName}.`);
          handleCancel();
        } else {
          toast(res.data?.message || 'Gagal menyimpan');
        }
      }

      loadData();
    } catch (err) {
      toast('Terjadi kesalahan server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (trx) => {
    setForm({
      id: trx.id,
      title: trx.description || trx.title || '',
      amount: trx.amount,
      type: trx.type,
      date: trx.transactions_date || trx.date || new Date().toISOString().slice(0, 10),
      note: trx.note || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      const res = await apiDeleteTransaction(id);
      if (res.ok) {
        toast('Transaksi berhasil dihapus');
        loadData();
      } else {
        toast(res.data?.message || 'Gagal menghapus');
      }
    } catch (err) {
      toast('Terjadi kesalahan server');
    }
  };

  const handleCancel = () => {
    setForm({ id: '', title: '', amount: '', type: 'expense', date: new Date().toISOString().slice(0, 10), note: '' });
  };

  const filteredTransactions = transactions.filter(x => {
    const desc = (x.description || x.title || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return desc.includes(q);
  });

  return (
    <>
      <Topbar
        setMobileMenuOpen={setMobileMenuOpen}
        title="Catat Transaksi"
        desc="Masukkan pemasukan atau pengeluaran"
        extraAction={
          <>
            <div className="search-box">
              <Search size={18} /> 
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Cari transaksi..." 
              />
            </div>
            <Link className="btn btn-ghost" to="/dashboard">Kembali</Link>
          </>
        }
      />
      <section className="page-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-head"><div><h2>{form.id ? 'Edit Transaksi' : 'Form Transaksi'}</h2></div></div>
          <div className="form-grid">
            <div className="field"><label>Judul Transaksi</label><div className="input-wrap"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Makan ayam geprek" required disabled={isSubmitting} /></div></div>
            <div className="field"><label>Nominal</label><div className="input-wrap"><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="28000" required disabled={isSubmitting} /></div></div>
            <div className="field"><label>Tipe</label><div className="input-wrap"><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} disabled={isSubmitting}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></div></div>
            <div className="ai-category-preview"><span>Prediksi kategori AI</span><strong>{preview}</strong></div>
            <div className="field"><label>Tanggal</label><div className="input-wrap"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required disabled={isSubmitting} /></div></div>
            <div className="field"><label>Catatan</label><div className="input-wrap"><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Opsional, contoh: makan siang setelah kuliah" disabled={isSubmitting}></textarea></div></div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses AI...' : (form.id ? 'Simpan Perubahan' : 'Simpan Transaksi')}</button>
              {form.id && <button className="btn btn-ghost" type="button" onClick={handleCancel} disabled={isSubmitting}>Batal Edit</button>}
            </div>
          </div>
        </form>
        <div className="table-card">
          <div className="panel-head" style={{ padding: '22px 22px 0' }}><div><h2>Riwayat Terbaru</h2><p>Gunakan edit kalau ada kesalahan input. Jangan hapus data yang sebenarnya benar karena prediksi AI butuh riwayat.</p></div></div>
          {loading ? (
            <div style={{ padding: '22px' }}>Memuat data transaksi...</div>
          ) : (
            <table>
              <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Kategori AI</th><th>Nominal</th><th>Aksi</th></tr></thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>{searchQuery ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}</td></tr>
                ) : filteredTransactions.map(x => (
                  <tr key={x.id}>
                    <td>{x.transactions_date || x.date}</td>
                    <td><strong>{x.description || x.title}</strong><br /><small style={{ color: '#6b7b74' }}>{x.note || '-'}</small></td>
                    <td><span className={`badge ${x.type === 'income' ? '' : 'warn'}`}>{x.category_name || x.category}</span></td>
                    <td className={x.type === 'income' ? 'amount-plus' : 'amount-minus'}>{x.type === 'income' ? '+' : '-'} {rupiah(x.amount)}</td>
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
          )}
        </div>
      </section>
    </>
  );
}