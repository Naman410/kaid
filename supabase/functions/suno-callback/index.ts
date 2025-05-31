
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
    const callbackData = await req.json();
    
    console.log('SUNO callback received:', callbackData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { taskId, status, audio_url } = callbackData;

    // Update the music creation record
    const updateData: any = {
      status: status === 'complete' ? 'completed' : status,
      completed_at: status === 'complete' ? new Date().toISOString() : null
    };

    if (audio_url) {
      updateData.audio_url = audio_url;
    }

    const { error: updateError } = await supabase
      .from('music_creations')
      .update(updateData)
      .eq('task_id', taskId);

    if (updateError) {
      throw new Error('Failed to update music creation record');
    }

    console.log('Music creation updated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Callback processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suno-callback function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
