// Fix for TypeScript error in excel-lead-transform.ts
// The error suggests there's a line where a string is being assigned to a never type
// Without seeing the full file, here's a generic fix that should resolve this type issue:

// Properly type the extra_data field to accept any string keys
export interface ExtraDataType {
  [key: string]: string | number | boolean | null;
}

export const processExtraData = (data: Record<string, any>): ExtraDataType => {
  const result: ExtraDataType = {};
  
  // Process and validate each field
  Object.entries(data).forEach(([key, value]) => {
    // Ensure the key is a string and value is properly typed
    if (typeof key === 'string') {
      if (typeof value === 'string' || 
          typeof value === 'number' || 
          typeof value === 'boolean' || 
          value === null) {
        result[key] = value;
      } else {
        // Convert other types to string
        result[key] = String(value);
      }
    }
  });
  
  return result;
};
