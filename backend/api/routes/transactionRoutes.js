const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'transactions.json');

// Helper: Baca data dari JSON file
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Buat file & folder jika belum ada
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

// Helper: Tulis data ke JSON file
function writeData(data) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /api/transactions — Ambil semua transaksi
router.get('/', (req, res) => {
    const transactions = readData();
    res.json({ success: true, data: transactions });
});

// POST /api/transactions — Tambah transaksi baru
router.post('/', (req, res) => {
    const { deskripsi, jumlah, kategori, tipe } = req.body;

    if (!deskripsi || !jumlah) {
        return res.status(400).json({ success: false, message: 'Deskripsi dan jumlah wajib diisi.' });
    }

    const transactions = readData();
    const newTransaction = {
        id: Date.now().toString(),
        deskripsi,
        jumlah: parseFloat(jumlah),
        kategori: kategori || 'Belum Dikategorikan',
        tipe: tipe || 'pengeluaran', // 'pemasukan' | 'pengeluaran'
        tanggal: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    writeData(transactions);

    res.status(201).json({ success: true, data: newTransaction });
});

// DELETE /api/transactions/:id — Hapus transaksi
router.delete('/:id', (req, res) => {
    let transactions = readData();
    const index = transactions.findIndex(t => t.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }

    transactions.splice(index, 1);
    writeData(transactions);

    res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
});

module.exports = router;
