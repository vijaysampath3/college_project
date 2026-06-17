-- RPC for Platform Stats
CREATE OR REPLACE FUNCTION get_admin_platform_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  total_students INT;
  total_teachers INT;
  total_parents INT;
  total_schools INT;
  total_assessments INT;
  assigned_students INT;
BEGIN
  SELECT count(*) INTO total_students FROM public.student_profiles WHERE status = 'active';
  SELECT count(*) INTO total_teachers FROM public.teacher_profiles WHERE status = 'active';
  SELECT count(*) INTO total_parents FROM public.parent_profiles WHERE status = 'active';
  SELECT count(*) INTO total_schools FROM public.schools WHERE status = 'active';
  SELECT count(*) INTO total_assessments FROM public.assessment_results;
  SELECT count(DISTINCT student_id) INTO assigned_students FROM public.teacher_student_assignments WHERE status = 'active';
  
  RETURN json_build_object(
    'totalStudents', total_students,
    'totalTeachers', total_teachers,
    'totalParents', total_parents,
    'totalSchools', total_schools,
    'totalAssessments', total_assessments,
    'assignedStudents', assigned_students
  );
END;
$$;

-- RPC for Health Stats
CREATE OR REPLACE FUNCTION get_admin_health_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  total_students INT;
  students_with_reports INT;
  students_without_reports INT;
  active_teachers INT;
  active_schools INT;
BEGIN
  SELECT count(*) INTO total_students FROM public.student_profiles;
  SELECT count(DISTINCT student_id) INTO students_with_reports FROM public.student_reports;
  students_without_reports := total_students - students_with_reports;
  SELECT count(*) INTO active_teachers FROM public.teacher_profiles WHERE status = 'active';
  SELECT count(*) INTO active_schools FROM public.schools WHERE status = 'active';
  
  RETURN json_build_object(
    'totalStudents', total_students,
    'studentsWithReports', students_with_reports,
    'studentsWithoutReports', students_without_reports,
    'activeTeachers', active_teachers,
    'activeSchools', active_schools
  );
END;
$$;

-- RPC for Risk Distribution
CREATE OR REPLACE FUNCTION get_admin_risk_distribution()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH ranked_reports AS (
    SELECT student_id, risk_analysis, 
           ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
    FROM public.student_reports
  ),
  latest_reports AS (
    SELECT risk_analysis
    FROM ranked_reports
    WHERE rn = 1
  ),
  risk_counts AS (
    SELECT 
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'Low Risk' THEN 1 ELSE 0 END) as low_risk,
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'Moderate Risk' THEN 1 ELSE 0 END) as moderate_risk,
      SUM(CASE WHEN risk_analysis->>'overallRisk' = 'High Risk' THEN 1 ELSE 0 END) as high_risk,
      COUNT(*) as total
    FROM latest_reports
  )
  SELECT json_build_object(
    'Low Risk', COALESCE(low_risk, 0),
    'Moderate Risk', COALESCE(moderate_risk, 0),
    'High Risk', COALESCE(high_risk, 0),
    'total', COALESCE(total, 0)
  ) INTO result FROM risk_counts;
  
  RETURN result;
END;
$$;

