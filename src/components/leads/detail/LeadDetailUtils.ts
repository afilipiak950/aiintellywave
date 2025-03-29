
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
  
  if (lead.extra_data?.linkedin_url) return lead.extra_data.linkedin_url;
  if (lead.extra_data?.["LinkedIn Url"]) return lead.extra_data["LinkedIn Url"];
  if (lead.extra_data?.["LinkedIn"]) return lead.extra_data["LinkedIn"];
  return null;
};
