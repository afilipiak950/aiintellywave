
import { Lead } from '@/types/lead';

/**
 * Transforms Excel row data into a Lead object
 * Improved with better type handling and more robust mapping
 */
export const transformExcelRowToLead = (row: any, projectId: string): Lead => {
  const rowData = row.row_data as Record<string, any>;
  
  // Use case-insensitive lookups to handle various capitalization conventions
  const findField = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      // Try exact match first
      if (rowData[name] !== undefined) return rowData[name];
      
      // Try case-insensitive match
      const key = Object.keys(rowData).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) return rowData[key];
    }
    return null;
  };
  
  // Extract basic information with improved field detection
  const name = findField(['name', 'Name', 'full_name', 'Full Name', 'fullName']) || 'Unnamed Lead';
  const email = findField(['email', 'Email', 'E-Mail', 'e_mail', 'emailAddress']) || null;
  const company = findField(['company', 'Company', 'Organization', 'CompanyName', 'company_name']) || null;
  const position = findField(['position', 'Position', 'Title', 'JobTitle', 'job_title']) || null;
  const phone = findField(['phone', 'Phone', 'Phone Number', 'PhoneNumber', 'phone_number', 'contact']) || null;
  
  return {
    id: row.id,
    project_id: projectId,
    name,
    company,
    email,
    phone,
    position,
    status: 'new' as Lead['status'],
    notes: null,
    last_contact: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    score: 50,
    tags: null,
    // Include all row_data as an additional property for complete information
    excel_data: rowData
  };
};
