
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
    const { userId } = await req.json();
    
    console.log('DIA usage tracking request:', { userId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('daily_dia_messages, last_dia_reset, subscription_status')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch user profile');
    }

    const now = new Date();
    const lastReset = new Date(profile.last_dia_reset || now);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    let currentMessages = profile.daily_dia_messages || 0;
    
    // Reset counter if it's a new day
    if (isNewDay) {
      currentMessages = 0;
    }

    // Check daily message limits (50 for both free and premium)
    const dailyLimit = 50;

    if (currentMessages >= dailyLimit) {
      return new Response(JSON.stringify({ 
        canProceed: false,
        message: "Today's message limit reached, come back tomorrow!",
        remainingMessages: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment message count
    const updateData = {
      daily_dia_messages: currentMessages + 1,
      updated_at: now.toISOString()
    };

    // Update reset time if it's a new day
    if (isNewDay) {
      updateData.last_dia_reset = now.toISOString();
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update DIA message count');
    }

    console.log('DIA usage tracked successfully');

    return new Response(JSON.stringify({ 
      canProceed: true,
      remainingMessages: dailyLimit - (currentMessages + 1),
      message: 'DIA message tracked successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-dia-usage function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      canProceed: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
