require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  try {
    const { data, error } = await supabase.from('transactions').select('*').limit(1);
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success, data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}
run();
