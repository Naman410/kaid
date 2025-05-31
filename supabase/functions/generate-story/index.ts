
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
    const { prompt, genre, length, userInput } = await req.json();
    
    console.log('Story generation request:', { prompt, genre, length, userInput });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create child-safe system prompt
    const systemPrompt = `You are a creative children's storyteller who writes safe, educational, and entertaining stories for kids aged 5-10. 

Guidelines:
- Create ${genre} stories that are completely appropriate for children
- Keep stories positive, educational, and fun
- Maximum length: ${length === 'short' ? '150' : length === 'medium' ? '300' : '500'} words
- Include themes of friendship, curiosity, problem-solving, and kindness
- Avoid any scary, violent, or inappropriate content
- Use simple, engaging language that children can understand
- Make the story interactive and imaginative

Continue the story based on the user's input: "${userInput}"
Previous context: ${prompt || 'Beginning a new story'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput || 'Start a magical adventure story' }
        ],
        max_tokens: length === 'short' ? 200 : length === 'medium' ? 400 : 600,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate story');
    }

    const data = await response.json();
    const generatedStory = data.choices[0].message.content;

    console.log('Story generated successfully');

    return new Response(JSON.stringify({ 
      story: generatedStory,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
