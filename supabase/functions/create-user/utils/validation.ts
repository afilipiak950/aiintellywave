
export interface UserCreationPayload {
  email: string;
  name: string;
  company_id?: string;
  role: 'admin' | 'manager' | 'customer';
  language?: string;
}

/**
 * Validates the user creation payload
 */
export function validatePayload(requestBody: any): { 
  valid: boolean; 
  errorMessage?: string;
  data?: UserCreationPayload;
} {
  console.log("Validating payload:", JSON.stringify(requestBody));
  
  // Check required fields
  if (!requestBody.email) {
    return { valid: false, errorMessage: "Missing required field: email" };
  }
  
  if (!requestBody.name) {
    return { valid: false, errorMessage: "Missing required field: name" };
  }
  
  // Validate role if present (default to 'customer' if missing)
  const role = requestBody.role || 'customer';
  if (role !== 'admin' && role !== 'manager' && role !== 'customer') {
    return { valid: false, errorMessage: "Invalid role. Must be 'admin', 'manager', or 'customer'" };
  }
  
  // Format the validated data
  const data: UserCreationPayload = {
    email: requestBody.email,
    name: requestBody.name,
    company_id: requestBody.company_id,
    role: role as 'admin' | 'manager' | 'customer',
    language: requestBody.language || 'en'
  };
  
  console.log("Validation successful:", JSON.stringify(data, null, 2));
  return { valid: true, data };
}
