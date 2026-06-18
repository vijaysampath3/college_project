-- Create parent_home_activity_logs table for Phase P4
CREATE TABLE IF NOT EXISTS public.parent_home_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    activity_category TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    parent_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.parent_home_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Parents can view their own activity logs" ON public.parent_home_activity_logs;
CREATE POLICY "Parents can view their own activity logs"
    ON public.parent_home_activity_logs FOR SELECT
    USING (auth.uid()::text = (SELECT user_id::text FROM public.parent_profiles WHERE id::text = parent_home_activity_logs.parent_id::text));

DROP POLICY IF EXISTS "Parents can insert their own activity logs" ON public.parent_home_activity_logs;
CREATE POLICY "Parents can insert their own activity logs"
    ON public.parent_home_activity_logs FOR INSERT
    WITH CHECK (auth.uid()::text = (SELECT user_id::text FROM public.parent_profiles WHERE id::text = parent_home_activity_logs.parent_id::text));
