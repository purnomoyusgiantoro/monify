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

export const initialTransactions = [];

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
