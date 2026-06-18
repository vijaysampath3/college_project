-- Add missing fields to student_profiles for Teacher Student Management
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS enrollment_date DATE,
ADD COLUMN IF NOT EXISTS created_by_teacher UUID REFERENCES public.teacher_profiles(id),
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_number TEXT;
