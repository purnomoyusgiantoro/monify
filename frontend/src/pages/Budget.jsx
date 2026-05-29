import { useMemo, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import BudgetSummaryCards from '../components/budget/BudgetSummaryCards.jsx';
import BudgetForm from '../components/budget/BudgetForm.jsx';
import BudgetList from '../components/budget/BudgetList.jsx';
import { getBudgetSummary, initialBudgets } from '../data/budgetData.js';
import { initialTransactions } from '../data/transactionData.js';

const activePeriod = '2026-06';
const emptyForm = {
  category: 'Makanan',
  limit: '',
  period: activePeriod,
};

export default function Budget() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [formData, setFormData] = useState(emptyForm);

  const summary = useMemo(() => {
    return getBudgetSummary(budgets, initialTransactions, formData.period || activePeriod);
  }, [budgets, formData.period]);

  function handleFormChange(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const limit = Number(formData.limit);
    if (!formData.category || !formData.period || !limit || limit <= 0) {
      alert('Kategori, limit budget, dan periode wajib diisi dengan benar.');
      return;
    }

    setBudgets((current) => {
      const existingBudget = current.find(
        (budget) => budget.category === formData.category && budget.period === formData.period,
      );

      if (existingBudget) {
        return current.map((budget) => (
          budget.id === existingBudget.id ? { ...budget, limit } : budget
        ));
      }

      return [
        ...current,
        {
          id: Date.now(),
          category: formData.category,
          limit,
          period: formData.period,
        },
      ];
    });

    setFormData((current) => ({ ...current, limit: '' }));
  }

  return (
    <main className="page-main budget-main">
      <Topbar
        title="Budget"
        description="Atur batas pengeluaran agar keuangan bulanan lebih terkontrol"
        selectedDate="2026-06-22"
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
        />

        <BudgetList rows={summary.rows} />
      </section>
    </main>
  );
}
