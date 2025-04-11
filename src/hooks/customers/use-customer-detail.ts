
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

// Helper function to verify if a user exists in any of the relevant tables
async function checkUserExistsInTables(userId: string): Promise<{exists: boolean, details: string}> {
  if (!userId) return { exists: false, details: 'Keine Benutzer-ID angegeben' };
  
  console.log('Überprüfe Existenz des Benutzers mit ID:', userId);
  
  try {
    // Check in profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Fehler beim Überprüfen des profiles-Eintrags:', profileError);
      return { exists: false, details: `Profiles-Tabellenfehler: ${profileError.message}` };
    }
    
    if (profileData) {
      console.log('Benutzer existiert in profiles-Tabelle');
      return { exists: true, details: 'Benutzer in profiles-Tabelle gefunden' };
    }
    
    // Check in company_users table
    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (companyUserError) {
      console.error('Fehler beim Überprüfen des company_users-Eintrags:', companyUserError);
      return { exists: false, details: `Company_users-Tabellenfehler: ${companyUserError.message}` };
    }
    
    if (companyUserData) {
      console.log('Benutzer existiert in company_users-Tabelle');
      return { exists: true, details: 'Benutzer in company_users-Tabelle gefunden' };
    }
    
    // Check in user_roles table as a last resort
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (userRoleError) {
      console.error('Fehler beim Überprüfen des user_roles-Eintrags:', userRoleError);
      return { exists: false, details: `User_roles-Tabellenfehler: ${userRoleError.message}` };
    }
    
    if (userRoleData) {
      console.log('Benutzer existiert in user_roles-Tabelle');
      return { exists: true, details: 'Benutzer in user_roles-Tabelle gefunden' };
    }
    
    console.log('Benutzer mit ID nicht in Datenbank gefunden:', userId);
    return { exists: false, details: 'Benutzer in keiner Tabelle gefunden' };
    
  } catch (error: any) {
    console.error('Allgemeiner Fehler beim Überprüfen der Benutzerexistenz:', error);
    return { exists: false, details: `Fehler beim Überprüfen der Existenz: ${error.message}` };
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
      
      // First verify if the user exists in any tables
      const userExistsCheck = await checkUserExistsInTables(customerId);
      if (!userExistsCheck.exists) {
        console.error(`[useCustomerDetail] Benutzer existiert nicht: ${userExistsCheck.details}`);
        throw new Error(`Kunde nicht gefunden: ${userExistsCheck.details}`);
      }

      try {
        // Get all company associations for this user
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
          console.error('[useCustomerDetail] Fehler beim Laden der company_users Daten:', companyUserError);
          throw new Error(`Fehler beim Laden der Firmen-Benutzer-Verknüpfungen: ${companyUserError.message}`);
        }
        
        console.log(`[useCustomerDetail] Gefundene Firmenverknüpfungen: ${companyUsersData?.length || 0}`, companyUsersData);

        if (!companyUsersData || companyUsersData.length === 0) {
          console.error('[useCustomerDetail] Keine Firmenverknüpfungen gefunden für ID:', customerId);
          
          // Als Fallback, hole Profildaten direkt
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', customerId)
            .maybeSingle();
          
          if (profileError || !profileData) {
            throw new Error('Keine Kundendaten für diese ID gefunden. Der Benutzer existiert, ist aber keiner Firma zugeordnet.');
          }

          // Minimale Kundendaten aus dem Profil zurückgeben
          const minimalCustomer: Customer = {
            id: customerId,
            name: profileData?.first_name && profileData?.last_name 
              ? `${profileData.first_name} ${profileData.last_name}`.trim()
              : 'Unbenannter Benutzer',
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Find primary company based on is_primary_company flag or email domain match
        let primaryCompanyAssociation = companyUsersData?.find(cu => cu.is_primary_company === true);
        
        // If no explicit primary found, try to find based on email domain match
        if (!primaryCompanyAssociation && companyUsersData && companyUsersData.length > 0) {
          const email = companyUsersData[0]?.email;
          
          if (email && email.includes('@')) {
            const emailDomain = email.split('@')[1].toLowerCase();
            const domainPrefix = emailDomain.split('.')[0].toLowerCase();
            
            // Find company with matching domain
            primaryCompanyAssociation = companyUsersData.find(cu => {
              if (!cu.companies) return false;
              const companyName = cu.companies.name.toLowerCase();
              return (
                companyName === domainPrefix || 
                companyName.includes(domainPrefix) || 
                domainPrefix.includes(companyName)
              );
            });
          }
        }
        
        // Fallback to first association if no primary found
        if (!primaryCompanyAssociation && companyUsersData && companyUsersData.length > 0) {
          primaryCompanyAssociation = companyUsersData[0];
        }
        
        console.log('[useCustomerDetail] Primäre Firmenverknüpfung:', primaryCompanyAssociation);
        
        // Build the associated_companies array from all company associations
        const associatedCompanies = companyUsersData?.map(association => ({
          id: association.company_id,
          name: association.companies?.name || '',
          company_id: association.company_id,
          company_name: association.companies?.name || '',
          role: association.role || '',
          is_primary: association.is_primary_company || false
        })) || [];

        // Create a primary_company object if we have a primary association
        const primaryCompany = primaryCompanyAssociation ? {
          id: primaryCompanyAssociation.company_id,
          name: primaryCompanyAssociation.companies?.name || '',
          company_id: primaryCompanyAssociation.company_id,
          role: primaryCompanyAssociation.role || ''
        } : undefined;

        // Get tags from company data if available
        const companyTags = primaryCompanyAssociation?.companies?.tags || [];

        // Combine the data
        const customerData: Customer = {
          id: customerId,
          user_id: customerId,
          name: primaryCompanyAssociation?.full_name || 
                (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unbekannt'),
          email: primaryCompanyAssociation?.email,
          status: 'active', // Default status
          avatar_url: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
          avatar: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
          role: primaryCompanyAssociation?.role,
          company: primaryCompanyAssociation?.companies?.name,
          company_id: primaryCompanyAssociation?.company_id,
          company_name: primaryCompanyAssociation?.companies?.name,
          contact_email: primaryCompanyAssociation?.companies?.contact_email || primaryCompanyAssociation?.email,
          contact_phone: primaryCompanyAssociation?.companies?.contact_phone,
          city: primaryCompanyAssociation?.companies?.city,
          country: primaryCompanyAssociation?.companies?.country,
          first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
          last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          website: primaryCompanyAssociation?.companies?.website,
          address: primaryCompanyAssociation?.companies?.address,
          associated_companies: associatedCompanies,
          primary_company: primaryCompany,
          is_primary_company: primaryCompanyAssociation?.is_primary_company || false,
          tags: companyTags // Ensure tags are properly included
        };

        console.log('Customer data with tags:', customerData);
        return customerData;
      } catch (error: any) {
        console.error('Error fetching customer detail:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    meta: {
      onError: (err: any) => {
        console.error('Fehler in onError callback:', err);
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
