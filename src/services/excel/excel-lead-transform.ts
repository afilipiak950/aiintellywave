
// Fix for TypeScript error in excel-lead-transform.ts

// Properly type the extra_data field to accept any string keys
export interface ExtraDataType {
  [key: string]: string | number | boolean | null;
}

import { LeadStatus } from '@/types/lead';

// Map string status to a valid LeadStatus type
export function mapToLeadStatus(status: string): LeadStatus {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'new':
      return 'new';
    case 'contacted':
      return 'contacted';
    case 'qualified':
      return 'qualified';
    case 'proposal':
      return 'proposal';
    case 'negotiation':
      return 'negotiation';
    case 'won':
      return 'won';
    case 'lost':
      return 'lost';
    default:
      return 'new'; // Default fallback
  }
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

/**
 * Transforms Excel row data into a lead object
 * @param rowData - Raw Excel row data
 * @param projectId - Project ID to associate the lead with
 * @returns Lead object ready for database insertion
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string) => {
  // Handle basic fields with intelligent mapping
  const name = rowData["Name"] || 
    (rowData["First Name"] && rowData["Last Name"] ? 
      `${rowData["First Name"]} ${rowData["Last Name"]}` : 
      "Unknown Contact");
  
  const email = rowData["Email"] || rowData["Email Address"] || null;
  const phone = rowData["Phone"] || rowData["Phone Number"] || rowData["Mobile"] || null;
  const company = rowData["Company"] || rowData["Organization"] || rowData["Business"] || null;
  const position = rowData["Title"] || rowData["Position"] || rowData["Job Title"] || null;
  const rawStatus = rowData["Status"] || 'new';
  
  // Map string status to valid LeadStatus type
  const status = mapToLeadStatus(rawStatus);
  
  // Process the remaining fields as extra_data
  const excludedFields = ["Name", "Email", "Email Address", "Phone", "Phone Number", 
    "Mobile", "Company", "Organization", "Business", "Title", "Position", "Job Title",
    "First Name", "Last Name", "Status"];
  
  const extraData: Record<string, any> = {};
  
  Object.entries(rowData).forEach(([key, value]) => {
    if (!excludedFields.includes(key)) {
      extraData[key] = value;
    }
  });
  
  // If we had First Name and Last Name but not a combined Name field,
  // add these to extra_data to preserve the information
  if (!rowData["Name"] && rowData["First Name"]) {
    extraData["First Name"] = rowData["First Name"];
  }
  
  if (!rowData["Name"] && rowData["Last Name"]) {
    extraData["Last Name"] = rowData["Last Name"];
  }
  
  return {
    name,
    email,
    phone,
    company,
    position,
    status, // Now using the mapped LeadStatus
    project_id: projectId,
    score: 0,
    extra_data: processExtraData(extraData),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
