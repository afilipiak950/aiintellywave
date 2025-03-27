
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform knowledge that we want to include as context for the AI
const platformKnowledge = `
MIRA Platform Documentation:

# Navigation
- Dashboard: Central hub with project tiles, statistics, and quick navigation
- Projects: View, create and manage all your projects
- Appointments: Schedule and manage meetings and events
- Documents: Access project-related files and documentation
- MIRA AI: AI assistant for intelligent support
- KI-Personas: Create and manage AI assistants for different tasks
- Profile: Manage your personal settings and profile information

# Project Management
- Creating a Project: Click the "New Project" button on the Projects page
- Project Details: Click on any project to view details, files, feedback, and progress
- Project Status: Projects can be in planning, active, completed, or canceled states
- Adding Feedback: Use the feedback tab in project details to communicate with team

# Appointment Scheduling
- Create appointments from the Appointments page
- Invite team members and clients to meetings
- Connect with calendar integrations

# AI Features
- MIRA AI: Ask questions, get recommendations, and automate tasks
- KI-Personas: Create specialized AI assistants with different expertise areas
- Email analysis using AI helps understand communication patterns

# User Settings
- Profile: Update personal information, contact details, and profile picture
- Set notification preferences for project updates and messages
- Change language and appearance settings

# Common Questions
Q: How do I create a new project?
A: Navigate to the Projects page and click on the "New Project" button in the top right corner.

Q: Where can I find my files?
A: Files are stored in the Documents section, accessible from the dashboard or via the specific project's details page.

Q: How do I invite team members?
A: Team members can be invited through the Profile > Settings > Team section.

Q: Can I analyze my email communication?
A: Yes, connect your email through the KI-Personas section to analyze communication patterns.

Q: How do I change the platform language?
A: Language settings can be found in Profile > Settings > Language.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('AI Search query received:', query);

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(
        JSON.stringify({
          error: 'AI search is not properly configured. Contact administrator.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that answers questions about the MIRA platform. 
            Only provide information based on the following platform documentation.
            Your answers should be concise, factual, and directly related to the platform.
            If you don't know the answer or if the information isn't in the documentation, politely say so and suggest contacting support.
            Here is the platform documentation:
            ${platformKnowledge}`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Error processing your request. Please try again later.',
          details: data
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const answer = data.choices[0].message.content;
    console.log('AI Search response:', answer.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
