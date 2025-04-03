
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { UserData } from './types/customerTypes';

// Helper function to determine the best company match for a user based on email
const determineBestCompanyMatch = (email: string, companyId: string, allCompanies: Record<string, any>) => {
  if (!email || !email.includes('@')) return companyId;
  
  const emailDomain = email.split('@')[1];
  const domainPrefix = emailDomain?.split('.')[0]?.toLowerCase();
  
  if (!domainPrefix) return companyId;
  
  // First try exact matches
  for (const cId in allCompanies) {
    const companyName = allCompanies[cId]?.name?.toLowerCase() || '';
    if (companyName === domainPrefix) {
      console.log(`Found exact match: ${companyName} equals ${domainPrefix}`);
      return cId;
    }
  }
  
  // Then try fuzzy matches
  for (const cId in allCompanies) {
    const companyName = allCompanies[cId]?.name?.toLowerCase() || '';
    if (companyName.includes(domainPrefix) || domainPrefix.includes(companyName)) {
      console.log(`Found fuzzy match: ${companyName} includes/contained in ${domainPrefix}`);
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
    
    // Group users by user_id and collect all of their company associations
    const userCompanies: Record<string, Array<{ companyId: string, role: string, email: string }>> = {};
    
    companyUsersData?.forEach(userRecord => {
      if (!userRecord.user_id || !userRecord.company_id) return;
      
      if (!userCompanies[userRecord.user_id]) {
        userCompanies[userRecord.user_id] = [];
      }
      
      userCompanies[userRecord.user_id].push({
        companyId: userRecord.company_id,
        role: userRecord.role || 'customer',
        email: userRecord.email || ''
      });
    });
    
    // For each user, determine their primary company based on email domain
    const usersBestCompany: Record<string, string> = {};
    
    for (const userId in userCompanies) {
      const userAssociations = userCompanies[userId];
      if (userAssociations.length === 0) continue;
      
      // Get the first company as default
      let bestCompanyId = userAssociations[0].companyId;
      let userEmail = '';
      
      // Find the first valid email to use for domain matching
      for (const assoc of userAssociations) {
        if (assoc.email && assoc.email.includes('@')) {
          userEmail = assoc.email;
          break;
        }
      }
      
      // If we have an email, try to match it to a company
      if (userEmail) {
        bestCompanyId = determineBestCompanyMatch(
          userEmail, 
          bestCompanyId, 
          companiesMap
        );
      }
      
      usersBestCompany[userId] = bestCompanyId;
    }
    
    // Group users by company_id
    const usersByCompany: Record<string, UserData[]> = {};
    
    companyUsersData?.forEach(userRecord => {
      if (!userRecord.company_id) {
        console.warn('Skipping user without company_id:', userRecord);
        return;
      }
      
      const companyId = userRecord.company_id;
      const profile = profilesMap[userRecord.user_id] || {};
      
      if (!usersByCompany[companyId]) {
        usersByCompany[companyId] = [];
      }
      
      // Collect all company associations for this user
      const associatedCompanies = (companyUsersData || [])
        .filter(cu => cu.user_id === userRecord.user_id)
        .map(cu => ({
          id: cu.id || '',
          company_id: cu.company_id || '',
          company_name: companiesMap[cu.company_id]?.name || '',
          role: cu.role || 'customer'
        }));
      
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
        position: profile.position,
        associated_companies: associatedCompanies,
        // Flag to indicate if this is their primary company based on email domain
        is_primary_company: usersBestCompany[userRecord.user_id] === companyId
      });
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
