
export interface UserCreationPayload {
  email: string;
  name: string;
  role: string;
  company_id?: string; // Optional
  password?: string;
  language?: string;
}

export function validatePayload(body: any): { 
  valid: boolean; 
  errorMessage?: string; 
  data?: UserCreationPayload 
} {
  // Check if body is an object
  if (!body || typeof body !== 'object') {
    return { valid: false, errorMessage: 'Request body must be a valid JSON object' };
  }
  
  // Required fields validation
  const requiredFields = ['email', 'name', 'role'];
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return { 
      valid: false, 
      errorMessage: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }
  
  // Email format validation (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return { valid: false, errorMessage: 'Invalid email format' };
  }
  
  // Role validation - if needed
  const validRoles = ['admin', 'manager', 'customer', 'employee'];
  if (!validRoles.includes(body.role)) {
    return { 
      valid: false, 
      errorMessage: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
    };
  }
  
  // Return validated data
  return { 
    valid: true, 
    data: {
      email: body.email,
      name: body.name,
      role: body.role,
      company_id: body.company_id, // This is now optional
      password: body.password,
      language: body.language || 'en'
    }
  };
}
