-- Add session_data to assessment_sessions
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS session_data JSONB DEFAULT '{}'::jsonb;
