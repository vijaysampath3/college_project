-- Create Teacher Student Notes Table
CREATE TABLE IF NOT EXISTS public.teacher_student_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_teacher_student_notes
    BEFORE UPDATE ON public.teacher_student_notes
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Enable RLS
ALTER TABLE public.teacher_student_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Teachers can view notes they created" 
    ON public.teacher_student_notes FOR SELECT 
    USING (
        teacher_id IN (
            SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert notes they created" 
    ON public.teacher_student_notes FOR INSERT 
    WITH CHECK (
        teacher_id IN (
            SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update notes they created" 
    ON public.teacher_student_notes FOR UPDATE 
    USING (
        teacher_id IN (
            SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete notes they created" 
    ON public.teacher_student_notes FOR DELETE 
    USING (
        teacher_id IN (
            SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
        )
    );

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_student_notes_teacher_id ON public.teacher_student_notes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_notes_student_id ON public.teacher_student_notes(student_id);
