
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  package_type TEXT NOT NULL DEFAULT 'basic' CHECK (package_type IN ('basic', 'starter', 'pro')),
  daily_limit_per_student INTEGER NOT NULL DEFAULT 5,
  monthly_limit_per_student INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  organization_id UUID REFERENCES public.organizations NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations NOT NULL,
  teacher_id UUID REFERENCES public.teachers NOT NULL,
  name TEXT NOT NULL,
  grade_level TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_enrollments table
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes NOT NULL,
  organization_id UUID REFERENCES public.organizations NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create daily_usage_tracking table
CREATE TABLE public.daily_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  creations_count INTEGER NOT NULL DEFAULT 0,
  organization_id UUID REFERENCES public.organizations,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create monthly_usage_tracking table
CREATE TABLE public.monthly_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  creations_count INTEGER NOT NULL DEFAULT 0,
  organization_id UUID REFERENCES public.organizations,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Extend profiles table to support B2B (CORRECTED - no redundant columns)
ALTER TABLE public.profiles 
ADD COLUMN user_type TEXT DEFAULT 'b2c_student' CHECK (user_type IN ('b2c_student', 'b2b_student', 'teacher', 'admin', 'super_admin')),
ADD COLUMN organization_id UUID REFERENCES public.organizations,
ADD COLUMN class_id UUID REFERENCES public.classes;

-- CRITICAL: Backfill user_type for all existing users
UPDATE public.profiles
SET user_type = 'b2c_student'
WHERE user_type IS NULL;

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations (FIXED: use 'id' instead of 'user_id')
CREATE POLICY "Users can view their organization" 
  ON public.organizations 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE user_type = 'super_admin' 
      OR organization_id = organizations.id
    )
  );

-- RLS Policies for teachers (teachers can view themselves and their org)
CREATE POLICY "Teachers can view themselves and org teachers" 
  ON public.teachers 
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND user_type IN ('teacher', 'admin')
    )
  );

-- RLS Policies for classes (teachers and students can view their classes)
CREATE POLICY "Users can view their classes" 
  ON public.classes 
  FOR SELECT 
  USING (
    teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.uid())
    OR id IN (SELECT class_id FROM public.profiles WHERE id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for student_enrollments
CREATE POLICY "Users can view relevant enrollments" 
  ON public.student_enrollments 
  FOR SELECT 
  USING (
    student_id = auth.uid()
    OR class_id IN (
      SELECT id FROM public.classes WHERE teacher_id IN (
        SELECT id FROM public.teachers WHERE user_id = auth.uid()
      )
    )
    OR organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for usage tracking (users can view their own, teachers can view their students)
CREATE POLICY "Users can view relevant usage tracking" 
  ON public.daily_usage_tracking 
  FOR SELECT 
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT student_id FROM public.student_enrollments 
      WHERE class_id IN (
        SELECT id FROM public.classes WHERE teacher_id IN (
          SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can view relevant monthly usage" 
  ON public.monthly_usage_tracking 
  FOR SELECT 
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT student_id FROM public.student_enrollments 
      WHERE class_id IN (
        SELECT id FROM public.classes WHERE teacher_id IN (
          SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Insert policies for usage tracking
CREATE POLICY "Users can insert their own usage" 
  ON public.daily_usage_tracking 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own monthly usage" 
  ON public.monthly_usage_tracking 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Update policies for usage tracking
CREATE POLICY "Users can update their own usage" 
  ON public.daily_usage_tracking 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own monthly usage" 
  ON public.monthly_usage_tracking 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create function to check user limits
CREATE OR REPLACE FUNCTION public.check_user_limits(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  org_limits RECORD;
  daily_usage INTEGER;
  monthly_usage INTEGER;
  result JSON;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = user_id_param;
  
  -- If B2C user, use existing total_creations_used logic
  IF user_profile.user_type = 'b2c_student' OR user_profile.organization_id IS NULL THEN
    RETURN json_build_object(
      'canProceed', (user_profile.total_creations_used < 10),
      'dailyRemaining', 999,
      'monthlyRemaining', 999,
      'userType', 'b2c'
    );
  END IF;
  
  -- Get organization limits
  SELECT * INTO org_limits 
  FROM public.organizations 
  WHERE id = user_profile.organization_id;
  
  -- Get current daily usage
  SELECT COALESCE(creations_count, 0) INTO daily_usage
  FROM public.daily_usage_tracking 
  WHERE user_id = user_id_param AND date = CURRENT_DATE;
  
  -- Get current monthly usage
  SELECT COALESCE(creations_count, 0) INTO monthly_usage
  FROM public.monthly_usage_tracking 
  WHERE user_id = user_id_param 
    AND year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND month = EXTRACT(MONTH FROM CURRENT_DATE);
  
  -- Check limits
  result := json_build_object(
    'canProceed', (
      daily_usage < org_limits.daily_limit_per_student AND 
      monthly_usage < org_limits.monthly_limit_per_student
    ),
    'dailyRemaining', (org_limits.daily_limit_per_student - daily_usage),
    'monthlyRemaining', (org_limits.monthly_limit_per_student - monthly_usage),
    'userType', 'b2b',
    'organizationName', org_limits.name
  );
  
  RETURN result;
END;
$$;

-- Create function to track B2B usage
CREATE OR REPLACE FUNCTION public.track_b2b_usage(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = user_id_param;
  
  -- Only track for B2B users
  IF user_profile.user_type != 'b2b_student' OR user_profile.organization_id IS NULL THEN
    RETURN true;
  END IF;
  
  -- Update or insert daily usage
  INSERT INTO public.daily_usage_tracking (user_id, date, creations_count, organization_id)
  VALUES (user_id_param, CURRENT_DATE, 1, user_profile.organization_id)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    creations_count = daily_usage_tracking.creations_count + 1,
    updated_at = now();
  
  -- Update or insert monthly usage
  INSERT INTO public.monthly_usage_tracking (user_id, year, month, creations_count, organization_id)
  VALUES (
    user_id_param, 
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, 
    1, 
    user_profile.organization_id
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET 
    creations_count = monthly_usage_tracking.creations_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Update the handle_new_user function to support B2B users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Young Creator'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'robot'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'b2c_student')
  );
  RETURN NEW;
END;
$$;
