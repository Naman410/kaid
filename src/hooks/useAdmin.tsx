
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAPI = () => {
  return useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data?: any }) => {
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
  });
};

export const useRegisterOrganization = () => {
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
