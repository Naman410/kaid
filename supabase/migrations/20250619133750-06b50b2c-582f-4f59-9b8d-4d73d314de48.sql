
-- Phase 1: Complete Teacher Dashboard Backend Database Setup

-- 1. Add RLS policies for teachers to view their students' data

-- Allow teachers to view their own profile AND their students' profiles (CORRECTED)
CREATE POLICY "Teachers can view their students' profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() -- Allows users to view their OWN profile
    OR
    id IN (          -- Allows teachers to view their STUDENTS' profiles
      SELECT se.student_id 
      FROM public.student_enrollments se
      JOIN public.classes c ON se.class_id = c.id
      JOIN public.teachers t ON c.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- Allow teachers to view creations of their students
CREATE POLICY "Teachers can view their students' creations" 
  ON public.creations 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT se.student_id 
      FROM public.student_enrollments se
      JOIN public.classes c ON se.class_id = c.id
      JOIN public.teachers t ON c.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- Allow teachers to view music creations of their students
CREATE POLICY "Teachers can view their students' music creations" 
  ON public.music_creations 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT se.student_id 
      FROM public.student_enrollments se
      JOIN public.classes c ON se.class_id = c.id
      JOIN public.teachers t ON c.teacher_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- 2. Create get_teacher_classes function
CREATE OR REPLACE FUNCTION public.get_teacher_classes(p_teacher_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Get teacher's classes with student counts and organization limits
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'name', c.name,
      'grade_level', c.grade_level,
      'student_count', COALESCE(student_counts.count, 0),
      'organization_name', o.name,
      'daily_limit_per_student', o.daily_limit_per_student,
      'monthly_limit_per_student', o.monthly_limit_per_student,
      'package_type', o.package_type,
      'created_at', c.created_at
    )
  ) INTO result
  FROM public.classes c
  JOIN public.teachers t ON c.teacher_id = t.id
  JOIN public.organizations o ON c.organization_id = o.id
  LEFT JOIN (
    SELECT class_id, COUNT(*) as count
    FROM public.student_enrollments
    WHERE is_active = true
    GROUP BY class_id
  ) student_counts ON c.id = student_counts.class_id
  WHERE t.user_id = p_teacher_user_id AND c.is_active = true;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 3. Create get_teacher_students function
CREATE OR REPLACE FUNCTION public.get_teacher_students(p_teacher_user_id UUID, p_class_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Get students with usage data and limits
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'class_name', c.name,
      'class_id', c.id,
      'daily_usage', COALESCE(daily.creations_count, 0),
      'monthly_usage', COALESCE(monthly.creations_count, 0),
      'daily_limit', o.daily_limit_per_student,
      'monthly_limit', o.monthly_limit_per_student,
      'enrolled_at', se.enrolled_at,
      'total_creations', p.total_creations_used
    )
  ) INTO result
  FROM public.profiles p
  JOIN public.student_enrollments se ON p.id = se.student_id
  JOIN public.classes c ON se.class_id = c.id
  JOIN public.teachers t ON c.teacher_id = t.id
  JOIN public.organizations o ON c.organization_id = o.id
  LEFT JOIN public.daily_usage_tracking daily ON p.id = daily.user_id AND daily.date = CURRENT_DATE
  LEFT JOIN public.monthly_usage_tracking monthly ON p.id = monthly.user_id 
    AND monthly.year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND monthly.month = EXTRACT(MONTH FROM CURRENT_DATE)
  WHERE t.user_id = p_teacher_user_id 
    AND se.is_active = true
    AND (p_class_id IS NULL OR c.id = p_class_id)
  ORDER BY p.username;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 4. Create get_student_creations function
CREATE OR REPLACE FUNCTION public.get_student_creations(p_teacher_user_id UUID, p_student_id UUID DEFAULT NULL, p_class_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Security Check: Ensure the teacher has access to the requested scope
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers t
    JOIN public.classes c ON t.id = c.teacher_id
    WHERE t.user_id = p_teacher_user_id
    AND (p_class_id IS NULL OR c.id = p_class_id)
  ) THEN
    RETURN '[]'::json;
  END IF;

  -- Aggregate creations and music creations
  SELECT json_agg(creations_data) INTO result
  FROM (
    -- General Creations
    SELECT 
      c.id, 
      c.user_id, 
      c.creation_type, 
      c.creation_data, 
      c.created_at, 
      p.username,
      cl.name as class_name
    FROM public.creations c
    JOIN public.profiles p ON c.user_id = p.id
    JOIN public.student_enrollments se ON se.student_id = c.user_id
    JOIN public.classes cl ON se.class_id = cl.id
    WHERE (p_student_id IS NULL OR c.user_id = p_student_id)
      AND (p_class_id IS NULL OR se.class_id = p_class_id)
      AND se.class_id IN (
        SELECT c.id FROM public.classes c 
        JOIN public.teachers t ON c.teacher_id = t.id 
        WHERE t.user_id = p_teacher_user_id
      )
    UNION ALL
    -- Music Creations
    SELECT 
      mc.id, 
      mc.user_id, 
      'music' as creation_type, 
      to_jsonb(mc) - 'user_id' as creation_data, 
      mc.created_at, 
      p.username,
      cl.name as class_name
    FROM public.music_creations mc
    JOIN public.profiles p ON mc.user_id = p.id
    JOIN public.student_enrollments se ON se.student_id = mc.user_id
    JOIN public.classes cl ON se.class_id = cl.id
    WHERE (p_student_id IS NULL OR mc.user_id = p_student_id)
      AND (p_class_id IS NULL OR se.class_id = p_class_id)
      AND se.class_id IN (
        SELECT c.id FROM public.classes c 
        JOIN public.teachers t ON c.teacher_id = t.id 
        WHERE t.user_id = p_teacher_user_id
      )
    ORDER BY created_at DESC
  ) as creations_data;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
