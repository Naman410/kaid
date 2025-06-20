
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCheckUserLimits = () => {
  const { user } = useAuth();
  
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
