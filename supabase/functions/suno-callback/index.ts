
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
    
    console.log('SUNO callback received:', JSON.stringify(callbackData, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the nested structure: callbackData.data.data contains the track array
    const responseData = callbackData.data;
    const taskId = responseData.task_id;
    const tracks = responseData.data || [];
    
    if (!taskId) {
      throw new Error('No task_id found in callback data');
    }

    // Use the first track as specified
    const firstTrack = tracks[0];
    
    let updateData: any = {
      status: callbackData.data.callbackType === 'complete' ? 'completed' : 'processing',
      completed_at: callbackData.data.callbackType === 'complete' ? new Date().toISOString() : null
    };

    // If we have track data, extract the enhanced information
    if (firstTrack) {
      // Prioritize source_stream_audio_url, then audio_url
      if (firstTrack.source_stream_audio_url) {
        updateData.audio_url = firstTrack.source_stream_audio_url;
      } else if (firstTrack.audio_url) {
        updateData.audio_url = firstTrack.audio_url;
      }
      
      if (firstTrack.image_url) {
        updateData.image_url = firstTrack.image_url;
      }
      
      if (firstTrack.duration) {
        updateData.duration = firstTrack.duration;
      }
      
      if (firstTrack.tags) {
        updateData.tags = firstTrack.tags;
      }
      
      if (firstTrack.id) {
        updateData.suno_track_id = firstTrack.id;
      }

      console.log('Extracted track data:', {
        audio_url: updateData.audio_url,
        image_url: firstTrack.image_url,
        duration: firstTrack.duration,
        tags: firstTrack.tags,
        suno_track_id: firstTrack.id
      });
    }

    // Update the music creation record
    const { error: updateError } = await supabase
      .from('music_creations')
      .update(updateData)
      .eq('task_id', taskId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update music creation record');
    }

    console.log('Music creation updated successfully with enhanced data');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Callback processed successfully',
      trackData: firstTrack ? {
        audio_url: updateData.audio_url,
        image_url: firstTrack.image_url,
        duration: firstTrack.duration
      } : null
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
