
import { Lead, LeadStatus } from '@/types/lead';

/**
 * Transforms Excel row data into a lead object format
 */
export const transformExcelRowToLead = (rowData: Record<string, any>, projectId: string): Partial<Lead> => {
  if (!rowData) {
    console.error('DEEP DEBUG: Invalid row data for transformation', rowData);
    return {
      name: 'Unknown Lead',
      status: 'new' as LeadStatus,
      project_id: projectId
    };
  }

  // Helper function to find a field by various likely column names
  const findField = (possibleNames: string[]): string | null => {
    const result = possibleNames.find(name => 
      Object.keys(rowData).some(key => 
        key.toLowerCase().includes(name.toLowerCase()) && rowData[key]
      )
    );
    
    if (result) {
      const matchingKey = Object.keys(rowData).find(key => 
        key.toLowerCase().includes(result.toLowerCase())
      );
      return matchingKey ? rowData[matchingKey] : null;
    }
    
    return null;
  };

  // Extract name - try common name fields
  const name = findField(['name', 'full name', 'fullname', 'contact', 'person']) || 
               `${findField(['first name', 'firstname', 'given name']) || ''} ${findField(['last name', 'lastname', 'surname']) || ''}`.trim() ||
               'Unknown Lead';

  // Extract company - try common company fields  
  const company = findField(['company', 'organization', 'organisation', 'business', 'firm']) || null;

  // Extract email - try common email fields
  const email = findField(['email', 'e-mail', 'mail', 'email address']) || null;

  // Extract phone - try common phone fields
  const phone = findField(['phone', 'telephone', 'mobile', 'cell', 'contact number']) || null;

  // Extract position - try common position fields
  const position = findField(['position', 'title', 'job title', 'role', 'job role', 'occupation']) || null;

  // Extract notes - try common notes fields
  const notes = findField(['notes', 'comments', 'description', 'additional info']) || 
                `Imported from Excel. Raw data: ${JSON.stringify(rowData)}`;

  console.log('DEEP DEBUG: Transformed Excel row data to lead:', {
    name,
    company,
    email,
    phone,
    position
  });

  // Return the lead object with the transformed data
  return {
    name,
    company,
    email,
    phone,
    position,
    status: 'new' as LeadStatus,
    notes,
    project_id: projectId,
    score: 50,  // Default score
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
