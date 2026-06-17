-- Phase 11B.2 - Teacher Management System

CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Will be linked properly in Phase 11C
    school_id UUID NOT NULL REFERENCES schools(id),
    teacher_id TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL UNIQUE,
    teacher_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    department TEXT,
    designation TEXT,
    qualification TEXT,
    joining_date DATE,
    profile_photo_url TEXT,
    temp_password TEXT, -- Storing temporarily until authentication provisioning in Phase 11C
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_teachers_school ON teacher_profiles(school_id);
CREATE INDEX idx_teachers_status ON teacher_profiles(status);
CREATE INDEX idx_teachers_teacher_id ON teacher_profiles(teacher_id);
CREATE INDEX idx_teachers_employee_id ON teacher_profiles(employee_id);

-- RLS Policies
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Admins (Service Role or Users with Admin role in meta data) can do everything
CREATE POLICY "Admins have full access to teacher_profiles"
    ON teacher_profiles FOR ALL
    USING (
        auth.jwt()->>'role' = 'service_role' 
        OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
    );
