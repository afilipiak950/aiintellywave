import { Lead } from '@/types/lead';

// Helper function to get initials from name
export const getInitialsFromName = (name: string): string => {
  if (!name) return "??";
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
};

// Helper function to get LinkedIn URL from lead data
export const getLinkedInUrlFromLead = (lead: Lead | null): string | null => {
  if (!lead) return null;
  
  // Check different possible field names for LinkedIn URL
  const possibleFields = [
    'linkedin_url',
    'LinkedIn Url',
    'LinkedIn',
    'Person Linkedin Url',
    'LinkedInURL',
    'linkedin'
  ];
  
  for (const field of possibleFields) {
    if (lead.extra_data?.[field]) {
      return lead.extra_data[field];
    }
  }
  
  return null;
};

// Helper function to ensure LinkedIn URL is properly formatted
export const formatLinkedInUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If URL already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, prepend https://
  return `https://${url}`;
};
