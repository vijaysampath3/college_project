-- Add is_primary_parent column to student_parent_relationships
ALTER TABLE public.student_parent_relationships 
ADD COLUMN IF NOT EXISTS is_primary_parent BOOLEAN DEFAULT false;
