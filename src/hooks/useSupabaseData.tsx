
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  return {
    useLearningTracks,
    useLessons,
    useUserProgress,
    useUserCreations,
    useSaveCreation,
    useUpdateProgress,
  };
};
