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
            // Mencoba memanggil Hugging Face Space API (Gradio format)
            // Jika Anda menggunakan custom FastAPI, ubah payload dan URL sesuai kebutuhan.
            const url = process.env.AI_SERVICE_URL || 'https://pxy18-ai-v4.hf.space/run/predict';
            const headers = process.env.HUGGINGFACE_API_TOKEN 
                ? { 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` } 
                : {};

            const aiResponse = await axios.post(url, {
                data: [deskripsi] // Payload standar Gradio
            }, { 
                headers,
                timeout: 10000 // Beri waktu ekstra untuk API eksternal
            });

            // Gradio merespons di dalam array 'data'
            const resultData = aiResponse.data.data[0]; 

            res.json({
                success: true,
                data: {
                    deskripsi: deskripsi,
                    kategori_ai: resultData.category || resultData.kategori_ai || classifyLocal(deskripsi),
                    akurasi: resultData.confidence || resultData.akurasi || 0.75,
                    source: 'huggingface_model'
                }
            });
        } catch (apiError) {
            console.error('Hugging Face API error, fallback to local:', apiError.message);
            const kategori = classifyLocal(deskripsi);
            res.json({
                success: true,
                data: { deskripsi, kategori_ai: kategori, akurasi: 0.75, source: 'fallback_rules' },
                message: 'AI Service tidak aktif atau error. Menggunakan klasifikasi lokal.'
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
            .select('amount, expense_category_id, expense_categories(name)')
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
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const remaining = Math.max(1, daysInMonth - today.getDate());

        const expenseByCat = {};
        transactions.forEach(t => {
            const catId = t.expense_category_id || 'unknown';
            if (!expenseByCat[catId]) {
                expenseByCat[catId] = { spent: 0, name: t.expense_categories?.name || 'Lainnya' };
            }
            expenseByCat[catId].spent += Number(t.amount || 0);
        });

        let variableRemainingBudget = 0;
        userBudgets.forEach(b => {
            const catId = b.expense_category_id;
            const catName = (b.expense_categories?.name || '').toLowerCase();
            const budgetLimit = Number(b.amount || 0);
            const spent = expenseByCat[catId] ? expenseByCat[catId].spent : 0;
            
            const isFixed = catName.includes('tagihan') || catName.includes('cicilan') || catName.includes('asuransi') || catName.includes('investasi');
            if (!isFixed) {
                variableRemainingBudget += Math.max(0, budgetLimit - spent);
            }
        });

        const safe_to_spend = totalBudget > 0 
            ? Math.max(0, Math.floor(variableRemainingBudget / remaining))
            : Math.max(0, Math.floor((totalBudget - monthlyExpenses) / remaining));

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
            .select('amount, expense_category_id, expense_categories(name)')
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

        const expenseByCat = {};
        transactions.forEach(t => {
            const catId = t.expense_category_id || 'unknown';
            if (!expenseByCat[catId]) {
                expenseByCat[catId] = { spent: 0, name: t.expense_categories?.name || 'Lainnya' };
            }
            expenseByCat[catId].spent += Number(t.amount || 0);
        });

        let totalProjected = 0;

        // 1. Budgeted categories
        userBudgets.forEach(b => {
            const catId = b.expense_category_id;
            const catName = (b.expense_categories?.name || '').toLowerCase();
            const budgetLimit = Number(b.amount || 0);
            const spent = expenseByCat[catId] ? expenseByCat[catId].spent : 0;
            
            const isFixed = catName.includes('tagihan') || catName.includes('cicilan') || catName.includes('asuransi') || catName.includes('investasi');

            if (isFixed) {
                totalProjected += Math.max(budgetLimit, spent);
            } else {
                const projectedVariable = Math.round((spent / day) * daysInMonth);
                totalProjected += Math.max(spent, projectedVariable);
            }
        });

        // 2. Unbudgeted categories
        Object.keys(expenseByCat).forEach(catId => {
            const hasBudget = userBudgets.some(b => b.expense_category_id === catId);
            if (!hasBudget) {
                const spent = expenseByCat[catId].spent;
                const catName = (expenseByCat[catId].name || '').toLowerCase();
                const isFixed = catName.includes('tagihan') || catName.includes('cicilan') || catName.includes('asuransi') || catName.includes('investasi');
                
                if (isFixed) {
                    totalProjected += spent;
                } else {
                    const projectedVariable = Math.round((spent / day) * daysInMonth);
                    totalProjected += Math.max(spent, projectedVariable);
                }
            }
        });

        const riskPercentage = Math.min(140, Math.round((totalProjected / Math.max(1, totalBudget)) * 100));

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
                projected_expense: totalProjected,
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

// ============================================
// POST /api/ai/chat
// ============================================
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, metrics } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'OpenRouter API Key belum dikonfigurasi.' });
        }

        const systemPrompt = `Kamu adalah "Monify Bot", seorang Asisten Keuangan Pribadi yang profesional, ramah, dan solutif.
Pekerjaanmu adalah membantu pengguna mengelola keuangan mereka dengan bijak, hemat, dan menghindari overbudget.
Karakter: Ramah, menggunakan sapaan akrab namun sopan (menggunakan bahasa Indonesia santai). Selalu memberikan saran praktis dan langkah nyata.

Berikut adalah kondisi keuangan pengguna saat ini:
- Total Budget: ${metrics.totalBudget ? `Rp ${metrics.totalBudget.toLocaleString('id-ID')}` : 'Belum diatur'}
- Pengeluaran Saat Ini: ${metrics.monthlyExpense ? `Rp ${metrics.monthlyExpense.toLocaleString('id-ID')}` : '0'}
- Sisa Budget: ${metrics.remainingBudget ? `Rp ${metrics.remainingBudget.toLocaleString('id-ID')}` : '0'}
- Prediksi Akhir Bulan: ${metrics.monthlyPrediction ? `Rp ${metrics.monthlyPrediction.toLocaleString('id-ID')}` : '0'}
- Safe to Spend Hari Ini: ${metrics.safeToSpendToday ? `Rp ${metrics.safeToSpendToday.toLocaleString('id-ID')}` : '0'}
- Risiko Overbudget: ${metrics.riskPercent || 0}%

Instruksi:
1. Jawablah pertanyaan pengguna secara singkat, padat, dan jelas.
2. Jika pengguna meminta saran, berikan 1-2 poin langkah nyata berdasarkan metrik keuangan mereka.
3. Jangan pernah memberikan saran investasi berisiko tinggi.
4. Jangan menjawab pertanyaan yang sama sekali tidak berhubungan dengan keuangan atau aplikasi Monify.
`;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
            max_tokens: 1500,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
        res.json({ success: true, data: { reply } });

    } catch (error) {
        console.error('Chat AI error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Gagal menghubungi AI Chat Service.' });
    }
});

module.exports = router;
