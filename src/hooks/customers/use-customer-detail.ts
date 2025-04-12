
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

// Verbesserte Funktion zur Überprüfung der Benutzerexistenz
async function checkUserExists(userId: string): Promise<{exists: boolean, source: string, details: any}> {
  if (!userId) return { exists: false, source: '', details: null };
  
  console.log('[checkUserExists] Prüfe Benutzer-ID:', userId);
  
  // 1. Zuerst in company_users prüfen (Hauptquelle für Systembenutzer)
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
    .eq('user_id', userId)
    .maybeSingle();
    
  if (companyUserError) {
    console.error('[checkUserExists] Fehler bei company_users-Abfrage:', companyUserError);
  } else if (companyUserData) {
    console.log('[checkUserExists] Benutzer in company_users gefunden:', companyUserData);
    return { exists: true, source: 'company_users', details: companyUserData };
  }
  
  // 2. Falls nicht gefunden, in profiles prüfen
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    console.error('[checkUserExists] Fehler bei profiles-Abfrage:', profileError);
  } else if (profileData) {
    console.log('[checkUserExists] Benutzer in profiles gefunden:', profileData);
    return { exists: true, source: 'profiles', details: profileData };
  }
  
  // 3. Als letztes in customers prüfen
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (customerError) {
    console.error('[checkUserExists] Fehler bei customers-Abfrage:', customerError);
  } else if (customerData) {
    console.log('[checkUserExists] Benutzer in customers gefunden:', customerData);
    return { exists: true, source: 'customers', details: customerData };
  }
  
  console.log('[checkUserExists] Benutzer nicht gefunden:', userId);
  return { exists: false, source: '', details: null };
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
      
      // Zuerst prüfen, ob der Benutzer existiert und wo
      const userCheck = await checkUserExists(customerId);
      console.log(`[useCustomerDetail] Benutzerprüfung:`, userCheck);
      
      if (!userCheck.exists) {
        console.error(`[useCustomerDetail] Benutzer existiert nicht: ${customerId}`);
        throw new Error(`Kunde nicht gefunden. Bitte prüfen Sie, ob die ID in company_users, profiles oder customers existiert.`);
      }

      // Je nach Quelle des Benutzers unterschiedlich verarbeiten
      if (userCheck.source === 'company_users') {
        console.log('[useCustomerDetail] Verwende company_users-Daten');
        const userData = userCheck.details;
        
        // Spezielle E-Mail-Domain-Behandlung
        const email = userData.email || '';
        let companyName = userData.companies?.name || '';
        
        if (email.toLowerCase().includes('@fact-talents.de')) {
          companyName = 'Fact Talents';
        } else if (email.toLowerCase().includes('@wbungert.com')) {
          companyName = 'Bungert';
        } else if (email.toLowerCase().includes('@teso-specialist.de')) {
          companyName = 'Teso Specialist';
        }
        
        // Associated Companies aufbauen
        // Hole alle Firmenverbindungen für diesen Benutzer
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
          role: assoc.role || '',
          is_primary: assoc.is_primary_company || false
        }));
        
        // Benutzerprofildetails abrufen (für zusätzliche Informationen)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Kundennotizen abrufen, falls vorhanden
        const { data: customerData } = await supabase
          .from('customers')
          .select('conditions')
          .eq('id', customerId)
          .maybeSingle();
        
        // Kundendaten zusammenstellen
        return {
          id: customerId,
          user_id: customerId,
          // Ensure name is always present and a string
          name: userData.full_name || 
                `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unbekannt'),
          email: userData.email,
          status: 'active',
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
          // Add the notes property from the customer data if available
          notes: customerData?.conditions || ''
        } as Customer;
      }
      
      if (userCheck.source === 'profiles') {
        console.log('[useCustomerDetail] Verwende profiles-Daten');
        const profileData = userCheck.details;
        
        // Minimale Kundendaten zurückgeben
        return {
          id: customerId,
          user_id: customerId,
          name: profileData?.first_name && profileData?.last_name 
            ? `${profileData.first_name} ${profileData.last_name}`.trim()
            : 'Unbenannter Benutzer',
          email: '',
          status: 'active',
          avatar: profileData?.avatar_url,
          avatar_url: profileData?.avatar_url,
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          website: '',
          associated_companies: [],
          notes: '' // Add empty notes for consistency
        } as Customer;
      }
      
      if (userCheck.source === 'customers') {
        console.log('[useCustomerDetail] Verwende customers-Daten');
        const customerData = userCheck.details;
        
        // Kundendaten aus customers-Tabelle zurückgeben
        return {
          id: customerId,
          name: customerData.name || 'Unbekannter Kunde', // Ensure name is always present
          status: 'active',
          company: customerData.name,
          company_name: customerData.name,
          notes: customerData.conditions || '', // Map conditions to notes
          setup_fee: customerData.setup_fee,
          price_per_appointment: customerData.price_per_appointment,
          monthly_revenue: customerData.monthly_revenue,
          associated_companies: []
        } as Customer;
      }
      
      // Dieser Code sollte nie erreicht werden, da wir bereits prüfen, ob der Benutzer existiert
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
