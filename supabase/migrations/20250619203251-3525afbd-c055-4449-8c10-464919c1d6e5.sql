
-- COMPLETE ADMIN/SUPER ADMIN IMPLEMENTATION PLAN
-- Phase 1: Database Schema Enhancements

-- 1.1 Update user type constraint to include 'admin'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('b2c_student', 'b2b_student', 'teacher', 'admin', 'super_admin'));

-- 1.2 Extend organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

-- 1.3 Create audit logging system
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 1.4 Ensure profiles has is_active column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Phase 2: CORRECTED RLS POLICIES (combining all access patterns)

-- 2.1 Organizations RLS (Super Admin + Org Admin access)
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can view organizations" ON public.organizations;

CREATE POLICY "Users can view organizations" 
ON public.organizations FOR SELECT 
USING (
  -- Super Admins can view all organizations
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR 
  -- Users can view their own organization
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) = id
);

-- 2.2 Teachers RLS (Super Admin + Teacher's Org Admin + Teacher's own record)
DROP POLICY IF EXISTS "Teachers can view themselves and org teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can view teachers" ON public.teachers;

CREATE POLICY "Users can view teachers" 
ON public.teachers FOR SELECT 
USING (
  -- Teachers can view their own record
  user_id = auth.uid() 
  OR
  -- Super Admins can view all teachers
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Org Admins can view teachers in their organization
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- 2.3 Classes RLS (CORRECTED - includes all access patterns)
DROP POLICY IF EXISTS "Users can view their classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can view classes" ON public.classes;

CREATE POLICY "Users can view classes" 
ON public.classes FOR SELECT 
USING (
  -- Teachers can view classes they teach
  teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
  OR
  -- Students can view their enrolled classes
  id IN (SELECT class_id FROM public.profiles WHERE id = auth.uid())
  OR
  -- Super Admins can view all classes
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Org Admins can view classes in their organization
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- 2.4 Student enrollments RLS (CORRECTED - includes teacher access)
DROP POLICY IF EXISTS "Users can view relevant enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Admins can view enrollments" ON public.student_enrollments;

CREATE POLICY "Users can view enrollments" 
ON public.student_enrollments FOR SELECT 
USING (
  -- Students can view their own enrollments
  student_id = auth.uid()
  OR
  -- Super Admins can view all enrollments
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Org Admins can view enrollments in their organization
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  OR
  -- Teachers can view enrollments for their classes
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  )
);

-- 2.5 Daily usage tracking RLS (CORRECTED - includes teacher access)
DROP POLICY IF EXISTS "Users can view relevant usage tracking" ON public.daily_usage_tracking;
DROP POLICY IF EXISTS "Admins can view daily usage" ON public.daily_usage_tracking;

CREATE POLICY "Users can view daily usage" 
ON public.daily_usage_tracking FOR SELECT 
USING (
  -- A user can see their own usage
  user_id = auth.uid()
  OR
  -- A Super Admin can see all usage
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- An Admin can see usage for their entire organization
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  OR
  -- A Teacher can see usage for students in their classes
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

-- 2.6 Monthly usage tracking RLS (CORRECTED - includes teacher access)
DROP POLICY IF EXISTS "Users can view relevant monthly usage" ON public.monthly_usage_tracking;
DROP POLICY IF EXISTS "Admins can view monthly usage" ON public.monthly_usage_tracking;

CREATE POLICY "Users can view monthly usage" 
ON public.monthly_usage_tracking FOR SELECT 
USING (
  -- A user can see their own usage
  user_id = auth.uid()
  OR
  -- A Super Admin can see all usage
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- An Admin can see usage for their entire organization
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  OR
  -- A Teacher can see usage for students in their classes
  user_id IN (
    SELECT se.student_id
    FROM public.student_enrollments se
    JOIN public.classes c ON se.class_id = c.id
    JOIN public.teachers t ON c.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

-- 2.7 Profile update policy (CORRECTED - Super Admins can update ANY profile)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update own profiles" ON public.profiles;

CREATE POLICY "Users can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  -- Users can update their own profile
  id = auth.uid()
  OR
  -- Super Admins can update ANY profile
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 2.8 Audit logs RLS (Super Admin and relevant admins can view)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  -- Super Admins can view all audit logs
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Users can view their own actions
  actor_user_id = auth.uid()
);

-- Phase 3: Database Functions

-- 3.1 Get organization details (role-aware with explicit target)
CREATE OR REPLACE FUNCTION public.get_organization_details(p_user_id UUID, p_target_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  result JSON;
BEGIN
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Security check
  IF user_profile.user_type = 'super_admin' THEN
    -- Super admin can see any organization
    SELECT row_to_json(o) INTO result 
    FROM public.organizations o 
    WHERE o.id = p_target_org_id AND o.is_active = true;
  ELSIF user_profile.user_type = 'admin' THEN
    -- Regular admin can only see their own organization
    IF user_profile.organization_id = p_target_org_id THEN
      SELECT row_to_json(o) INTO result 
      FROM public.organizations o 
      WHERE o.id = p_target_org_id AND o.is_active = true;
    ELSE
      RAISE EXCEPTION 'Unauthorized: Admin can only view their own organization';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Only admins can view organization details';
  END IF;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- 3.2 Get all organizations (Super Admin only)
CREATE OR REPLACE FUNCTION public.get_all_organizations(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  result JSON;
BEGIN
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Security check - only super admins
  IF user_profile.user_type != 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only Super Admins can view all organizations';
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'id', o.id,
      'name', o.name,
      'subdomain', o.subdomain,
      'status', o.status,
      'phone', o.phone,
      'admin_email', o.admin_email,
      'package_type', o.package_type,
      'daily_limit_per_student', o.daily_limit_per_student,
      'monthly_limit_per_student', o.monthly_limit_per_student,
      'is_active', o.is_active,
      'created_at', o.created_at,
      'teacher_count', COALESCE(teacher_counts.count, 0),
      'student_count', COALESCE(student_counts.count, 0)
    )
  ) INTO result
  FROM public.organizations o
  LEFT JOIN (
    SELECT organization_id, COUNT(*) as count
    FROM public.teachers
    WHERE is_active = true
    GROUP BY organization_id
  ) teacher_counts ON o.id = teacher_counts.organization_id
  LEFT JOIN (
    SELECT organization_id, COUNT(*) as count
    FROM public.student_enrollments
    WHERE is_active = true
    GROUP BY organization_id
  ) student_counts ON o.id = student_counts.organization_id
  WHERE o.is_active = true
  ORDER BY o.created_at DESC;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 3.3 Get organization teachers (role-aware)
CREATE OR REPLACE FUNCTION public.get_organization_teachers(p_user_id UUID, p_target_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  result JSON;
BEGIN
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Security check
  IF user_profile.user_type = 'super_admin' THEN
    -- Super admin can see any organization's teachers
    NULL; -- No additional check needed
  ELSIF user_profile.user_type = 'admin' AND user_profile.organization_id = p_target_org_id THEN
    -- Regular admin can only see their own organization's teachers
    NULL; -- Check passed
  ELSE
    RAISE EXCEPTION 'Unauthorized: Cannot view teachers for this organization';
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'id', t.id,
      'user_id', t.user_id,
      'full_name', t.full_name,
      'email', t.email,
      'is_active', t.is_active,
      'created_at', t.created_at,
      'class_count', COALESCE(class_counts.count, 0)
    )
  ) INTO result
  FROM public.teachers t
  LEFT JOIN (
    SELECT teacher_id, COUNT(*) as count
    FROM public.classes
    WHERE is_active = true
    GROUP BY teacher_id
  ) class_counts ON t.id = class_counts.teacher_id
  WHERE t.organization_id = p_target_org_id AND t.is_active = true
  ORDER BY t.created_at DESC;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 3.4 Get organization analytics (role-aware)
CREATE OR REPLACE FUNCTION public.get_organization_analytics(p_user_id UUID, p_target_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  result JSON;
BEGIN
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Security check
  IF user_profile.user_type = 'super_admin' THEN
    -- Super admin can see any organization's analytics
    NULL; -- No additional check needed
  ELSIF user_profile.user_type = 'admin' AND user_profile.organization_id = p_target_org_id THEN
    -- Regular admin can only see their own organization's analytics
    NULL; -- Check passed
  ELSE
    RAISE EXCEPTION 'Unauthorized: Cannot view analytics for this organization';
  END IF;
  
  SELECT json_build_object(
    'total_teachers', (
      SELECT COUNT(*) FROM public.teachers 
      WHERE organization_id = p_target_org_id AND is_active = true
    ),
    'total_students', (
      SELECT COUNT(*) FROM public.student_enrollments 
      WHERE organization_id = p_target_org_id AND is_active = true
    ),
    'total_classes', (
      SELECT COUNT(*) FROM public.classes 
      WHERE organization_id = p_target_org_id AND is_active = true
    ),
    'daily_usage', (
      SELECT COALESCE(SUM(creations_count), 0) 
      FROM public.daily_usage_tracking 
      WHERE organization_id = p_target_org_id AND date = CURRENT_DATE
    ),
    'monthly_usage', (
      SELECT COALESCE(SUM(creations_count), 0) 
      FROM public.monthly_usage_tracking 
      WHERE organization_id = p_target_org_id 
        AND year = EXTRACT(YEAR FROM CURRENT_DATE)
        AND month = EXTRACT(MONTH FROM CURRENT_DATE)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3.5 Log audit action
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_actor_user_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_user_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    p_actor_user_id,
    p_action_type,
    p_target_type,
    p_target_id,
    p_details
  );
  
  RETURN true;
END;
$$;

-- Fix the existing get_teacher_students function GROUP BY issue
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
