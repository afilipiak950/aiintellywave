
import { Lead } from "@/types/lead";

export type SocialNetwork = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'github';

export interface SocialProfile {
  network: SocialNetwork;
  url: string;
}

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

export const getInitialsFromName = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'NA';
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

export const formatLinkedInUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export const getSocialProfiles = (lead: Lead): SocialProfile[] => {
  const profiles: SocialProfile[] = [];
  
  // Check for LinkedIn
  const linkedInUrl = getLinkedInUrlFromLead(lead);
  if (linkedInUrl) {
    profiles.push({
      network: 'linkedin',
      url: formatLinkedInUrl(linkedInUrl)
    });
  }
  
  // Check for Twitter
  const twitterUrl = lead.extra_data?.twitter_url || 
    lead.extra_data?.["Twitter"] || 
    lead.extra_data?.["Twitter URL"] || 
    lead.extra_data?.["twitter"];
  
  if (twitterUrl) {
    profiles.push({
      network: 'twitter',
      url: formatLinkedInUrl(twitterUrl as string)
    });
  }
  
  // Check for Facebook
  const facebookUrl = lead.extra_data?.facebook_url || 
    lead.extra_data?.["Facebook"] || 
    lead.extra_data?.["Facebook URL"] || 
    lead.extra_data?.["facebook"];
  
  if (facebookUrl) {
    profiles.push({
      network: 'facebook',
      url: formatLinkedInUrl(facebookUrl as string)
    });
  }
  
  // Check for Instagram
  const instagramUrl = lead.extra_data?.instagram_url || 
    lead.extra_data?.["Instagram"] || 
    lead.extra_data?.["Instagram URL"] || 
    lead.extra_data?.["instagram"];
  
  if (instagramUrl) {
    profiles.push({
      network: 'instagram',
      url: formatLinkedInUrl(instagramUrl as string)
    });
  }
  
  // Check for GitHub
  const githubUrl = lead.extra_data?.github_url || 
    lead.extra_data?.["GitHub"] || 
    lead.extra_data?.["GitHub URL"] || 
    lead.extra_data?.["github"];
  
  if (githubUrl) {
    profiles.push({
      network: 'github',
      url: formatLinkedInUrl(githubUrl as string)
    });
  }
  
  return profiles;
};
