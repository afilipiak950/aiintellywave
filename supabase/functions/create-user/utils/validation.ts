
// Define the request payload structure for user creation
export interface UserCreationPayload {
  email: string;
  name: string;
  company_id: string;
  role?: 'admin' | 'manager' | 'customer';  // Using explicit string union type to match database enum
  language?: string;
  password?: string; // Add password field
  address?: string;  // Add address field
  city?: string;     // Add city field
  country?: string;  // Add country field
}

// Validate the incoming request payload for completeness and correctness
export function validatePayload(input: any): { valid: boolean; errorMessage?: string; data?: UserCreationPayload } {
  console.log('Validating payload:', JSON.stringify(input));
  
  // Extract all fields from input with default values where appropriate
  const { 
    email, 
    name, 
    company_id, 
    role = 'customer', 
    language = 'en',
    password,  // Extract password from input
    address,   // Extract address from input
    city,      // Extract city from input
    country    // Extract country from input
  } = input;
  
  // Check required fields existence
  if (!email || typeof email !== 'string') {
    return { valid: false, errorMessage: 'Valid email is required' };
  }
  
  if (!name || typeof name !== 'string') {
    return { valid: false, errorMessage: 'Name is required' };
  }
  
  if (!company_id || typeof company_id !== 'string') {
    return { valid: false, errorMessage: 'Company ID is required' };
  }
  
  // Validate email format with a basic regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, errorMessage: 'Invalid email format' };
  }
  
  // Validate role is one of the allowed values
  const validRoles = ['admin', 'manager', 'customer'];
  if (role && !validRoles.includes(role)) {
    console.error('Invalid role value:', role);
    return {
      valid: false,
      errorMessage: `Role must be one of: ${validRoles.map(r => `'${r}'`).join(', ')}`
    };
  }
  
  // All validations passed, return the validated data
  const validatedData: UserCreationPayload = { 
    email, 
    name, 
    company_id, 
    role, 
    language,
    password,  // Include password in validated data
    address,   // Include address in validated data
    city,      // Include city in validated data
    country    // Include country in validated data
  };
  
  console.log('Validation successful:', {...validatedData, password: password ? '******' : undefined});
  return { valid: true, data: validatedData };
}
