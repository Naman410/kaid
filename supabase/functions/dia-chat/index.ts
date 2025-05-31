
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
    const { message, conversationHistory } = await req.json();
    
    console.log('D.I.A. chat request:', { message });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create D.I.A. system prompt
    const systemPrompt = `You are D.I.A. (Digital Intelligence Assistant), a friendly AI companion for children aged 5-10 learning about artificial intelligence and technology. 

Your personality:
- Enthusiastic, patient, and encouraging
- Use simple language appropriate for young children
- Always positive and supportive
- Love to teach about AI, robots, and technology in fun ways
- Use emojis to make conversations engaging
- Encourage creativity and curiosity

Guidelines:
- Keep responses short and easy to understand (2-3 sentences max)
- Always be completely safe and appropriate for children
- Focus on educational content about AI, technology, and creativity
- Encourage kids to explore the creative zones (Art Studio, Story Treehouse, Music Cave)
- Answer questions about how AI works in simple, relatable terms
- Be excited about learning and creating together

Remember: You're helping kids learn about AI while having fun!`;

    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Add recent conversation history (limit to last 6 messages)
      const recentHistory = conversationHistory.slice(-6);
      messages.push(...recentHistory);
    }
    
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get D.I.A. response');
    }

    const data = await response.json();
    const diaResponse = data.choices[0].message.content;

    console.log('D.I.A. response generated successfully');

    return new Response(JSON.stringify({ 
      response: diaResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dia-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
