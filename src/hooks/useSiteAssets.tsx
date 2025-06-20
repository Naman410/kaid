
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSiteAssets = (usageContext?: string) => {
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
