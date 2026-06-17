-- Phase 11B.6 - Platform Comparison & Analytics Center RPCs

-- 1. School Comparison
CREATE OR REPLACE FUNCTION get_admin_school_comparison()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH school_metrics AS (
    SELECT 
      s.id,
      s.school_name,
      (SELECT count(*) FROM public.student_profiles WHERE school_id = s.id AND status = 'active') as total_students,
      (SELECT count(*) FROM public.teacher_profiles WHERE school_id = s.id AND status = 'active') as total_teachers,
      (SELECT count(*) FROM public.parent_profiles pp 
       JOIN public.student_parent_relationships spr ON spr.parent_id = pp.id
       JOIN public.student_profiles sp ON spr.student_id = sp.id
       WHERE sp.school_id = s.id AND pp.status = 'active') as total_parents,
      
      -- Assessment Completion
      (SELECT COUNT(*) FROM public.assessment_results ar 
       JOIN public.student_profiles sp ON ar.student_id = sp.id 
       WHERE sp.school_id = s.id) as total_completed_assessments,
      (SELECT COUNT(*) FROM public.assessment_progress ap
       JOIN public.student_profiles sp ON ap.student_id = sp.id 
       WHERE sp.school_id = s.id) as total_assessments_started,
      
      -- Readiness & Risk from latest reports
      (
        SELECT ROUND(AVG(sr.readiness_score)::numeric, 1)
        FROM (
          SELECT student_id, readiness_score,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
          FROM public.student_reports
        ) sr
        JOIN public.student_profiles sp ON sr.student_id = sp.id
        WHERE sr.rn = 1 AND sp.school_id = s.id
      ) as avg_readiness_score,

      (
        SELECT COUNT(*)
        FROM (
          SELECT student_id, risk_analysis,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
          FROM public.student_reports
        ) sr
        JOIN public.student_profiles sp ON sr.student_id = sp.id
        WHERE sr.rn = 1 AND sp.school_id = s.id AND sr.risk_analysis->>'overallRisk' = 'High Risk'
      ) as high_risk_students

    FROM public.schools s
    WHERE s.status = 'active'
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', id,
      'school_name', school_name,
      'totalStudents', total_students,
      'totalTeachers', total_teachers,
      'totalParents', total_parents,
      'assessmentCompletionRate', CASE WHEN total_assessments_started > 0 THEN ROUND((total_completed_assessments::numeric / total_assessments_started) * 100) ELSE 0 END,
      'avgReadinessScore', COALESCE(avg_readiness_score, 0),
      'highRiskPercentage', CASE WHEN total_students > 0 THEN ROUND((high_risk_students::numeric / total_students) * 100) ELSE 0 END
    )
  ), '[]'::json) INTO result FROM school_metrics;
  
  RETURN result;
END;
$$;


-- 2. Risk Comparison
CREATE OR REPLACE FUNCTION get_admin_risk_comparison()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH ranked_reports AS (
    SELECT sr.student_id, sr.risk_analysis, sp.school_id, s.school_name,
           ROW_NUMBER() OVER (PARTITION BY sr.student_id ORDER BY sr.created_at DESC) as rn
    FROM public.student_reports sr
    JOIN public.student_profiles sp ON sr.student_id = sp.id
    JOIN public.schools s ON sp.school_id = s.id
    WHERE s.status = 'active'
  ),
  school_risk_counts AS (
    SELECT 
      school_name,
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'Low Risk' THEN 1 ELSE 0 END) as low_risk,
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'Moderate Risk' THEN 1 ELSE 0 END) as moderate_risk,
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'High Risk' THEN 1 ELSE 0 END) as high_risk,
      COUNT(*) as total_evaluated
    FROM ranked_reports
    WHERE rn = 1
    GROUP BY school_name
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'school_name', school_name,
      'lowRisk', low_risk,
      'moderateRisk', moderate_risk,
      'highRisk', high_risk,
      'total', total_evaluated
    )
  ), '[]'::json) INTO result FROM school_risk_counts;
  
  RETURN result;
END;
$$;


