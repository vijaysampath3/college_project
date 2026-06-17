-- Create Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Nullable for now, will link to auth.users in the future
    student_id TEXT NOT NULL UNIQUE,
    temporary_password TEXT,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    student_name TEXT NOT NULL,
    admission_number TEXT UNIQUE,
    grade TEXT,
    section TEXT,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view student_profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Public can insert student_profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Public can update student_profiles" ON public.student_profiles;

-- Create policies for student_profiles (Allow public for now until full auth is implemented)
CREATE POLICY "Public can view student_profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert student_profiles" ON public.student_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update student_profiles" ON public.student_profiles FOR UPDATE USING (true);

-- Create Teacher Student Assignments Table
CREATE TABLE IF NOT EXISTS public.teacher_student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID DEFAULT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for teacher_student_assignments
ALTER TABLE public.teacher_student_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view teacher_student_assignments" ON public.teacher_student_assignments;
DROP POLICY IF EXISTS "Public can insert teacher_student_assignments" ON public.teacher_student_assignments;
DROP POLICY IF EXISTS "Public can update teacher_student_assignments" ON public.teacher_student_assignments;

-- Create policies for teacher_student_assignments (Allow public for now until full auth is implemented)
CREATE POLICY "Public can view teacher_student_assignments" ON public.teacher_student_assignments FOR SELECT USING (true);
CREATE POLICY "Public can insert teacher_student_assignments" ON public.teacher_student_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update teacher_student_assignments" ON public.teacher_student_assignments FOR UPDATE USING (true);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_student_profiles
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_teacher_student_assignments
    BEFORE UPDATE ON public.teacher_student_assignments
    FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_student_profiles_school_id ON public.student_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON public.student_profiles(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON public.student_profiles(student_id);

CREATE INDEX IF NOT EXISTS idx_teacher_student_assignments_teacher_id ON public.teacher_student_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_assignments_student_id ON public.teacher_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_assignments_status ON public.teacher_student_assignments(status);
