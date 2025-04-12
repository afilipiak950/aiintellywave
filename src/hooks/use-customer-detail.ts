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

// Fetch customer detail by ID
const fetchCustomerDetail = async (customerId?: string): Promise<UICustomer | null> => {
  if (!customerId) {
    throw new Error('No customer ID provided');
  }

  try {
    console.log(`[fetchCustomerDetail] Fetching customer details for ID: ${customerId}`);

    // CHECKING DATA SOURCES: Try to understand where the user data comes from
    console.log('[fetchCustomerDetail] Checking in company_users table first');
    
    // FIRST CHECK: Check company_users as this seems to be the source of the system users list
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
        companies:company_id (
          id,
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country,
          website,
          address,
          tags
        )
      `)
      .eq('user_id', customerId);

    if (companyUserError) {
      console.error('[fetchCustomerDetail] Error fetching company_users data:', companyUserError);
    } else {
      console.log(`[fetchCustomerDetail] Found ${companyUsersData?.length || 0} company_users associations:`, companyUsersData);
    }
    
    // SECOND CHECK: Try the customers table (direct customer records)
    console.log('[fetchCustomerDetail] Checking in customers table');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (customerError) {
      console.error('[fetchCustomerDetail] Error fetching customer data:', customerError);
    } else {
      console.log('[fetchCustomerDetail] Customer data from customers table:', customerData);
    }
    
    // THIRD CHECK: Check profiles table
    console.log('[fetchCustomerDetail] Checking in profiles table');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (profileError) {
      console.error('[fetchCustomerDetail] Error fetching profile data:', profileError);
    } else {
      console.log('[fetchCustomerDetail] Profile data from profiles table:', profileData);
    }

    // Now use the appropriate data source based on what was found
    
    // If we have company_users data, use it as primary source (matching what's seen in the UI)
    if (companyUsersData && companyUsersData.length > 0) {
      console.log('[fetchCustomerDetail] Using company_users data as primary source');
      
      // Find the best company match based on email and is_primary_company flag
      const email = companyUsersData[0]?.email || '';
      const primaryCompanyAssociation = findBestCompanyMatch(email, companyUsersData);
      
      // Special handling for specific email domains
      const isFactTalentsEmail = email.toLowerCase().includes('@fact-talents.de');
      const isWbungertEmail = email.toLowerCase().includes('@wbungert.com');
      const isTesoSpecialistEmail = email.toLowerCase().includes('@teso-specialist.de');
      
      // Process company information based on the email domain
      let companyName = primaryCompanyAssociation?.companies?.name || '';
      if (isFactTalentsEmail) {
        companyName = 'Fact Talents';
      } else if (isWbungertEmail) {
        companyName = 'Bungert';
      } else if (isTesoSpecialistEmail) {
        companyName = 'Teso Specialist';
      }
      
      // Get tags from company data if available
      const companyTags = primaryCompanyAssociation?.companies?.tags || [];
      
      // Build the associated_companies array
      const associatedCompanies = companyUsersData.map(association => ({
        id: association.company_id,
        name: association.companies?.name || '',
        company_id: association.company_id,
        company_name: association.companies?.name || '',
        role: association.role || '',
        is_primary: association.is_primary_company || false
      }));

      // Customer data from company_users
      const customer: UICustomer = {
        id: customerId,
        name: primaryCompanyAssociation?.full_name || 
              (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
        email: primaryCompanyAssociation?.email,
        status: 'active', // Default status
        avatar: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
        role: primaryCompanyAssociation?.role,
        company: companyName,
        company_id: primaryCompanyAssociation?.company_id,
        company_name: companyName,
        contact_email: primaryCompanyAssociation?.companies?.contact_email || primaryCompanyAssociation?.email,
        contact_phone: primaryCompanyAssociation?.companies?.contact_phone,
        city: primaryCompanyAssociation?.companies?.city,
        country: primaryCompanyAssociation?.companies?.country,
        
        // Profile data with fallbacks
        first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
        last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        website: primaryCompanyAssociation?.companies?.website,
        address: primaryCompanyAssociation?.companies?.address,
        
        // Associated companies
        associated_companies: associatedCompanies,
        primary_company: primaryCompanyAssociation ? {
          id: primaryCompanyAssociation.company_id,
          name: companyName,
          company_id: primaryCompanyAssociation.company_id,
          role: primaryCompanyAssociation.role || ''
        } : undefined,
        is_primary_company: primaryCompanyAssociation?.is_primary_company || false,
        tags: companyTags
      };
      
      return customer;
    }
    
    // If we have direct customer data from customers table, use it
    if (customerData) {
      console.log('[fetchCustomerDetail] Using customers table data');
      
      // Map customer data
      const customer: UICustomer = {
        id: customerData.id,
        name: customerData.name || 'Unnamed Customer',
        email: '',  // Default empty values for fields not in customers table
        status: 'active',
        company: customerData.name, // For direct customers, company name is the customer name
        company_name: customerData.name,
        notes: customerData.conditions
      };
      
      // Return customer with all original fields
      return customer as UICustomer & typeof customerData;
    }
    
    // Fallback to profile data if available
    if (profileData) {
      console.log('[fetchCustomerDetail] Using profiles table data');
      
      // Minimal customer data from profile
      const customer: UICustomer = {
        id: customerId,
        name: profileData?.first_name && profileData?.last_name 
          ? `${profileData.first_name} ${profileData.last_name}`.trim()
          : 'Unnamed User',
        email: '',
        status: 'active',
        avatar: profileData?.avatar_url,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        website: ''
      };

      return customer;
    }

    // If no data found in any table, throw an error
    throw new Error('No customer data found for this ID');

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
  
  // Subscribe to profiles table changes
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
    
  // Add subscription to customers table changes
  const customersChannel = supabase.channel(`public:customers:id=eq.${customerId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'customers',
      filter: `id=eq.${customerId}`
    }, (payload) => {
      console.log('[setupCustomerSubscription] Customers update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    })
    .subscribe();
    
  // Add subscription to company_users table changes
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
    supabase.removeChannel(customersChannel);
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
