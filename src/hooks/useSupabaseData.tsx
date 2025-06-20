
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Enhanced error handling function
  const handleQueryError = (error: any, context: string) => {
    console.error(`${context} error:`, error);
    
    if (error?.message?.includes('infinite recursion')) {
      toast.error('Database configuration issue. Please contact support.');
    } else if (error?.message?.includes('permission denied')) {
      toast.error('Access denied. You may not have permission to view this data.');
    } else if (error?.code === 'PGRST301') {
      toast.error('Multiple records found when expecting one. Please contact support.');
    } else {
      toast.error(`Failed to load ${context.toLowerCase()}. Please try again.`);
    }
  };

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
        
        if (error) {
          handleQueryError(error, 'Site assets');
          throw error;
        }
        return data;
      },
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
        
        if (error) {
          handleQueryError(error, 'Learning tracks');
          throw error;
        }
        return data;
      },
      retry: 2,
      staleTime: 10 * 60 * 1000, // 10 minutes
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
        
        if (error) {
          handleQueryError(error, 'Lessons');
          throw error;
        }
        return data;
      },
      enabled: !!trackId,
      retry: 2,
      staleTime: 10 * 60 * 1000,
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
        
        if (error) {
          handleQueryError(error, 'User progress');
          throw error;
        }
        return data;
      },
      enabled: !!user?.id,
      retry: 2,
      staleTime: 5 * 60 * 1000,
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
        
        if (error) {
          handleQueryError(error, 'User creations');
          throw error;
        }
        return data;
      },
      enabled: !!user?.id,
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2 minutes for fresher data
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
        
        if (error) {
          handleQueryError(error, 'Music creations');
          throw error;
        }
        return data;
      },
      enabled: !!user?.id,
      retry: 2,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Check user limits using new function
  const useCheckUserLimits = () => {
    return useMutation({
      mutationFn: async () => {
        const { data, error } = await supabase.functions.invoke('check-user-limits', {
          body: { userId: user?.id }
        });
        
        if (error) {
          handleQueryError(error, 'User limits check');
          throw error;
        }
        return data;
      },
    });
  };

  // Save creation mutation
  const useSaveCreation = () => {
    return useMutation({
      mutationFn: async ({ type, data }: { type: string; data: any }) => {
        if (!user?.id) {
          throw new Error('User must be logged in to save creations');
        }

        const { error } = await supabase
          .from('creations')
          .insert({
            user_id: user.id,
            creation_type: type,
            creation_data: data
          });
        
        if (error) {
          handleQueryError(error, 'Save creation');
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-creations'] });
        toast.success('Creation saved successfully!');
      },
      onError: () => {
        toast.error('Failed to save creation. Please try again.');
      },
    });
  };

  // Update lesson progress mutation
  const useUpdateProgress = () => {
    return useMutation({
      mutationFn: async ({ lessonId, status }: { lessonId: string; status: string }) => {
        if (!user?.id) {
          throw new Error('User must be logged in to update progress');
        }

        const { error } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          });
        
        if (error) {
          handleQueryError(error, 'Update progress');
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        toast.success('Progress updated!');
      },
    });
  };

  // Mark intro as seen mutation
  const useMarkIntroSeen = () => {
    return useMutation({
      mutationFn: async () => {
        if (!user?.id) {
          throw new Error('User must be logged in');
        }

        const { error } = await supabase
          .from('profiles')
          .update({ has_seen_intro: true })
          .eq('id', user.id);
        
        if (error) {
          handleQueryError(error, 'Mark intro seen');
          throw error;
        }
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
        if (!user?.id) {
          throw new Error('User must be logged in to generate music');
        }

        const { data, error } = await supabase.functions.invoke('generate-music', {
          body: {
            prompt,
            style,
            title,
            instrumental,
            userId: user.id
          }
        });
        
        if (error) {
          handleQueryError(error, 'Generate music');
          throw error;
        }
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-music-creations'] });
        toast.success('Music generation started!');
      },
    });
  };

  // Teacher dashboard functions with enhanced error handling
  const useTeacherClasses = () => {
    return useQuery({
      queryKey: ['teacher-classes', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('teacher-dashboard', {
          body: { endpoint: 'classes' }
        });
        
        if (error) {
          handleQueryError(error, 'Teacher classes');
          throw error;
        }
        return data?.data || [];
      },
      enabled: !!user?.id,
      retry: 1,
      staleTime: 5 * 60 * 1000,
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
        
        if (error) {
          handleQueryError(error, 'Teacher students');
          throw error;
        }
        return data?.data || [];
      },
      enabled: !!user?.id,
      retry: 1,
      staleTime: 5 * 60 * 1000,
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
        
        if (error) {
          handleQueryError(error, 'Student creations');
          throw error;
        }
        return data?.data || [];
      },
      enabled: !!user?.id,
      retry: 1,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Fixed Admin API function with proper authentication
  const useAdminAPI = () => {
    return useMutation({
      mutationFn: async ({ endpoint, data }: { endpoint: string; data?: any }) => {
        // Get the current session to use the access token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No active session');
        }

        const url = new URL(`https://dkmdtuwtvuvekzjyopaj.supabase.co/functions/v1/admin-api`);
        url.searchParams.set('endpoint', endpoint);
        
        const response = await fetch(url.toString(), {
          method: data ? 'POST' : 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
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
      onError: (error) => {
        handleQueryError(error, 'Admin API');
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
        
        if (error) {
          handleQueryError(error, 'Organization registration');
          throw error;
        }
        return data;
      },
      onSuccess: () => {
        toast.success('Organization registered successfully!');
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
    
    // Admin functions
    useAdminAPI,
    useRegisterOrganization,
  };
};
