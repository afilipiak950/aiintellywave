import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { toast } from './use-toast';
import { useEffect } from 'react';

// Enhanced function to determine the best company match based on email domain and primary flag
const findBestCompanyMatch = (email: string, companyAssociations: any[]) => {
  if (!companyAssociations?.length) return null;
  
  console.log('[findBestCompanyMatch] Finding best match for:', email, 'from', companyAssociations.length, 'associations');
  
  // SPECIAL OVERRIDE: Always prioritize specific email domains
  if (email && email.toLowerCase().includes('@fact-talents.de')) {
    console.log('[findBestCompanyMatch] Found fact-talents.de email, looking for Fact Talents company');
    
    // Look for a company that has "Fact" and "Talents" in the name
    const factTalentsMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        return companyName.includes('fact') && companyName.includes('talent');
      }
    );
    
    if (factTalentsMatch) {
      console.log(`[findBestCompanyMatch] Found Fact Talents company: ${factTalentsMatch.companies?.name}`);
      return factTalentsMatch;
    }
    
    // If no fact talents company found but email is fact-talents.de,
    // just return the first association - we'll override the name later
    console.log('[findBestCompanyMatch] No Fact Talents company found, but email is fact-talents.de');
    return companyAssociations[0];
  }
  
  if (email && email.toLowerCase().includes('@wbungert.com')) {
    console.log('[findBestCompanyMatch] Found wbungert.com email, looking for Bungert company');
    
    // Look for a company that has "Bungert" in the name
    const bungertMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        return companyName.includes('bungert');
      }
    );
    
    if (bungertMatch) {
      console.log(`[findBestCompanyMatch] Found Bungert company: ${bungertMatch.companies?.name}`);
      return bungertMatch;
    }
    
    // If no Bungert company found but email is wbungert.com,
    // just return the first association - we'll override the name later
    console.log('[findBestCompanyMatch] No Bungert company found, but email is wbungert.com');
    return companyAssociations[0];
  }
  
  if (email && email.toLowerCase().includes('@teso-specialist.de')) {
    console.log('[findBestCompanyMatch] Found teso-specialist.de email, looking for Teso Specialist company');
    
    // Look for a company that has "Teso" and "Specialist" in the name
    const tesoSpecialistMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        return companyName.includes('teso') && companyName.includes('specialist');
      }
    );
    
    if (tesoSpecialistMatch) {
      console.log(`[findBestCompanyMatch] Found Teso Specialist company: ${tesoSpecialistMatch.companies?.name}`);
      return tesoSpecialistMatch;
    }
    
    // If no Teso Specialist company found but email is teso-specialist.de,
    // just return the first association - we'll override the name later
    console.log('[findBestCompanyMatch] No Teso Specialist company found, but email is teso-specialist.de');
    return companyAssociations[0];
  }
  
  // First look for explicitly marked primary company
  const primaryMarked = companyAssociations.find(assoc => assoc.is_primary_company === true);
  
  if (primaryMarked) {
    console.log('[findBestCompanyMatch] Found explicitly marked primary company:', primaryMarked.companies?.name);
    return primaryMarked;
  }
  
  // Then try domain-based matching if email is available
  if (email && email.includes('@')) {
    const emailDomain = email.split('@')[1];
    if (!emailDomain) return companyAssociations[0];
    
    // Try domain-based matching - improved matching logic
    // Extract domain parts for more precise matching
    const domainParts = emailDomain.toLowerCase().split('.');
    const domainName = domainParts[0]; // e.g., 'fact-talents' from 'fact-talents.de'
    
    console.log('[findBestCompanyMatch] Trying to match email domain:', emailDomain, 'domain name:', domainName);
    
    // Special case for fact-talents.de domain
    if (emailDomain === 'fact-talents.de') {
      const factTalentsMatch = companyAssociations.find(
        assoc => {
          if (!assoc.companies?.name) return false;
          const companyName = assoc.companies.name.toLowerCase();
          return companyName.includes('fact') && companyName.includes('talent');
        }
      );
      
      if (factTalentsMatch) {
        console.log(`[findBestCompanyMatch] Found match for fact-talents.de: ${factTalentsMatch.companies?.name}`);
        return factTalentsMatch;
      }
    }
    
    // First try exact domain match
    const exactDomainMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        
        // Check if company name exactly matches the domain name
        return companyName === domainName || 
               // Or check if domain contains company name exactly
               emailDomain.toLowerCase() === companyName;
      }
    );
    
    if (exactDomainMatch) {
      console.log(`[findBestCompanyMatch] Found exact domain match: ${exactDomainMatch.companies?.name}`);
      return exactDomainMatch;
    }
    
    // If no exact match, try partial matches
    // First check company names that contain the domain or vice versa
    const partialDomainMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        
        // Company name contains domain part or domain part contains company name
        return domainName.includes(companyName) || companyName.includes(domainName);
      }
    );
    
    if (partialDomainMatch) {
      console.log(`[findBestCompanyMatch] Found partial domain match: ${partialDomainMatch.companies?.name}`);
      return partialDomainMatch;
    }
    
    // Last resort - try matching tokens in domain with tokens in company name
    // This helps with cases like "fact-talents.de" matching "Fact Talents GmbH"
    const tokenMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyNameTokens = assoc.companies.name.toLowerCase().split(/[\s-_]+/);
        const domainTokens = domainName.split(/[\s-_]+/);
        
        // Check if any token in company name matches any token in domain
        return companyNameTokens.some(companyToken => 
          domainTokens.some(domainToken => 
            companyToken.includes(domainToken) || domainToken.includes(companyToken)
          )
        );
      }
    );
    
    if (tokenMatch) {
      console.log(`[findBestCompanyMatch] Found token match: ${tokenMatch.companies?.name}`);
      return tokenMatch;
    }
  }
  
  // Then try to find an admin role
  const adminMatch = companyAssociations.find(assoc => assoc.is_admin);
  
  if (adminMatch) {
    console.log(`[findBestCompanyMatch] Found admin match: ${adminMatch.companies?.name}`);
    return adminMatch;
  }
  
  // Fallback to first association
  console.log(`[findBestCompanyMatch] Using fallback to first association: ${companyAssociations[0]?.companies?.name}`);
  return companyAssociations[0];
};

