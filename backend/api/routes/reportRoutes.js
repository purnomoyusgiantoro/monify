const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// GET /api/reports/daily?date=YYYY-MM-DD — Laporan harian
// ============================================
router.get('/daily', authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().slice(0, 10);

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('user_id', req.user.id)
            .eq('transactions_date', targetDate);

        if (error) throw error;

        const report = buildReport(transactions, targetDate, 'daily');

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Daily report error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal membuat laporan harian.' });
    }
});

// ============================================
// GET /api/reports/monthly?month=YYYY-MM — Laporan bulanan
// ============================================
router.get('/monthly', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const { month } = req.query;
        const targetMonth = month || defaultMonth;
        
        const targetYearNum = parseInt(targetMonth.split('-')[0]);
        const targetMonthNum = parseInt(targetMonth.split('-')[1]);
        const lastDay = new Date(targetYearNum, targetMonthNum, 0).getDate();

        const { data: transactions, error: trxError } = await supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('user_id', req.user.id)
            .gte('transactions_date', `${targetMonth}-01`)
            .lte('transactions_date', `${targetMonth}-${String(lastDay).padStart(2, '0')}`);

        if (trxError) throw trxError;

        const report = buildReport(transactions, targetMonth, 'monthly');

        // Budget summary
        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('amount, expense_category_id, expense_categories(name)')
            .eq('user_id', req.user.id)
            .eq('month', targetMonthNum)
            .eq('year', targetYearNum);

        if (budgetError) throw budgetError;

        const budgetSummary = userBudgets.map(b => {
            const used = transactions
                .filter(t => t.type === 'expense' && t.expense_category_id === b.expense_category_id)
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const limit = Number(b.amount);
            return {
                category_name: b.expense_categories?.name || 'Unknown',
                limit,
                used,
                remaining: Math.max(0, limit - used),
                percentage: Math.round((used / Math.max(1, limit)) * 100)
            };
        });

        report.budget_summary = budgetSummary;

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Monthly report error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal membuat laporan bulanan.' });
    }
});

// ============================================
// GET /api/reports/yearly?year=YYYY — Laporan tahunan
// ============================================
router.get('/yearly', authMiddleware, async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year || String(new Date().getFullYear());

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('user_id', req.user.id)
            .gte('transactions_date', `${targetYear}-01-01`)
            .lte('transactions_date', `${targetYear}-12-31`);

        if (error) throw error;

        const report = buildReport(transactions, targetYear, 'yearly');

        // Monthly breakdown
        const monthlyBreakdown = {};
        for (let m = 1; m <= 12; m++) {
            const monthKey = `${targetYear}-${String(m).padStart(2, '0')}`;
            const monthTransactions = transactions.filter(t => t.transactions_date.startsWith(monthKey));

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            monthlyBreakdown[monthKey] = {
                income,
                expense,
                balance: income - expense,
                transaction_count: monthTransactions.length
            };
        }

        report.monthly_breakdown = monthlyBreakdown;

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Yearly report error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal membuat laporan tahunan.' });
    }
});

// ============================================
// Helper: Build report dari transaksi yang sudah difilter
// ============================================
function buildReport(transactions, period, periodType) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const balance = totalIncome - totalExpense;

    // Expense by category
    const byCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const catName = t.expense_categories?.name || 'Lainnya';

        if (!byCategory[catName]) {
            byCategory[catName] = { amount: 0, count: 0 };
        }
        byCategory[catName].amount += Number(t.amount || 0);
        byCategory[catName].count += 1;
    });

    const categoryBreakdown = Object.entries(byCategory)
        .map(([name, data]) => ({
            category_name: name,
            amount: data.amount,
            count: data.count,
            percentage: Math.round((data.amount / Math.max(1, totalExpense)) * 100)
        }))
        .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown[0] || { category_name: 'Belum ada', amount: 0 };

    // Enrich transactions
    const enrichedTransactions = transactions
        .map(t => ({
            ...t,
            category_name: t.type === 'income'
                ? (t.income_categories?.name || 'Pemasukan')
                : (t.expense_categories?.name || 'Lainnya')
        }))
        .sort((a, b) => new Date(b.transactions_date) - new Date(a.transactions_date));

    return {
        period,
        period_type: periodType,
        total_income: totalIncome,
        total_expense: totalExpense,
        balance,
        transaction_count: transactions.length,
        top_category: topCategory,
        category_breakdown: categoryBreakdown,
        transactions: enrichedTransactions
    };
}

module.exports = router;
