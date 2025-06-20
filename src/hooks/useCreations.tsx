
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserCreations = () => {
  const { user } = useAuth();
  
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

export const useSaveCreation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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

export const useUserMusicCreations = () => {
  const { user } = useAuth();
  
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

export const useGenerateMusic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
