
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

// Enhanced function to check existence and fetch entity data with better error handling
async function fetchEntityData(customerId: string): Promise<{exists: boolean, source: string, details: any, errorDetails?: any}> {
  if (!customerId) return { exists: false, source: '', details: null, errorDetails: { message: 'No ID provided' } };
  
  console.log('[fetchEntityData] Prüfe ID:', customerId);
  
  try {
    // 1. First, check in customers table (primary source for actual customers)
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (customerError) {
      console.error('[fetchEntityData] Fehler bei customers-Abfrage:', customerError);
      
      // If this is a policy error, we should report it differently
      if (customerError.message?.includes('infinite recursion') || 
          customerError.message?.includes('policy') ||
          customerError.message?.includes('permission denied')) {
        return { 
          exists: false, 
          source: '', 
          details: null, 
          errorDetails: { 
            type: 'policy_error',
            table: 'customers',
            message: customerError.message 
          } 
        };
      }
    } else if (customerData) {
      console.log('[fetchEntityData] Eintrag in customers Tabelle gefunden:', customerData);
      return { exists: true, source: 'customers', details: customerData };
    }
    
    // 2. Check in company_users with joined company data
    const { data: companyUserData, error: companyUserError } = await supabase
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
        companies:company_id (
          id,
          name,
          city,
          country,
          contact_email,
          contact_phone,
          tags
        )
      `)
      .eq('user_id', customerId)
      .maybeSingle();
      
    if (companyUserError) {
      console.error('[fetchEntityData] Fehler bei company_users-Abfrage:', companyUserError);
      
      // Handle policy errors for company_users
      if (companyUserError.message?.includes('infinite recursion') || 
          companyUserError.message?.includes('policy') ||
          companyUserError.message?.includes('permission denied')) {
        return { 
          exists: false, 
          source: '', 
          details: null, 
          errorDetails: { 
            type: 'policy_error',
            table: 'company_users',
            message: companyUserError.message 
          } 
        };
      }
    } else if (companyUserData) {
      console.log('[fetchEntityData] Benutzer in company_users gefunden:', companyUserData);
      return { exists: true, source: 'company_users', details: companyUserData };
    }
    
    // 3. Check in profiles as last resort
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (profileError) {
      console.error('[fetchEntityData] Fehler bei profiles-Abfrage:', profileError);
      
      // Handle policy errors for profiles
      if (profileError.message?.includes('infinite recursion') || 
          profileError.message?.includes('policy') ||
          profileError.message?.includes('permission denied')) {
        return { 
          exists: false, 
          source: '', 
          details: null, 
          errorDetails: { 
            type: 'policy_error',
            table: 'profiles',
            message: profileError.message 
          } 
        };
      }
    } else if (profileData) {
      console.log('[fetchEntityData] Benutzer in profiles gefunden:', profileData);
      return { exists: true, source: 'profiles', details: profileData };
    }
    
    // 4. Additional check: verify if the ID exists in auth.users but not in our tables
    try {
      // This requires admin privileges, so it might not work for all users
      const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(customerId);
      
      if (!authUserError && authUserData?.user) {
        // ID exists in auth but not in our customer-related tables
        console.log('[fetchEntityData] Benutzer existiert in auth, aber nicht in Kundentabellen:', authUserData.user);
        return { 
          exists: false, 
          source: '', 
          details: null, 
          errorDetails: { 
            type: 'user_not_customer',
            email: authUserData.user.email,
            message: 'ID existiert in auth, aber nicht in Kundentabellen' 
          } 
        };
      }
    } catch (authError) {
      // Just log this error but don't return it as the main error
      console.log('[fetchEntityData] Auth check failed (expected for non-admin users):', authError);
    }

    // 4 (Alternative). Check if the ID exists in auth.users via the RPC function
    try {
      // Use a more direct approach to bypass TypeScript limitations
      const { data, error } = await supabase.rpc('check_user_exists', { 
        user_id_param: customerId 
      });

      if (!error && data === true) {
        console.log('[fetchEntityData] Benutzer existiert in auth via function check, aber nicht in Kundentabellen');
        return { 
          exists: false, 
          source: '', 
          details: null, 
          errorDetails: { 
            type: 'user_not_customer',
            message: 'ID existiert in auth, aber nicht in Kundentabellen' 
          } 
        };
      }
    } catch (funcError) {
      console.log('[fetchEntityData] RPC function check failed:', funcError);
    }
    
    // If we got here, the ID wasn't found in any table
    console.log('[fetchEntityData] Kein Eintrag gefunden für ID:', customerId);
    return { 
      exists: false, 
      source: '', 
      details: null, 
      errorDetails: { 
        type: 'not_found',
        message: `Keine Daten gefunden für ID: ${customerId}` 
      } 
    };
  } catch (error) {
    // Catch any unexpected errors
    console.error('[fetchEntityData] Unerwarteter Fehler:', error);
    return { 
      exists: false, 
      source: '', 
      details: null, 
      errorDetails: { 
        type: 'unexpected_error',
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export const useCustomerDetail = (customerId?: string) => {
  const {
    data: customer,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) {
        throw new Error('Keine Kunden-ID angegeben');
      }

      console.log(`[useCustomerDetail] Lade Kundendetails für ID: ${customerId}`);
      
      // Fetch entity data from appropriate table
      const entityData = await fetchEntityData(customerId);
      console.log(`[useCustomerDetail] Entitätsdaten:`, entityData);
      
      if (!entityData.exists) {
        console.error(`[useCustomerDetail] Keine Daten gefunden für ID: ${customerId}`);
        
        // Improve error messaging based on error type
        if (entityData.errorDetails?.type === 'policy_error') {
          throw new Error(`Database policy error: Es gibt ein Problem mit den Datenbankberechtigungen für die Tabelle ${entityData.errorDetails.table}. Details: ${entityData.errorDetails.message}`);
        } else if (entityData.errorDetails?.type === 'user_not_customer') {
          throw new Error(`Benutzer-ID statt Kunden-ID: Die ID ${customerId} gehört zu einem Benutzer, aber nicht zu einem Kunden in der customers-Tabelle.`);
        } else if (entityData.errorDetails?.type === 'not_found') {
          throw new Error(`Kunde nicht gefunden. Die ID ${customerId} existiert in keiner relevanten Datenbanktabelle.`);
        } else {
          throw new Error(`Kunde nicht gefunden. Bitte prüfen Sie die ID.`);
        }
      }

      // Format data based on source
      if (entityData.source === 'customers') {
        console.log('[useCustomerDetail] Verwende customers-Tabellendaten');
        const customerData = entityData.details;
        
        // Get additional company data if available
        let companyData = null;
        if (customerData.company_id) {
          const { data } = await supabase
            .from('companies')
            .select('*')
            .eq('id', customerData.company_id)
            .maybeSingle();
          companyData = data;
        }
        
        return {
          id: customerId,
          name: customerData.name || 'Unbekannter Kunde',
          status: 'active' as 'active' | 'inactive',
          company: customerData.name,
          company_name: customerData.name,
          notes: customerData.conditions || '',
          setup_fee: customerData.setup_fee,
          price_per_appointment: customerData.price_per_appointment,
          monthly_revenue: customerData.monthly_revenue,
          // Company data if available
          company_id: companyData?.id,
          contact_email: companyData?.contact_email || '',
          contact_phone: companyData?.contact_phone || '',
          address: companyData?.address || '',
          website: companyData?.website || '',
          city: companyData?.city || '',
          country: companyData?.country || '',
          tags: companyData?.tags || [],
          // Default values for user fields
          email: '',
          associated_companies: []
        } as Customer;
      }
      
      if (entityData.source === 'company_users') {
        console.log('[useCustomerDetail] Verwende company_users-Daten');
        const userData = entityData.details;
        
        // Handle email domain special cases
        const email = userData.email || '';
        let companyName = userData.companies?.name || '';
        
        if (email.toLowerCase().includes('@fact-talents.de')) {
          companyName = 'Fact Talents';
        } else if (email.toLowerCase().includes('@wbungert.com')) {
          companyName = 'Bungert';
        } else if (email.toLowerCase().includes('@teso-specialist.de')) {
          companyName = 'Teso Specialist';
        }
        
        // Build associated companies data
        // Get all company associations for this user
        const { data: allCompanyAssociations } = await supabase
          .from('company_users')
          .select(`
            company_id,
            role,
            is_admin,
            is_primary_company,
            companies:company_id (name)
          `)
          .eq('user_id', customerId);
        
        const associatedCompanies = (allCompanyAssociations || []).map(assoc => ({
          id: assoc.company_id,
          name: assoc.companies?.name || '',
          company_id: assoc.company_id,
          company_name: assoc.companies?.name || '',
          role: assoc.role || '',
          is_primary: assoc.is_primary_company || false
        }));
        
        // Get profile data for additional information
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Try to get customer notes if this user happens to be in customers table
        const { data: customerData } = await supabase
          .from('customers')
          .select('conditions')
          .eq('id', customerId)
          .maybeSingle();
        
        // Build complete customer data
        return {
          id: customerId,
          user_id: customerId,
          name: userData.full_name || 
                `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unbekannt'),
          email: userData.email,
          status: 'active' as 'active' | 'inactive',
          avatar_url: userData.avatar_url || profileData?.avatar_url,
          avatar: userData.avatar_url || profileData?.avatar_url,
          role: userData.role,
          company: companyName,
          company_id: userData.company_id,
          company_name: companyName,
          contact_email: userData.companies?.contact_email || userData.email,
          contact_phone: userData.companies?.contact_phone,
          city: userData.companies?.city,
          country: userData.companies?.country,
          first_name: userData.first_name || profileData?.first_name || '',
          last_name: userData.last_name || profileData?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          website: userData.companies?.website,
          address: userData.companies?.address,
          associated_companies: associatedCompanies,
          primary_company: associatedCompanies.find(c => c.is_primary) || associatedCompanies[0],
          tags: userData.companies?.tags || [],
          notes: customerData?.conditions || ''
        } as Customer;
      }
      
      if (entityData.source === 'profiles') {
        console.log('[useCustomerDetail] Verwende profiles-Daten');
        const profileData = entityData.details;
        
        // Try to get company_users data for this user
        const { data: companyUserData } = await supabase
          .from('company_users')
          .select(`
            company_id,
            role,
            email,
            companies:company_id (
              name,
              city,
              country,
              contact_email,
              contact_phone,
              website,
              address
            )
          `)
          .eq('user_id', customerId)
          .maybeSingle();
        
        return {
          id: customerId,
          user_id: customerId,
          name: profileData?.first_name && profileData?.last_name 
            ? `${profileData.first_name} ${profileData.last_name}`.trim()
            : 'Unbenannter Benutzer',
          email: companyUserData?.email || '',
          status: 'active' as 'active' | 'inactive',
          avatar: profileData?.avatar_url,
          avatar_url: profileData?.avatar_url,
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          company: companyUserData?.companies?.name || '',
          company_id: companyUserData?.company_id,
          company_name: companyUserData?.companies?.name || '',
          contact_email: companyUserData?.companies?.contact_email || companyUserData?.email || '',
          contact_phone: companyUserData?.companies?.contact_phone || '',
          city: companyUserData?.companies?.city || '',
          country: companyUserData?.companies?.country || '',
          website: companyUserData?.companies?.website || '',
          address: companyUserData?.companies?.address || '',
          associated_companies: companyUserData ? [{
            id: companyUserData.company_id,
            name: companyUserData.companies?.name || '',
            company_id: companyUserData.company_id,
            role: companyUserData.role
          }] : [],
          notes: ''
        } as Customer;
      }
      
      // This code should never be reached since we already checked if the entity exists
      throw new Error('Unerwarteter Fehler bei der Datenabrufe');
    },
    enabled: !!customerId,
    meta: {
      onError: (err: any) => {
        console.error('Fehler in useCustomerDetail:', err);
        toast({
          title: "Fehler",
          description: err.message || "Fehler beim Laden der Kundendaten",
          variant: "destructive"
        });
      }
    }
  });

  return {
    customer,
    loading,
    error: error instanceof Error ? error.message : null,
    refreshCustomer: refetch
  };
};

