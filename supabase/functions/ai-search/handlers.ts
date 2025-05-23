
import { validateRequestData, createErrorResponse, createSuccessResponse, platformKnowledge } from "./utils.ts";
import { callOpenAI } from "./openai-client.ts";

// Set the platform knowledge using environment variable
const platformInfo = platformKnowledge;

// Main handler for AI search requests
export async function handleAISearch(req: Request): Promise<Response> {
  let requestData;
  try {
    requestData = await req.json();
  } catch (parseError) {
    console.error('Failed to parse request JSON:', parseError);
    return createErrorResponse(
      'Invalid request format. Please provide a JSON body.',
      parseError.message,
      400
    );
  }
  
  // Validate the request data
  const validation = validateRequestData(requestData);
  if (!validation.isValid) {
    return createErrorResponse(validation.error || 'Invalid request data', null, 400);
  }
  
  const { query } = requestData;
  console.log('AI Search query received:', query);

  // Set a timeout for the OpenAI request to prevent endless waiting
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    const answer = await callOpenAI(query, controller.signal);
    clearTimeout(timeoutId);
    
    console.log('AI Search response:', answer.substring(0, 100) + '...');
    return createSuccessResponse({ answer });
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('Request timed out');
      return createErrorResponse(
        'The search request timed out. Please try again with a simpler query.',
        null,
        408 // Request Timeout
      );
    }
    
    console.error('Error during OpenAI request:', error.message || 'Unknown error');
    return createErrorResponse(
      'Error processing your request. Please try again later.',
      error.message || 'Unknown error',
      500
    );
  }
}
