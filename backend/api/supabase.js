require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || '').trim();
console.log("SUPABASE_URL IS:", supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di environment variables.');
}

// Inisialisasi Supabase client
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = supabase;