-- 3. Teacher Comparison (with TEI)
CREATE OR REPLACE FUNCTION get_admin_teacher_comparison()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH teacher_stats AS (
    SELECT 
      tp.id,
      tp.first_name || ' ' || tp.last_name as teacher_name,
      s.school_name,
      
      (SELECT count(DISTINCT student_id) FROM public.teacher_student_assignments WHERE teacher_id = tp.id AND status = 'active') as assigned_students,
      
      -- Active students (has done something in last 30 days)
      (SELECT count(DISTINCT student_id) FROM public.teacher_student_assignments tsa
       JOIN public.assessment_results ar ON ar.student_id = tsa.student_id
       WHERE tsa.teacher_id = tp.id AND tsa.status = 'active' AND ar.created_at > (NOW() - interval '30 days')) as active_students,
      
      -- Assessment Completion
      (SELECT count(*) FROM public.assessment_results ar 
       JOIN public.teacher_student_assignments tsa ON tsa.student_id = ar.student_id 
       WHERE tsa.teacher_id = tp.id) as completed_assessments,
      (SELECT count(*) FROM public.assessment_progress ap 
       JOIN public.teacher_student_assignments tsa ON tsa.student_id = ap.student_id 
       WHERE tsa.teacher_id = tp.id) as started_assessments,
       
      -- Avg Readiness of assigned students
      (
        SELECT ROUND(AVG(sr.readiness_score)::numeric, 1)
        FROM (
          SELECT student_id, readiness_score,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
          FROM public.student_reports
        ) sr
        JOIN public.teacher_student_assignments tsa ON tsa.student_id = sr.student_id
        WHERE sr.rn = 1 AND tsa.teacher_id = tp.id AND tsa.status = 'active'
      ) as avg_readiness_score
      
    FROM public.teacher_profiles tp
    LEFT JOIN public.schools s ON tp.school_id = s.id
    WHERE tp.status = 'active'
  ),
  teacher_metrics AS (
    SELECT *,
      CASE WHEN started_assessments > 0 THEN ROUND((completed_assessments::numeric / started_assessments) * 100) ELSE 0 END as assessment_completion_rate,
      CASE WHEN assigned_students > 0 THEN ROUND((active_students::numeric / assigned_students) * 100) ELSE 0 END as engagement_rate
    FROM teacher_stats
  ),
  teacher_tei AS (
    SELECT *,
      -- TEI Formula: 30% Readiness + 30% Assessment Completion + 40% Engagement Rate
      ROUND(
        (COALESCE(avg_readiness_score, 0) / 100.0 * 30.0) +
        (assessment_completion_rate / 100.0 * 30.0) +
        (engagement_rate / 100.0 * 40.0)
      , 1) as tei_score
    FROM teacher_metrics
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', id,
      'teacher_name', teacher_name,
      'school_name', COALESCE(school_name, 'Unassigned'),
      'assignedStudents', assigned_students,
      'activeStudents', active_students,
      'assessmentCompletionRate', assessment_completion_rate,
      'avgReadinessScore', COALESCE(avg_readiness_score, 0),
      'teiScore', tei_score
    ) ORDER BY tei_score DESC
  ), '[]'::json) INTO result FROM teacher_tei;
  
  RETURN result;
END;
$$;


-- 4. Assessment Analytics
CREATE OR REPLACE FUNCTION get_admin_assessment_analytics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH assessment_types AS (
    SELECT unnest(ARRAY['Reading Assessment', 'Typing Assessment', 'Attention Assessment', 'Focus & Engagement', 'Learning Behaviour', 'CPT']) as type
  ),
  assessment_metrics AS (
    SELECT 
      t.type as assessment_name,
      (SELECT COUNT(*) FROM public.assessment_sessions WHERE assessment_type = t.type) as total_attempts,
      (SELECT COUNT(*) FROM public.assessment_results WHERE assessment_type = t.type) as completed_attempts,
      (SELECT AVG(duration_seconds) FROM public.assessment_sessions WHERE assessment_type = t.type AND duration_seconds IS NOT NULL) as avg_duration_seconds
    FROM assessment_types t
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'assessmentName', assessment_name,
      'totalAttempts', total_attempts,
      'completionRate', CASE WHEN total_attempts > 0 THEN ROUND((completed_attempts::numeric / total_attempts) * 100) ELSE 0 END,
      'avgDurationSeconds', COALESCE(ROUND(avg_duration_seconds::numeric), 0),
      'avgScore', 0 -- Needs specific extraction per assessment type if required, 0 for now
    )
  ), '[]'::json) INTO result FROM assessment_metrics;
  
  RETURN result;
END;
$$;


-- 5. Intervention Analytics
CREATE OR REPLACE FUNCTION get_admin_intervention_analytics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- Check if data exists. For now, returning minimal schema as it relies on future tables/data
  SELECT json_build_object(
    'hasData', false,
    'message', 'Insufficient intervention data available.'
  ) INTO result;
  
  RETURN result;
END;
$$;


