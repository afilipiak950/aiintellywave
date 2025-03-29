
import { Lead, LeadStatus } from '@/types/lead';

/**
 * Known field mappings for standard lead columns
 * This maps Excel column names (keys) to database field names (values)
 */
export const KNOWN_FIELD_MAPPINGS: Record<string, keyof Lead> = {
  // Name variations
  'Name': 'name',
  'Full Name': 'name',
  'FullName': 'name',
  'Contact': 'name',
  'Contact Name': 'name',
  
  // Company variations
  'Company': 'company',
  'Organization': 'company',
  'Organisation': 'company',
  'Business': 'company',
  
  // Email variations
  'Email': 'email',
  'E-mail': 'email',
  'Email Address': 'email',
  
  // Phone variations
  'Phone': 'phone',
  'Telephone': 'phone',
  'Mobile': 'phone',
  'Cell': 'phone',
  'Contact Number': 'phone',
  
  // Position variations
  'Position': 'position',
  'Title': 'position',
  'Job Title': 'position',
  'Role': 'position',
  'Job Role': 'position',
  
  // Status variations
  'Status': 'status',
  'Lead Status': 'status',
  'Stage': 'status',
  
  // Notes variations
  'Notes': 'notes',
  'Comments': 'notes',
  'Description': 'notes',
  'Additional Info': 'notes',
};

// These are the standard lead fields in the database schema
const STANDARD_LEAD_FIELDS: Array<keyof Lead> = [
  'name', 'company', 'email', 'phone', 'position', 'status', 'notes', 
  'score', 'tags', 'project_id', 'last_contact'
];

/**
 * Transforms Excel row data into a lead object format with dynamic field mapping
 * Maps recognized fields to standard columns and unrecognized fields to extra_data
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string): Partial<Lead> => {
  // Initialize the result with basic structure
  const result: Partial<Lead> = {
    project_id: projectId,
    score: 50,
    tags: ['excel-import'],
  };
  
  // Track unrecognized fields for extra_data
  const extraData: Record<string, any> = {};
  
  // Process each field in the Excel row
  for (const [excelField, value] of Object.entries(rowData)) {
    // Skip empty values
    if (value === null || value === undefined || value === '') continue;
    
    // Convert to string value to ensure consistency
    const stringValue = String(value);
    
    // Check if this is a known field mapping
    const mappedField = KNOWN_FIELD_MAPPINGS[excelField];
    if (mappedField) {
      // Special handling for status field
      if (mappedField === 'status') {
        result[mappedField] = mapToLeadStatus(stringValue);
      } else {
        result[mappedField] = stringValue;
      }
    } else {
      // This is an unrecognized field, add it to extra_data
      extraData[excelField] = stringValue;
    }
  }
  
  // Handle special case for name fields (First Name + Last Name)
  if (!result.name && (rowData['First Name'] || rowData['FirstName'] || rowData['Last Name'] || rowData['LastName'])) {
    const firstName = rowData['First Name'] || rowData['FirstName'] || '';
    const lastName = rowData['Last Name'] || rowData['LastName'] || '';
    result.name = `${firstName} ${lastName}`.trim();
    
    // Remove these from extra_data if they were added
    delete extraData['First Name'];
    delete extraData['FirstName'];
    delete extraData['Last Name'];
    delete extraData['LastName'];
  }
  
  // Ensure we have at least a placeholder name
  if (!result.name) {
    result.name = `Lead from Excel`;
  }
  
  // Add extra_data if we have any unrecognized fields
  if (Object.keys(extraData).length > 0) {
    result.extra_data = extraData as Record<string, any>;
  }
  
  return result;
};

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
