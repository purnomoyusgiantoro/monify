const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// GET /api/dashboard/summary — calculateBalance() + getMonthlySummary()
// ============================================
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        const today = date ? new Date(date) : new Date();
        const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        // 1. Fetch month transactions
        const { data: monthTransactions, error: trxError } = await supabase
            .from('transactions')
            .select('type, amount')
            .eq('user_id', req.user.id)
            .gte('transactions_date', `${currentMonthPrefix}-01`)
            .lte('transactions_date', `${currentMonthPrefix}-31`);

        if (trxError) throw trxError;


        // 2. Fetch budgets for the current month
        const currentMonthNum = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('amount')
            .eq('user_id', req.user.id)
            .eq('month', currentMonthNum)
            .eq('year', currentYear);

        if (budgetError) throw budgetError;

        // Calculate total income from income transactions
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const balance = totalIncome - totalExpense;

        // Budget metrics
        const totalBudget = userBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        const day = Math.max(1, today.getDate());
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const remaining = Math.max(1, daysInMonth - day);
        const projected = Math.round((totalExpense / day) * daysInMonth);
        const risk = Math.min(140, Math.round((projected / Math.max(1, totalBudget)) * 100));
        const safeToSpend = Math.max(0, Math.floor((totalBudget - totalExpense) / remaining));

        res.json({
            success: true,
            data: {
                balance,
                total_income: totalIncome,
                total_expense: totalExpense,
                total_budget: totalBudget,
                projected_expense: projected,
                risk_percentage: risk || 0,
                safe_to_spend: safeToSpend,
                days_remaining: remaining,
                days_in_month: daysInMonth,
                current_day: day,
                total_transactions: monthTransactions.length,
                month: currentMonthPrefix
            }
        });
    } catch (error) {
        console.error('Dashboard summary error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan dashboard.' });
    }
});

// ============================================
// GET /api/dashboard/expense-by-category — getExpenseByCategory()
// ============================================
router.get('/expense-by-category', authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        const today = date ? new Date(date) : new Date();
        const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthNum = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const { data: monthExpenses, error: trxError } = await supabase
            .from('transactions')
            .select('amount, expense_category_id, expense_categories(name)')
            .eq('user_id', req.user.id)
            .eq('type', 'expense')
            .gte('transactions_date', `${currentMonthPrefix}-01`)
            .lte('transactions_date', `${currentMonthPrefix}-31`);

        if (trxError) throw trxError;

        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('expense_category_id, amount')
            .eq('user_id', req.user.id)
            .eq('month', currentMonthNum)
            .eq('year', currentYear);

        if (budgetError) throw budgetError;

        const totalExpense = monthExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // Group by category
        const byCategory = {};
        monthExpenses.forEach(t => {
            const catId = t.expense_category_id || 'unknown';
            if (!byCategory[catId]) {
                byCategory[catId] = { amount: 0, count: 0, name: t.expense_categories?.name || 'Lainnya' };
            }
            byCategory[catId].amount += Number(t.amount || 0);
            byCategory[catId].count += 1;
        });

        // Enrich with budget limits
        const categories = Object.entries(byCategory)
            .map(([catId, data]) => {
                const budget = userBudgets.find(b => b.expense_category_id === catId);
                const limit = budget ? Number(budget.amount) : 0;

                return {
                    category_id: catId,
                    category_name: data.name,
                    amount: data.amount,
                    count: data.count,
                    percentage: totalExpense ? Math.round((data.amount / totalExpense) * 100) : 0,
                    budget_limit: limit,
                    budget_usage: limit ? Math.round((data.amount / limit) * 100) : 0
                };
            })
            .sort((a, b) => b.amount - a.amount);

        res.json({
            success: true,
            data: {
                total_expense: totalExpense,
                categories,
                month: currentMonthPrefix
            }
        });
    } catch (error) {
        console.error('Expense by category error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pengeluaran per kategori.' });
    }
});

// ============================================
// GET /api/dashboard/history — getTransactionHistory()
// ============================================
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { limit } = req.query;
        const maxItems = parseInt(limit) || 10;

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('user_id', req.user.id)
            .order('transactions_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(maxItems);

        if (error) throw error;

        // Enrich
        const enriched = transactions.map(t => ({
            ...t,
            category_name: t.type === 'income'
                ? (t.income_categories?.name || 'Pemasukan')
                : (t.expense_categories?.name || 'Lainnya')
        }));

        res.json({
            success: true,
            data: enriched,
            total: enriched.length
        });
    } catch (error) {
        console.error('Transaction history error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat transaksi.' });
    }
});

module.exports = router;
