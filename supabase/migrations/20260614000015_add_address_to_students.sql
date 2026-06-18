-- Add missing address field to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS address TEXT;
