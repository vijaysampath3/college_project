const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
    env[key] = val;
  }
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const userId = 'a2efd9d6-1c43-40cb-9b8a-780abacf27a0';
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*, schools(*)')
    .eq('user_id', userId)
    .single();
  console.log('STUDENT_PROFILE:', JSON.stringify(data, null, 2), error);
}
run();
