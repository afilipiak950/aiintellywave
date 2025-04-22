
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

const JobSyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setDebugInfo(null);
      
      console.log("Starting job & HR data synchronization process...");
      
      toast({
        title: 'Synchronisierung gestartet',
        description: 'Die Job- und HR-Kontakte werden jetzt synchronisiert. Dies kann einen Moment dauern.',
        variant: 'default'
      });
      
      // Get company names from the displayed job list
      const jobElements = document.querySelectorAll('[data-company-name]');
      const companies = Array.from(jobElements).map(el => 
        (el as HTMLElement).dataset.companyName || 'Unknown Company'
      );
      
      const uniqueCompanies = [...new Set(companies)];
      console.log(`Found ${uniqueCompanies.length} unique companies in job list:`, uniqueCompanies);
      
      if (uniqueCompanies.length === 0) {
        toast({
          title: 'Keine Unternehmen gefunden',
          description: 'Führen Sie zunächst eine Jobsuche durch, um Unternehmen zu identifizieren.',
          variant: 'destructive'
        });
        return;
      }
      
      const jobId = crypto.randomUUID();
      console.log(`Creating background job with ID: ${jobId}`);
      
      // First synchronize with the primary company (first in the list)
      const primaryCompany = uniqueCompanies[0];
      console.log(`Synchronizing primary company: ${primaryCompany}`);
      
      const response = await supabase.functions.invoke('scrape-and-enrich', {
        body: {
          jobId,
          background: true,
          maxPages: 5,
          maxDepth: 1,
          company: primaryCompany,
          title: "HR Manager",
          url: window.location.origin,
          enrichWithApollo: true
        }
      });
      
      console.log("Full function response:", response);
      setDebugInfo(response);
      
      if (response.error) {
        console.error("Function error:", response.error);
        toast({
          title: 'Synchronisierungsfehler',
          description: `Fehler: ${response.error.message}. Bitte versuchen Sie es später erneut.`,
          variant: 'destructive'
        });
        return;
      }

      const data = response.data;
      console.log("Function data response:", data);
      
      if (data?.success === false) {
        const errorMessage = data.error || 'Ein Fehler ist aufgetreten';
        console.error("Function returned error:", errorMessage);
        toast({
          title: 'Synchronisierungsfehler',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }
      
      // If there are more companies, process them in the background
      if (uniqueCompanies.length > 1) {
        console.log(`Processing ${uniqueCompanies.length - 1} additional companies in the background...`);
        
        // Process other companies asynchronously
        uniqueCompanies.slice(1).forEach(async (company, index) => {
          try {
            console.log(`Background processing company ${index + 1}: ${company}`);
            
            await supabase.functions.invoke('scrape-and-enrich', {
              body: {
                jobId: `${jobId}-${index}`,
                background: true,
                maxPages: 3,
                maxDepth: 1,
                company: company,
                title: "HR Manager",
                url: window.location.origin,
                enrichWithApollo: true
              }
            });
          } catch (err) {
            console.error(`Error processing company ${company}:`, err);
          }
        });
      }

      toast({
        title: 'Synchronisierung erfolgreich',
        description: 'Die HR-Kontakte werden im Hintergrund synchronisiert. Aktualisieren Sie die Seite in einigen Sekunden.',
        variant: 'default'
      });
      
    } catch (err: any) {
      console.error('Job sync error:', err);
      toast({
        title: 'Synchronisierungsfehler',
        description: err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const debugDisplay = process.env.NODE_ENV === 'development' && debugInfo ? (
    <div className="mt-2 text-xs text-gray-500">
      <pre className="overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  ) : null;

  return (
    <>
      <Button 
        onClick={handleSync} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Synchronisiere...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Jobs & HR-Daten synchronisieren
          </>
        )}
      </Button>
      {debugDisplay}
    </>
  );
};

export default JobSyncButton;
