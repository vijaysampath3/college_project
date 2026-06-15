require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Querying assessment_results...');
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No data found in assessment_results table.');
  } else {
    console.log(`Found ${data.length} recent results. Latest result:`);
    console.log(JSON.stringify(data[0], null, 2));
  }
}

checkDatabase();