-- RPC for School Overview
CREATE OR REPLACE FUNCTION get_admin_school_overview()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH school_stats AS (
    SELECT 
      s.id as school_id,
      s.school_name,
      (SELECT COUNT(*) FROM public.student_profiles sp WHERE sp.school_id = s.id) as student_count,
      (SELECT COUNT(*) FROM public.student_profiles sp WHERE sp.school_id = s.id AND sp.status = 'active') as active_students,
      (SELECT COUNT(*) FROM public.teacher_profiles tp WHERE tp.school_id = s.id) as teacher_count,
      (SELECT COUNT(*) FROM public.parent_profiles pp 
       JOIN public.teacher_profiles tp ON pp.created_by_teacher = tp.id 
       WHERE tp.school_id = s.id) as parent_count,
      (SELECT COUNT(*) FROM public.assessment_results ar 
       JOIN public.student_profiles sp ON ar.student_id = sp.id 
       WHERE sp.school_id = s.id) as assessment_count,
      (SELECT ROUND(AVG(
        CASE 
          WHEN sr.risk_analysis->>'overallRisk' = 'Low Risk' THEN 1.0
          WHEN sr.risk_analysis->>'overallRisk' = 'Moderate Risk' THEN 2.0
          WHEN sr.risk_analysis->>'overallRisk' = 'High Risk' THEN 3.0
          ELSE NULL 
        END
      ), 2) FROM public.student_reports sr 
       JOIN public.student_profiles sp ON sr.student_id = sp.id 
       WHERE sp.school_id = s.id) as avg_risk_level
    FROM public.schools s
  )
  SELECT json_agg(row_to_json(school_stats)) INTO result FROM school_stats;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- RPC for Platform Usage (Last 5 Months)
CREATE OR REPLACE FUNCTION get_admin_platform_usage()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', current_date) - interval '4 months',
      date_trunc('month', current_date),
      '1 month'::interval
    ) as month_start
  ),
  monthly_assessments AS (
    SELECT 
      date_trunc('month', created_at) as m_date, 
      COUNT(*) as count 
    FROM public.assessment_results 
    WHERE created_at >= date_trunc('month', current_date) - interval '4 months'
    GROUP BY m_date
  ),
  -- Active Users = Distinct users who completed an assessment, generated a report, completed an activity, or learning path progress
  active_users_data AS (
    SELECT date_trunc('month', created_at) as m_date, student_id as user_id FROM public.assessment_results
    UNION
    SELECT date_trunc('month', created_at) as m_date, student_id as user_id FROM public.student_reports
    -- Removed activity_progress and learning_path_progress unions as tables don't exist yet
  ),
  monthly_active_users AS (
    SELECT m_date, COUNT(DISTINCT user_id) as count
    FROM active_users_data
    WHERE m_date >= date_trunc('month', current_date) - interval '4 months'
    GROUP BY m_date
  ),
  combined_stats AS (
    SELECT 
      to_char(m.month_start, 'Mon') as name,
      COALESCE(ma.count, 0) as assessments,
      COALESCE(mau.count, 0) as active_users
    FROM months m
    LEFT JOIN monthly_assessments ma ON m.month_start = ma.m_date
    LEFT JOIN monthly_active_users mau ON m.month_start = mau.m_date
    ORDER BY m.month_start ASC
  )
  SELECT json_agg(row_to_json(combined_stats)) INTO result FROM combined_stats;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- RPC for Recent Users
CREATE OR REPLACE FUNCTION get_admin_recent_users(limit_count INT DEFAULT 5)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  WITH all_users AS (
    SELECT 
      sp.student_name as name,
      'Student' as role,
      s.school_name,
      'Created by System' as created_by,
      sp.created_at
    FROM public.student_profiles sp
    LEFT JOIN public.schools s ON sp.school_id = s.id
    
    UNION ALL
    
    SELECT 
      tp.teacher_name as name,
      'Teacher' as role,
      s.school_name,
      'Created by Admin' as created_by,
      tp.created_at
    FROM public.teacher_profiles tp
    LEFT JOIN public.schools s ON tp.school_id = s.id
    
    UNION ALL
    
    SELECT 
      pp.parent_name as name,
      'Parent' as role,
      s.school_name,
      'Created by Teacher ' || tp.teacher_name as created_by,
      pp.created_at
    FROM public.parent_profiles pp
    LEFT JOIN public.teacher_profiles tp ON pp.created_by_teacher = tp.id
    LEFT JOIN public.schools s ON tp.school_id = s.id
  )
  SELECT json_agg(row_to_json(ordered_users)) INTO result 
  FROM (
    SELECT name, role, school_name, created_by, created_at 
    FROM all_users 
    ORDER BY created_at DESC 
    LIMIT limit_count
  ) ordered_users;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;
