
import { Lead } from '@/types/lead';

/**
 * Transforms raw Excel data into a lead object with comprehensive field mapping
 * @param rowData The Excel row data as a Record
 * @param projectId The project ID to associate with the lead
 * @returns A partial Lead object ready for insertion
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string): Partial<Lead> => {
  console.log('Transforming Excel row to lead. Row data:', rowData);
  
  // Helper function to find a field value with multiple possible column names
  const findField = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      if (rowData[name] !== undefined && rowData[name] !== null) return String(rowData[name]);
      // Try case-insensitive match
      const key = Object.keys(rowData).find(k => k.toLowerCase() === name.toLowerCase());
      if (key && rowData[key] !== undefined && rowData[key] !== null) return String(rowData[key]);
    }
    return null;
  };
  
  // Extract lead data with comprehensive field matching
  const name = findField([
    'Name', 'name', 'Full Name', 'FullName', 'full_name', 
    'First Name', 'FirstName', 'first_name', 'Contact Name', 'contact_name',
    'Customer Name', 'customer_name', 'Client Name', 'client_name'
  ]) || 'Unnamed Lead';
  
  const company = findField([
    'Company', 'company', 'Organization', 'CompanyName', 'company_name',
    'Business', 'business', 'Employer', 'employer', 'Firma', 'firma',
    'Company Name', 'Organization Name'
  ]);
  
  const email = findField([
    'Email', 'email', 'E-Mail', 'EmailAddress', 'email_address',
    'Mail', 'mail', 'Contact Email', 'contact_email', 'Email Address'
  ]);
  
  const phone = findField([
    'Phone', 'phone', 'Phone Number', 'PhoneNumber', 'phone_number',
    'Mobile', 'mobile', 'Cell', 'cell', 'Telephone', 'telephone',
    'Contact Number', 'contact_number', 'Telefon', 'telefon'
  ]);
  
  const position = findField([
    'Position', 'position', 'Title', 'JobTitle', 'job_title',
    'Role', 'role', 'Job Position', 'job_position', 'Occupation', 'occupation',
    'Job Role', 'Job', 'job', 'Position Title'
  ]);
  
  // Extract tags from relevant fields
  const extractTags = (): string[] => {
    const tags: string[] = [];
    
    // Extract keywords if available
    const keywords = findField(['Keywords', 'keywords', 'Tags', 'tags']);
    if (keywords) {
      tags.push(...keywords.split(/[,;]/).map(tag => tag.trim().toLowerCase()));
    }
    
    // Add industry as tag if available
    const industry = findField(['Industry', 'industry', 'Sector', 'sector', 'Business Type']);
    if (industry) {
      tags.push(industry.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }
    
    // Add location as tag if available
    const location = findField(['City', 'city', 'Location', 'location', 'Country', 'country']);
    if (location) {
      tags.push(location.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }
    
    return tags;
  };
  
  // Store the original row data in notes field for reference - but as a formatted string
  const rowDataString = JSON.stringify(rowData, null, 2);
  const notes = `Imported from Excel\n\nOriginal data:\n${rowDataString}`;
  
  // Build the lead object
  const lead: Partial<Lead> = {
    name,
    company,
    email,
    phone,
    position,
    status: 'new' as Lead['status'],
    notes,
    project_id: projectId,
    score: 0,
    tags: extractTags(),
    last_contact: null
  };
  
  console.log('Transformed lead:', lead);
  return lead;
};
