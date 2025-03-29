
import { Lead, LeadStatus } from '@/types/lead';

/**
 * Transforms Excel row data into a lead object format
 * This helps standardize the mapping of Excel columns to lead fields
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string): Partial<Lead> => {
  // Extract name using various potential field names
  const name = extractField(rowData, [
    'name', 'Name', 'Full Name', 'FullName', 'Contact', 'Contact Name'
  ]) || combineFields(rowData, ['First Name', 'FirstName'], ['Last Name', 'LastName']);

  // Extract company name
  const company = extractField(rowData, [
    'company', 'Company', 'Organization', 'Organisation', 'Business'
  ]);

  // Extract email
  const email = extractField(rowData, [
    'email', 'Email', 'E-mail', 'Email Address'
  ]);

  // Extract phone
  const phone = extractField(rowData, [
    'phone', 'Phone', 'Telephone', 'Mobile', 'Cell', 'Contact Number'
  ]);

  // Extract position
  const position = extractField(rowData, [
    'position', 'Position', 'Title', 'Job Title', 'Role', 'Job Role'
  ]);

  // Extract potential status from Excel
  const excelStatus = extractField(rowData, [
    'status', 'Status', 'Lead Status', 'Stage'
  ]);
  
  // Map Excel status to valid LeadStatus or use default 'new'
  const status: LeadStatus = mapToLeadStatus(excelStatus);

  // Prepare the lead object
  return {
    name: name || `Lead from Excel`,
    company,
    email,
    phone,
    position,
    status,
    notes: JSON.stringify(rowData),
    project_id: projectId,
    score: 50,
    tags: ['excel-import'],
  };
};

// Helper function to extract a field value using multiple possible field names
function extractField(data: Record<string, any>, fieldNames: string[]): string | null {
  for (const field of fieldNames) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      return String(data[field]);
    }
  }
  return null;
}

// Helper function to combine two fields (like first name and last name)
function combineFields(
  data: Record<string, any>, 
  firstFieldNames: string[], 
  secondFieldNames: string[]
): string | null {
  const first = extractField(data, firstFieldNames);
  const second = extractField(data, secondFieldNames);
  
  if (first || second) {
    return `${first || ''} ${second || ''}`.trim();
  }
  
  return null;
}

/**
 * Maps any string value to a valid LeadStatus type
 * This ensures type safety when importing from Excel where status might be in various formats
 */
function mapToLeadStatus(status: string | null): LeadStatus {
  if (!status) return 'new';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  switch(normalizedStatus) {
    case 'contacted':
    case 'contact':
    case 'reached':
    case 'reached out':
      return 'contacted';
      
    case 'qualified':
    case 'lead qualified':
    case 'sql':
    case 'mql':
      return 'qualified';
      
    case 'proposal':
    case 'proposed':
    case 'quote':
    case 'quoted':
      return 'proposal';
      
    case 'negotiation':
    case 'negotiating':
    case 'in negotiation':
      return 'negotiation';
      
    case 'won':
    case 'closed won':
    case 'successful':
    case 'converted':
    case 'customer':
    case 'client':
      return 'won';
      
    case 'lost':
    case 'closed lost':
    case 'failed':
    case 'rejected':
      return 'lost';
      
    default:
      return 'new';
  }
}
