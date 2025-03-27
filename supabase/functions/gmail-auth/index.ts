
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  validateEnvVars, 
  handleCorsPreflightRequest, 
  createErrorResponse,
  parseRequest 
} from "./utils.ts";
import { 
  handleAuthorizeRequest, 
  handleTokenRequest, 
  handleFetchRequest 
} from "./handlers.ts";

/**
 * Main request handler
 * @param req Request object
 * @returns Response object
 */
async function handleRequest(req: Request) {
  console.log('Gmail Auth: Request received', {
    method: req.method,
    url: req.url
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // Validate environment variables first
    const envValidation = validateEnvVars();
    if (!envValidation.isValid) {
      console.error('Gmail auth: Missing required environment variables:', envValidation.missingVars);
      return createErrorResponse(`Missing required environment variables: ${envValidation.missingVars.join(', ')}`, 400);
    }

    // Parse and validate the request
    const { action, body } = await parseRequest(req);
    console.log('Gmail Auth: Processing request with action:', action);

    // Handle different actions
    switch (action) {
      case 'authorize':
        return await handleAuthorizeRequest();
      
      case 'token':
        return await handleTokenRequest(body);
      
      case 'fetch':
        return await handleFetchRequest(body);
      
      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error: any) {
    console.error('Error in gmail-auth function:', error);
    return createErrorResponse(error.message, 500);
  }
}

// Start the server
serve(handleRequest);
