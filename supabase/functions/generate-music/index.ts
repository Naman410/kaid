
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
    const { prompt, style, title, instrumental, userId } = await req.json();
    
    console.log('Music generation request:', { prompt, style, title, instrumental, userId });

    const sunoApiToken = Deno.env.get('SUNO_API_TOKEN');
    if (!sunoApiToken) {
      throw new Error('SUNO API token not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create child-safe music prompt
    const safePrompt = `Create ${instrumental ? 'an instrumental' : 'a song with lyrics'} that is completely safe and appropriate for children aged 5-10. The music should be positive, educational, and fun. ${prompt}. Make sure the content is wholesome and contains no inappropriate themes.`;

    // Call SUNO API
    const response = await fetch('https://apibox.erweima.ai/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${sunoApiToken}`,
      },
      body: JSON.stringify({
        prompt: safePrompt,
        customMode: false,
        instrumental: instrumental,
        model: "V4",
        callBackUrl: `${supabaseUrl}/functions/v1/suno-callback`,
        style: "",
        title: ""
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to generate music');
    }

    const data = await response.json();
    const taskId = data.data.taskId;

    console.log('SUNO API response:', data);

    // Store the music creation record
    const { error: dbError } = await supabase
      .from('music_creations')
      .insert({
        user_id: userId,
        task_id: taskId,
        title: title,
        prompt: prompt,
        style: style,
        instrumental: instrumental,
        status: 'pending'
      });

    if (dbError) {
      throw new Error('Failed to save music creation record');
    }

    console.log('Music generation started successfully');

    return new Response(JSON.stringify({ 
      taskId,
      success: true,
      message: 'Music generation started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-music function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
