
export const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

const seedTransactions = [
  { id: 1, date: '2026-05-01', title: 'Uang bulanan', type: 'income', category: 'Pemasukan', amount: 3500000, note: 'Saldo awal bulan' },
  { id: 2, date: '2026-05-02', title: 'Makan ayam geprek', type: 'expense', category: 'Makanan', amount: 28000, note: 'Makan siang' },
  { id: 3, date: '2026-05-03', title: 'Bensin motor', type: 'expense', category: 'Transport', amount: 35000, note: 'Isi bensin' },
  { id: 4, date: '2026-05-04', title: 'Top up kuota', type: 'expense', category: 'Internet', amount: 43000, note: 'Paket data' },
  { id: 5, date: '2026-05-05', title: 'Kopi dan camilan', type: 'expense', category: 'Makanan', amount: 24000, note: 'Nongkrong' },
  { id: 6, date: '2026-05-06', title: 'Langganan aplikasi', type: 'expense', category: 'Hiburan', amount: 49000, note: 'Subscription' },
  { id: 7, date: '2026-05-07', title: 'Belanja skincare', type: 'expense', category: 'Belanja', amount: 89000, note: 'Kebutuhan pribadi' },
  { id: 8, date: '2026-05-08', title: 'Gojek kampus', type: 'expense', category: 'Transport', amount: 22000, note: 'Transportasi' }
];

const defaultState = {
  user: { name: 'Indra Fata', email: 'indra@example.com', role: 'Full-Stack MONIFY' },
  profile: { income: 3500000, budget: 2200000, savingTarget: 500000 },
  budgets: {
    Makanan: 700000,
    Transport: 400000,
    Belanja: 450000,
    Hiburan: 250000,
    Internet: 180000,
    Lainnya: 220000
  },
  transactions: seedTransactions
};

export function clone(data) { return JSON.parse(JSON.stringify(data)); }

export function getState() {
  const raw = localStorage.getItem('monify_state');
  if (!raw) {
    localStorage.setItem('monify_state', JSON.stringify(defaultState));
    return clone(defaultState);
  }
  try {
    const parsed = JSON.parse(raw);
    parsed.budgets = { ...defaultState.budgets, ...(parsed.budgets || {}) };
    parsed.profile = { ...defaultState.profile, ...(parsed.profile || {}) };
    parsed.user = { ...defaultState.user, ...(parsed.user || {}) };
    parsed.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : clone(seedTransactions);
    return parsed;
  } catch {
    return clone(defaultState);
  }
}

export function setState(next) { localStorage.setItem('monify_state', JSON.stringify(next)); window.dispatchEvent(new Event('statechange')); }

export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2300);
}

export function classify(text = '') {
  const t = text.toLowerCase();
  if (/makan|ayam|kopi|nasi|bakso|mie|jajan|minum|food|resto|geprek/.test(t)) return 'Makanan';
  if (/gojek|grab|bensin|parkir|ojek|bus|kereta|transport|angkot/.test(t)) return 'Transport';
  if (/baju|skincare|sepatu|belanja|marketplace|shopee|tokopedia|barang/.test(t)) return 'Belanja';
  if (/netflix|game|spotify|bioskop|hiburan|nongkrong|langganan|top up game/.test(t)) return 'Hiburan';
  if (/kuota|internet|wifi|pulsa|indihome|paket data/.test(t)) return 'Internet';
  return 'Lainnya';
}

export function summary(state = getState(), transactions = state.transactions) {
  const today = new Date();
  const income = transactions.filter(x => x.type === 'income').reduce((a,b)=>a+Number(b.amount || 0),0);
  const expense = transactions.filter(x => x.type === 'expense').reduce((a,b)=>a+Number(b.amount || 0),0);
  const balance = income - expense;
  const day = Math.max(1, today.getDate());
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remaining = Math.max(1, daysInMonth - day);
  const projected = Math.round((expense / day) * daysInMonth);
  const risk = Math.min(140, Math.round((projected / Math.max(1, state.profile.budget)) * 100));
  const safe = Math.max(0, Math.floor((state.profile.budget - expense) / remaining));
  const byCategory = {};
  transactions.filter(x=>x.type==='expense').forEach(x => byCategory[x.category] = (byCategory[x.category] || 0) + Number(x.amount || 0));
  const topCategory = Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0] || ['Belum ada',0];
  return { income, expense, balance, day, daysInMonth, remaining, projected, risk, safe, byCategory, topCategory, total: transactions.length };
}

export function timestamp() {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
}
