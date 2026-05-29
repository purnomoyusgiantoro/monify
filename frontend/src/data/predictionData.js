import { getBudgetSummary } from './budgetData.js';

export const predictionConfig = {
  currentDate: '2026-06-22',
  period: '2026-06',
};

function getDaysInMonth(period) {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function getCurrentDay(dateValue) {
  return new Date(dateValue).getDate();
}

function getMonthlyExpense(transactions, period) {
  return transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.date.slice(0, 7) === period)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function getExpenseByCategory(transactions, period) {
  return transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.date.slice(0, 7) === period)
    .reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + transaction.amount;
      return result;
    }, {});
}

function getHighestCategory(categoryTotals) {
  const entries = Object.entries(categoryTotals);
  if (!entries.length) return { category: 'Belum ada', amount: 0 };

  const [category, amount] = entries.sort((a, b) => b[1] - a[1])[0];
  return { category, amount };
}

function getRiskStatus(riskPercent, monthlyPrediction, totalBudget) {
  if (monthlyPrediction > totalBudget) return { label: 'Overbudget', tone: 'danger' };
  if (riskPercent >= 90) return { label: 'Bahaya', tone: 'danger' };
  if (riskPercent >= 70) return { label: 'Waspada', tone: 'warning' };
  return { label: 'Aman', tone: 'success' };
}

export function getPredictionMetrics(budgets, transactions, currentDate = predictionConfig.currentDate) {
  const period = currentDate.slice(0, 7);
  const totalDays = getDaysInMonth(period);
  const currentDay = getCurrentDay(currentDate);
  const remainingDays = Math.max(totalDays - currentDay + 1, 1);

  const budgetSummary = getBudgetSummary(budgets, transactions, period);
  const monthlyExpense = getMonthlyExpense(transactions, period);
  const dailyAverageExpense = currentDay > 0 ? monthlyExpense / currentDay : 0;
  const monthlyPrediction = Math.round(dailyAverageExpense * totalDays);
  const remainingBudget = Math.max(budgetSummary.totalBudget - monthlyExpense, 0);
  const safeToSpendToday = Math.floor(remainingBudget / remainingDays);
  const rawRisk = budgetSummary.totalBudget > 0 ? (monthlyPrediction / budgetSummary.totalBudget) * 100 : 0;
  const riskPercent = Math.min(100, Math.max(0, Math.round(rawRisk)));
  const categoryTotals = getExpenseByCategory(transactions, period);
  const highestCategory = getHighestCategory(categoryTotals);
  const status = getRiskStatus(riskPercent, monthlyPrediction, budgetSummary.totalBudget);

  const suggestions = buildSuggestions({
    monthlyPrediction,
    safeToSpendToday,
    riskPercent,
    monthlyExpense,
    totalBudget: budgetSummary.totalBudget,
    remainingBudget,
    highestCategory,
    status,
  });

  return {
    period,
    currentDate,
    totalBudget: budgetSummary.totalBudget,
    monthlyExpense,
    monthlyPrediction,
    safeToSpendToday,
    remainingBudget,
    riskPercent,
    status,
    highestCategory,
    suggestions,
  };
}

export function buildSuggestions(metrics) {
  const suggestions = [];

  if (metrics.totalBudget <= 0) {
    return [
      'Budget bulan ini belum diatur. Isi batas budget dulu supaya prediksi AI tidak menebak tanpa dasar.',
      'Tambahkan transaksi rutin seperti makan, transport, tagihan, dan hiburan agar analisis lebih akurat.',
    ];
  }

  if (metrics.highestCategory.amount > 0) {
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
    `Batas aman belanja hari ini dihitung dari sisa budget dibagi sisa hari dalam bulan berjalan.`,
  );

  return suggestions;
}

export const quickPrompts = [
  'Berapa aman belanja hari ini?',
  'Kenapa risiko overbudget saya?',
  'Kategori mana yang paling boros?',
  'Beri saran hemat bulan ini',
];
