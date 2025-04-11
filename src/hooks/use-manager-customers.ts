import { useState, useEffect } from 'react';
import { UICustomer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { repairCompanyUsers } from '@/hooks/customers/utils/company-users-debug';

export const useManagerCustomers = () => {
  const [customers, setCustomers] = useState<UICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);
  
  // Fetch customers from Supabase
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Bitte melden Sie sich an, um Kunden zu sehen.');
        return;
      }
      
      // Fetch customer users with role='customer', including primary company flag
      let { data: customerUsers, error: customerError } = await supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          email,
          full_name,
          first_name,
          last_name,
          is_primary_company,
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
        .eq('role', 'customer');

      if (customerError) {
        console.error('Error fetching customer users:', customerError);
        throw customerError;
      }
      
      console.log('Direct fetch results:', customerUsers?.length || 0, 'customers found');
      
      // Group by user_id to handle multiple company associations
      const userGroups: Record<string, any[]> = {};
      customerUsers?.forEach(customer => {
        if (!userGroups[customer.user_id]) {
          userGroups[customer.user_id] = [];
        }
        userGroups[customer.user_id].push(customer);
      });
      
      // For each user, determine which company should be displayed as primary
      const formattedCustomers = Object.entries(userGroups).map(([userId, associations]) => {
        // First try to find explicitly marked primary company
        let primaryAssociation = associations.find(assoc => assoc.is_primary_company);
        
        // If none is marked as primary, try to match by email domain
        if (!primaryAssociation && associations.length > 0) {
          const email = associations[0].email;
          
          if (email && email.includes('@')) {
            const emailDomain = email.split('@')[1].toLowerCase();
            const domainPrefix = emailDomain.split('.')[0].toLowerCase();
            
            // Find company with matching domain
            primaryAssociation = associations.find(assoc => {
              if (!assoc.companies?.name) return false;
              const companyName = assoc.companies.name.toLowerCase();
              return (
                companyName === domainPrefix || 
                companyName.includes(domainPrefix) || 
                domainPrefix.includes(companyName)
              );
            });
          }
        }
        
        // Fallback to first association
        if (!primaryAssociation && associations.length > 0) {
          primaryAssociation = associations[0];
        }
        
        // If we have no associations at all, return minimal data
        if (!primaryAssociation) {
          return {
            id: userId,
            name: 'Unknown Customer',
            email: '',
            company: 'No Company',
            company_name: 'No Company',
            status: 'active' as 'active' | 'inactive',
            associated_companies: []
          };
        }
        
        // Create associated_companies array
        const associatedCompanies = associations.map(assoc => ({
          id: assoc.company_id,
          name: assoc.companies?.name || '',
          company_id: assoc.company_id,
          company_name: assoc.companies?.name || '',
          role: assoc.role || '',
          is_primary: assoc.is_primary_company || false
        }));
        
        // Return the formatted customer with primary company data
        return {
          id: userId,
          name: primaryAssociation.full_name || 
                `${primaryAssociation.first_name || ''} ${primaryAssociation.last_name || ''}`.trim() || 
                'Unnamed Customer',
          email: primaryAssociation.email,
          company: primaryAssociation.companies?.name,
          company_name: primaryAssociation.companies?.name,
          company_id: primaryAssociation.company_id,
          status: 'active' as 'active' | 'inactive',
          role: primaryAssociation.role,
          city: primaryAssociation.companies?.city || '',
          country: primaryAssociation.companies?.country || '',
          phone: '',
          contact_email: primaryAssociation.email || primaryAssociation.companies?.contact_email,
          associated_companies: associatedCompanies,
          tags: primaryAssociation.companies?.tags || [],
          users: []
        };
      });
      
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error in customer fetch:', error);
      setError(error.message || 'Fehler beim Laden der Kundendaten');
      toast({
        title: "Fehler",
        description: `Kunden konnten nicht geladen werden: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Repair customer associations
  const repairCustomerAssociations = async () => {
    setIsRepairing(true);
    try {
      // Use the repairCompanyUsers utility function
      const repairResult = await repairCompanyUsers();
      
      if (repairResult.status === 'error') {
        throw new Error(repairResult.error);
      }
      
      // After repair, refetch the data
      await fetchCustomers();
      
      toast({
        title: "Erfolg",
        description: "Kundenassociationen wurden repariert",
      });
    } catch (error: any) {
      console.error('Error repairing customer associations:', error);
      toast({
        title: "Fehler",
        description: `Reparatur fehlgeschlagen: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.company && customer.company.toLowerCase().includes(searchLower)) ||
      (customer.city && customer.city.toLowerCase().includes(searchLower)) ||
      (customer.country && customer.country.toLowerCase().includes(searchLower))
    );
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  return {
    customers: filteredCustomers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
    isRepairing,
    repairCustomerAssociations
  };
};
