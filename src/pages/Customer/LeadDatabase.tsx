
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Lead } from '@/types/lead';
import LeadErrorHandler from '@/components/leads/LeadErrorHandler';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchLeadsData } from '@/services/leads/lead-fetch';

const LeadDatabase = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedLeads = await fetchLeadsData({});
      setLeads(fetchedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to load leads'));
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Die Leads konnten nicht geladen werden."
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    fetchLeads();
  };

  return (
    <LeadDatabaseContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lead Database</h1>
          <p className="text-muted-foreground">Manage and track all leads across your projects</p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleRetry}
          disabled={isLoading || isRetrying}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {error && (
        <LeadErrorHandler
          error={error}
          onRetry={handleRetry}
          isRetrying={isRetrying}
          retryCount={retryCount}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="border rounded-lg p-4 hover:bg-muted/20">
              <h3 className="font-medium">{lead.name}</h3>
              {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
              {lead.email && <p className="text-sm">{lead.email}</p>}
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Keine Leads gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Es wurden noch keine Leads hinzugefügt.
          </p>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Erneut laden
          </Button>
        </div>
      )}
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
