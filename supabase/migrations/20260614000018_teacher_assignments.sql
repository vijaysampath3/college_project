-- Create Teacher Assigned Activities Table
CREATE TABLE IF NOT EXISTS public.teacher_assigned_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    activity_code TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    activity_category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    teacher_note TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, overdue
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Teacher Assigned Assessments Table
CREATE TABLE IF NOT EXISTS public.teacher_assigned_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    assessment_title TEXT NOT NULL,
    reason TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal',
    teacher_note TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, overdue
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Student Notifications Table
CREATE TABLE IF NOT EXISTS public.student_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'assignment', 'alert', 'system'
    source_type TEXT, -- e.g., 'teacher_assigned_activity', 'teacher_assigned_assessment'
    source_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_teacher_assigned_activities
    BEFORE UPDATE ON public.teacher_assigned_activities
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_teacher_assigned_assessments
    BEFORE UPDATE ON public.teacher_assigned_assessments
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Enable RLS
ALTER TABLE public.teacher_assigned_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assigned_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for teacher_assigned_activities
CREATE POLICY "Teachers can view activities they assigned" 
    ON public.teacher_assigned_activities FOR SELECT 
    USING (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Teachers can insert activities they assign" 
    ON public.teacher_assigned_activities FOR INSERT 
    WITH CHECK (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Teachers can update activities they assigned" 
    ON public.teacher_assigned_activities FOR UPDATE 
    USING (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can view their assigned activities" 
    ON public.teacher_assigned_activities FOR SELECT 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can update their assigned activities (for completion)" 
    ON public.teacher_assigned_activities FOR UPDATE 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

-- Policies for teacher_assigned_assessments
CREATE POLICY "Teachers can view assessments they assigned" 
    ON public.teacher_assigned_assessments FOR SELECT 
    USING (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Teachers can insert assessments they assign" 
    ON public.teacher_assigned_assessments FOR INSERT 
    WITH CHECK (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Teachers can update assessments they assigned" 
    ON public.teacher_assigned_assessments FOR UPDATE 
    USING (
        teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can view their assigned assessments" 
    ON public.teacher_assigned_assessments FOR SELECT 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can update their assigned assessments (for completion)" 
    ON public.teacher_assigned_assessments FOR UPDATE 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

-- Policies for student_notifications
CREATE POLICY "Teachers can view notifications for their students" 
    ON public.student_notifications FOR SELECT 
    USING (
        student_id IN (
            SELECT student_id FROM public.teacher_student_assignments 
            WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Teachers can insert notifications" 
    ON public.student_notifications FOR INSERT 
    WITH CHECK (
        student_id IN (
            SELECT student_id FROM public.teacher_student_assignments 
            WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can view their notifications" 
    ON public.student_notifications FOR SELECT 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Students can update their notifications (mark as read)" 
    ON public.student_notifications FOR UPDATE 
    USING (
        student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
    );

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_assigned_activities_teacher ON public.teacher_assigned_activities(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assigned_activities_student ON public.teacher_assigned_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assigned_assessments_teacher ON public.teacher_assigned_assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assigned_assessments_student ON public.teacher_assigned_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notifications_student ON public.student_notifications(student_id);
