import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getState, setState, rupiah, toast, timestamp } from '../utils/store';
import { Target, CreditCard, Leaf, Bot, Flame, Calculator, CheckCircle } from 'lucide-react';
import {
  apiGetDashboardSummary,
  apiGetBudgets,
  apiGetExpenseCategories,
  apiCreateBudget,
  apiUpdateBudget,
  apiPredict,
  apiGetPredictions,
  apiGetMe,
  apiUpdateSettings
} from '../utils/api';

export default function Budget() {
  const { setMobileMenuOpen } = useOutletContext();
  const [loading, setLoading] = useState(true);

  // Backend data states
  const [summaryData, setSummaryData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [prediction, setPrediction] = useState(null);

  // User settings from DB
  const [profile, setProfile] = useState({ monthly_income: 0, saving_target: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, budRes, predRes, meRes] = await Promise.all([
        apiGetDashboardSummary(),
        apiGetExpenseCategories(),
        apiGetBudgets(),
        apiGetPredictions(1),
        apiGetMe()
      ]);

      if (sumRes.ok) setSummaryData(sumRes.data.data);
      if (catRes.ok) setCategories(catRes.data.data);
      if (budRes.ok) setBudgets(budRes.data.data);
      if (predRes.ok && predRes.data.data.length > 0) {
        setPrediction(predRes.data.data[0]);
      }

      if (meRes.ok && meRes.data.data) {
        setProfile({
          monthly_income: meRes.data.data.monthly_income || 0,
          saving_target: meRes.data.data.saving_target || 0
        });
      }
    } catch (err) {
      console.error('Failed to load budget data:', err);
      toast('Gagal memuat data dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('statechange', loadData);
    return () => window.removeEventListener('statechange', loadData);
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const income = Number(data.get('income')) || 0;
    const saving = Number(data.get('saving')) || 0;

    try {
      const res = await apiUpdateSettings(income, saving);
      if (res.ok) {
        toast('Target penghasilan & tabungan berhasil disimpan ke database!');
        loadData();
      } else {
        toast(res.data?.message || 'Gagal menyimpan target keuangan');
      }
    } catch (err) {
      toast('Terjadi kesalahan saat menghubungi server');
    }
  };

  const handleLimitSubmit = async (e, catId, budgetId) => {
    e.preventDefault();
    const limit = Number(e.target.elements.limit.value);

    try {
      if (limit <= 0) {
        toast('Limit harus lebih besar dari 0');
        return;
      }

      if (budgetId) {
        const res = await apiUpdateBudget(budgetId, { amount: limit });
        if (res.ok) toast('Limit diperbarui!');
        else toast(res.data?.message || 'Gagal memperbarui');
      } else {
        const res = await apiCreateBudget({ expense_category_id: catId, amount: limit });
        if (res.ok) toast('Limit dibuat!');
        else toast(res.data?.message || 'Gagal membuat limit');
      }
      loadData();
    } catch (err) {
      toast('Terjadi kesalahan server');
    }
  };

  const handleUpdateAI = async () => {
    try {
      toast('Meminta rekomendasi AI...');
      const res = await apiPredict();
      if (res.ok) {
        toast('Prediksi AI berhasil diperbarui!');
        loadData();
      } else {
        toast(res.data?.message || 'Gagal update AI');
      }
    } catch (err) {
      toast('Terjadi kesalahan saat memanggil AI');
    }
  };

  if (loading && !summaryData) return <div className="p-8">Memuat data budget...</div>;

  // Merge categories with budgets
  const rows = categories.map(cat => {
    const b = budgets.find(x => x.expense_category_id === cat.id);
    return {
      catId: cat.id,
      catName: cat.name,
      budgetId: b ? b.id : null,
      limit: b ? b.amount : 0,
      used: b ? b.used_amount : 0,
      pct: b ? b.usage_percentage : 0
    };
  });

  const aiStamp = prediction
    ? `Terakhir diperbarui: ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(prediction.created_at))}`
    : 'Klik update untuk membaca ulang kondisi budget terbaru.';

  // Parse recommendation text from prediction or generate default
  let messages = ['Belum ada rekomendasi AI. Silakan klik Update Prediksi AI.'];
  if (prediction && prediction.recommendation) {
    // Split by dot to get individual sentences for the UI list
    messages = prediction.recommendation.split('. ').filter(x => x.trim().length > 0);
  } else if (prediction) {
    messages = [
      `Safe-to-spend hari ini: ${rupiah(prediction.safe_to_spend_today)}`,
      `Risiko saat ini ${prediction.risk_percentage}%. Status: ${prediction.overbudget_status}`
    ];
  }

  const totalBudget = summaryData?.total_budget || 0;
  const totalExpense = summaryData?.total_expense || 0;
  const remaining = Math.max(0, totalBudget - totalExpense);

  return (
    <>
      <Topbar
        setMobileMenuOpen={setMobileMenuOpen}
        title="Budget Bulanan"
        desc="Atur batas pengeluaran tiap kategori agar keuangan tetap terkontrol."
        extraAction={<button className="btn btn-primary" onClick={handleUpdateAI}>Update Prediksi AI</button>}
      />
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Target size={24} /></div><span className="stat-pill">Target</span></div><h3>{rupiah(totalBudget)}</h3><p>Total limit kategori Anda</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><CreditCard size={24} /></div><span className="stat-pill">Terpakai</span></div><h3>{rupiah(totalExpense)}</h3><p>Total pengeluaran tercatat</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Leaf size={24} /></div><span className="stat-pill">Sisa</span></div><h3>{rupiah(remaining)}</h3><p>Sisa ruang pengeluaran</p></div>
        <div className="stat-card"><div className="stat-top"><div className="stat-icon"><Bot size={24} /></div><span className="stat-pill">AI</span></div><h3>{summaryData?.risk_percentage || 0}%</h3><p>Risiko dari pola pengeluaran</p></div>
      </section>

      <section className="page-grid">
        <form className="panel form-profile" onSubmit={handleProfileSubmit}>
          <div className="panel-head"><div><h2>Target Keuangan Dasar</h2></div></div>
          <div className="form-grid">
            <div className="field"><label>Pemasukan Bulanan</label><div className="input-wrap"><input name="income" type="number" defaultValue={profile.monthly_income} /></div></div>
            <div className="field"><label>Total Budget Pengeluaran</label><div className="input-wrap"><input type="text" value={rupiah(totalBudget)} disabled /></div></div>
            <div className="field"><label>Target Tabungan</label><div className="input-wrap"><input name="saving" type="number" defaultValue={profile.saving_target} /></div></div>
            <button className="btn btn-primary" type="submit">Simpan ke Supabase</button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-head"><div><h2>Limit per Kategori </h2><p>Ubah limit sesuai kebutuhan. Angka ini dipakai AI untuk membaca kategori mana yang harus dikurangi.</p></div></div>
          <div className="budget-list">
            {rows.map(row => (
              <form key={row.catId} className="budget-item editable-budget" onSubmit={(e) => handleLimitSubmit(e, row.catId, row.budgetId)}>
                <div className="budget-head"><span>{row.catName}</span><span>{rupiah(row.used)} / {rupiah(row.limit)}</span></div>
                <div className={`progress ${row.pct >= 90 ? 'danger' : row.pct >= 70 ? 'warn' : ''}`}><span style={{ width: `${Math.min(100, row.pct)}%` }}></span></div>
                <p className="help">Terpakai {row.pct}%. {row.pct >= 90 ? 'Stop dulu kategori ini.' : row.pct >= 70 ? 'Mulai rem belanja kategori ini.' : row.limit === 0 ? 'Belum ada limit.' : 'Masih cukup aman.'}</p>
                <div className="budget-edit-row"><input type="number" name="limit" defaultValue={row.limit} placeholder="Masukkan limit..." /><button className="btn btn-ghost" type="submit">Simpan Limit</button></div>
              </form>
            ))}
          </div>
        </div>
      </section>

      <section className="panel ai-budget-panel">
        <div className="panel-head"><div><h2>Rekomendasi AI Budget</h2><p>{aiStamp}</p></div></div>
        <div className="reco-list">
          {messages.map((m, i) => (
            <div className="reco" key={i}><i>{[<Flame size={18} />, <Target size={18} />, <Calculator size={18} />][i % 4] || <CheckCircle size={18} />}</i><span>{m}</span></div>
          ))}
        </div>
      </section>
    </>
  );
}