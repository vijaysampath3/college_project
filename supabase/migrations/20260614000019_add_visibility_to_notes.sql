-- Add visibility column to teacher_student_notes table
ALTER TABLE public.teacher_student_notes 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'teacher_only' CHECK (visibility IN ('teacher_only', 'parent_visible', 'admin_visible'));
