
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

    // Get current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('request_count_today, subscription_status')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch user profile');
    }

    // Check usage limits
    const dailyLimit = profile.subscription_status === 'premium' ? 50 : 10;
    const currentUsage = profile.request_count_today || 0;

    if (currentUsage >= dailyLimit) {
      return new Response(JSON.stringify({ 
        canProceed: false,
        message: `Daily limit of ${dailyLimit} creations reached. ${profile.subscription_status === 'free' ? 'Upgrade for more!' : 'Try again tomorrow!'}`,
        remainingUses: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        request_count_today: currentUsage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update usage count');
    }

    console.log('Usage tracked successfully');

    return new Response(JSON.stringify({ 
      canProceed: true,
      remainingUses: dailyLimit - (currentUsage + 1),
      message: 'Usage tracked successfully'
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
