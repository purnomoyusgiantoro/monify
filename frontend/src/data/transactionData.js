export const transactionTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
];

export const transactionTypes = [
  { label: 'Pemasukan', value: 'income', icon: '/assets/icon-pemasukan.png' },
  { label: 'Pengeluaran', value: 'expense', icon: '/assets/icon-pengeluaran.png' },
];

export const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya'];

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

export const initialTransactions = [
  { id: 1, name: 'Gaji Bulanan', date: '2026-06-20', category: 'Gaji', type: 'income', amount: 3000000, note: 'Gaji bulan Juni' },
  { id: 2, name: 'Ayam goreng', date: '2026-06-21', category: 'Makanan', type: 'expense', amount: 20000, note: '' },
  { id: 3, name: 'Gojek', date: '2026-06-21', category: 'Transport', type: 'expense', amount: 30000, note: '' },
  { id: 4, name: 'Netflix', date: '2026-06-21', category: 'Hiburan', type: 'expense', amount: 20000, note: '' },
  { id: 5, name: 'Top up Dana', date: '2026-06-21', category: 'Lainnya', type: 'expense', amount: 10000, note: '' },
  { id: 6, name: 'Tagihan Wifi', date: '2026-06-21', category: 'Tagihan', type: 'expense', amount: 150000, note: '' },
  { id: 7, name: 'Saham BBC A', date: '2026-06-21', category: 'Investasi', type: 'income', amount: 200000, note: '' },
  { id: 8, name: 'Baju baru', date: '2026-06-21', category: 'Pakaian', type: 'expense', amount: 30000, note: '' },
];

const keywordCategoryRules = [
  { category: 'Makanan', keywords: ['ayam', 'makan', 'nasi', 'kopi', 'bakso', 'mie', 'warung', 'resto'] },
  { category: 'Transport', keywords: ['gojek', 'grab', 'bensin', 'ojek', 'taxi', 'parkir', 'bus'] },
  { category: 'Hiburan', keywords: ['netflix', 'spotify', 'game', 'bioskop', 'hiburan'] },
  { category: 'Tagihan', keywords: ['wifi', 'listrik', 'air', 'tagihan', 'pulsa', 'internet'] },
  { category: 'Pakaian', keywords: ['baju', 'celana', 'sepatu', 'jaket', 'pakaian'] },
  { category: 'Elektronik', keywords: ['hp', 'laptop', 'charger', 'mouse', 'keyboard', 'elektronik'] },
  { category: 'Gaji', keywords: ['gaji', 'salary', 'upah'] },
  { category: 'Investasi', keywords: ['saham', 'reksa', 'crypto', 'dividen', 'investasi'] },
];

export function suggestCategory(name, type) {
  const normalizedName = name.toLowerCase();
  const matchedRule = keywordCategoryRules.find((rule) => rule.keywords.some((keyword) => normalizedName.includes(keyword)));

  if (matchedRule) return matchedRule.category;
  return type === 'income' ? 'Lainnya' : 'Lainnya';
}

export function getCategoriesByType(type) {
  return type === 'income' ? incomeCategories : expenseCategories;
}
