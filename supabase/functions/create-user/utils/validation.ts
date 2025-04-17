
export interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
  data?: UserData;
}

export interface UserData {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  company_id?: string;
  language?: string;
}

export function validatePayload(payload: any): ValidationResult {
  console.log('Validating payload:', JSON.stringify(payload));
  
  // Check if payload exists
  if (!payload) {
    return {
      valid: false,
      errorMessage: 'Request payload is missing or empty'
    };
  }

  // Check if email is provided and valid
  if (!payload.email || typeof payload.email !== 'string') {
    return {
      valid: false,
      errorMessage: 'Email is required and must be a string'
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return {
      valid: false,
      errorMessage: 'Invalid email format'
    };
  }

  // Collect user data from payload
  const userData: UserData = {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role || 'customer',
    company_id: payload.company_id || null,
    language: payload.language || 'en'
  };

  console.log('Validation successful, validated data:', JSON.stringify(userData));
  
  return {
    valid: true,
    data: userData
  };
}
