
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { emailContent } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a smaller, faster model
        messages: [
          { 
            role: 'system', 
            content: `You are an expert email analyzer. Analyze the following email and provide a detailed analysis of its:
            1. Tone (formal, informal, friendly, professional, etc.)
            2. Style (concise, verbose, technical, simple, etc.)
            3. Language characteristics (vocabulary level, sentence structure, etc.)
            4. Sentiment (positive, negative, neutral)
            5. Formality level (on a scale of 1-10)
            6. Persuasiveness (on a scale of 1-10)
            7. Clarity (on a scale of 1-10)
            
            Format the response as a JSON object with these keys:
            {
              "tone": {"primary": "string", "secondary": "string", "description": "string"},
              "style": {"primary": "string", "characteristics": ["string"]},
              "language": {"level": "string", "features": ["string"]},
              "metrics": {"formality": number, "persuasiveness": number, "clarity": number},
              "summary": "string"
            }`
          },
          { role: 'user', content: emailContent }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    const analysisText = data.choices[0].message.content;
    let analysisJson;
    
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                        analysisText.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText;
      analysisJson = JSON.parse(jsonString.replace(/```/g, '').trim());
    } catch (jsonError) {
      console.error('Error parsing analysis JSON:', jsonError);
      // If parsing fails, return the raw text
      analysisJson = { 
        raw: analysisText,
        summary: "Analysis format error - see raw output"
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisJson 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-email function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
