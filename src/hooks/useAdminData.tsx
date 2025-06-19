
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all organizations (Super Admin only)
  const useAllOrganizations = () => {
    return useQuery({
      queryKey: ['all-organizations', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_all_organizations', {
          p_user_id: user?.id
        });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  // Fetch organization details (role-aware)
  const useOrganizationDetails = (organizationId: string) => {
    return useQuery({
      queryKey: ['organization-details', user?.id, organizationId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_organization_details', {
          p_user_id: user?.id,
          p_target_org_id: organizationId
        });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id && !!organizationId,
    });
  };

  // Fetch organization teachers (role-aware)
  const useOrganizationTeachers = (organizationId: string) => {
    return useQuery({
      queryKey: ['organization-teachers', user?.id, organizationId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_organization_teachers', {
          p_user_id: user?.id,
          p_target_org_id: organizationId
        });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id && !!organizationId,
    });
  };

  // Fetch organization analytics (role-aware)
  const useOrganizationAnalytics = (organizationId: string) => {
    return useQuery({
      queryKey: ['organization-analytics', user?.id, organizationId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_organization_analytics', {
          p_user_id: user?.id,
          p_target_org_id: organizationId
        });
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id && !!organizationId,
    });
  };

  // Update organization status
  const useUpdateOrganizationStatus = () => {
    return useMutation({
      mutationFn: async ({ orgId, status }: { orgId: string; status: string }) => {
        const { error } = await supabase
          .from('organizations')
          .update({ status })
          .eq('id', orgId);
        
        if (error) throw error;

        // Log audit action
        await supabase.rpc('log_audit_action', {
          p_actor_user_id: user?.id,
          p_action_type: 'organization_status_update',
          p_target_type: 'organization',
          p_target_id: orgId,
          p_details: { new_status: status }
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
      },
    });
  };

  // Deactivate user
  const useDeactivateUser = () => {
    return useMutation({
      mutationFn: async (userId: string) => {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', userId);
        
        if (error) throw error;

        // Log audit action
        await supabase.rpc('log_audit_action', {
          p_actor_user_id: user?.id,
          p_action_type: 'user_deactivation',
          p_target_type: 'profile',
          p_target_id: userId,
          p_details: { action: 'deactivated' }
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organization-teachers'] });
      },
    });
  };

  return {
    useAllOrganizations,
    useOrganizationDetails,
    useOrganizationTeachers,
    useOrganizationAnalytics,
    useUpdateOrganizationStatus,
    useDeactivateUser,
  };
};
