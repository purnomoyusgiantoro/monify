import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpendingChart from '../components/SpendingChart.jsx';
import BudgetSection from '../components/BudgetSection.jsx';
import TransactionSection from '../components/TransactionSection.jsx';
import { budgetCategories, getBudgetRowsForCategories } from '../data/budgetData.js';
import { dashboardData as staticDashboardData } from '../data/dashboardData.js';
import { apiGetBudgets, apiGetDashboardSummary, apiGetExpenseCategories, apiGetTransactionHistory, apiGetTransactions } from '../utils/api.js';
import { getCache, setCache } from '../utils/cache.js';

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDashboardTransactions(history = []) {
  return history.map((t) => ({
    id: t.id,
    name: t.description || t.name || '',
    date: t.transactions_date || t.date || '',
    created_at: t.created_at || t.transactions_date || t.date || '',
    category: t.category_name || t.category || 'Lainnya',
    type: t.type || 'expense',
    amount: Number(t.amount) || 0,
  }));
}

function buildTrendPoints(transactions = [], rangeDays = 7, referenceDateStr) {
  const referenceDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const points = [];

  if (rangeDays === 'month') {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i += 1) {
      const d = new Date(year, month, i);
      points.push({
        day: String(d.getDate()),
        fullDate: toIsoDate(d),
        value: 0,
      });
    }
  } else {
    const daysLimit = Number(rangeDays) || 7;
    for (let i = daysLimit - 1; i >= 0; i -= 1) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      points.push({
        day: String(d.getDate()),
        fullDate: toIsoDate(d),
        value: 0,
      });
    }
  }

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense' || !transaction.date) return;

    const transactionDate = String(transaction.date).slice(0, 10);
    const targetPoint = points.find((point) => point.fullDate === transactionDate);
    if (targetPoint) {
      targetPoint.value += Number(transaction.amount) || 0;
    }
  });

  return points;
}

function applyTrendChart(data, transactions, rangeDays, selectedDate) {
  const points = buildTrendPoints(transactions, rangeDays, selectedDate);
  const subtitle = rangeDays === 'month' 
    ? 'Pengeluaran harian sepanjang bulan ini'
    : `Pengeluaran harian selama ${rangeDays} hari terakhir`;
  const filterLabel = rangeDays === 'month' ? 'Bulan Ini' : `${rangeDays} Hari Terakhir`;
  
  return {
    ...data,
    _historyTransactions: transactions,
    chart: {
      ...data.chart,
      subtitle,
      filterLabel,
      monthLabel: filterLabel,
      points,
    },
  };
}

export default function Dashboard() {
  const [data, setData] = useState(() => {
    const cached = getCache('dashboard');
    return cached ? cached : staticDashboardData;
  });
  const [chartDays, setChartDays] = useState('month');
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      const cached = getCache('dashboard');
      if (cached && Array.isArray(cached._historyTransactions) && cached.selectedDate === selectedDate) {
        if (!cancelled) {
          setData(applyTrendChart(cached, cached._historyTransactions, chartDays, selectedDate));
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const [summaryRes, budgetsRes, historyRes, expenseCategoriesRes, transactionsRes] = await Promise.all([
          apiGetDashboardSummary(selectedDate),
          apiGetBudgets(),
          apiGetTransactionHistory(200),
          apiGetExpenseCategories(),
          apiGetTransactions(),
        ]);

        if (cancelled) return;

        const s = summaryRes.ok ? summaryRes.data.data : null;
        const h = historyRes.ok ? historyRes.data.data : null;
        const mappedBudgets = budgetsRes.ok && Array.isArray(budgetsRes.data.data)
          ? budgetsRes.data.data.map((budget) => ({
            id: budget.id,
            category: budget.category_name || 'Lainnya',
            limit: Number(budget.amount) || 0,
            period: `${budget.year}-${String(budget.month).padStart(2, '0')}`,
            used: Number(budget.used_amount) || 0,
            _expense_category_id: budget.expense_category_id || null,
          }))
          : [];
        const expenseCategories = expenseCategoriesRes.ok && Array.isArray(expenseCategoriesRes.data.data)
          ? expenseCategoriesRes.data.data
          : null;
        const transactions = transactionsRes.ok && Array.isArray(transactionsRes.data.data)
          ? normalizeDashboardTransactions(transactionsRes.data.data)
          : [];

        setData((prev) => {
          let next = { ...prev };
          const activePeriod = selectedDate.slice(0, 7);
          const categoryNames = expenseCategories && expenseCategories.length > 0
            ? expenseCategories.map((category) => category.name)
            : budgetCategories;
          const budgetRows = getBudgetRowsForCategories(categoryNames, mappedBudgets, transactions, activePeriod);
          const totalBudget = budgetRows.reduce((sum, row) => sum + (row.limit || 0), 0);
          const totalUsed = budgetRows.reduce((sum, row) => sum + (row.used || 0), 0);

          if (s) {
            next.summary = {
              balance: s.balance || 0,
              income: s.total_income || 0,
              expense: s.total_expense || 0,
              budgetTotal: totalBudget,
              budgetUsed: totalUsed,
              safeToSpendToday: s.safe_to_spend_today_remaining ?? s.safe_to_spend ?? 0,
              monthlyPrediction: s.projected_expense || 0,
              balanceTrend: prev.summary.balanceTrend,
              incomeTrend: prev.summary.incomeTrend,
              expenseTrend: prev.summary.expenseTrend,
            };
            next.selectedDate = selectedDate;
          } else {
            next.summary = {
              ...prev.summary,
              budgetTotal: totalBudget,
              budgetUsed: totalUsed,
            };
          }

          next.budgets = budgetRows;
          next.selectedDate = selectedDate;
          
          const mappedHistory = Array.isArray(h) ? normalizeDashboardTransactions(h) : [];
          mappedHistory.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
          next.transactions = mappedHistory.slice(0, 5);

          next = applyTrendChart(next, mappedHistory, chartDays, selectedDate);
          setCache('dashboard', next);
          return next;
        });
      } catch {
        setData((prev) => applyTrendChart(prev, prev._historyTransactions || prev.transactions || [], chartDays, selectedDate));
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

        <SpendingChart chart={{ ...data.chart, filterValue: chartDays, onFilterChange: setChartDays }} />

        <section className="dashboard-panels">
          <BudgetSection budgets={data.budgets} />
          <TransactionSection transactions={data.transactions} />
        </section>
      </main>
    </>
  );
}
