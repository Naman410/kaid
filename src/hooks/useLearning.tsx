
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useLearningTracks = () => {
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

export const useLessons = (trackId: string) => {
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

export const useUserProgress = () => {
  const { user } = useAuth();
  
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

export const useUpdateProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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

export const useMarkIntroSeen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
