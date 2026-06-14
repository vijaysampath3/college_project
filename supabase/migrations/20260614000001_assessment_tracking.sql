-- Create Assessment Progress Table
CREATE TABLE IF NOT EXISTS public.assessment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  school_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, assessment_type)
);

-- Create Assessment Sessions Table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  duration_seconds INTEGER,
  school_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Assessment Results Table
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_version TEXT NOT NULL,
  result_data JSONB NOT NULL,
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.assessment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Create Policies for Students (They can access their own data)
CREATE POLICY "Users can view their own progress" ON public.assessment_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own progress" ON public.assessment_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own progress" ON public.assessment_progress
  FOR UPDATE USING (auth.uid() = student_id);


CREATE POLICY "Users can view their own sessions" ON public.assessment_sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own sessions" ON public.assessment_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own sessions" ON public.assessment_sessions
  FOR UPDATE USING (auth.uid() = student_id);


CREATE POLICY "Users can view their own results" ON public.assessment_results
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own results" ON public.assessment_results
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own results" ON public.assessment_results
  FOR UPDATE USING (auth.uid() = student_id);

-- Create Indexes for performance
CREATE INDEX idx_assessment_progress_student_id ON public.assessment_progress(student_id);
CREATE INDEX idx_assessment_sessions_student_id ON public.assessment_sessions(student_id);
CREATE INDEX idx_assessment_results_student_id ON public.assessment_results(student_id);
