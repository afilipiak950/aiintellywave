
import { Lead } from '@/types/lead';

/**
 * Maps Excel row data to a lead object
 * Handles dynamic field mapping and common field name variations
 */
export const transformExcelRowToLead = (
  rowData: Record<string, any>,
  projectId: string
): Partial<Lead> => {
  // Common field name variations
  const nameVariations = ['name', 'full name', 'fullname', 'contact name', 'contactname', 'person name'];
  const emailVariations = ['email', 'email address', 'emailaddress', 'mail'];
  const phoneVariations = ['phone', 'phone number', 'phonenumber', 'mobile', 'telephone', 'tel', 'contact'];
  const companyVariations = ['company', 'company name', 'organization', 'organisation', 'business', 'firm'];
  const positionVariations = ['position', 'job title', 'jobtitle', 'title', 'role', 'designation'];

  // Helper to find value by checking multiple possible field names
  const findValue = (variations: string[]): string | null => {
    for (const field of variations) {
      // Check exact match first
      if (rowData[field] !== undefined && rowData[field] !== null) {
        return rowData[field] || null;
      }
      
      // Check case-insensitive match
      const caseInsensitiveKey = Object.keys(rowData).find(
        key => key.toLowerCase() === field.toLowerCase()
      );
      
      if (caseInsensitiveKey && rowData[caseInsensitiveKey] !== undefined && rowData[caseInsensitiveKey] !== null) {
        return rowData[caseInsensitiveKey] || null;
      }
    }
    return null;
  };

  // Extract the core lead fields
  const name = findValue(nameVariations) || 'Unnamed Lead';
  const email = findValue(emailVariations);
  const phone = findValue(phoneVariations);
  const company = findValue(companyVariations);
  const position = findValue(positionVariations);
  
  // Create the lead object with the basic information
  const lead: Partial<Lead> = {
    project_id: projectId,
    name,
    email,
    phone,
    company,
    position,
    status: 'new',
    score: 0, // Default score
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['excel-import'],
    extra_data: {}
  };
  
  // Add any additional fields to extra_data
  Object.keys(rowData).forEach(key => {
    // Skip fields we've already processed
    const lowerKey = key.toLowerCase();
    const isProcessedField = 
      nameVariations.some(v => v.toLowerCase() === lowerKey) ||
      emailVariations.some(v => v.toLowerCase() === lowerKey) ||
      phoneVariations.some(v => v.toLowerCase() === lowerKey) ||
      companyVariations.some(v => v.toLowerCase() === lowerKey) ||
      positionVariations.some(v => v.toLowerCase() === lowerKey);
    
    if (!isProcessedField && rowData[key] !== undefined && rowData[key] !== null) {
      if (!lead.extra_data) lead.extra_data = {};
      lead.extra_data[key] = rowData[key];
    }
  });
  
  console.log(`Transformed lead: ${name} with fields: ${Object.keys(lead).join(', ')}`);
  
  return lead;
};
