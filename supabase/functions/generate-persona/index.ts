
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
    const { emailAnalyses } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Prepare a condensed version of the analyses for the prompt
    const analysesForPrompt = emailAnalyses.map((analysis: any) => ({
      tone: analysis.tone_analysis?.primary || 'Neutral',
      style: analysis.style_metrics?.style?.primary || 'Standard',
      formality: analysis.style_metrics?.metrics?.formality || 5,
      persuasiveness: analysis.style_metrics?.metrics?.persuasiveness || 5,
      clarity: analysis.style_metrics?.metrics?.clarity || 5,
      summary: analysis.summary || 'No summary available'
    }));
    
    const prompt = `
    I have analyzed ${analysesForPrompt.length} emails. Here are the key findings:
    
    ${JSON.stringify(analysesForPrompt, null, 2)}
    
    Based on these analyses, suggest a communication persona that captures the overall style, tone, and communication approach. 
    Recommend a name for this persona, a primary function (e.g., "follow-up emails", "new client outreach", etc.), 
    and a communication style (e.g., "professional", "friendly", "technical", etc.).
    
    Format your response as a JSON object with these keys:
    {
      "name": "string - a descriptive name for the persona",
      "primaryFunction": "string - main communication purpose",
      "communicationStyle": "string - style descriptor",
      "toneProfile": "string - formal/informal/mixed",
      "characteristics": ["array of key characteristics"],
      "strengths": ["array of communication strengths"],
      "suggestions": "string - brief suggestions for improvement"
    }`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert communication analyst that helps create AI personas based on email analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    const responseText = data.choices[0].message.content;
    let personaJson;
    
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      personaJson = JSON.parse(jsonString.replace(/```/g, '').trim());
    } catch (jsonError) {
      console.error('Error parsing persona JSON:', jsonError);
      // If parsing fails, return the raw text
      personaJson = { 
        raw: responseText,
        name: "Communication Persona",
        error: "Format error - see raw output"
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      persona: personaJson 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-persona function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
