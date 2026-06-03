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

export function getBudgetRowsForCategories(categories, budgets, transactions, period) {
  const periodBudgets = budgets.filter((budget) => budget.period === period);
  const categoriesInOrder = [];
  const seen = new Set();

  for (const category of categories) {
    if (!category || seen.has(category)) continue;
    seen.add(category);
    categoriesInOrder.push(category);
  }

  for (const budget of periodBudgets) {
    if (!budget.category || seen.has(budget.category)) continue;
    seen.add(budget.category);
    categoriesInOrder.push(budget.category);
  }

  return categoriesInOrder.map((category) => {
    const matchedBudget = periodBudgets.find((budget) => budget.category === category);
    const limit = Number(matchedBudget?.limit) || 0;
    const used = matchedBudget?.used != null
      ? Number(matchedBudget.used) || 0
      : getBudgetUsageByCategory(transactions, category, period);
    const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      id: matchedBudget?.id ?? `${period}-${category}`,
      category,
      limit,
      period,
      used,
      percent,
      remaining: limit - used,
      _expense_category_id: matchedBudget?._expense_category_id ?? null,
    };
  });
}

export function getBudgetRows(budgets, transactions, period) {
  return getBudgetRowsForCategories(budgetCategories, budgets, transactions, period);
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
