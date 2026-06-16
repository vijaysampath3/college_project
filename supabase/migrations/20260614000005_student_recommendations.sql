-- Create student_recommendations table
CREATE TABLE IF NOT EXISTS public.student_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    recommendation_batch_id UUID NOT NULL DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    recommendation_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    impact_score INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 10,
    activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    generated_from_report UUID REFERENCES public.student_reports(id),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.student_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies (open for development backend like the report table)
CREATE POLICY "Allow all select on recommendations" ON public.student_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow all insert on recommendations" ON public.student_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on recommendations" ON public.student_recommendations FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on recommendations" ON public.student_recommendations FOR DELETE USING (true);

-- Create recommendation_ai_messages table
CREATE TABLE IF NOT EXISTS public.recommendation_ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    recommendation_batch_id UUID NOT NULL,
    coach_message TEXT NOT NULL,
    motivation TEXT NOT NULL,
    strategy_explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recommendation_ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on ai_messages" ON public.recommendation_ai_messages FOR SELECT USING (true);
CREATE POLICY "Allow all insert on ai_messages" ON public.recommendation_ai_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on ai_messages" ON public.recommendation_ai_messages FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on ai_messages" ON public.recommendation_ai_messages FOR DELETE USING (true);
