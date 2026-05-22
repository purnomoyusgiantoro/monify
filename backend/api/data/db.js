const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

/**
 * Pastikan file JSON ada. Jika belum, buat dengan default value.
 */
function ensureFile(filename, defaultData = []) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
    return filePath;
}

/**
 * Baca data dari JSON file.
 */
function readJSON(filename, defaultData = []) {
    try {
        const filePath = ensureFile(filename, defaultData);
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return Array.isArray(defaultData) ? [] : defaultData;
    }
}

/**
 * Tulis data ke JSON file.
 */
function writeJSON(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Generate unique ID (timestamp-based + random suffix).
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Get current ISO timestamp.
 */
function now() {
    return new Date().toISOString();
}

/**
 * Cari item berdasarkan ID di dalam array.
 */
function findById(items, id) {
    return items.find(item => item.id === id);
}

/**
 * Filter items berdasarkan user_id.
 */
function filterByUser(items, userId) {
    return items.filter(item => item.user_id === userId);
}

module.exports = {
    readJSON,
    writeJSON,
    generateId,
    now,
    findById,
    filterByUser
};
