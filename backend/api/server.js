const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'MONIFY Backend is running!',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            transactions: '/api/transactions',
            categories: '/api/categories',
            budgets: '/api/budgets',
            ai: '/api/ai',
            dashboard: '/api/dashboard',
            reports: '/api/reports'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server.'
    });
});

// Start server (hanya jalan di lokal, tidak di Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ MONIFY Backend v2.0 berjalan di http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        console.log('📦 Endpoints:');
        console.log('   - POST /api/auth/register');
        console.log('   - POST /api/auth/login');
        console.log('   - GET  /api/transactions');
        console.log('   - GET  /api/categories/income');
        console.log('   - GET  /api/categories/expense');
        console.log('   - GET  /api/budgets');
        console.log('   - POST /api/ai/predict');
        console.log('   - GET  /api/dashboard/summary');
        console.log('   - GET  /api/reports/monthly');
    });
}

// WAJIB UNTUK VERCEL: Export app agar bisa dibaca sebagai Serverless Function
module.exports = app;
