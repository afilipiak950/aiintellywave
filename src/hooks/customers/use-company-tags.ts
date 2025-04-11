
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCompanyTags = (companyId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateCompanyTags = async (tags: string[]): Promise<boolean> => {
    if (!companyId) return false;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ tags })
        .eq('id', companyId);
      
      if (error) throw error;
      
      toast({
        title: 'Tags Updated',
        description: 'Company tags have been updated successfully.'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating company tags:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tags',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    updateCompanyTags,
    isUpdating
  };
};
