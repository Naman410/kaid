
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, actionType } = await req.json();
    
    console.log('Usage tracking request:', { userId, actionType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user profile to determine user type
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_type, organization_id, total_creations_used, subscription_status')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch user profile');
    }

    // Handle B2B users with separate tracking
    if (profile.user_type === 'b2b_student' && profile.organization_id) {
      // Use the track_b2b_usage function for B2B users
      const { error: trackError } = await supabase.rpc('track_b2b_usage', {
        user_id_param: userId
      });

      if (trackError) {
        throw new Error('Failed to track B2B usage');
      }

      // Check limits using the check_user_limits function
      const { data: limitCheck, error: limitError } = await supabase.rpc('check_user_limits', {
        user_id_param: userId
      });

      if (limitError) {
        throw new Error('Failed to check user limits');
      }

      return new Response(JSON.stringify({ 
        canProceed: limitCheck.canProceed,
        message: limitCheck.canProceed ? 'Usage tracked successfully' : 'Usage limit reached',
        userType: 'b2b',
        dailyRemaining: limitCheck.dailyRemaining,
        monthlyRemaining: limitCheck.monthlyRemaining
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle B2C users with existing logic (lifetime limit of 10 for free users)
    const totalLimit = profile.subscription_status === 'premium' ? 999999 : 10;
    const currentUsage = profile.total_creations_used || 0;

    if (currentUsage >= totalLimit) {
      return new Response(JSON.stringify({ 
        canProceed: false,
        message: `Creation limit of ${totalLimit} reached. ${profile.subscription_status === 'free' ? 'Upgrade for unlimited creations!' : 'Contact support for assistance.'}`,
        remainingUses: 0,
        userType: 'b2c'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment B2C usage count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_creations_used: currentUsage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update usage count');
    }

    console.log('B2C usage tracked successfully');

    return new Response(JSON.stringify({ 
      canProceed: true,
      remainingUses: totalLimit - (currentUsage + 1),
      message: 'Usage tracked successfully',
      userType: 'b2c'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-usage function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      canProceed: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
