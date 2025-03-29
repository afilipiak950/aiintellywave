
import { Lead } from '@/types/lead';

/**
 * Transforms raw Excel data into a lead object
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
  const name = findField(['Name', 'name', 'Full Name', 'FullName', 'full_name', 'Contact', 'contact']) || 'Unnamed Lead';
  const company = findField(['Company', 'company', 'Organization', 'CompanyName', 'company_name', 'Firm', 'Business']) || null;
  const email = findField(['Email', 'email', 'E-Mail', 'EmailAddress', 'email_address', 'Mail']) || null;
  const phone = findField(['Phone', 'phone', 'Phone Number', 'PhoneNumber', 'phone_number', 'Tel', 'Telephone', 'Mobile']) || null;
  const position = findField(['Position', 'position', 'Title', 'JobTitle', 'job_title', 'Role', 'Job']) || null;
  
  // Convert row data to JSON for notes field
  let notes: string | null;
  try {
    notes = JSON.stringify(rowData);
  } catch (error) {
    console.error(`Error stringifying Excel row data:`, error);
    notes = `Error processing data for lead`;
  }
  
  // Extract column names for tags
  const tags = Object.keys(rowData);
  
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

/**
 * Extracts display-friendly lead information from Excel row data
 */
export const getLeadDisplayInfo = (rowData: Record<string, any>): { 
  name: string; 
  company: string | null; 
  email: string | null;
  phone: string | null;
} => {
  return {
    name: transformExcelRowToLead(rowData, '').name,
    company: transformExcelRowToLead(rowData, '').company,
    email: transformExcelRowToLead(rowData, '').email,
    phone: transformExcelRowToLead(rowData, '').phone
  };
};
