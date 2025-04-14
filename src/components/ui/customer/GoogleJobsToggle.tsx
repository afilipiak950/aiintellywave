
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';

interface GoogleJobsToggleProps {
  companyId: string;
  enabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

const GoogleJobsToggle = ({ companyId, enabled, onStatusChange }: GoogleJobsToggleProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const toggleGoogleJobs = async (newValue: boolean) => {
    setIsLoading(true);
    try {
      // Check if a record exists
      const { data: existingFeature } = await supabase
        .from('company_features')
        .select('id')
        .eq('company_id', companyId)
        .single();

      let result;
      if (existingFeature) {
        // Update existing record
        result = await supabase
          .from('company_features')
          .update({ google_jobs_enabled: newValue, updated_at: new Date().toISOString() })
          .eq('company_id', companyId);
      } else {
        // Insert new record
        result = await supabase
          .from('company_features')
          .insert({ company_id: companyId, google_jobs_enabled: newValue });
      }

      if (result.error) throw result.error;
      
      setIsEnabled(newValue);
      onStatusChange(newValue);
      
      toast({
        title: newValue ? "Google Jobs aktiviert" : "Google Jobs deaktiviert",
        description: newValue
          ? "Kunden können nun das Google Jobs Dashboard nutzen."
          : "Das Google Jobs Dashboard ist jetzt deaktiviert.",
        variant: newValue ? "default" : "secondary",
      });
    } catch (error) {
      console.error('Error toggling Google Jobs:', error);
      toast({
        title: "Fehler",
        description: "Die Google Jobs Funktion konnte nicht geändert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="google-jobs-toggle" className="flex items-center text-sm font-medium">
            Google Jobs Dashboard
            <div className="ml-2 cursor-help text-muted-foreground group relative">
              <Info size={14} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover rounded shadow-lg text-xs z-50">
                Bei Aktivierung erhalten Kunden Zugriff auf das Google Jobs Dashboard, um aktuelle Stellenangebote einzusehen.
              </div>
            </div>
          </Label>
          <Switch
            id="google-jobs-toggle"
            checked={isEnabled}
            onCheckedChange={toggleGoogleJobs}
            disabled={isLoading}
            aria-label="Toggle Google Jobs Dashboard"
          />
        </div>
        {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Wird gespeichert...</span>}
      </div>
    </div>
  );
};

export default GoogleJobsToggle;
