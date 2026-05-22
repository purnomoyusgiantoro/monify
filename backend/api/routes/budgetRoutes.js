const express = require('express');
const { generateId, now } = require('../data/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// GET /api/budgets — List budget user
// ============================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        // Note: budget has month/year in DB schema instead of periode, but we'll try to support logic
        // Based on JSON logic, we just return the budgets and calculate usage
        
        // 1. Get budgets for user
        let query = supabase.from('budgets').select('*, expense_categories(name)').eq('user_id', req.user.id);
        const { data: budgets, error: budgetError } = await query;
        if (budgetError) throw budgetError;

        // 2. We need to calculate used_amount. 
        // This is complex in SQL without views, so we'll fetch transactions and calculate in JS
        const { data: transactions, error: trxError } = await supabase
            .from('transactions')
            .select('expense_category_id, amount, transactions_date')
            .eq('user_id', req.user.id)
            .eq('type', 'expense');
            
        if (trxError) throw trxError;

        let filtered = budgets;

        // Actually the old code expected start_date/end_date on the budget object
        // Let's assume start_date and end_date are columns in supabase, wait, my schema was month/year
        // Let's modify the response to match the frontend expectations
        const enriched = filtered.map(b => {
            // Reconstruct start/end date from month/year if they are not columns
            const b_start_date = b.start_date || `${b.year}-${String(b.month).padStart(2, '0')}-01`;
            const lastDay = new Date(b.year || new Date().getFullYear(), b.month || (new Date().getMonth() + 1), 0).getDate();
            const b_end_date = b.end_date || `${b.year}-${String(b.month).padStart(2, '0')}-${lastDay}`;

            const used = transactions
                .filter(t =>
                    t.expense_category_id === b.expense_category_id &&
                    t.transactions_date >= b_start_date &&
                    t.transactions_date <= b_end_date
                )
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            return {
                ...b,
                start_date: b_start_date,
                end_date: b_end_date,
                category_name: b.expense_categories?.name || 'Unknown',
                used_amount: used,
                remaining: Math.max(0, b.amount - used),
                usage_percentage: Math.round((used / Math.max(1, b.amount)) * 100)
            };
        });

        res.json({
            success: true,
            data: enriched,
            total: enriched.length
        });
    } catch (error) {
        console.error('Get budgets error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil data budget.' });
    }
});

// ============================================
// GET /api/budgets/:id — Detail budget
// ============================================
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .select('*, expense_categories(name)')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (budgetError || !budget) {
            return res.status(404).json({ success: false, message: 'Budget tidak ditemukan.' });
        }

        const b_start_date = budget.start_date || `${budget.year}-${String(budget.month).padStart(2, '0')}-01`;
        const lastDay = new Date(budget.year || new Date().getFullYear(), budget.month || (new Date().getMonth() + 1), 0).getDate();
        const b_end_date = budget.end_date || `${budget.year}-${String(budget.month).padStart(2, '0')}-${lastDay}`;

        const { data: transactions, error: trxError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', req.user.id)
            .eq('type', 'expense')
            .eq('expense_category_id', budget.expense_category_id)
            .gte('transactions_date', b_start_date)
            .lte('transactions_date', b_end_date);
            
        if (trxError) throw trxError;

        const used = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

        res.json({
            success: true,
            data: {
                ...budget,
                start_date: b_start_date,
                end_date: b_end_date,
                category_name: budget.expense_categories?.name || 'Unknown',
                used_amount: used,
                remaining: Math.max(0, budget.amount - used),
                usage_percentage: Math.round((used / Math.max(1, budget.amount)) * 100)
            }
        });
    } catch (error) {
        console.error('Get budget detail error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail budget.' });
    }
});

// ============================================
// POST /api/budgets — Buat budget baru
// ============================================
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { expense_category_id, limit_amount, month, year, amount } = req.body;
        
        // Handle variations of limit_amount vs amount depending on frontend
        const budgetAmount = limit_amount || amount;

        if (!expense_category_id || !budgetAmount) {
            return res.status(400).json({ success: false, message: 'Kategori pengeluaran dan limit wajib diisi.' });
        }

        if (parseFloat(budgetAmount) <= 0) {
            return res.status(400).json({ success: false, message: 'Limit harus lebih dari 0.' });
        }
        
        const b_month = month || new Date().getMonth() + 1;
        const b_year = year || new Date().getFullYear();

        // Cek duplikat
        const { data: existing, error: checkError } = await supabase
            .from('budgets')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('expense_category_id', expense_category_id)
            .eq('month', b_month)
            .eq('year', b_year)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Budget untuk kategori dan periode ini sudah ada.' });
        }

        const newBudget = {
            id: generateId(),
            user_id: req.user.id,
            expense_category_id,
            amount: parseFloat(budgetAmount),
            month: b_month,
            year: b_year,
            created_at: now(),
            update_at: now()
        };

        const { error: insertError } = await supabase
            .from('budgets')
            .insert([newBudget]);

        if (insertError) throw insertError;

        res.status(201).json({
            success: true,
            message: 'Budget berhasil dibuat.',
            data: newBudget
        });
    } catch (error) {
        console.error('Create budget error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal membuat budget.' });
    }
});

// ============================================
// PUT /api/budgets/:id — Update budget
// ============================================
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: existing, error: checkError } = await supabase
            .from('budgets')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ success: false, message: 'Budget tidak ditemukan.' });
        }

        const { expense_category_id, limit_amount, amount, month, year } = req.body;
        const budgetAmount = limit_amount || amount;

        let updates = { update_at: now() };
        if (expense_category_id) updates.expense_category_id = expense_category_id;
        if (budgetAmount !== undefined) updates.amount = parseFloat(budgetAmount);
        if (month) updates.month = month;
        if (year) updates.year = year;

        const { data: updated, error: updateError } = await supabase
            .from('budgets')
            .update(updates)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Budget berhasil diperbarui.',
            data: updated
        });
    } catch (error) {
        console.error('Update budget error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal memperbarui budget.' });
    }
});

// ============================================
// DELETE /api/budgets/:id — Hapus budget
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: existing, error: checkError } = await supabase
            .from('budgets')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ success: false, message: 'Budget tidak ditemukan.' });
        }

        const { error: deleteError } = await supabase
            .from('budgets')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Budget berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete budget error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghapus budget.' });
    }
});

module.exports = router;