-- 6. School Rankings (SPI v1)
CREATE OR REPLACE FUNCTION get_admin_school_rankings()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH school_metrics AS (
    SELECT 
      s.id,
      s.school_name,
      (SELECT count(*) FROM public.student_profiles WHERE school_id = s.id AND status = 'active') as total_students,
      (SELECT count(*) FROM public.teacher_profiles WHERE school_id = s.id AND status = 'active') as total_teachers,
      
      -- Assessment Completion
      (SELECT COUNT(*) FROM public.assessment_results ar 
       JOIN public.student_profiles sp ON ar.student_id = sp.id 
       WHERE sp.school_id = s.id) as completed_assessments,
      (SELECT COUNT(*) FROM public.assessment_progress ap
       JOIN public.student_profiles sp ON ap.student_id = sp.id 
       WHERE sp.school_id = s.id) as started_assessments,
      
      -- Avg Readiness
      (
        SELECT ROUND(AVG(sr.readiness_score)::numeric, 1)
        FROM (
          SELECT student_id, readiness_score,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
          FROM public.student_reports
        ) sr
        JOIN public.student_profiles sp ON sr.student_id = sp.id
        WHERE sr.rn = 1 AND sp.school_id = s.id
      ) as avg_readiness_score,

      -- Risk Distribution
      (
        SELECT 
          SUM(CASE WHEN sr.risk_analysis->>'overallRisk' = 'Low Risk' THEN 100 
                   WHEN sr.risk_analysis->>'overallRisk' = 'Moderate Risk' THEN 50 
                   ELSE 0 END) / NULLIF(COUNT(*), 0)
        FROM (
          SELECT student_id, risk_analysis,
                 ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
          FROM public.student_reports
        ) sr
        JOIN public.student_profiles sp ON sr.student_id = sp.id
        WHERE sr.rn = 1 AND sp.school_id = s.id
      ) as risk_distribution_score,

      -- Teacher Engagement (Teachers with assigned students)
      (
        SELECT COUNT(DISTINCT teacher_id) FROM public.teacher_student_assignments tsa
        JOIN public.teacher_profiles tp ON tp.id = tsa.teacher_id
        WHERE tp.school_id = s.id AND tsa.status = 'active'
      ) as engaged_teachers

    FROM public.schools s
    WHERE s.status = 'active'
  ),
  spi_calculated AS (
    SELECT *,
      CASE WHEN started_assessments > 0 THEN (completed_assessments::numeric / started_assessments) * 100 ELSE 0 END as assessment_completion_rate,
      CASE WHEN total_students > 0 THEN (started_assessments::numeric / total_students) * 100 ELSE 0 END as student_engagement_score,
      CASE WHEN total_teachers > 0 THEN (engaged_teachers::numeric / total_teachers) * 100 ELSE 0 END as teacher_engagement_score
    FROM school_metrics
  ),
  final_rankings AS (
    SELECT 
      id,
      school_name,
      ROUND(
        (COALESCE(avg_readiness_score, 0) * 0.30) +
        (assessment_completion_rate * 0.25) +
        (COALESCE(risk_distribution_score, 0) * 0.20) +
        (LEAST(student_engagement_score, 100) * 0.15) +
        (teacher_engagement_score * 0.10)
      , 1) as spi_score
    FROM spi_calculated
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', id,
      'school_name', school_name,
      'spiScore', spi_score
    ) ORDER BY spi_score DESC
  ), '[]'::json) INTO result FROM (
    SELECT * FROM final_rankings ORDER BY spi_score DESC LIMIT 10
  ) as top_10;
  
  RETURN result;
END;
$$;


-- 7. Platform Health Comparison
CREATE OR REPLACE FUNCTION get_admin_platform_health_comparison()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  total_schools INT;
  total_teachers INT;
  total_students INT;
  total_parents INT;
  reports_generated INT;
  recommendations_generated INT;
  learning_paths_generated INT;
  activities_completed INT;
BEGIN
  SELECT count(*) INTO total_schools FROM public.schools WHERE status = 'active';
  SELECT count(*) INTO total_teachers FROM public.teacher_profiles WHERE status = 'active';
  SELECT count(*) INTO total_students FROM public.student_profiles WHERE status = 'active';
  SELECT count(*) INTO total_parents FROM public.parent_profiles WHERE status = 'active';
  SELECT count(*) INTO reports_generated FROM public.student_reports;
  
  -- Placeholders for future modules
  recommendations_generated := 0;
  learning_paths_generated := 0; 
  activities_completed := 0;

  RETURN json_build_object(
    'totalSchools', total_schools,
    'totalTeachers', total_teachers,
    'totalStudents', total_students,
    'totalParents', total_parents,
    'reportsGenerated', reports_generated,
    'recommendationsGenerated', recommendations_generated,
    'learningPathsGenerated', learning_paths_generated,
    'activitiesCompleted', activities_completed
  );
END;
$$;
