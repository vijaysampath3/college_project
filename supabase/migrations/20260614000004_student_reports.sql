-- Create student_reports table
CREATE TABLE IF NOT EXISTS public.student_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_version INTEGER DEFAULT 1,
    readiness_score INTEGER NOT NULL,
    learning_profile TEXT NOT NULL,
    risk_analysis JSONB NOT NULL,
    ai_insights JSONB NOT NULL,
    assessment_summary JSONB NOT NULL,
    assessment_snapshot JSONB NOT NULL,
    generated_from_assessments INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.student_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own reports"
    ON public.student_reports
    FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Service role can create reports"
    ON public.student_reports
    FOR INSERT
    WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_reports_student_id ON public.student_reports(student_id);
