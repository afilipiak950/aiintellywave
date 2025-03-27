
import { corsHeaders } from "./utils.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Interface for OpenAI completion request messages
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Main function to call OpenAI API
export async function callOpenAI(query: string, abortSignal: AbortSignal) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: createMessages(query),
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: abortSignal
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Raw OpenAI response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      return extractAnswer(data);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    // Rethrow abort errors so they can be handled separately
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Error calling OpenAI:', error);
    throw new Error(`Error processing AI request: ${error.message || 'Unknown error'}`);
  }
}

// Helper function to create the messages array for OpenAI
function createMessages(query: string): Message[] {
  return [
    {
      role: 'system',
      content: `You are a helpful assistant that answers questions about the MIRA platform. 
              Only provide information based on the following platform documentation.
              Your answers should be concise, factual, and directly related to the platform.
              If you don't know the answer or if the information isn't in the documentation, politely say so and suggest contacting support.
              Here is the platform documentation:
              ${Deno.env.get('PLATFORM_KNOWLEDGE') || ''}`
    },
    { role: 'user', content: query }
  ];
}

// Helper function to extract the answer from OpenAI response
function extractAnswer(data: any): string {
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Received invalid response format from AI service');
  }

  const answer = data.choices[0].message.content;
  console.log('AI Search response:', answer.substring(0, 100) + '...');
  return answer;
}
