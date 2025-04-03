
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
      
      // Fetch customer users with role='customer'
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
          companies:company_id (
            id,
            name,
            city,
            country,
            contact_email,
            contact_phone
          )
        `)
        .eq('role', 'customer');

      if (customerError) {
        console.error('Error fetching customer users:', customerError);
        throw customerError;
      }
      
      console.log('Direct fetch results:', customerUsers?.length || 0, 'customers found');
      
      // Format customers for the list component
      const formattedCustomers = customerUsers?.map(customer => ({
        id: customer.user_id,
        name: customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer',
        email: customer.email,
        company: customer.companies?.name,
        company_name: customer.companies?.name,
        company_id: customer.company_id,
        status: 'active' as 'active' | 'inactive',
        role: customer.role,
        city: customer.companies?.city || '',
        country: customer.companies?.country || '',
        phone: '',
        contact_email: customer.email || customer.companies?.contact_email,
        users: []
      })) || [];
      
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
