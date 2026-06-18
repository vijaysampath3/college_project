CREATE OR REPLACE FUNCTION public.get_email_by_id(id_type text, id_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email text;
BEGIN
  IF id_type = 'student' THEN
    SELECT email INTO found_email FROM profiles WHERE student_id = id_value LIMIT 1;
  ELSIF id_type = 'teacher' THEN
    SELECT email INTO found_email FROM profiles WHERE teacher_id = id_value LIMIT 1;
  ELSIF id_type = 'parent' THEN
    SELECT email INTO found_email FROM parent_profiles WHERE parent_id = id_value LIMIT 1;
  END IF;
  
  RETURN found_email;
END;
$$;
