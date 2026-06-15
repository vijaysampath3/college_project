import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vcfhbgktxhfkapdqawpo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmhiZ2t0eGhma2FwZHFhd3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDQ1MTUsImV4cCI6MjA5NjgyMDUxNX0.MiwbPCmx2kWw8Kso5HrRBbPnRo1Csnv0pxs8WdVjxaU';
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