// Extract fetch logic for better reusability
const fetchCustomerDetail = async (customerId?: string): Promise<UICustomer | null> => {
  if (!customerId) {
    throw new Error('No customer ID provided');
  }

  try {
    console.log(`[fetchCustomerDetail] Fetching customer details for ID: ${customerId}`);

    // Get all company associations for this user including the is_primary_company flag
    const { data: companyUsersData, error: companyUserError } = await supabase
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
        avatar_url,
        is_primary_company,
        last_sign_in_at,
        created_at_auth,
        companies:company_id (
          id,
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country,
          website
        )
      `)
      .eq('user_id', customerId);

    if (companyUserError) {
      console.error('[fetchCustomerDetail] Error fetching company user data:', companyUserError);
      throw companyUserError;
    }

    console.log(`[fetchCustomerDetail] Found ${companyUsersData?.length || 0} company associations for user:`, companyUsersData);
    
    // If no company associations found, get basic profile data as fallback
    if (!companyUsersData || companyUsersData.length === 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      
      if (profileError || !profileData) {
        throw new Error('No customer data found for this ID');
      }

      // Return minimal customer data from profile
      const minimalCustomer: UICustomer = {
        id: customerId,
        name: profileData?.first_name && profileData?.last_name 
          ? `${profileData.first_name} ${profileData.last_name}`.trim()
          : 'Unnamed User',
        email: '',
        status: 'inactive',
        avatar: profileData?.avatar_url,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        website: ''
      };

      return minimalCustomer;
    }

    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        first_name,
        last_name,
        avatar_url,
        phone,
        position
      `)
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileError) {
      console.error('[fetchCustomerDetail] Error fetching profiles data:', profileError);
      // Continue with partial data rather than throwing
    }

    // Find the best company match based on email and is_primary_company flag
    const email = companyUsersData[0]?.email || '';
    const primaryCompanyAssociation = findBestCompanyMatch(email, companyUsersData);
    
    // Special handling for fact-talents.de emails
    const isFactTalentsEmail = email.toLowerCase().includes('@fact-talents.de');
    const isWbungertEmail = email.toLowerCase().includes('@wbungert.com');
    const isTesoSpecialistEmail = email.toLowerCase().includes('@teso-specialist.de');
    
    // Process company information based on the email domain
    let companyName = primaryCompanyAssociation?.companies?.name || '';
    if (isFactTalentsEmail) {
      console.log('[fetchCustomerDetail] Overriding company name to "Fact Talents" for fact-talents.de email');
      companyName = 'Fact Talents';
    } else if (isWbungertEmail) {
      console.log('[fetchCustomerDetail] Overriding company name to "Bungert" for wbungert.com email');
      companyName = 'Bungert';
    } else if (isTesoSpecialistEmail) {
      console.log('[fetchCustomerDetail] Overriding company name to "Teso Specialist" for teso-specialist.de email');
      companyName = 'Teso Specialist';
    }
    
    // Build the associated_companies array from all company associations
    const associatedCompanies = companyUsersData.map(association => ({
      id: association.company_id,
      name: isFactTalentsEmail && association.company_id === primaryCompanyAssociation?.company_id 
            ? 'Fact Talents' 
            : isWbungertEmail && association.company_id === primaryCompanyAssociation?.company_id
            ? 'Bungert'
            : isTesoSpecialistEmail && association.company_id === primaryCompanyAssociation?.company_id
            ? 'Teso Specialist'
            : association.companies?.name || '',
      company_id: association.company_id,
      company_name: isFactTalentsEmail && association.company_id === primaryCompanyAssociation?.company_id 
                   ? 'Fact Talents' 
                   : isWbungertEmail && association.company_id === primaryCompanyAssociation?.company_id
                   ? 'Bungert'
                   : isTesoSpecialistEmail && association.company_id === primaryCompanyAssociation?.company_id
                   ? 'Teso Specialist'
                   : association.companies?.name || '',
      role: association.role || '',
      is_primary: association.is_primary_company || false
    }));

    // Create a primary_company object
    const primary = primaryCompanyAssociation ? {
      id: primaryCompanyAssociation.company_id,
      name: isFactTalentsEmail ? 'Fact Talents' 
            : isWbungertEmail ? 'Bungert' 
            : isTesoSpecialistEmail ? 'Teso Specialist'
            : primaryCompanyAssociation.companies?.name || '',
      company_id: primaryCompanyAssociation.company_id,
      role: primaryCompanyAssociation.role || '',
      is_primary: primaryCompanyAssociation.is_primary_company || false
    } : undefined;

    // Combine the data
    const customerData: UICustomer = {
      id: customerId,
      name: primaryCompanyAssociation?.full_name || 
            (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
      email: primaryCompanyAssociation?.email,
      status: 'active', // Default status
      avatar: primaryCompanyAssociation?.avatar_url || (profileData ? profileData.avatar_url : undefined),
      role: primaryCompanyAssociation?.role,
      company: isFactTalentsEmail ? 'Fact Talents' 
             : isWbungertEmail ? 'Bungert' 
             : isTesoSpecialistEmail ? 'Teso Specialist'
             : companyName,
      company_id: primaryCompanyAssociation?.company_id,
      company_name: isFactTalentsEmail ? 'Fact Talents' 
                  : isWbungertEmail ? 'Bungert' 
                  : isTesoSpecialistEmail ? 'Teso Specialist'
                  : companyName,
      company_role: primaryCompanyAssociation?.role,
      contact_email: primaryCompanyAssociation?.companies?.contact_email || primaryCompanyAssociation?.email,
      contact_phone: primaryCompanyAssociation?.companies?.contact_phone,
      city: primaryCompanyAssociation?.companies?.city,
      country: primaryCompanyAssociation?.companies?.country,
      description: primaryCompanyAssociation?.companies?.description,
      website: primaryCompanyAssociation?.companies?.website,
      
      // Profile data with fallbacks
      first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
      last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
      phone: profileData?.phone || '',
      position: profileData?.position || '',
      
      // Default values for missing fields
      address: '',
      department: '',
      job_title: '',
      company_size: undefined,
      linkedin_url: '',
      notes: '',

      // Add all associated companies as array
      associated_companies: associatedCompanies,
      
      // Set primary company
      primary_company: primary,
      // Determine is_primary_company (will be true for the best match)
      is_primary_company: primaryCompanyAssociation?.is_primary_company || false
    };

    console.log('[fetchCustomerDetail] Customer data assembled successfully:', customerData);
    return customerData;
  } catch (error: any) {
    console.error('[fetchCustomerDetail] Error fetching customer detail:', error);
    throw error;
  }
};

