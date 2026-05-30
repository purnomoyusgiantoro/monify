export const transactionTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
];

export const transactionTypes = [
  { label: 'Pemasukan', value: 'income', icon: '/assets/icon-pemasukan.png' },
  { label: 'Pengeluaran', value: 'expense', icon: '/assets/icon-pengeluaran.png' },
];

export const incomeCategories = ['Gaji', 'Bonus', 'Investasi'];

export const expenseCategories = [
  'Makanan',
  'Tagihan',
  'Kebutuhan Pokok',
  'Pakaian',
  'Elektronik',
  'Transport',
  'Hiburan',
  'Lainnya',
];

export const initialTransactions = [];



export function getCategoriesByType(type) {
  return type === 'income' ? incomeCategories : expenseCategories;
}
