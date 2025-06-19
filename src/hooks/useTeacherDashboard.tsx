
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TeacherClass {
  id: string;
  name: string;
  grade_level: string;
  student_count: number;
  organization_name: string;
  daily_limit_per_student: number;
  monthly_limit_per_student: number;
  package_type: string;
  created_at: string;
}

interface TeacherStudent {
  id: string;
  username: string;
  avatar_url: string;
  class_name: string;
  class_id: string;
  daily_usage: number;
  monthly_usage: number;
  daily_limit: number;
  monthly_limit: number;
  enrolled_at: string;
  total_creations: number;
}

interface StudentCreation {
  id: string;
  user_id: string;
  creation_type: string;
  creation_data: any;
  created_at: string;
  username: string;
  class_name: string;
}

export const useTeacherDashboard = () => {
  const { user } = useAuth();

  // Fetch teacher's classes
  const useTeacherClasses = () => {
    return useQuery({
      queryKey: ['teacher-classes', user?.id],
      queryFn: async (): Promise<TeacherClass[]> => {
        const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
          body: null,
          headers: {
            'Content-Type': 'application/json',
          },
        }, {
          method: 'GET',
          params: new URLSearchParams({ endpoint: 'classes' })
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);
        
        return data.data;
      },
      enabled: !!user?.id,
    });
  };

  // Fetch teacher's students (optionally filtered by class)
  const useTeacherStudents = (classId?: string) => {
    return useQuery({
      queryKey: ['teacher-students', user?.id, classId],
      queryFn: async (): Promise<TeacherStudent[]> => {
        const params = new URLSearchParams({ endpoint: 'students' });
        if (classId) params.append('classId', classId);

        const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
          body: null,
          headers: {
            'Content-Type': 'application/json',
          },
        }, {
          method: 'GET',
          params
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);
        
        return data.data;
      },
      enabled: !!user?.id,
    });
  };

  // Fetch student creations (optionally filtered by student or class)
  const useStudentCreations = (studentId?: string, classId?: string) => {
    return useQuery({
      queryKey: ['student-creations', user?.id, studentId, classId],
      queryFn: async (): Promise<StudentCreation[]> => {
        const params = new URLSearchParams({ endpoint: 'creations' });
        if (studentId) params.append('studentId', studentId);
        if (classId) params.append('classId', classId);

        const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
          body: null,
          headers: {
            'Content-Type': 'application/json',
          },
        }, {
          method: 'GET',
          params
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);
        
        return data.data;
      },
      enabled: !!user?.id,
    });
  };

  return {
    useTeacherClasses,
    useTeacherStudents,
    useStudentCreations,
  };
};
