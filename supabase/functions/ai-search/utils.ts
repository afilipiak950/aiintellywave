
// CORS headers for edge function responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform knowledge that we want to include as context for the AI
export const platformKnowledge = `
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

// Helper function to validate request data
export function validateRequestData(data: any): { isValid: boolean; error?: string } {
  if (!data) {
    return { isValid: false, error: 'Invalid request format. Please provide a JSON body.' };
  }
  
  if (!data.query || data.query.trim() === '') {
    return { isValid: false, error: 'Please provide a valid search query.' };
  }
  
  return { isValid: true };
}

// Helper to create a standardized error response
export function createErrorResponse(error: string, details?: any, status = 400) {
  return new Response(
    JSON.stringify({
      error,
      ...(details ? { details } : {})
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Helper to create a successful response
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
