-- Add detailed analytics columns to student_activity_attempts
ALTER TABLE public.student_activity_attempts ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.student_activity_attempts ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.student_activity_attempts ADD COLUMN IF NOT EXISTS activity_type TEXT;

-- Update existing records if any
UPDATE public.student_activity_attempts saa
SET 
  difficulty = la.difficulty,
  activity_type = la.activity_type
FROM public.learning_activities la
WHERE saa.activity_code = la.activity_code
AND (saa.difficulty IS NULL OR saa.activity_type IS NULL);

-- Add Memory and Executive Function activities
INSERT INTO public.learning_activities (activity_code, category, title, description, difficulty, activity_level, estimated_minutes, xp_reward, activity_type) VALUES
('MEMORY_SEQ_001', 'memory', 'Sequence Memory', 'Remember and repeat the sequence of flashing lights or numbers.', 'Medium', 1, 10, 20, 'sequence_memory'),
('EXEC_SORT_001', 'executive_function', 'Rule Switch Sorting', 'Sort objects but follow changing rules (e.g. by color, then by shape).', 'Hard', 1, 15, 30, 'rule_switch')
ON CONFLICT (activity_code) DO NOTHING;
