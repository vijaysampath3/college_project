-- Phase 11A - Adaptive Learning Path Engine Migration

-- 1. Create student_learning_paths table
CREATE TABLE IF NOT EXISTS student_learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    path_name TEXT NOT NULL,
    journey_type TEXT NOT NULL DEFAULT 'standard', -- e.g., 'starter', 'standard', 'recovery'
    primary_focus_area TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'archived'
    current_week INTEGER NOT NULL DEFAULT 1,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    generated_from_report UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create learning_path_items table
CREATE TABLE IF NOT EXISTS learning_path_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID NOT NULL REFERENCES student_learning_paths(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    activity_code TEXT NOT NULL, -- references learning_activities(activity_code) conceptually, though we don't strictly enforce foreign key to allow flexibility
    activity_title TEXT NOT NULL,
    activity_category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Easy',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_student_paths_student_id ON student_learning_paths(student_id);
CREATE INDEX idx_student_paths_status ON student_learning_paths(status);
CREATE INDEX idx_path_items_path_id ON learning_path_items(path_id);
CREATE INDEX idx_path_items_week ON learning_path_items(path_id, week_number);

-- RLS
ALTER TABLE student_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own paths"
    ON student_learning_paths FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own paths"
    ON student_learning_paths FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Service Role full access to paths"
    ON student_learning_paths FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Students can view their path items"
    ON learning_path_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM student_learning_paths
            WHERE student_learning_paths.id = learning_path_items.path_id
            AND student_learning_paths.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can update their path items"
    ON learning_path_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM student_learning_paths
            WHERE student_learning_paths.id = learning_path_items.path_id
            AND student_learning_paths.student_id = auth.uid()
        )
    );

CREATE POLICY "Service Role full access to path items"
    ON learning_path_items FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
