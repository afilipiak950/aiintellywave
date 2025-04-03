
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

// Helper function to determine the best company match for a user based on email
const determineBestCompanyMatch = (email: string, companyId: string, allCompanies: Record<string, any>) => {
  if (!email || !email.includes('@')) return companyId;
  
  const emailDomain = email.split('@')[1];
  const domainPrefix = emailDomain?.split('.')[0]?.toLowerCase();
  
  if (!domainPrefix) return companyId;
  
  for (const cId in allCompanies) {
    const companyName = allCompanies[cId]?.name?.toLowerCase() || '';
    if (companyName === domainPrefix || companyName.includes(domainPrefix) || domainPrefix.includes(companyName)) {
      return cId;
    }
  }
  
  return companyId;
};

export async function fetchCompanyUsers() {
  try {
    console.log('Fetching company users data...');
    
    // First get all companies for reference
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
      
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
    }
    
    // Create a map of companies by id for quick lookup
    const companiesMap: Record<string, any> = {};
    companiesData?.forEach(company => {
      if (company.id) {
        companiesMap[company.id] = company;
      }
    });
    
    // Fetch company users data with the synchronized fields
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
      throw companyUsersError;
    }
    
    console.log('Company users data received:', companyUsersData?.length || 0, 'records');
    
    // Now fetch profiles data separately for any additional info
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Create a map of profiles by id
    const profilesMap: Record<string, any> = {};
    profilesData?.forEach(profile => {
      if (profile.id) {
        profilesMap[profile.id] = profile;
      }
    });
    
    // Group users by user_id first to find the best company match
    const usersBestCompany: Record<string, string> = {};
    
    companyUsersData?.forEach(userRecord => {
      if (!userRecord.user_id || !userRecord.email) return;
      
      if (!usersBestCompany[userRecord.user_id]) {
        // First association for this user
        usersBestCompany[userRecord.user_id] = userRecord.company_id;
      } else {
        // Already have an association, check if this one is better based on email
        const bestCompanyId = determineBestCompanyMatch(
          userRecord.email, 
          usersBestCompany[userRecord.user_id], 
          companiesMap
        );
        
        if (bestCompanyId !== usersBestCompany[userRecord.user_id]) {
          usersBestCompany[userRecord.user_id] = bestCompanyId;
        }
      }
    });
    
    // Group users by company_id
    const usersByCompany: Record<string, UserData[]> = {};
    
    companyUsersData?.forEach(userRecord => {
      if (!userRecord.company_id) {
        console.warn('Skipping user without company_id:', userRecord);
        return;
      }
      
      const companyId = userRecord.company_id;
      const profile = profilesMap[userRecord.user_id] || {};
      
      // Only add the user to their best matching company
      if (usersBestCompany[userRecord.user_id] === companyId) {
        if (!usersByCompany[companyId]) {
          usersByCompany[companyId] = [];
        }
        
        usersByCompany[companyId].push({
          user_id: userRecord.user_id,
          company_id: companyId,
          role: userRecord.role,
          is_admin: userRecord.is_admin,
          email: userRecord.email,
          full_name: userRecord.full_name,
          first_name: userRecord.first_name || profile.first_name,
          last_name: userRecord.last_name || profile.last_name,
          avatar_url: userRecord.avatar_url || profile.avatar_url,
          phone: profile.phone,
          position: profile.position
        });
      }
    });
    
    console.log('Company user groups created for companies:', Object.keys(usersByCompany).length);
    
    return usersByCompany;
  } catch (error: any) {
    console.error(`Error fetching company users data:`, error);
    toast({
      title: "Error",
      description: error.message || 'Failed to load user data',
      variant: "destructive"
    });
    
    return {};
  }
}
