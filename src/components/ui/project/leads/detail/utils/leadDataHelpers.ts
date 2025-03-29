
import { ExcelRow } from '../../../../../../types/project';

export const getProfilePhotoUrl = (lead: ExcelRow): string | null => {
  const photoFields = [
    "LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
    "avatar_url", "photo", "image_url", "headshot_url", "picture"
  ];
  
  for (const field of photoFields) {
    if (lead.row_data[field]) {
      const url = lead.row_data[field] as string;
      if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('www.'))) {
        return url;
      }
    }
  }
  
  return null;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
};

export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  return url.startsWith('http') ? url : `https://${url}`;
};

export const getLeadName = (lead: ExcelRow): string => {
  return lead.row_data["Name"] || 
    (lead.row_data["First Name"] && lead.row_data["Last Name"] ? 
      `${lead.row_data["First Name"]} ${lead.row_data["Last Name"]}` : 
      "Unknown");
};

export const getLeadTitle = (lead: ExcelRow): string => lead.row_data["Title"] || "";
export const getLeadEmail = (lead: ExcelRow): string => lead.row_data["Email"] || "";
export const getLeadCompany = (lead: ExcelRow): string => lead.row_data["Company"] || "";
export const getLeadCountry = (lead: ExcelRow): string => lead.row_data["Country"] || "";
export const getLeadCity = (lead: ExcelRow): string => lead.row_data["City"] || "";
export const getLeadState = (lead: ExcelRow): string => lead.row_data["State"] || "";
export const getLeadWebsite = (lead: ExcelRow): string => lead.row_data["Website"] || "";
export const getLeadIndustry = (lead: ExcelRow): string => lead.row_data["Industry"] || "";
export const getLeadFacebookUrl = (lead: ExcelRow): string => lead.row_data["Facebook Url"] || "";
export const getLeadTwitterUrl = (lead: ExcelRow): string => lead.row_data["Twitter Url"] || "";
export const getLeadLinkedinUrl = (lead: ExcelRow): string => {
  return lead.row_data["Linkedin Url"] || lead.row_data["LinkedIn Url"] || "";
};
export const getLeadEmployees = (lead: ExcelRow): string => lead.row_data["# Employees"] || "";
export const getLeadKeywords = (lead: ExcelRow): string => lead.row_data["Keywords"] || "";
