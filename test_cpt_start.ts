import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStartAssessment() {
  // Get any user
  const { data: users, error: userError } = await supabase.from('profiles').select('id, school_name').limit(1);
  if (userError || !users || users.length === 0) {
    console.error("No users found", userError);
    return;
  }
  
  const userId = users[0].id;
  const schoolName = users[0].school_name;
  
  console.log("Testing with user:", userId);
  
  // 1. Upsert progress
  const { error: progressError } = await supabase
    .from('assessment_progress')
    .upsert({
      student_id: userId,
      assessment_type: 'cpt',
      status: 'in_progress',
      school_name: schoolName,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id, assessment_type' });

  if (progressError) {
    console.error("Progress Error:", progressError);
    return;
  }

  // 2. Determine attempt number
  const { count } = await supabase
    .from('assessment_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', userId)
    .eq('assessment_type', 'cpt');

  const attemptNumber = (count || 0) + 1;

  // 3. Create session
  const { data: sessionData, error: sessionError } = await supabase
    .from('assessment_sessions')
    .insert({
      student_id: userId,
      assessment_type: 'cpt',
      status: 'in_progress',
      attempt_number: attemptNumber,
      school_name: schoolName,
      passage_id: undefined,
      passage_category: undefined,
      passage_difficulty: undefined,
    })
    .select('id, attempt_number')
    .single();

  if (sessionError) {
    console.error("Session Error:", sessionError);
  } else {
    console.log("Success! Session ID:", sessionData.id);
  }
}

testStartAssessment();
