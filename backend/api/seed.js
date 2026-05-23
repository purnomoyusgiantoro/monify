require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

const expenseCategories = [
    { name: 'Makanan', icon: 'coffee', color: '#EF4444' },
    { name: 'Transport', icon: 'car', color: '#F59E0B' },
    { name: 'Belanja', icon: 'shopping-bag', color: '#10B981' },
    { name: 'Hiburan', icon: 'film', color: '#3B82F6' },
    { name: 'Internet', icon: 'wifi', color: '#8B5CF6' },
    { name: 'Kesehatan', icon: 'heart', color: '#EC4899' },
    { name: 'Pendidikan', icon: 'book', color: '#14B8A6' },
    { name: 'Lainnya', icon: 'box', color: '#6B7280' }
];

const incomeCategories = [
    { name: 'Gaji', icon: 'dollar-sign', color: '#10B981' },
    { name: 'Bonus', icon: 'gift', color: '#3B82F6' },
    { name: 'Lainnya', icon: 'box', color: '#6B7280' }
];

async function seed() {
    console.log('Menyisipkan kategori pengeluaran...');
    for (const cat of expenseCategories) {
        await supabase.from('expense_categories').insert({
            id: generateId(),
            name: cat.name,
            icon: cat.icon,
            color: cat.color
        });
    }

    console.log('Menyisipkan kategori pemasukan...');
    for (const cat of incomeCategories) {
        await supabase.from('income_categories').insert({
            id: generateId(),
            name: cat.name,
            icon: cat.icon,
            color: cat.color
        });
    }

    console.log('Selesai! Data default berhasil ditambahkan.');
}

seed();
