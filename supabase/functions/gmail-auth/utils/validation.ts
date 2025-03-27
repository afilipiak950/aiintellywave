
/**
 * Validation utilities for Gmail Auth edge function
 */

/**
 * Validates required environment variables
 * @returns Object with validation status and missing variables
 */
export function validateEnvVars() {
  const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
  const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
  const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
  
  const missingVars = [];
  
  if (!CLIENT_ID) missingVars.push('GMAIL_CLIENT_ID');
  if (!CLIENT_SECRET) missingVars.push('GMAIL_CLIENT_SECRET');
  if (!REDIRECT_URI) missingVars.push('REDIRECT_URI');
  
  return {
    isValid: missingVars.length === 0,
    missingVars: missingVars,
    envVars: {
      clientIdSet: !!CLIENT_ID,
      clientIdLength: CLIENT_ID ? CLIENT_ID.length : 0,
      clientIdPrefix: CLIENT_ID ? CLIENT_ID.substring(0, 10) + '...' : 'not set',
      clientIdMatch: CLIENT_ID === '815248398322-3q99ebfhlprektm3tte5a0n1mcejqc7p.apps.googleusercontent.com',
      clientSecretSet: !!CLIENT_SECRET,
      clientSecretLength: CLIENT_SECRET ? CLIENT_SECRET.length : 0,
      clientSecretPrefix: CLIENT_SECRET ? CLIENT_SECRET.substring(0, 5) + '...' : 'not set',
      clientSecretMatch: CLIENT_SECRET === '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',
      redirectUri: REDIRECT_URI || 'not set'
    }
  };
}

