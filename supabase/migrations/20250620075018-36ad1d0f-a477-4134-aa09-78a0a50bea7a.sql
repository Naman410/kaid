
-- Fix infinite recursion in RLS policies by using security definer functions
-- and simplifying policy logic

-- 1. Create security definer functions to break recursion cycles
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT user_type FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop all existing problematic RLS policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their students' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

-- 3. Create simple, non-recursive RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_type() = 'super_admin');

CREATE POLICY "Super admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.get_current_user_type() = 'super_admin');

-- 4. Fix organizations policies
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;

CREATE POLICY "Users can view organizations" 
ON public.organizations FOR SELECT 
USING (
  public.get_current_user_type() = 'super_admin'
  OR 
  public.get_current_user_org_id() = id
);

-- 5. Fix teachers policies
DROP POLICY IF EXISTS "Users can view teachers" ON public.teachers;

CREATE POLICY "Users can view teachers" 
ON public.teachers FOR SELECT 
USING (
  user_id = auth.uid() 
  OR
  public.get_current_user_type() = 'super_admin'
  OR
  (public.get_current_user_type() = 'admin' AND organization_id = public.get_current_user_org_id())
);

-- 6. Fix classes policies
DROP POLICY IF EXISTS "Users can view classes" ON public.classes;

CREATE POLICY "Users can view classes" 
ON public.classes FOR SELECT 
USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
  OR
  public.get_current_user_type() = 'super_admin'
  OR
  (public.get_current_user_type() = 'admin' AND organization_id = public.get_current_user_org_id())
);

-- 7. Fix student enrollments policies
DROP POLICY IF EXISTS "Users can view enrollments" ON public.student_enrollments;

CREATE POLICY "Users can view enrollments" 
ON public.student_enrollments FOR SELECT 
USING (
  student_id = auth.uid()
  OR
  public.get_current_user_type() = 'super_admin'
  OR
  (public.get_current_user_type() = 'admin' AND organization_id = public.get_current_user_org_id())
  OR
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  )
);

-- 8. Fix daily usage tracking policies
DROP POLICY IF EXISTS "Users can view daily usage" ON public.daily_usage_tracking;

CREATE POLICY "Users can view daily usage" 
ON public.daily_usage_tracking FOR SELECT 
USING (
  user_id = auth.uid()
  OR
  public.get_current_user_type() = 'super_admin'
  OR
  (public.get_current_user_type() = 'admin' AND organization_id = public.get_current_user_org_id())
  OR
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

-- 9. Fix monthly usage tracking policies
DROP POLICY IF EXISTS "Users can view monthly usage" ON public.monthly_usage_tracking;

CREATE POLICY "Users can view monthly usage" 
ON public.monthly_usage_tracking FOR SELECT 
USING (
  user_id = auth.uid()
  OR
  public.get_current_user_type() = 'super_admin'
  OR
  (public.get_current_user_type() = 'admin' AND organization_id = public.get_current_user_org_id())
  OR
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

-- 10. Add missing RLS policies for creations and music_creations
CREATE POLICY "Users can view own creations" 
ON public.creations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student creations" 
ON public.creations FOR SELECT 
USING (
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all creations" 
ON public.creations FOR SELECT 
USING (public.get_current_user_type() = 'super_admin');

CREATE POLICY "Users can view own music creations" 
ON public.music_creations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student music creations" 
ON public.music_creations FOR SELECT 
USING (
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can view all music creations" 
ON public.music_creations FOR SELECT 
USING (public.get_current_user_type() = 'super_admin');

-- 11. Update the get_teacher_students function to avoid GROUP BY issues
CREATE OR REPLACE FUNCTION public.get_teacher_students(p_teacher_user_id uuid, p_class_id uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Get students with usage data and limits
  SELECT json_agg(student_data) INTO result
  FROM (
    SELECT json_build_object(
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
    ) as student_data
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
    ORDER BY p.username
  ) students;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
