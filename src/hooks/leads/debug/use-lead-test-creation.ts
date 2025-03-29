
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/lead';

export const useLeadTestCreation = () => {
  const [loading, setLoading] = useState(false);

  const createTestLead = async () => {
    try {
      setLoading(true);
      const testLead = {
        name: `Test Lead ${Date.now()}`,
        company: 'Debug Company',
        email: `test${Date.now()}@example.com`,
        phone: '123-456-7890',
        position: 'Test Position',
        status: 'new' as LeadStatus,
        notes: 'Created for debugging purposes',
        score: 50,
        // Do not set project_id to test unassigned leads
      };
      
      console.log('Attempting direct lead creation with:', testLead);
      
      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select();
        
      if (error) {
        console.error('Direct lead creation error:', error);
        toast({
          title: 'Database Error',
          description: `Error: ${error.message}`,
          variant: 'destructive'
        });
        return null;
      } else {
        console.log('Direct lead creation successful:', data);
        toast({
          title: 'Test Lead Created',
          description: 'Direct database insertion successful. The lead will appear automatically.'
        });
        return data[0];
      }
    } catch (err) {
      console.error('Exception in direct lead creation:', err);
      toast({
        title: 'Exception Error',
        description: `Error: ${err.message}`,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTestLead,
    loading
  };
};
