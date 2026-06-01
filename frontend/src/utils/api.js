import { clearCache } from './cache.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper: Ambil token dari localStorage.
 */
export function getToken() {
    return localStorage.getItem('monify_token');
}

/**
 * Helper: Simpan token & user data setelah login/register.
 */
export function setAuth(token, user) {
    localStorage.setItem('monify_token', token);
    localStorage.setItem('monify_logged_in', 'true');
    localStorage.setItem('monify_user', JSON.stringify(user));
}

/**
 * Helper: Hapus auth data saat logout.
 */
export function clearAuth() {
    localStorage.removeItem('monify_token');
    localStorage.removeItem('monify_logged_in');
    localStorage.removeItem('monify_user');
    clearCache();
}

/**
 * Helper: Ambil user data dari localStorage.
 */
export function getUser() {
    try {
        const raw = localStorage.getItem('monify_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Helper: Cek apakah user sudah login (ada token).
 */
export function isAuthenticated() {
    return !!getToken() && localStorage.getItem('monify_logged_in') === 'true';
}

/**
 * Fetch wrapper dengan auth header.
 */
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    // Jika token expired/invalid, clear auth
    if (response.status === 401) {
        clearAuth();
    }

    return { ok: response.ok, status: response.status, data };
}

// ============================================
// AUTH API
// ============================================

export async function apiRegister(name, email, password) {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
}

export async function apiLogin(email, password) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

export async function apiLogout() {
    const result = await apiFetch('/auth/logout', { method: 'POST' });
    clearAuth();
    return result;
}

export async function apiGetMe() {
    return apiFetch('/auth/me');
}

export async function apiUpdateProfile(name, email) {
    return apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email })
    });
}


export async function apiUpdatePassword(oldPassword, newPassword) {
    return apiFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
    });
}

// ============================================
// TRANSACTIONS API
// ============================================

export async function apiGetTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/transactions${query ? '?' + query : ''}`);
}

export async function apiCreateTransaction(data) {
    const res = await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (res.ok) clearCache();
    return res;
}

export async function apiUpdateTransaction(id, data) {
    const res = await apiFetch(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (res.ok) clearCache();
    return res;
}

export async function apiDeleteTransaction(id) {
    const res = await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) clearCache();
    return res;
}

// ============================================
// CATEGORIES API
// ============================================

export async function apiGetIncomeCategories() {
    return apiFetch('/categories/income');
}

export async function apiGetExpenseCategories() {
    return apiFetch('/categories/expense');
}

// ============================================
// BUDGETS API
// ============================================

export async function apiGetBudgets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/budgets${query ? '?' + query : ''}`);
}

export async function apiCreateBudget(data) {
    const res = await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (res.ok) clearCache();
    return res;
}

export async function apiUpdateBudget(id, data) {
    const res = await apiFetch(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (res.ok) clearCache();
    return res;
}

// ============================================
// DASHBOARD API
// ============================================

export async function apiGetDashboardSummary(date) {
    return apiFetch(`/dashboard/summary${date ? `?date=${date}` : ''}`);
}

export async function apiGetExpenseByCategory(date) {
    return apiFetch(`/dashboard/expense-by-category${date ? `?date=${date}` : ''}`);
}

export async function apiGetTransactionHistory(limit = 10) {
    return apiFetch(`/dashboard/history?limit=${limit}`);
}

// ============================================
// AI API
// ============================================

export async function apiClassify(deskripsi, jumlah) {
    return apiFetch('/ai/classify', {
        method: 'POST',
        body: JSON.stringify({ deskripsi, jumlah })
    });
}

export async function apiPredict() {
    return apiFetch('/ai/predict', { method: 'POST' });
}

export async function apiGetPredictions(limit = 1) {
    return apiFetch(`/ai/predictions?limit=${limit}`);
}

export async function apiGetSafeToSpend() {
    return apiFetch('/ai/safe-to-spend');
}

export async function apiGetOverbudget() {
    return apiFetch('/ai/overbudget');
}

export async function apiChatBot(message, metrics) {
    return apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, metrics })
    });
}

// ============================================
// REPORTS API
// ============================================

export async function apiGetDailyReport(date) {
    return apiFetch(`/reports/daily?date=${date}`);
}

export async function apiGetMonthlyReport(month) {
    return apiFetch(`/reports/monthly?month=${month}`);
}

export async function apiGetYearlyReport(year) {
    return apiFetch(`/reports/yearly?year=${year}`);
}
