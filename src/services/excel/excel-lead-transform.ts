
import { Lead } from '@/types/lead';

/**
 * Transforms raw Excel data into a lead object with comprehensive field mapping
 * @param rowData The Excel row data as a Record
 * @param projectId The project ID to associate with the lead
 * @returns A partial Lead object ready for insertion
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string): Partial<Lead> => {
  // Helper function to find a field value with multiple possible column names
  const findField = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      if (rowData[name] !== undefined) return rowData[name];
      // Try case-insensitive match
      const key = Object.keys(rowData).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) return rowData[key];
    }
    return null;
  };
  
  // Extract lead data with comprehensive field matching
  const name = findField([
    'Name', 'name', 'Full Name', 'FullName', 'full_name', 
    'First Name', 'FirstName', 'first_name', 'Contact Name', 'contact_name'
  ]) || 'Unnamed Lead';
  
  const company = findField([
    'Company', 'company', 'Organization', 'CompanyName', 'company_name',
    'Business', 'business', 'Employer', 'employer'
  ]) || null;
  
  const email = findField([
    'Email', 'email', 'E-Mail', 'EmailAddress', 'email_address',
    'Mail', 'mail', 'Contact Email', 'contact_email'
  ]) || null;
  
  const phone = findField([
    'Phone', 'phone', 'Phone Number', 'PhoneNumber', 'phone_number',
    'Mobile', 'mobile', 'Cell', 'cell', 'Telephone', 'telephone',
    'Contact Number', 'contact_number'
  ]) || null;
  
  const position = findField([
    'Position', 'position', 'Title', 'JobTitle', 'job_title',
    'Role', 'role', 'Job Position', 'job_position', 'Occupation', 'occupation'
  ]) || null;
  
  // Store the original row data in notes field for reference - but as a formatted string
  const rowDataString = JSON.stringify(rowData, null, 2);
  const notes = `Imported from Excel\n\nOriginal data:\n${rowDataString}`;
  
  // Extract column names for tags
  const tags = Object.keys(rowData).map(key => key.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());
  
  return {
    name,
    company,
    email,
    phone,
    position,
    status: 'new' as Lead['status'],
    notes,
    project_id: projectId,
    score: 0,
    tags,
    last_contact: null
  };
};
