import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpendingChart from '../components/SpendingChart.jsx';
import BudgetSection from '../components/BudgetSection.jsx';
import TransactionSection from '../components/TransactionSection.jsx';
import { dashboardData as staticDashboardData } from '../data/dashboardData.js';
import { apiGetDashboardSummary, apiGetExpenseByCategory, apiGetTransactionHistory } from '../utils/api.js';
import { getCache, setCache } from '../utils/cache.js';

export default function Dashboard() {
  const [data, setData] = useState(() => {
    const cached = getCache('dashboard');
    return cached ? cached : staticDashboardData;
  });
  const [chartDays, setChartDays] = useState('7');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const [summaryRes, categoryRes, historyRes] = await Promise.all([
          apiGetDashboardSummary(selectedDate),
          apiGetExpenseByCategory(selectedDate),
          apiGetTransactionHistory(50), // Fetch more for charting
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
            next.selectedDate = selectedDate;
          }

          // Map budgets from category breakdown
          if (c && c.categories) {
            next.budgets = c.categories.map((cat) => ({
              category: cat.category_name || 'Lainnya',
              used: cat.amount || 0,
              limit: cat.budget_limit || 0,
            }));
          }

          // Map transactions
          if (h && Array.isArray(h)) {
            const mapped = h.map((t) => ({
              name: t.description || t.name || '',
              date: t.transactions_date || t.date || '',
              category: t.category_name || t.category || 'Lainnya',
              type: t.type || 'expense',
              amount: Number(t.amount) || 0,
            }));
            
            // List only needs top 5
            next.transactions = mapped.slice(0, 5);

            // Chart needs filtered points
            const chartPoints = [];
            const today = new Date();
            const daysLimit = Number(chartDays) || 7;
            
            // 1. Generate an array of dates for the last `daysLimit` days
            for (let i = daysLimit - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const dayString = String(d.getDate()).padStart(2, '0');
                const fullDateString = `${year}-${month}-${dayString}`;
                chartPoints.push({ day: dayString, fullDate: fullDateString, value: 0 });
            }
            
            // 2. Add amounts from transactions
            mapped.forEach((t) => {
              if (t.type === 'expense' && t.date) {
                 const tDate = t.date.slice(0, 10);
                 const point = chartPoints.find(p => p.fullDate === tDate);
                 if (point) {
                     point.value += t.amount;
                 }
              }
            });
              
            next.chart = { ...prev.chart, points: chartPoints };
          }

          // Pass filter handlers
          next.chart = {
            ...next.chart,
            filterValue: chartDays,
            onFilterChange: setChartDays,
          };

          setCache('dashboard', next);
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
  }, [chartDays, selectedDate]);

  const { summary } = data;
  const budgetPercent = summary.budgetTotal > 0 ? Math.round((summary.budgetUsed / summary.budgetTotal) * 100) : 0;

  return (
    <>
      <main className="page-main dashboard-main">
        <Topbar 
          selectedDate={selectedDate} 
          onChangeDate={setSelectedDate} 
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
