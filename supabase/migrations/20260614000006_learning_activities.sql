-- Create learning_activities table
CREATE TABLE IF NOT EXISTS public.learning_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,  -- Easy, Medium, Hard
    activity_level INTEGER NOT NULL DEFAULT 1,
    prerequisite_activity_code TEXT REFERENCES public.learning_activities(activity_code),
    estimated_minutes INTEGER NOT NULL DEFAULT 10,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    activity_type TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on learning_activities" ON public.learning_activities FOR SELECT USING (true);
CREATE POLICY "Allow all insert on learning_activities" ON public.learning_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on learning_activities" ON public.learning_activities FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on learning_activities" ON public.learning_activities FOR DELETE USING (true);


-- Add progress tracking to student_recommendations
ALTER TABLE public.student_recommendations ADD COLUMN IF NOT EXISTS target_count INTEGER DEFAULT 1;
ALTER TABLE public.student_recommendations ADD COLUMN IF NOT EXISTS completed_count INTEGER DEFAULT 0;

-- Create student_activity_attempts table
CREATE TABLE IF NOT EXISTS public.student_activity_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    activity_code TEXT NOT NULL REFERENCES public.learning_activities(activity_code),
    recommendation_id UUID REFERENCES public.student_recommendations(id),
    score NUMERIC,
    accuracy_percentage NUMERIC,
    completion_quality TEXT, -- Excellent, Good, Needs Practice
    xp_earned INTEGER DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.student_activity_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on student_activity_attempts" ON public.student_activity_attempts FOR SELECT USING (true);
CREATE POLICY "Allow all insert on student_activity_attempts" ON public.student_activity_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on student_activity_attempts" ON public.student_activity_attempts FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on student_activity_attempts" ON public.student_activity_attempts FOR DELETE USING (true);


-- Seed Initial Activities
INSERT INTO public.learning_activities (activity_code, category, title, description, difficulty, activity_level, estimated_minutes, xp_reward, activity_type) VALUES
-- Reading
('READ_FLUENCY_001', 'reading', 'Timed Reading Practice', 'Read aloud for speed and accuracy.', 'Easy', 1, 10, 10, 'timed_reading'),
('READ_FLUENCY_002', 'reading', 'Repeated Reading Exercise', 'Read the same passage 3 times to build fluency.', 'Easy', 2, 15, 10, 'repeated_reading'),
('READ_FLUENCY_003', 'reading', 'Sight Word Challenge', 'Quickly identify common sight words.', 'Medium', 3, 10, 20, 'sight_words'),
('READ_FLUENCY_004', 'reading', 'Pronunciation Practice', 'Focus on articulating difficult words clearly.', 'Hard', 4, 15, 35, 'pronunciation'),
('READ_ADV_001', 'reading', 'Advanced Vocabulary Builder', 'Challenge yourself with higher-grade reading material.', 'Hard', 5, 20, 35, 'advanced_reading'),

-- Comprehension
('COMP_MAIN_001', 'comprehension', 'Main Idea Practice', 'Identify the core topic of short paragraphs.', 'Easy', 1, 15, 10, 'main_idea'),
('COMP_INFERENCE_001', 'comprehension', 'Inference Challenge', 'Draw logical conclusions from given text.', 'Medium', 2, 15, 20, 'inference'),
('COMP_VOCAB_001', 'comprehension', 'Vocabulary Builder', 'Match words with their contextual meanings.', 'Easy', 1, 10, 10, 'vocab_match'),
('COMP_CRITICAL_001', 'comprehension', 'Critical Thinking Questions', 'Analyze and evaluate character motivations.', 'Hard', 3, 20, 35, 'critical_thinking'),

-- Attention & Focus
('ATTENTION_FOCUS_001', 'focus', 'Focus Sprint', '15-minute focused work burst with strict rules.', 'Medium', 1, 15, 20, 'focus_sprint'),
('ATTENTION_VISUAL_001', 'attention', 'Visual Search Challenge', 'Find specific targets among distractors.', 'Medium', 1, 10, 20, 'visual_search'),
('ATTENTION_SCAN_001', 'attention', 'Rapid Scanning', 'Scan text quickly to find specific keywords.', 'Easy', 2, 10, 10, 'rapid_scan'),
('FOCUS_TRACKING_001', 'focus', 'Continuous Tracking', 'Follow a moving target with your eyes without breaking focus.', 'Medium', 2, 5, 20, 'continuous_tracking'),

-- Typing
('TYPING_SPEED_001', 'typing', 'Speed Builder', 'Type common word sequences as fast as possible.', 'Easy', 1, 10, 10, 'typing_speed'),
('TYPING_ACCURACY_001', 'typing', 'Accuracy Builder', 'Focus purely on making 0 mistakes.', 'Medium', 1, 10, 20, 'typing_accuracy'),
('TYPING_PATTERN_001', 'typing', 'Letter Pattern Drill', 'Type complex letter combinations to build muscle memory.', 'Hard', 2, 15, 35, 'typing_pattern'),

-- Learning Behaviour
('BEHAVIOUR_GOALS_001', 'behaviour', 'Goal Breakdown Strategy', 'Break down a large mock-assignment into micro-tasks.', 'Medium', 1, 15, 20, 'goal_breakdown'),
('BEHAVIOUR_PATTERN_001', 'behaviour', 'Pattern Recognition', 'Identify sequences in abstract symbols.', 'Easy', 1, 10, 10, 'pattern_recognition'),
('BEHAVIOUR_PERSISTENCE_001', 'behaviour', 'Persistence Challenge', 'A difficult puzzle requiring multiple attempts to solve.', 'Hard', 2, 20, 35, 'persistence')
ON CONFLICT (activity_code) DO NOTHING;
