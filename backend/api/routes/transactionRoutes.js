const express = require('express');
const { generateId, now } = require('../data/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// GET /api/transactions — List transaksi user
// ============================================
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, category_id, start_date, end_date, limit } = req.query;

        let query = supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('user_id', req.user.id)
            .order('transactions_date', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        if (category_id) {
            query = query.or(`income_category_id.eq.${category_id},expense_category_id.eq.${category_id}`);
        }

        if (start_date) {
            query = query.gte('transactions_date', start_date);
        }

        if (end_date) {
            query = query.lte('transactions_date', end_date);
        }

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data: transactions, error } = await query;

        if (error) throw error;

        // Enrich category_name
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
        console.error('Get transactions error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi.' });
    }
});

// ============================================
// GET /api/transactions/:id — Detail transaksi
// ============================================
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select(`
                *,
                income_categories (name),
                expense_categories (name)
            `)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !transaction) {
            return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
        }

        const enriched = {
            ...transaction,
            category_name: transaction.type === 'income'
                ? (transaction.income_categories?.name || 'Pemasukan')
                : (transaction.expense_categories?.name || 'Lainnya')
        };

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error('Get transaction detail error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail transaksi.' });
    }
});

// ============================================
// POST /api/transactions — Tambah transaksi
// ============================================
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            type,
            amount,
            description,
            transactions_date,
            income_category_id,
            expense_category_id,
            category_method
        } = req.body;

        if (!type || !amount || !description) {
            return res.status(400).json({ success: false, message: 'Tipe, nominal, dan deskripsi wajib diisi.' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Tipe harus income atau expense.' });
        }

        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Nominal harus lebih dari 0.' });
        }

        const newTransaction = {
            id: generateId(),
            user_id: req.user.id,
            income_category_id: type === 'income' ? (income_category_id || null) : null,
            expense_category_id: type === 'expense' ? (expense_category_id || null) : null,
            type,
            amount: parseFloat(amount),
            description: description.trim(),
            transactions_date: transactions_date || new Date().toISOString().slice(0, 10),
            category_method: category_method || 'manual',
            created_at: now(),
            update_at: now()
        };

        const { error: insertError } = await supabase
            .from('transactions')
            .insert([newTransaction]);

        if (insertError) throw insertError;

        res.status(201).json({
            success: true,
            message: 'Transaksi berhasil ditambahkan.',
            data: newTransaction
        });
    } catch (error) {
        console.error('Create transaction error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menambahkan transaksi.' });
    }
});

// ============================================
// PUT /api/transactions/:id — Update transaksi
// ============================================
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const {
            type,
            amount,
            description,
            transactions_date,
            income_category_id,
            expense_category_id,
            category_method
        } = req.body;

        // Cek existing
        const { data: existing, error: checkError } = await supabase
            .from('transactions')
            .select('id, type')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
        }

        let updates = { update_at: now() };
        
        let newType = type || existing.type;

        if (type && ['income', 'expense'].includes(type)) {
            updates.type = type;
            if (type === 'income') {
                updates.expense_category_id = null;
                if (income_category_id) updates.income_category_id = income_category_id;
            } else {
                updates.income_category_id = null;
                if (expense_category_id) updates.expense_category_id = expense_category_id;
            }
        } else {
            if (income_category_id !== undefined && newType === 'income') updates.income_category_id = income_category_id;
            if (expense_category_id !== undefined && newType === 'expense') updates.expense_category_id = expense_category_id;
        }

        if (amount !== undefined) updates.amount = parseFloat(amount);
        if (description) updates.description = description.trim();
        if (transactions_date) updates.transactions_date = transactions_date;
        if (category_method) updates.category_method = category_method;

        const { data: updated, error: updateError } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Transaksi berhasil diperbarui.',
            data: updated
        });
    } catch (error) {
        console.error('Update transaction error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal memperbarui transaksi.' });
    }
});

// ============================================
// DELETE /api/transactions/:id — Hapus transaksi
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { data: existing, error: checkError } = await supabase
            .from('transactions')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
        }

        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Transaksi berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete transaction error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghapus transaksi.' });
    }
});

module.exports = router;
