
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      throw new Error('Only POST method allowed');
    }

    const { 
      organizationName, 
      subdomain, 
      adminEmail, 
      adminName, 
      phone, 
      packageType = 'basic' 
    } = await req.json();

    console.log(`Organization Registration Request: { name: "${organizationName}", email: "${adminEmail}" }`);

    // Validate required fields
    if (!organizationName || !subdomain || !adminEmail || !adminName) {
      throw new Error('Missing required fields: organizationName, subdomain, adminEmail, adminName');
    }

    // Check if subdomain already exists
    const { data: existingOrg, error: checkError } = await supabaseClient
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingOrg) {
      throw new Error('Subdomain already exists');
    }

    // Create organization record
    const { data: newOrg, error: createOrgError } = await supabaseClient
      .from('organizations')
      .insert({
        name: organizationName,
        subdomain: subdomain,
        package_type: packageType,
        status: 'pending',
        admin_email: adminEmail,
        phone: phone
      })
      .select()
      .single();

    if (createOrgError) throw createOrgError;

    console.log(`Organization Created: { id: "${newOrg.id}", status: "pending" }`);

    // TODO: Send notification email to super admins about new registration
    // This would typically integrate with an email service

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Organization registration submitted successfully. You will be notified once approved.',
      organizationId: newOrg.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin Registration Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Registration failed' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
