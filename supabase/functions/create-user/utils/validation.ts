
export interface UserData {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  company_id?: string;
  language?: string;
}

export interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
  data?: UserData;
}

export function validatePayload(payload: any): ValidationResult {
  // Log the payload for debugging
  console.log('Validating payload:', JSON.stringify(payload));

  // Check if payload is present
  if (!payload) {
    return {
      valid: false,
      errorMessage: 'No payload provided',
    };
  }

  // Validate required fields
  if (!payload.email) {
    return {
      valid: false,
      errorMessage: 'Email is required',
    };
  }

  // Validate email format with a basic regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return {
      valid: false,
      errorMessage: 'Invalid email format',
    };
  }

  // Password is optional since we might want to generate a random one or send an invite link
  if (payload.password !== undefined && typeof payload.password !== 'string') {
    return {
      valid: false,
      errorMessage: 'Password must be a string',
    };
  }

  // Create the validated data object
  const validatedData: UserData = {
    email: payload.email,
    password: payload.password,
    name: payload.name || '',
    role: payload.role || 'customer',
    company_id: payload.company_id,
    language: payload.language || 'en',
  };

  console.log('Validation successful, validated data:', JSON.stringify(validatedData));

  return {
    valid: true,
    data: validatedData,
  };
}
