export const dashboardData = {
  user: {
    name: 'Indra Fata',
    email: 'Indra@gmail.com',
    avatar: '/assets/icon-profile.png',
  },
  selectedDate: '2026-06-22',
  periodLabel: 'Juni 2026',
  summary: {
    balance: 3000000,
    income: 3300000,
    expense: 300000,
    budgetTotal: 2500000,
    budgetUsed: 80000,
    safeToSpendToday: 30000,
    monthlyPrediction: 3500000,
    balanceTrend: 8,
    incomeTrend: 8,
    expenseTrend: 8,
  },
  chart: {
    title: 'Tren Pengeluaran',
    subtitle: 'Pengeluaran harian selama 7 hari terakhir',
    filterLabel: '7 Hari Terakhir',
    monthLabel: 'Juni 2026',
    points: [
      { day: '16', value: 200000 },
      { day: '17', value: 300000 },
      { day: '18', value: 150000 },
      { day: '19', value: 350000 },
      { day: '20', value: 180000 },
      { day: '21', value: 230000 },
      { day: '22', value: 320000 },
    ],
  },
  budgets: [
    { category: 'Makanan', used: 30000, limit: 1000000 },
    { category: 'Transport', used: 30000, limit: 500000 },
    { category: 'Hiburan', used: 20000, limit: 400000 },
    { category: 'Lainnya', used: 10000, limit: 600000 },
  ],
  transactions: [
    { name: 'Gaji Bulanan', date: '2026-06-20', category: 'Gaji', type: 'income', amount: 3000000 },
    { name: 'Ayam goreng', date: '2026-06-21', category: 'Makanan', type: 'expense', amount: 20000 },
    { name: 'Gojek', date: '2026-06-21', category: 'Transport', type: 'expense', amount: 30000 },
    { name: 'Netflix', date: '2026-06-21', category: 'Hiburan', type: 'expense', amount: 20000 },
    { name: 'Top up Dana', date: '2026-06-21', category: 'Lainnya', type: 'expense', amount: 10000 },
  ],
};

export const sidebarMenus = [
  { label: 'Dashboard', icon: '/assets/icon-dashboard.png', page: 'dashboard' },
  { label: 'Transaksi', icon: '/assets/icon-transaksi.png', page: 'transactions' },
  { label: 'Budget', icon: '/assets/icon-budget.png', page: 'budget' },
  { label: 'Prediksi AI', icon: '/assets/icon-prediksi-ai.png', page: 'prediction' },
  { label: 'Setting', icon: '/assets/icon-setting.png', page: 'settings' },
];
