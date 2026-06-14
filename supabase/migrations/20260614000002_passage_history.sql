-- Alter assessment_sessions to add passage metadata
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS passage_id TEXT;
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS passage_category TEXT;
ALTER TABLE public.assessment_sessions ADD COLUMN IF NOT EXISTS passage_difficulty TEXT;

-- Create Student Passage History Table
CREATE TABLE IF NOT EXISTS public.student_passage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_id TEXT NOT NULL,
  category TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, passage_id)
);

-- Enable RLS
ALTER TABLE public.student_passage_history ENABLE ROW LEVEL SECURITY;

-- Create Policies for Students
CREATE POLICY "Users can view their own passage history" ON public.student_passage_history
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own passage history" ON public.student_passage_history
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own passage history" ON public.student_passage_history
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own passage history" ON public.student_passage_history
  FOR DELETE USING (auth.uid() = student_id);

-- Create Index for performance
CREATE INDEX idx_passage_history_student_id ON public.student_passage_history(student_id);
