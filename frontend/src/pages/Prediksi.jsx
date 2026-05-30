import { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import PredictionCards from '../components/prediction/PredictionCards.jsx';
import MonifySuggestion from '../components/prediction/MonifySuggestion.jsx';
import MonifyBot from '../components/prediction/MonifyBot.jsx';
import { initialBudgets } from '../data/budgetData.js';
import { initialTransactions } from '../data/transactionData.js';
import { getPredictionMetrics, predictionConfig } from '../data/predictionData.js';
import {
  apiPredict,
  apiGetSafeToSpend,
  apiGetOverbudget,
} from '../utils/api.js';
import { getCache, setCache } from '../utils/cache.js';

export default function PredictionAI({ onAddTransaction = () => {} }) {
  const localMetrics = useMemo(() => {
    return getPredictionMetrics(initialBudgets, initialTransactions, predictionConfig.currentDate);
  }, []);

  const [metrics, setMetrics] = useState(() => {
    const cached = getCache('prediksi');
    return cached ? cached : localMetrics;
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchPredictions() {
      try {
        // Trigger a new prediction and get overbudget data
        const [predictRes, safeRes, overbudgetRes] = await Promise.all([
          apiPredict(),
          apiGetSafeToSpend(),
          apiGetOverbudget(),
        ]);

        if (cancelled) return;

        const p = predictRes.ok ? predictRes.data.data : null;
        const s = safeRes.ok ? safeRes.data.data : null;
        const o = overbudgetRes.ok ? overbudgetRes.data.data : null;

        if (p || s || o) {
          setMetrics((prev) => {
            const next = { ...prev };

            if (p) {
              next.monthlyPrediction = p.predicted_monthly_expense || prev.monthlyPrediction;
              next.monthlyExpense = p.current_expense || prev.monthlyExpense;
              next.totalBudget = p.total_budget || prev.totalBudget;
              next.remainingBudget = Math.max(0, (p.total_budget || 0) - (p.current_expense || 0));
            }

            if (s) {
              next.safeToSpendToday = s.safe_to_spend_today || prev.safeToSpendToday;
            }

            if (o) {
              next.riskPercent = Math.min(100, Math.max(0, o.risk_percentage || prev.riskPercent));

              // Map status
              if (o.status === 'over_budget') {
                next.status = { label: 'Overbudget', tone: 'danger' };
              } else if (o.status === 'warning') {
                next.status = { label: 'Waspada', tone: 'warning' };
              } else {
                next.status = { label: 'Aman', tone: 'success' };
              }

              // Find highest category from breakdown
              if (o.category_breakdown && o.category_breakdown.length > 0) {
                const top = o.category_breakdown[0];
                next.highestCategory = {
                  category: top.category_name || 'Lainnya',
                  amount: top.used || 0,
                };
              }
            }

            // Rebuild suggestions based on new data
            next.suggestions = buildApiSuggestions(next);

            setCache('prediksi', next);
            return next;
          });
        }
      } catch {
        // Fallback: keep local metrics
      }
    }

    fetchPredictions();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="page-main prediction-main">
      <Topbar
        title="Prediksi AI"
        description="Analisis AI untuk membantumu belanja lebih aman"
        selectedDate={metrics.currentDate || predictionConfig.currentDate}
        showDate={false}
        action={(
          <button type="button" className="add-transaction-button" onClick={onAddTransaction}>
            <span aria-hidden="true">+</span>
            Tambah Transaksi
          </button>
        )}
      />

      <section className="prediction-layout">
        <div className="prediction-left">
          <PredictionCards metrics={metrics} />
          <MonifySuggestion suggestions={metrics.suggestions} />
        </div>

        <MonifyBot metrics={metrics} />
      </section>
    </main>
  );
}

function buildApiSuggestions(metrics) {
  const suggestions = [];

  if ((metrics.totalBudget || 0) <= 0) {
    return [
      'Budget bulan ini belum diatur. Isi batas budget dulu supaya prediksi AI tidak menebak tanpa dasar.',
      'Tambahkan transaksi rutin seperti makan, transport, tagihan, dan hiburan agar analisis lebih akurat.',
    ];
  }

  if (metrics.highestCategory && metrics.highestCategory.amount > 0) {
    suggestions.push(
      `Kategori ${metrics.highestCategory.category} menjadi pengeluaran terbesar bulan ini. Cek lagi apakah nominalnya memang wajib atau bisa ditekan.`,
    );
  }

  if (metrics.riskPercent >= 90) {
    suggestions.push('Risiko over budget sudah tinggi. Tahan pengeluaran non-wajib sampai akhir bulan.');
  } else if (metrics.riskPercent >= 70) {
    suggestions.push('Kondisi mulai rawan. Kurangi transaksi kecil yang sering berulang agar budget tidak bocor pelan-pelan.');
  } else {
    suggestions.push('Kondisi masih aman, tapi tetap jangan menaikkan gaya belanja hanya karena angka terlihat longgar.');
  }

  suggestions.push(
    'Batas aman belanja hari ini dihitung dari sisa budget dibagi sisa hari dalam bulan berjalan.',
  );

  return suggestions;
}
