
import { Search } from 'lucide-react';
import CustomerLoadingState from '../../components/ui/customer/CustomerLoadingState';
import CustomerErrorState from '../../components/ui/customer/CustomerErrorState';
import CustomerList from '../../components/ui/customer/CustomerList';
import { useCustomers } from '../../hooks/use-customers';
import { Customer } from '@/types/customer';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

const ManagerCustomers = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [directCustomers, setDirectCustomers] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(true);
  const [directError, setDirectError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch customers directly from Supabase
  useEffect(() => {
    const fetchCustomersDirectly = async () => {
      try {
        setDirectLoading(true);
        
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setDirectError('Bitte melden Sie sich an, um Kunden zu sehen.');
          setDirectLoading(false);
          return;
        }
        
        // Versuche zuerst company_users zu laden mit role='customer'
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
          users: []
        })) || [];
        
        setDirectCustomers(formattedCustomers);
      } catch (error) {
        console.error('Error in direct customer fetch:', error);
        setDirectError(error.message || 'Fehler beim Laden der Kundendaten');
        toast({
          title: "Fehler",
          description: `Kunden konnten nicht geladen werden: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setDirectLoading(false);
      }
    };

    fetchCustomersDirectly();
  }, []);

  // Filter customers by search term
  const filteredCustomers = directCustomers.filter(customer => {
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

  const handleRetry = async () => {
    setDirectLoading(true);
    setDirectError(null);
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDirectError('Bitte melden Sie sich an, um Kunden zu sehen.');
        return;
      }
      
      // Versuche zuerst company_users zu laden mit role='customer'
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
        users: []
      })) || [];
      
      setDirectCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error in retry customer fetch:', error);
      setDirectError(error.message || 'Fehler beim Laden der Kundendaten');
      toast({
        title: "Fehler",
        description: `Kunden konnten nicht geladen werden: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDirectLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Kunden</h1>
        <div className="flex space-x-2">
          <Button 
            variant={view === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={view === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('table')}
          >
            Tabelle
          </Button>
        </div>
      </div>

      {/* Search - only show if we have data */}
      {!directLoading && !directError && filteredCustomers.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Kunden suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Loading state */}
      {directLoading && <CustomerLoadingState />}

      {/* Error state */}
      {!directLoading && directError && (
        <CustomerErrorState 
          errorMsg={directError} 
          onRetry={handleRetry}
        />
      )}

      {/* Debug information */}
      {!directLoading && !directError && (
        <div className="text-sm text-gray-600 mb-4">
          <p>Gefundene Kunden: {filteredCustomers.length}</p>
          {filteredCustomers.length === 0 && searchTerm && (
            <p className="text-yellow-600">Keine Kunden für Suchbegriff "{searchTerm}" gefunden.</p>
          )}
          {filteredCustomers.length === 0 && !searchTerm && (
            <p className="text-yellow-600">Keine Kunden gefunden. Bitte überprüfen Sie die Datenbank.</p>
          )}
        </div>
      )}

      {/* Customer List */}
      {!directLoading && !directError && (
        <CustomerList 
          customers={filteredCustomers} 
          searchTerm={searchTerm}
          view={view}
        />
      )}
    </div>
  );
};

export default ManagerCustomers;
