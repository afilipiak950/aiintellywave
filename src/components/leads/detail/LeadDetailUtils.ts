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

// Social network utility types
export type SocialNetwork = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'github';

export interface SocialProfileData {
  url: string;
  network: SocialNetwork;
}

// Helper function to get all social media URLs from lead data
export const getSocialProfiles = (lead: Lead | null): SocialProfileData[] => {
  if (!lead) return [];
  
  const profiles: SocialProfileData[] = [];

  // LinkedIn fields mapping
  const linkedInUrl = getLinkedInUrlFromLead(lead);
  if (linkedInUrl) {
    profiles.push({
      url: formatSocialUrl(linkedInUrl, 'linkedin'),
      network: 'linkedin'
    });
  }
  
  // Twitter fields mapping
  const twitterFields = ['twitter', 'Twitter', 'Twitter Url', 'twitter_url', 'TwitterURL'];
  const twitterUrl = findFieldInLeadData(lead, twitterFields);
  if (twitterUrl) {
    profiles.push({
      url: formatSocialUrl(twitterUrl, 'twitter'),
      network: 'twitter'
    });
  }
  
  // Facebook fields mapping
  const facebookFields = ['facebook', 'Facebook', 'Facebook Url', 'facebook_url', 'FacebookURL'];
  const facebookUrl = findFieldInLeadData(lead, facebookFields);
  if (facebookUrl) {
    profiles.push({
      url: formatSocialUrl(facebookUrl, 'facebook'),
      network: 'facebook'
    });
  }
  
  // GitHub fields mapping
  const githubFields = ['github', 'GitHub', 'GitHub Url', 'github_url', 'GitHubURL'];
  const githubUrl = findFieldInLeadData(lead, githubFields);
  if (githubUrl) {
    profiles.push({
      url: formatSocialUrl(githubUrl, 'github'),
      network: 'github'
    });
  }
  
  // Instagram fields mapping
  const instagramFields = ['instagram', 'Instagram', 'Instagram Url', 'instagram_url', 'InstagramURL'];
  const instagramUrl = findFieldInLeadData(lead, instagramFields);
  if (instagramUrl) {
    profiles.push({
      url: formatSocialUrl(instagramUrl, 'instagram'),
      network: 'instagram'
    });
  }
  
  return profiles;
};

// Helper function to find a field in lead data using multiple possible keys
export const findFieldInLeadData = (lead: Lead | null, possibleFields: string[]): string | null => {
  if (!lead?.extra_data) return null;
  
  for (const field of possibleFields) {
    if (lead.extra_data[field]) {
      return lead.extra_data[field];
    }
  }
  
  return null;
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
  
  return findFieldInLeadData(lead, possibleFields);
};

// Helper function to ensure social media URL is properly formatted
export const formatSocialUrl = (url: string | null, network: SocialNetwork): string => {
  if (!url) return '';
  
  // If URL already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add domain based on network if only username is provided
  if (!url.includes('.')) {
    switch(network) {
      case 'linkedin':
        return `https://linkedin.com/in/${url}`;
      case 'twitter':
        return `https://twitter.com/${url}`;
      case 'facebook':
        return `https://facebook.com/${url}`;
      case 'instagram':
        return `https://instagram.com/${url}`;
      case 'github':
        return `https://github.com/${url}`;
      default:
        return `https://${url}`;
    }
  }
  
  // Otherwise, prepend https://
  return `https://${url}`;
};

// Helper function to ensure LinkedIn URL is properly formatted (for backward compatibility)
export const formatLinkedInUrl = (url: string | null): string | null => {
  if (!url) return null;
  return formatSocialUrl(url, 'linkedin');
};
