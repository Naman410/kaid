
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  id: string;
  user_type: 'super_admin' | 'admin' | 'teacher' | 'b2b_student' | 'b2c_student';
  organization_id?: string;
  username: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate and get user profile
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const userProfile = profile as UserProfile;
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');

    console.log(`Admin API Request: { endpoint: "${endpoint}", userId: "${user.id}", userType: "${userProfile.user_type}" }`);

    // Validate role helper function
    const validateRole = (allowedRoles: string[]) => {
      if (!allowedRoles.includes(userProfile.user_type)) {
        throw new Error(`Unauthorized: Required roles: ${allowedRoles.join(', ')}`);
      }
    };

    let result;

    switch (endpoint) {
      // --- SUPER ADMIN ONLY ENDPOINTS ---
      case 'get_all_organizations':
        validateRole(['super_admin']);
        const { data: allOrgsData, error: allOrgsError } = await supabaseClient
          .rpc('get_all_organizations', { p_user_id: user.id });
        if (allOrgsError) throw allOrgsError;
        result = allOrgsData;
        break;

      case 'approve_organization':
        validateRole(['super_admin']);
        const { organizationId, adminEmail, adminName } = await req.json();
        
        // Update organization status
        const { error: updateOrgError } = await supabaseClient
          .from('organizations')
          .update({ status: 'approved' })
          .eq('id', organizationId);
        
        if (updateOrgError) throw updateOrgError;

        // Log audit action
        await supabaseClient.rpc('log_audit_action', {
          p_actor_user_id: user.id,
          p_action_type: 'approve_organization',
          p_target_type: 'organization',
          p_target_id: organizationId,
          p_details: { admin_email: adminEmail, admin_name: adminName }
        });

        result = { success: true, message: 'Organization approved successfully' };
        break;

      case 'update_organization_settings':
        validateRole(['super_admin']);
        const { organizationId: orgId, settings } = await req.json();
        
        const { error: updateSettingsError } = await supabaseClient
          .from('organizations')
          .update(settings)
          .eq('id', orgId);
        
        if (updateSettingsError) throw updateSettingsError;

        // Log audit action
        await supabaseClient.rpc('log_audit_action', {
          p_actor_user_id: user.id,
          p_action_type: 'update_organization_settings',
          p_target_type: 'organization',
          p_target_id: orgId,
          p_details: settings
        });

        result = { success: true, message: 'Organization settings updated successfully' };
        break;

      case 'get_audit_logs':
        validateRole(['super_admin']);
        const { data: auditData, error: auditError } = await supabaseClient
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (auditError) throw auditError;
        result = auditData;
        break;

      // --- ADMIN & SUPER ADMIN ENDPOINTS ---
      case 'get_organization_details':
        validateRole(['admin', 'super_admin']);
        const targetOrgId = url.searchParams.get('organizationId') || userProfile.organization_id;
        if (!targetOrgId) throw new Error('Organization ID required');

        const { data: orgDetailsData, error: orgDetailsError } = await supabaseClient
          .rpc('get_organization_details', { 
            p_user_id: user.id, 
            p_target_org_id: targetOrgId 
          });
        if (orgDetailsError) throw orgDetailsError;
        result = orgDetailsData;
        break;

      case 'get_organization_teachers':
        validateRole(['admin', 'super_admin']);
        const teachersOrgId = url.searchParams.get('organizationId') || userProfile.organization_id;
        if (!teachersOrgId) throw new Error('Organization ID required');

        const { data: teachersData, error: teachersError } = await supabaseClient
          .rpc('get_organization_teachers', { 
            p_user_id: user.id, 
            p_target_org_id: teachersOrgId 
          });
        if (teachersError) throw teachersError;
        result = teachersData;
        break;

      case 'create_teacher':
        validateRole(['admin', 'super_admin']);
        const { email, fullName, organizationId: teacherOrgId } = await req.json();
        const finalOrgId = teacherOrgId || userProfile.organization_id;
        if (!finalOrgId) throw new Error('Organization ID required');

        // Create auth user for teacher
        const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
          email: email,
          password: Math.random().toString(36).slice(-8), // Temporary password
          email_confirm: true,
          user_metadata: {
            user_type: 'teacher',
            full_name: fullName
          }
        });

        if (createUserError) throw createUserError;

        // Create teacher record
        const { error: createTeacherError } = await supabaseClient
          .from('teachers')
          .insert({
            user_id: newUser.user.id,
            organization_id: finalOrgId,
            full_name: fullName,
            email: email
          });

        if (createTeacherError) throw createTeacherError;

        // Update profile
        const { error: updateProfileError } = await supabaseClient
          .from('profiles')
          .update({
            user_type: 'teacher',
            organization_id: finalOrgId
          })
          .eq('id', newUser.user.id);

        if (updateProfileError) throw updateProfileError;

        // Log audit action
        await supabaseClient.rpc('log_audit_action', {
          p_actor_user_id: user.id,
          p_action_type: 'create_teacher',
          p_target_type: 'teacher',
          p_target_id: newUser.user.id,
          p_details: { email, full_name: fullName, organization_id: finalOrgId }
        });

        result = { success: true, message: 'Teacher created successfully', teacherId: newUser.user.id };
        break;

      case 'get_organization_analytics':
        validateRole(['admin', 'super_admin']);
        const analyticsOrgId = url.searchParams.get('organizationId') || userProfile.organization_id;
        if (!analyticsOrgId) throw new Error('Organization ID required');

        const { data: analyticsData, error: analyticsError } = await supabaseClient
          .rpc('get_organization_analytics', { 
            p_user_id: user.id, 
            p_target_org_id: analyticsOrgId 
          });
        if (analyticsError) throw analyticsError;
        result = analyticsData;
        break;

      case 'get_organization_students':
        validateRole(['admin', 'super_admin']);
        const studentsOrgId = url.searchParams.get('organizationId') || userProfile.organization_id;
        if (!studentsOrgId) throw new Error('Organization ID required');

        const { data: studentsData, error: studentsError } = await supabaseClient
          .from('student_enrollments')
          .select(`
            *,
            profiles:student_id (
              id, username, avatar_url, total_creations_used
            ),
            classes:class_id (
              id, name
            )
          `)
          .eq('organization_id', studentsOrgId)
          .eq('is_active', true);

        if (studentsError) throw studentsError;
        result = studentsData;
        break;

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    console.log(`Admin API Success: { endpoint: "${endpoint}", resultType: "${typeof result}" }`);

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin API Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: error.message?.includes('Unauthorized') ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
