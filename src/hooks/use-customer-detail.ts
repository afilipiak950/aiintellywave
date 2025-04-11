
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { toast } from './use-toast';
import { useEffect } from 'react';

const findBestCompanyMatch = (email: string, companyAssociations: any[]) => {
  if (!companyAssociations?.length) return null;
  
  console.log('[findBestCompanyMatch] Finding best match for:', email, 'from', companyAssociations.length, 'associations');
  
  if (email && email.toLowerCase().includes('@fact-talents.de')) {
    console.log('[findBestCompanyMatch] Found fact-talents.de email, looking for Fact Talents company');
    
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
    
    console.log('[findBestCompanyMatch] No Fact Talents company found, but email is fact-talents.de');
    return companyAssociations[0];
  }
  
  if (email && email.toLowerCase().includes('@wbungert.com')) {
    console.log('[findBestCompanyMatch] Found wbungert.com email, looking for Bungert company');
    
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
    
    console.log('[findBestCompanyMatch] No Bungert company found, but email is wbungert.com');
    return companyAssociations[0];
  }
  
  if (email && email.toLowerCase().includes('@teso-specialist.de')) {
    console.log('[findBestCompanyMatch] Found teso-specialist.de email, looking for Teso Specialist company');
    
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
    
    console.log('[findBestCompanyMatch] No Teso Specialist company found, but email is teso-specialist.de');
    return companyAssociations[0];
  }
  
  const primaryMarked = companyAssociations.find(assoc => assoc.is_primary_company === true);
  
  if (primaryMarked) {
    console.log('[findBestCompanyMatch] Found explicitly marked primary company:', primaryMarked.companies?.name);
    return primaryMarked;
  }
  
  if (email && email.includes('@')) {
    const emailDomain = email.split('@')[1];
    if (!emailDomain) return companyAssociations[0];
    
    const domainParts = emailDomain.toLowerCase().split('.');
    const domainName = domainParts[0];
    
    console.log('[findBestCompanyMatch] Trying to match email domain:', emailDomain, 'domain name:', domainName);
    
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
    
    const exactDomainMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        
        return companyName === domainName || 
               emailDomain.toLowerCase() === companyName;
      }
    );
    
    if (exactDomainMatch) {
      console.log(`[findBestCompanyMatch] Found exact domain match: ${exactDomainMatch.companies?.name}`);
      return exactDomainMatch;
    }
    
    const partialDomainMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyName = assoc.companies.name.toLowerCase();
        
        return domainName.includes(companyName) || companyName.includes(domainName);
      }
    );
    
    if (partialDomainMatch) {
      console.log(`[findBestCompanyMatch] Found partial domain match: ${partialDomainMatch.companies?.name}`);
      return partialDomainMatch;
    }
    
    const tokenMatch = companyAssociations.find(
      assoc => {
        if (!assoc.companies?.name) return false;
        const companyNameTokens = assoc.companies.name.toLowerCase().split(/[\s-_]+/);
        const domainTokens = domainName.split(/[\s-_]+/);
        
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
  
  const adminMatch = companyAssociations.find(assoc => assoc.is_admin);
  
  if (adminMatch) {
    console.log(`[findBestCompanyMatch] Found admin match: ${adminMatch.companies?.name}`);
    return adminMatch;
  }
  
  console.log(`[findBestCompanyMatch] Using fallback to first association: ${companyAssociations[0]?.companies?.name}`);
  return companyAssociations[0];
};

const fetchCustomerDetail = async (customerId?: string): Promise<UICustomer | null> => {
  if (!customerId) {
    throw new Error('No customer ID provided');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId)) {
    throw new Error('The provided ID is not a valid UUID format');
  }

  try {
    console.log(`[fetchCustomerDetail] Fetching customer details for ID: ${customerId}`);

    // First try to get company_users data since that's more likely to exist
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
          website,
          address,
          tags
        )
      `)
      .eq('user_id', customerId);

    if (companyUserError) {
      console.error('[fetchCustomerDetail] Error fetching company user data:', companyUserError);
      throw companyUserError;
    }
    
    // Check if user exists in company_users
    if (!companyUsersData || companyUsersData.length === 0) {
      console.log(`[fetchCustomerDetail] No company associations found for user ID: ${customerId}, checking profiles`);
      
      // As a fallback, check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      
      if (profileError) {
        console.error('[fetchCustomerDetail] Error checking profile:', profileError);
        throw new Error(`Error checking profile: ${profileError.message}`);
      }
      
      if (profileData) {
        console.log('[fetchCustomerDetail] Found profile data but no company associations');
        // User exists in profiles but has no company associations
        const minimalCustomer: UICustomer = {
          id: customerId,
          name: profileData?.first_name && profileData?.last_name 
            ? `${profileData.first_name} ${profileData.last_name}`.trim()
            : 'Unnamed User',
          email: '',
          status: profileData?.is_active !== false ? 'active' : 'inactive',
          avatar: profileData?.avatar_url,
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          website: '',
          tags: []
        };

        return minimalCustomer;
      }
      
      // Check in user_roles as another potential way to verify user existence
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('user_id', customerId)
        .maybeSingle();
        
      if (!userRoleError && userRoleData) {
        console.log('[fetchCustomerDetail] Found user in user_roles table:', userRoleData);
        // User exists in user_roles but has no company or profile data
        return {
          id: customerId,
          name: 'User without Profile',
          email: '',
          status: 'active',
          avatar: null,
          first_name: '',
          last_name: '',
          phone: '',
          position: '',
          website: '',
          tags: [],
          role: userRoleData.role
        };
      }
      
      // Try to check if the user exists at all with a direct count query
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('id', customerId);
      
      if (countError) {
        console.error('[fetchCustomerDetail] Error checking if profile exists:', countError);
      }
      
      if (count === 0) {
        console.error('[fetchCustomerDetail] User not found in any table:', customerId);
        throw new Error('Customer ID does not exist in the system');
      } else {
        console.log('[fetchCustomerDetail] User exists in auth but has no profile data');
        // This case should be rare but we handle it anyway
        return {
          id: customerId,
          name: 'User without Profile Data',
          email: '',
          status: 'inactive',
          avatar: null,
          first_name: '',
          last_name: '',
          phone: '',
          position: '',
          website: '',
          tags: []
        };
      }
    }

    console.log(`[fetchCustomerDetail] Found ${companyUsersData?.length || 0} company associations for user:`, companyUsersData);

    // Then get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileError) {
      console.error('[fetchCustomerDetail] Error fetching profile data:', profileError);
      // Don't throw here, just continue with what we have
    }

    // Case 3: Has company associations - standard path
    const email = companyUsersData[0]?.email || '';
    const primaryCompanyAssociation = findBestCompanyMatch(email, companyUsersData);
    
    const isFactTalentsEmail = email.toLowerCase().includes('@fact-talents.de');
    const isWbungertEmail = email.toLowerCase().includes('@wbungert.com');
    const isTesoSpecialistEmail = email.toLowerCase().includes('@teso-specialist.de');
    
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
    
    const companyTags = primaryCompanyAssociation?.companies?.tags || [];
    console.log('Customer tags found:', companyTags);

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

    const customerData: UICustomer = {
      id: customerId,
      name: primaryCompanyAssociation?.full_name || 
            (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
      email: primaryCompanyAssociation?.email,
      status: 'active',
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
      
      first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
      last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
      phone: profileData?.phone || '',
      position: profileData?.position || '',
      
      address: primaryCompanyAssociation?.companies?.address || '',
      department: '',
      job_title: '',
      company_size: undefined,
      linkedin_url: '',
      notes: '',

      associated_companies: associatedCompanies,
      
      primary_company: primary,
      is_primary_company: primaryCompanyAssociation?.is_primary_company || false,
      tags: Array.isArray(companyTags) ? companyTags : []
    };

    console.log('[fetchCustomerDetail] Customer data assembled successfully:', customerData);
    return customerData;
  } catch (error: any) {
    console.error('[fetchCustomerDetail] Error fetching customer detail:', error);
    
    // Provide a more specific message based on error type
    if (error.message?.includes('does not exist')) {
      throw new Error('Customer ID does not exist in the system');
    } else if (error.message?.includes('auth') || error.message?.includes('profile')) {
      throw new Error('No customer data found for this ID');
    } else if (error.message?.includes('infinite recursion')) {
      throw new Error('Database policy error: RLS policy is causing infinite recursion');
    } else if (error.message?.includes('User not allowed') || error.code === 'not_admin') {
      throw new Error('Permission denied: You do not have permission to access this customer\'s information');
    } else if (error.message?.includes('not a valid UUID')) {
      throw new Error('The provided ID is not a valid UUID format');
    } else {
      throw error;
    }
  }
};

export const setupCustomerSubscription = (
  customerId: string | undefined,
  queryClient: any
) => {
  if (!customerId) return () => {};
  
  console.log(`[setupCustomerSubscription] Setting up subscriptions for customer: ${customerId}`);
  
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
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

  useEffect(() => {
    const cleanup = setupCustomerSubscription(customerId, queryClient);
    return cleanup;
  }, [customerId, queryClient]);

  return {
    customer,
    loading,
    error: error instanceof Error ? error.message : String(error) || null,
    refreshCustomer: refetch
  };
};
