
/**
 * Network utilities for Gmail Auth edge function
 */

/**
 * Tests DNS connectivity to a domain with multiple fallback mechanisms
 * @param domain Domain to test
 * @returns Promise with connectivity status
 */
export async function testDomainConnectivity(domain: string): Promise<{ success: boolean, error?: string, details?: any }> {
  try {
    console.log(`Testing connectivity to ${domain}...`);
    
    // Create multiple fetch attempts with different options
    const attempts = [];
    
    // Attempt 1: Standard fetch with 5 second timeout
    attempts.push(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`https://${domain}/`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*'
          }
        });
        
        clearTimeout(timeoutId);
        
        return {
          success: response.ok || response.status === 404, // 404 is fine, it means the domain exists
          status: response.status,
          statusText: response.statusText
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    });
    
    // Attempt 2: Try with a well-known path for the domain (robots.txt or other static resource)
    attempts.push(async () => {
      let path = '/robots.txt';
      if (domain === 'accounts.google.com' || domain === 'oauth2.googleapis.com') {
        path = '/o/oauth2/auth'; // A known endpoint for OAuth services
      } else if (domain === 'www.googleapis.com') {
        path = '/discovery/v1/apis';
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`https://${domain}${path}`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*'
          }
        });
        
        clearTimeout(timeoutId);
        
        return {
          success: true, // If we get any response, we count it as success for connectivity purposes
          status: response.status,
          statusText: response.statusText,
          path: path
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    });
    
    // Attempt 3: Try a GET request instead of HEAD (some servers might not support HEAD)
    attempts.push(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`https://${domain}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*'
          }
        });
        
        clearTimeout(timeoutId);
        
        return {
          success: response.ok || response.status === 404,
          status: response.status,
          statusText: response.statusText,
          method: 'GET'
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    });
    
    // Try each attempt in sequence, stopping at the first success
    const errors = [];
    for (const attemptFn of attempts) {
      try {
        const result = await attemptFn();
        if (result.success) {
          return {
            success: true,
            details: result
          };
        } else {
          errors.push(result);
        }
      } catch (err: any) {
        errors.push({
          error: err.message || 'Unknown error',
          name: err.name,
          cause: err.cause
        });
      }
    }
    
    // If we get here, all attempts failed
    return {
      success: false,
      error: 'All connection attempts failed',
      details: {
        errors,
        domain
      }
    };
    
  } catch (error: any) {
    console.error(`Connectivity test to ${domain} failed:`, error);
    
    // Provide more detailed error based on error type
    let errorDetails = error.message || 'Unknown error';
    
    if (error.name === 'AbortError') {
      errorDetails = 'Connection timed out after 5 seconds';
    } else if (error.cause && error.cause.code) {
      errorDetails = `Network error: ${error.cause.code}`;
    }
    
    return {
      success: false,
      error: errorDetails,
      details: {
        errorName: error.name,
        errorCause: error.cause ? (error.cause.code || error.cause.message) : 'Unknown cause',
        domain
      }
    };
  }
}

