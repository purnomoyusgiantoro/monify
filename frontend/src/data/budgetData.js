export const initialBudgets = [];

export const budgetCategories = [
  'Makanan',
  'Transport',
  'Hiburan',
  'Lainnya',
  'Tagihan',
  'Kebutuhan Pokok',
  'Pakaian',
  'Elektronik',
];

export function getBudgetUsageByCategory(transactions, category, period) {
  return transactions
    .filter((transaction) => {
      const transactionPeriod = transaction.date.slice(0, 7);
      return transaction.type === 'expense' && transaction.category === category && transactionPeriod === period;
    })
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getBudgetRows(budgets, transactions, period) {
  return budgets
    .filter((budget) => budget.period === period)
    .map((budget) => {
      const used = getBudgetUsageByCategory(transactions, budget.category, period);
      const percent = budget.limit > 0 ? Math.round((used / budget.limit) * 100) : 0;

      return {
        ...budget,
        used,
        percent,
        remaining: budget.limit - used,
      };
    });
}

export function getBudgetSummary(budgets, transactions, period) {
  const rows = getBudgetRows(budgets, transactions, period);
  const totalBudget = rows.reduce((total, budget) => total + budget.limit, 0);
  const totalUsed = rows.reduce((total, budget) => total + budget.used, 0);

  return {
    rows,
    totalBudget,
    totalUsed,
    remaining: totalBudget - totalUsed,
  };
}
