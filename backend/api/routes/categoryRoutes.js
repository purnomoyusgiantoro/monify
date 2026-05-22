const express = require('express');
const { generateId, now } = require('../data/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// GET /api/categories/income — List kategori pemasukan
// ============================================
router.get('/income', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('income_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get income categories error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori pemasukan.' });
    }
});

// ============================================
// GET /api/categories/expense — List kategori pengeluaran
// ============================================
router.get('/expense', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('expense_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get expense categories error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori pengeluaran.' });
    }
});

// ============================================
// POST /api/categories/income — Tambah kategori pemasukan
// ============================================
router.post('/income', authMiddleware, async (req, res) => {
    try {
        const { name, icon, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
        }

        // Cek duplikat
        const { data: existing, error: checkError } = await supabase
            .from('income_categories')
            .select('id')
            .ilike('name', name.trim())
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Kategori pemasukan sudah ada.' });
        }

        const newCategory = {
            id: generateId(),
            name: name.trim(),
            icon: icon || 'wallet',
            color: color || '#10B981',
            created_at: now(),
            update_at: now()
        };

        const { error: insertError } = await supabase
            .from('income_categories')
            .insert([newCategory]);

        if (insertError) throw insertError;

        res.status(201).json({
            success: true,
            message: 'Kategori pemasukan berhasil ditambahkan.',
            data: newCategory
        });
    } catch (error) {
        console.error('Create income category error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menambahkan kategori.' });
    }
});

// ============================================
// POST /api/categories/expense — Tambah kategori pengeluaran
// ============================================
router.post('/expense', authMiddleware, async (req, res) => {
    try {
        const { name, icon, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
        }

        // Cek duplikat
        const { data: existing, error: checkError } = await supabase
            .from('expense_categories')
            .select('id')
            .ilike('name', name.trim())
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Kategori pengeluaran sudah ada.' });
        }

        const newCategory = {
            id: generateId(),
            name: name.trim(),
            icon: icon || 'coffee',
            color: color || '#EF4444',
            created_at: now(),
            update_at: now()
        };

        const { error: insertError } = await supabase
            .from('expense_categories')
            .insert([newCategory]);

        if (insertError) throw insertError;

        res.status(201).json({
            success: true,
            message: 'Kategori pengeluaran berhasil ditambahkan.',
            data: newCategory
        });
    } catch (error) {
        console.error('Create expense category error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menambahkan kategori.' });
    }
});

// ============================================
// DELETE /api/categories/income/:id — Hapus kategori pemasukan
// ============================================
router.delete('/income/:id', authMiddleware, async (req, res) => {
    try {
        const { data: category, error: fetchError } = await supabase
            .from('income_categories')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !category) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        }

        const { error: deleteError } = await supabase
            .from('income_categories')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Kategori pemasukan berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete income category error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghapus kategori.' });
    }
});

// ============================================
// DELETE /api/categories/expense/:id — Hapus kategori pengeluaran
// ============================================
router.delete('/expense/:id', authMiddleware, async (req, res) => {
    try {
        const { data: category, error: fetchError } = await supabase
            .from('expense_categories')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !category) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        }

        const { error: deleteError } = await supabase
            .from('expense_categories')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Kategori pengeluaran berhasil dihapus.'
        });
    } catch (error) {
        console.error('Delete expense category error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghapus kategori.' });
    }
});

module.exports = router;
