
/**
 * Request utilities for Gmail Auth edge function
 */

/**
 * Parses and validates the request body
 * @param req Request object
 * @returns Parsed body and action
 */
export async function parseRequest(req: Request) {
  let action = null;
  let body = {};
  
  // Parse request body if it's a POST request
  if (req.method === 'POST') {
    try {
      body = await req.json();
      action = body.action;
    } catch (e) {
      console.error('Error parsing request body:', e);
      throw new Error('Invalid JSON in request body');
    }
  } else {
    // Parse URL parameters if it's a GET request
    const url = new URL(req.url);
    action = url.searchParams.get('action');
  }
  
  return { action, body };
}

