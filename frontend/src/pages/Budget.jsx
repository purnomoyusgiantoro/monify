import { useEffect, useMemo, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import BudgetSummaryCards from '../components/budget/BudgetSummaryCards.jsx';
import BudgetForm from '../components/budget/BudgetForm.jsx';
import BudgetList from '../components/budget/BudgetList.jsx';
import { budgetCategories, getBudgetRowsForCategories, getBudgetSummary, initialBudgets } from '../data/budgetData.js';
import { initialTransactions } from '../data/transactionData.js';
import {
  apiCreateBudget,
  apiDeleteBudget,
  apiGetBudgets,
  apiGetExpenseCategories,
  apiGetTransactions,
  apiUpdateBudget,
} from '../utils/api.js';
import { clearCache, getCache, setCache } from '../utils/cache.js';

const activePeriod = new Date().toISOString().slice(0, 7);
const emptyForm = {
  category: '',
  limit: '',
  period: activePeriod,
};

export default function Budget() {
  const [budgets, setBudgets] = useState(() => {
    const cached = getCache('budgets');
    return cached ? cached : initialBudgets;
  });
  const [formData, setFormData] = useState(emptyForm);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiTransactions, setApiTransactions] = useState([]);
  const [useApi, setUseApi] = useState(false);

  // Fetch budgets + expense categories from API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [budgetRes, catRes, trxRes] = await Promise.all([
          apiGetBudgets(),
          apiGetExpenseCategories(),
          apiGetTransactions(),
        ]);

        if (cancelled) return;

        if (budgetRes.ok && Array.isArray(budgetRes.data.data)) {
          const mapped = budgetRes.data.data.map((b) => ({
            id: b.id,
            category: b.category_name || 'Lainnya',
            limit: Number(b.amount) || 0,
            period: `${b.year}-${String(b.month).padStart(2, '0')}`,
            used: Number(b.used_amount) || 0,
            _expense_category_id: b.expense_category_id || null,
          }));
          setCache('budgets', mapped);
          setBudgets(mapped);
          setUseApi(true);
        }

        if (catRes.ok && Array.isArray(catRes.data.data)) {
          setApiCategories(catRes.data.data);
          // Set default category
          if (catRes.data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category: prev.category || catRes.data.data[0].name,
            }));
          }
        }

        if (trxRes.ok && Array.isArray(trxRes.data.data)) {
          setApiTransactions(
            trxRes.data.data.map((transaction) => ({
              id: transaction.id,
              amount: Number(transaction.amount) || 0,
              date: transaction.transactions_date || '',
              category: transaction.category_name || 'Lainnya',
              type: transaction.type || 'expense',
            })),
          );
        }
      } catch {
        // Fallback: keep static data
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    const period = formData.period || activePeriod;

    if (useApi) {
      const categoryNames = apiCategories.length > 0
        ? apiCategories.map((category) => category.name)
        : budgetCategories;
      const rows = getBudgetRowsForCategories(categoryNames, budgets, apiTransactions, period);
      const totalBudget = rows.reduce((sum, row) => sum + (row.limit || 0), 0);
      const totalUsed = rows.reduce((sum, row) => sum + (row.used || 0), 0);
      return { rows, totalBudget, totalUsed, remaining: totalBudget - totalUsed };
    }

    return getBudgetSummary(budgets, initialTransactions, period);
  }, [apiCategories, apiTransactions, budgets, formData.period, useApi]);

  function handleFormChange(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.category || !formData.period) {
      alert('Kategori dan periode wajib diisi.');
      return;
    }

    const limit = Number(formData.limit);
    // Check existing
    const existing = budgets.find(
      (b) => b.category === formData.category && b.period === formData.period,
    );

    if (!formData.limit || limit <= 0) {
      if (existing?.id) {
        try {
          const result = await apiDeleteBudget(existing.id);
          if (!result.ok) {
            alert(result.data?.message || 'Gagal mengembalikan budget ke Belum Diatur.');
            return;
          }
        } catch {
          alert('Terjadi kesalahan saat menghapus budget.');
          return;
        }

        setBudgets((current) => current.filter((budget) => budget.id !== existing.id));
        clearCache();
      }

      setFormData((current) => ({ ...current, limit: '' }));
      return;
    }

    const [year, month] = (formData.period || activePeriod).split('-').map(Number);

    // Find expense_category_id
    const catMatch = apiCategories.find(
      (c) => c.name.toLowerCase() === formData.category.toLowerCase(),
    );
    const expense_category_id = catMatch ? catMatch.id : null;

    try {
      if (existing && existing.id) {
        // Update existing
        const res = await apiUpdateBudget(existing.id, {
          amount: limit,
          expense_category_id,
          month,
          year,
        });
        if (res.ok) {
          setBudgets((current) =>
            current.map((b) =>
              b.id === existing.id ? { ...b, limit } : b,
            ),
          );
        } else {
          // Fallback local
          setBudgets((current) =>
            current.map((b) =>
              b.id === existing.id ? { ...b, limit } : b,
            ),
          );
        }
      } else {
        // Create new
        const res = await apiCreateBudget({
          expense_category_id,
          amount: limit,
          month,
          year,
        });
        if (res.ok && res.data.data) {
          const newBudget = {
            id: res.data.data.id,
            category: formData.category,
            limit,
            period: formData.period,
            used: 0,
            _expense_category_id: expense_category_id,
          };
          setBudgets((current) => [...current, newBudget]);
        } else {
          // Fallback local
          setBudgets((current) => [
            ...current,
            {
              id: Date.now(),
              category: formData.category,
              limit,
              period: formData.period,
              used: 0,
            },
          ]);
        }
      }
    } catch {
      // Fallback local
      if (existing) {
        setBudgets((current) =>
          current.map((b) =>
            b.id === existing.id ? { ...b, limit } : b,
          ),
        );
      } else {
        setBudgets((current) => [
          ...current,
          { id: Date.now(), category: formData.category, limit, period: formData.period, used: 0 },
        ]);
      }
    }

    clearCache();
    setFormData((current) => ({ ...current, limit: '' }));
  }

  // Category names for the form
  const categoryNames = apiCategories.length > 0
    ? apiCategories.map((c) => c.name)
    : null;

  return (
    <main className="page-main budget-main">
      <Topbar
        title="Budget"
        description="Atur batas pengeluaran agar keuangan bulanan lebih terkontrol"
        selectedDate={new Date().toISOString().slice(0, 10)}
        showDate={false}
      />

      <BudgetSummaryCards
        totalBudget={summary.totalBudget}
        totalUsed={summary.totalUsed}
        remaining={summary.remaining}
      />

      <section className="budget-page-layout">
        <BudgetForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          categories={categoryNames}
        />

        <BudgetList rows={summary.rows} />
      </section>
    </main>
  );
}
