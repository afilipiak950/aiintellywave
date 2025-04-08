
import { Lead } from "@/types/lead";

export const getNameFromLead = (lead: Lead): string => {
  // Check for first_name and last_name fields first
  const firstName = lead.first_name || 
    lead.extra_data?.["First Name"] || 
    lead.extra_data?.["first_name"] || 
    lead.extra_data?.["FirstName"];
    
  const lastName = lead.last_name || 
    lead.extra_data?.["Last Name"] || 
    lead.extra_data?.["last_name"] || 
    lead.extra_data?.["LastName"];
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    // Fall back to the name field
    return lead.name || '';
  }
};

export const getLinkedInUrlFromLead = (lead: Lead): string | null => {
  // Check standard properties first
  if (lead.extra_data?.linkedin_url) {
    return lead.extra_data.linkedin_url as string;
  }
  
  // Check different possible field formats
  const possibleKeys = [
    'linkedin_url',
    'linkedIn_url',
    'linkedInUrl',
    'linkedin',
    'LinkedIn',
    'LinkedIn URL',
    'linkedin_profile',
    'LinkedInProfile'
  ];
  
  for (const key of possibleKeys) {
    if (lead.extra_data && lead.extra_data[key]) {
      return lead.extra_data[key] as string;
    }
  }
  
  return null;
};
