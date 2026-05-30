import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpendingChart from '../components/SpendingChart.jsx';
import BudgetSection from '../components/BudgetSection.jsx';
import TransactionSection from '../components/TransactionSection.jsx';
import { dashboardData as staticDashboardData } from '../data/dashboardData.js';
import { apiGetDashboardSummary, apiGetExpenseByCategory, apiGetTransactionHistory } from '../utils/api.js';

export default function Dashboard() {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('cache_dashboard');
      if (cached) return JSON.parse(cached);
    } catch {}
    return staticDashboardData;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const [summaryRes, categoryRes, historyRes] = await Promise.all([
          apiGetDashboardSummary(),
          apiGetExpenseByCategory(),
          apiGetTransactionHistory(5),
        ]);

        if (cancelled) return;

        const s = summaryRes.ok ? summaryRes.data.data : null;
        const c = categoryRes.ok ? categoryRes.data.data : null;
        const h = historyRes.ok ? historyRes.data.data : null;

        setData((prev) => {
          const next = { ...prev };

          // Map summary
          if (s) {
            next.summary = {
              balance: s.balance || 0,
              income: s.total_income || 0,
              expense: s.total_expense || 0,
              budgetTotal: s.total_budget || 0,
              budgetUsed: s.total_expense || 0,
              safeToSpendToday: s.safe_to_spend || 0,
              monthlyPrediction: s.projected_expense || 0,
              balanceTrend: prev.summary.balanceTrend,
              incomeTrend: prev.summary.incomeTrend,
              expenseTrend: prev.summary.expenseTrend,
            };
            if (!next.selectedDate) {
              next.selectedDate = new Date().toISOString().slice(0, 10);
            }
          }

          // Map budgets from category breakdown
          if (c && c.categories) {
            next.budgets = c.categories.map((cat) => ({
              category: cat.category_name || 'Lainnya',
              used: cat.amount || 0,
              limit: cat.budget_limit || 0,
            }));
            if (next.budgets.length === 0) {
              next.budgets = prev.budgets;
            }
          }

          // Map transactions
          if (h && Array.isArray(h)) {
            next.transactions = h.map((t) => ({
              name: t.description || t.name || '',
              date: t.transactions_date || t.date || '',
              category: t.category_name || t.category || 'Lainnya',
              type: t.type || 'expense',
              amount: Number(t.amount) || 0,
            }));
            if (next.transactions.length === 0) {
              next.transactions = prev.transactions;
            }
          }

          // Keep chart as-is (no daily breakdown endpoint available)
          // Build chart from transaction history if possible
          if (h && Array.isArray(h) && h.length > 0) {
            const dailyMap = {};
            h.forEach((t) => {
              if (t.type === 'expense') {
                const day = (t.transactions_date || '').slice(8, 10);
                if (day) {
                  dailyMap[day] = (dailyMap[day] || 0) + Number(t.amount || 0);
                }
              }
            });
            const chartPoints = Object.entries(dailyMap)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([day, value]) => ({ day, value }));
            if (chartPoints.length >= 2) {
              next.chart = { ...prev.chart, points: chartPoints };
            }
          }

          localStorage.setItem('cache_dashboard', JSON.stringify(next));
          return next;
        });
      } catch {
        // Fallback: keep static data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const { summary } = data;
  const budgetPercent = summary.budgetTotal > 0 ? Math.round((summary.budgetUsed / summary.budgetTotal) * 100) : 0;

  return (
    <>
      <main className="page-main dashboard-main">
        <Topbar 
          selectedDate={data.selectedDate} 
          onChangeDate={(newDate) => setData(prev => ({ ...prev, selectedDate: newDate }))} 
        />

        <section className="summary-grid summary-grid--top">
          <StatCard
            title="Saldo"
            value={summary.balance}
            icon="/assets/icon-saldo.png"
            size="large"
            trend={summary.balanceTrend}
            trendType="positive"
          />
          <StatCard
            title="Pengeluaran"
            value={summary.expense}
            icon="/assets/icon-pengeluaran.png"
            size="large"
            trend={summary.expenseTrend}
            trendType="negative"
          />
        </section>

        <section className="summary-grid summary-grid--bottom">
          <StatCard
            title="Pemasukan"
            value={summary.income}
            icon="/assets/icon-pemasukan.png"
            trend={summary.incomeTrend}
            trendType="positive"
          />
          <StatCard
            title="Budget"
            value={summary.budgetTotal}
            icon="/assets/icon-budget-dashboard.png"
            description={`${budgetPercent}% dari total budget terpakai`}
          >
            <ProgressBar value={summary.budgetUsed} max={summary.budgetTotal} label="Budget terpakai" />
          </StatCard>
          <StatCard
            title="Aman dipakai"
            value={summary.safeToSpendToday}
            icon="/assets/icon-aman-dipakai.png"
            description="Sisa aman untuk hari ini"
          />
          <StatCard
            title="Prediksi bulanan"
            value={summary.monthlyPrediction}
            icon="/assets/icon-prediksi-bulanan.png"
            description="Prediksi akhir bulan"
          />
        </section>

        <SpendingChart chart={data.chart} />

        <section className="dashboard-panels">
          <BudgetSection budgets={data.budgets} />
          <TransactionSection transactions={data.transactions} />
        </section>
      </main>
    </>
  );
}
