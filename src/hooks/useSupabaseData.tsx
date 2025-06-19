import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch site assets
  const useSiteAssets = (usageContext?: string) => {
    return useQuery({
      queryKey: ['site-assets', usageContext],
      queryFn: async () => {
        let query = supabase
          .from('site_assets')
          .select('*')
          .eq('is_active', true);
        
        if (usageContext) {
          query = query.eq('usage_context', usageContext);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data;
      },
    });
  };

  // Fetch learning tracks
  const useLearningTracks = () => {
    return useQuery({
      queryKey: ['learning-tracks'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('learning_tracks')
          .select('*')
          .order('order_index');
        
        if (error) throw error;
        return data;
      },
    });
  };

  // Fetch lessons for a track
  const useLessons = (trackId: string) => {
    return useQuery({
      queryKey: ['lessons', trackId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('track_id', trackId)
          .order('order_index');
        
        if (error) throw error;
        return data;
      },
      enabled: !!trackId,
    });
  };

  // Fetch user's lesson progress
  const useUserProgress = () => {
    return useQuery({
      queryKey: ['user-progress', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user?.id);
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Fetch user's creations
  const useUserCreations = () => {
    return useQuery({
      queryKey: ['user-creations', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Fetch user's music creations
  const useUserMusicCreations = () => {
    return useQuery({
      queryKey: ['user-music-creations', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('music_creations')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Check user limits using new function
  const useCheckUserLimits = () => {
    return useMutation({
      mutationFn: async () => {
        const { data, error } = await supabase.functions.invoke('check-user-limits', {
          body: { userId: user?.id }
        });
        
        if (error) throw error;
        return data;
      },
    });
  };

  // Save creation mutation
  const useSaveCreation = () => {
    return useMutation({
      mutationFn: async ({ type, data }: { type: string; data: any }) => {
        const { error } = await supabase
          .from('creations')
          .insert({
            user_id: user?.id,
            creation_type: type,
            creation_data: data
          });
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-creations'] });
      },
    });
  };

  // Update lesson progress mutation
  const useUpdateProgress = () => {
    return useMutation({
      mutationFn: async ({ lessonId, status }: { lessonId: string; status: string }) => {
        const { error } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user?.id,
            lesson_id: lessonId,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          });
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      },
    });
  };

  // Mark intro as seen mutation
  const useMarkIntroSeen = () => {
    return useMutation({
      mutationFn: async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ has_seen_intro: true })
          .eq('id', user?.id);
        
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      },
    });
  };

  // Generate music mutation
  const useGenerateMusic = () => {
    return useMutation({
      mutationFn: async ({ prompt, style, title, instrumental }: { 
        prompt: string; 
        style: string; 
        title: string; 
        instrumental: boolean; 
      }) => {
        const { data, error } = await supabase.functions.invoke('generate-music', {
          body: {
            prompt,
            style,
            title,
            instrumental,
            userId: user?.id
          }
        });
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-music-creations'] });
      },
    });
  };

  // Teacher dashboard functions (these were already there)
  const useTeacherClasses = () => {
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

  const useTeacherStudents = (classId?: string) => {
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

  const useStudentCreations = (studentId?: string, classId?: string) => {
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

  // NEW: Admin API functions
  const useAdminAPI = () => {
    return useMutation({
      mutationFn: async ({ endpoint, data }: { endpoint: string; data?: any }) => {
        const url = new URL(`https://dkmdtuwtvuvekzjyopaj.supabase.co/functions/v1/admin-api`);
        url.searchParams.set('endpoint', endpoint);
        
        const response = await fetch(url.toString(), {
          method: data ? 'POST' : 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbWR0dXd0dnV2ZWt6anlvcGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODYyMjEsImV4cCI6MjA2NDI2MjIyMX0.r3ya5-xVjqm9QelHD5r_DhsHYIiXz3loA28oMEuRjvY`,
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Admin API request failed');
        }
        
        return response.json();
      },
    });
  };

  // Admin organization registration
  const useRegisterOrganization = () => {
    return useMutation({
      mutationFn: async (organizationData: {
        organizationName: string;
        subdomain: string;
        adminEmail: string;
        adminName: string;
        phone?: string;
        packageType?: string;
      }) => {
        const { data, error } = await supabase.functions.invoke('admin-registration', {
          body: organizationData
        });
        
        if (error) throw error;
        return data;
      },
    });
  };

  return {
    useSiteAssets,
    useLearningTracks,
    useLessons,
    useUserProgress,
    useUserCreations,
    useSaveCreation,
    useUpdateProgress,
    useUserMusicCreations,
    useGenerateMusic,
    useMarkIntroSeen,
    useCheckUserLimits,
    // Teacher dashboard functions
    useTeacherClasses,
    useTeacherStudents,
    useStudentCreations,
    
    // New admin functions
    useAdminAPI,
    useRegisterOrganization,
  };
};
