const express = require('express');
const axios = require('axios');
const { generateId, now } = require('../data/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ============================================
// POST /api/ai/classify — Klasifikasi kategori dari deskripsi
// ============================================
router.post('/classify', authMiddleware, async (req, res) => {
    try {
        const { deskripsi, jumlah } = req.body;

        if (!deskripsi) {
            return res.status(400).json({ success: false, message: 'Deskripsi transaksi wajib diisi.' });
        }

        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-category`, {
                deskripsi,
                jumlah: jumlah || 0
            }, { timeout: 5000 });

            res.json({
                success: true,
                data: {
                    deskripsi: aiResponse.data.deskripsi,
                    kategori_ai: aiResponse.data.kategori_ai,
                    akurasi: aiResponse.data.akurasi,
                    source: 'ai_model'
                }
            });
        } catch {
            const kategori = classifyLocal(deskripsi);
            res.json({
                success: true,
                data: { deskripsi, kategori_ai: kategori, akurasi: 0.75, source: 'fallback_rules' },
                message: 'AI Service tidak aktif. Menggunakan klasifikasi lokal.'
            });
        }
    } catch (error) {
        console.error('Classify error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengklasifikasikan transaksi.' });
    }
});

// ============================================
// POST /api/ai/predict — Generate prediksi + simpan
// ============================================
router.post('/predict', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthNum = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Ambil transaksi bulan ini
        const { data: monthTransactions, error: trxError } = await supabase
            .from('transactions')
            .select('amount, type, expense_category_id')
            .eq('user_id', req.user.id)
            .gte('transactions_date', `${currentMonth}-01`)
            .lte('transactions_date', `${currentMonth}-31`);

        if (trxError) throw trxError;

        // Ambil budget bulan ini
        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('amount')
            .eq('user_id', req.user.id)
            .eq('month', currentMonthNum)
            .eq('year', currentYear);

        if (budgetError) throw budgetError;

        const monthlyExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const day = Math.max(1, today.getDate());
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const remaining = Math.max(1, daysInMonth - day);

        const predicted_monthly_expense = Math.round((monthlyExpenses / day) * daysInMonth);
        const totalBudget = userBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

        const riskPercentage = Math.min(140, Math.round((predicted_monthly_expense / Math.max(1, totalBudget)) * 100));
        let overbudget_status;
        if (riskPercentage >= 100) overbudget_status = 'over_budget';
        else if (riskPercentage >= 80) overbudget_status = 'warning';
        else overbudget_status = 'safe';

        const safe_to_spend_today = Math.max(0, Math.floor((totalBudget - monthlyExpenses) / remaining));

        const recommendation = generateRecommendation(overbudget_status, riskPercentage, safe_to_spend_today, monthTransactions, currentMonth);

        const predictionData = {
            predicted_monthly_expense,
            safe_to_spend_today,
            overbudget_status,
            recommendation,
            risk_percentage: riskPercentage,
            total_budget: totalBudget,
            current_expense: monthlyExpenses,
            days_remaining: remaining
        };

        const newPrediction = {
            id: generateId(),
            user_id: req.user.id,
            prediction_data: predictionData,
            created_at: now()
        };

        const { error: insertError } = await supabase
            .from('ai_predictions')
            .insert([newPrediction]);

        if (insertError) throw insertError;

        res.json({
            success: true,
            message: 'Prediksi AI berhasil dibuat.',
            data: {
                id: newPrediction.id,
                ...predictionData,
                created_at: newPrediction.created_at
            }
        });
    } catch (error) {
        console.error('Generate prediction error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal membuat prediksi.' });
    }
});

// ============================================
// GET /api/ai/predictions — Histori prediksi
// ============================================
router.get('/predictions', authMiddleware, async (req, res) => {
    try {
        const { limit } = req.query;
        let query = supabase
            .from('ai_predictions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (limit) query = query.limit(parseInt(limit));

        const { data: predictions, error } = await query;
        
        if (error) throw error;

        // Flatten data structure for response
        const formatted = predictions.map(p => ({
            id: p.id,
            user_id: p.user_id,
            ...p.prediction_data,
            created_at: p.created_at
        }));

        res.json({
            success: true,
            data: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error('Get predictions error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil histori prediksi.' });
    }
});

// ============================================
// GET /api/ai/safe-to-spend
// ============================================
router.get('/safe-to-spend', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthNum = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const { data: transactions, error: trxError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', req.user.id)
            .eq('type', 'expense')
            .gte('transactions_date', `${currentMonth}-01`)
            .lte('transactions_date', `${currentMonth}-31`);

        if (trxError) throw trxError;

        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('amount')
            .eq('user_id', req.user.id)
            .eq('month', currentMonthNum)
            .eq('year', currentYear);

        if (budgetError) throw budgetError;

        const monthlyExpenses = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const totalBudget = userBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const remaining = Math.max(1, daysInMonth - today.getDate());

        const safe_to_spend = Math.max(0, Math.floor((totalBudget - monthlyExpenses) / remaining));

        res.json({
            success: true,
            data: {
                safe_to_spend_today: safe_to_spend,
                total_budget: totalBudget,
                current_expense: monthlyExpenses,
                days_remaining: remaining
            }
        });
    } catch (error) {
        console.error('Safe to spend error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghitung safe-to-spend.' });
    }
});

// ============================================
// GET /api/ai/overbudget
// ============================================
router.get('/overbudget', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthNum = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const { data: transactions, error: trxError } = await supabase
            .from('transactions')
            .select('amount, expense_category_id')
            .eq('user_id', req.user.id)
            .eq('type', 'expense')
            .gte('transactions_date', `${currentMonth}-01`)
            .lte('transactions_date', `${currentMonth}-31`);

        if (trxError) throw trxError;

        const { data: userBudgets, error: budgetError } = await supabase
            .from('budgets')
            .select('amount, expense_category_id, expense_categories(name)')
            .eq('user_id', req.user.id)
            .eq('month', currentMonthNum)
            .eq('year', currentYear);

        if (budgetError) throw budgetError;

        const monthlyExpenses = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const totalBudget = userBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        
        const day = Math.max(1, today.getDate());
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const projected = Math.round((monthlyExpenses / day) * daysInMonth);
        const riskPercentage = Math.min(140, Math.round((projected / Math.max(1, totalBudget)) * 100));

        let status;
        if (riskPercentage >= 100) status = 'over_budget';
        else if (riskPercentage >= 80) status = 'warning';
        else status = 'safe';

        const categoryBreakdown = userBudgets.map(b => {
            const catExpense = transactions
                .filter(t => t.expense_category_id === b.expense_category_id)
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const limit = Number(b.amount);
            return {
                category_id: b.expense_category_id,
                category_name: b.expense_categories?.name || 'Unknown',
                limit,
                used: catExpense,
                percentage: Math.round((catExpense / Math.max(1, limit)) * 100)
            };
        }).sort((a, b) => b.percentage - a.percentage);

        res.json({
            success: true,
            data: {
                risk_percentage: riskPercentage || 0,
                status,
                projected_expense: projected,
                total_budget: totalBudget,
                current_expense: monthlyExpenses,
                category_breakdown: categoryBreakdown
            }
        });
    } catch (error) {
        console.error('Overbudget prediction error:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menghitung risiko over budget.' });
    }
});

function classifyLocal(text) {
    const t = text.toLowerCase();
    if (/makan|ayam|kopi|nasi|bakso|mie|jajan|minum|food|resto|geprek|warung/.test(t)) return 'Makanan';
    if (/gojek|grab|bensin|parkir|ojek|bus|kereta|transport|angkot/.test(t)) return 'Transport';
    if (/baju|skincare|sepatu|belanja|marketplace|shopee|tokopedia|barang|beli|toko|mall/.test(t)) return 'Belanja';
    if (/netflix|game|spotify|bioskop|hiburan|nongkrong|langganan/.test(t)) return 'Hiburan';
    if (/kuota|internet|wifi|pulsa|indihome|paket data|listrik|air/.test(t)) return 'Internet';
    if (/obat|dokter|rumah sakit|apotek|kesehatan/.test(t)) return 'Kesehatan';
    if (/kursus|buku|kuliah|sekolah|pendidikan/.test(t)) return 'Pendidikan';
    return 'Lainnya';
}

function generateRecommendation(status, risk, safe, monthExpenses, currentMonth) {
    const byCategory = {};
    monthExpenses.forEach(t => {
        if(t.type === 'expense' && t.expense_category_id) {
            byCategory[t.expense_category_id] = (byCategory[t.expense_category_id] || 0) + Number(t.amount || 0);
        }
    });
    const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    const recommendations = [];

    if (status === 'over_budget') {
        recommendations.push('Pengeluaran diprediksi melewati budget. Segera kurangi pengeluaran non-prioritas.');
    } else if (status === 'warning') {
        recommendations.push('Hati-hati, pengeluaran mulai mendekati batas budget.');
    } else {
        recommendations.push('Pengeluaran masih dalam batas aman. Tetap pantau transaksi harian.');
    }

    if (topCat) {
        recommendations.push(`Fokus kurangi kategori pengeluaran terbesar untuk menghemat lebih banyak.`);
    }

    recommendations.push(`Safe-to-spend hari ini: Rp ${safe.toLocaleString('id-ID')}. Gunakan sebagai batas belanja harian.`);

    return recommendations.join(' ');
}

module.exports = router;
