
export const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

const seedTransactions = [];

const defaultState = {
  user: { name: 'Pengguna', email: 'user@example.com', role: 'Member' },
  profile: { income: 0, budget: 0, savingTarget: 0 },
  budgets: {
    Makanan: 0,
    Transport: 0,
    Belanja: 0,
    Hiburan: 0,
    Internet: 0,
    Lainnya: 0
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
