
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface CompanySearchStringToggleProps {
  companyId: string;
}

const CompanySearchStringToggle: React.FC<CompanySearchStringToggleProps> = ({ companyId }) => {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleSearchStringFeature } = useSearchStrings();

  // Fetch current setting on mount
  React.useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('enable_search_strings')
          .eq('id', companyId)
          .single();
        
        if (error) throw error;
        
        setIsEnabled(data.enable_search_strings);
      } catch (error) {
        console.error('Error fetching company search string settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanySettings();
  }, [companyId]);

  const handleToggle = async (checked: boolean) => {
    const success = await toggleSearchStringFeature(companyId, checked);
    if (success) {
      setIsEnabled(checked);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-6 w-32" />;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="search-string-toggle" 
        checked={isEnabled || false}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="search-string-toggle">
        Search String Feature
      </Label>
    </div>
  );
};

export default CompanySearchStringToggle;
