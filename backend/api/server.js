const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'MONIFY Backend is running!' });
});

// Routes
app.use('/api/transactions', transactionRoutes);

// Proxy endpoint ke AI Service (FastAPI)
app.post('/api/predict', async (req, res) => {
    try {
        const axios = require('axios');
        const aiResponse = await axios.post('http://localhost:8000/predict-category', {
            deskripsi: req.body.deskripsi,
            jumlah: req.body.jumlah,
        });
        res.json(aiResponse.data);
    } catch (error) {
        console.error('AI Service error:', error.message);
        res.json({
            message: 'AI Service belum aktif. Menggunakan dummy response.',
            deskripsi: req.body.deskripsi,
            kategori_ai: 'Belum Dikategorikan',
            akurasi: 0,
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ MONIFY Backend berjalan di http://localhost:${PORT}`);
});
