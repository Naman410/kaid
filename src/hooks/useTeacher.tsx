
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTeacherClasses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
        body: { endpoint: 'classes' }
      });
      
      if (error) throw error;
      return data?.data || [];
    },
    enabled: !!user?.id,
  });
};

export const useTeacherStudents = (classId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teacher-students', user?.id, classId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
        body: { 
          endpoint: 'students',
          classId: classId || null
        }
      });
      
      if (error) throw error;
      return data?.data || [];
    },
    enabled: !!user?.id,
  });
};

export const useStudentCreations = (studentId?: string, classId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-creations', user?.id, studentId, classId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
        body: { 
          endpoint: 'creations',
          studentId: studentId || null,
          classId: classId || null
        }
      });
      
      if (error) throw error;
      return data?.data || [];
    },
    enabled: !!user?.id,
  });
};
