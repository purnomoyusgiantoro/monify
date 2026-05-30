export const dashboardData = {
  user: {
    name: 'Pengguna',
    email: '',
    avatar: '/assets/icon-profile.png',
  },
  selectedDate: new Date().toISOString().slice(0, 10),
  periodLabel: '',
  summary: {
    balance: 0,
    income: 0,
    expense: 0,
    budgetTotal: 0,
    budgetUsed: 0,
    safeToSpendToday: 0,
    monthlyPrediction: 0,
    balanceTrend: 0,
    incomeTrend: 0,
    expenseTrend: 0,
  },
  chart: {
    title: 'Tren Pengeluaran',
    subtitle: 'Pengeluaran harian selama 7 hari terakhir',
    filterLabel: '7 Hari Terakhir',
    monthLabel: '',
    points: [],
  },
  budgets: [],
  transactions: [],
};

export const sidebarMenus = [
  { label: 'Dashboard', icon: '/assets/icon-dashboard.png', page: 'dashboard' },
  { label: 'Transaksi', icon: '/assets/icon-transaksi.png', page: 'transactions' },
  { label: 'Budget', icon: '/assets/icon-budget.png', page: 'budget' },
  { label: 'Prediksi AI', icon: '/assets/icon-prediksi-ai.png', page: 'prediction' },
  { label: 'Setting', icon: '/assets/icon-setting.png', page: 'settings' },
];
