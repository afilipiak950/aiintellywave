
export interface CreateUserPayload {
  email: string;
  name: string;
  company_id: string;
  role?: string;  // Changed from user_role to string
  language?: string;
}

export function validateUserPayload(body: any): { isValid: boolean; error?: string; payload?: CreateUserPayload } {
  console.log('Validating user payload:', JSON.stringify(body));
  
  const { email, name, company_id, role = 'customer', language = 'en' } = body;
  
  // Validate required fields
  if (!email || !name || !company_id) {
    console.error('Missing required fields:', { email, name, company_id });
    return {
      isValid: false,
      error: 'Missing required fields: email, name, and company_id are required'
    };
  }
  
  return { 
    isValid: true, 
    payload: { email, name, company_id, role, language } 
  };
}
