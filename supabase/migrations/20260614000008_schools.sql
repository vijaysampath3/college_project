-- Phase 11B.1 - School Management Foundation

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name TEXT NOT NULL,
    school_code TEXT NOT NULL UNIQUE,
    district TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    principal_name TEXT,
    logo_url TEXT,
    academic_year TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_schools_status ON schools(status);
CREATE INDEX idx_schools_code ON schools(school_code);

-- RLS Policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Admins (Service Role or Users with Admin role in meta data) can do everything
CREATE POLICY "Admins have full access to schools"
    ON schools FOR ALL
    USING (
        auth.jwt()->>'role' = 'service_role' 
        OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
    );

-- Everyone else has no access (since only Admins can manage schools)
-- Later phases can add SELECT policies for teachers/students for their own school.
