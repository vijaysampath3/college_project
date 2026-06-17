-- Enable moddatetime extension
CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;

-- Create Parent Profiles Table
CREATE TABLE IF NOT EXISTS public.parent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Nullable for now, will link to auth.users in the future
    parent_id TEXT NOT NULL UNIQUE,
    parent_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    occupation TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    created_by_teacher UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Student Parent Relationships Table
CREATE TABLE IF NOT EXISTS public.student_parent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
    parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE RESTRICT,
    relationship TEXT NOT NULL, -- e.g. Father, Mother, Guardian, Grandparent
    linked_by_teacher UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, parent_id)
);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_parent_profiles
    BEFORE UPDATE ON public.parent_profiles
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_student_parent_relationships
    BEFORE UPDATE ON public.student_parent_relationships
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_parent_profiles_status ON public.parent_profiles(status);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_parent_id ON public.parent_profiles(parent_id);

CREATE INDEX IF NOT EXISTS idx_student_parent_rel_student_id ON public.student_parent_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parent_rel_parent_id ON public.student_parent_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_parent_rel_relationship ON public.student_parent_relationships(relationship);