// Set up realtime subscription for customer updates
export const setupCustomerSubscription = (
  customerId: string | undefined,
  queryClient: any
) => {
  if (!customerId) return () => {};
  
  console.log(`[setupCustomerSubscription] Setting up subscriptions for customer: ${customerId}`);
  
  // Subscribe to both profiles and company_users changes
  const profilesChannel = supabase.channel(`public:profiles:id=eq.${customerId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'profiles',
      filter: `id=eq.${customerId}`
    }, (payload) => {
      console.log('[setupCustomerSubscription] Profiles update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    })
    .subscribe();
    
  const companyUsersChannel = supabase.channel(`public:company_users:user_id=eq.${customerId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'company_users',
      filter: `user_id=eq.${customerId}`
    }, (payload) => {
      console.log('[setupCustomerSubscription] Company users update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    })
    .subscribe();
    
  // Return cleanup function
  return () => {
    console.log('[setupCustomerSubscription] Cleaning up subscriptions');
    supabase.removeChannel(profilesChannel);
    supabase.removeChannel(companyUsersChannel);
  };
};

export const useCustomerDetail = (customerId?: string) => {
  const queryClient = useQueryClient();
  
  const {
    data: customer,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetchCustomerDetail(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    meta: {
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to load customer details",
          variant: "destructive"
        });
      }
    }
  });

  // Set up realtime subscription
  useEffect(() => {
    const cleanup = setupCustomerSubscription(customerId, queryClient);
    return cleanup;
  }, [customerId, queryClient]);

  return {
    customer,
    loading,
    error: error instanceof Error ? error.message : null,
    refreshCustomer: refetch
  };
};
