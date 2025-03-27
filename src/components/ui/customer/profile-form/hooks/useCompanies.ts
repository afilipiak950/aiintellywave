
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setCompanies(data || []);
      } catch (error: any) {
        console.error('Error loading companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies list',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  return { companies, loading };
};
