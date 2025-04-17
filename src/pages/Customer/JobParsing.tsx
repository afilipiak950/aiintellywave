import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserPlus, Building, ExternalLink } from 'lucide-react';
import JobSearch from '@/components/customer/job-parsing/JobSearch';
import JobResultsTable from '@/components/customer/job-parsing/JobResultsTable';
import JobSyncButton from '@/components/customer/job-parsing/JobSyncButton';
import JobDetailModal from '@/components/customer/job-parsing/JobDetailModal';
import ClayWorkbookModal from '@/components/customer/job-parsing/ClayWorkbookModal';
import { useJobSearchState } from '@/hooks/job-parsing/state/useJobSearchState';
import { useJobSearchHistory } from '@/hooks/job-parsing/api/useJobSearchHistory';
import { useClayWorkbookOperations } from '@/hooks/job-parsing/api/useClayWorkbookOperations';
import { isJobParsingEnabled } from '@/hooks/use-feature-access';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

const JobParsing: React.FC = () => {
  const { user } = useAuth();
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isClayModalOpen, setIsClayModalOpen] = useState(false);
  const [clayWorkbookUrl, setClayWorkbookUrl] = useState<string | null>(null);
  const [isClayLoading, setIsClayLoading] = useState(false);
  const [clayError, setClayError] = useState<string | null>(null);

  const {
    searchParams,
    setSearchParams,
    jobs,
    isLoading,
    error,
    retryCount,
    handleSearch,
  } = useJobSearchState();

  const { searchHistory, loadSearchHistory } = useJobSearchHistory();
  const { createClayWorkbook } = useClayWorkbookOperations(user?.companyId || null, user?.id || null);

  // Check if feature is enabled
  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (user?.id) {
        try {
          const enabled = await isJobParsingEnabled(user.id);
          setFeatureEnabled(enabled);
        } catch (err) {
          console.error('Error checking feature access:', err);
          setFeatureEnabled(false);
        }
      }
    };

    checkFeatureAccess();
  }, [user?.id]);

  // Load search history when user changes
  useEffect(() => {
    if (user?.id && user?.companyId) {
      loadSearchHistory(user.id, user.companyId);
    }
  }, [user?.id, user?.companyId, loadSearchHistory]);

  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  // Handle Clay workbook creation
  const handleCreateClayWorkbook = async () => {
    if (!user?.id || !user?.companyId) {
      toast({
        title: "Fehler",
        description: "Benutzer nicht authentifiziert",
        variant: "destructive"
      });
      return;
    }

    setIsClayLoading(true);
    setClayError(null);

    try {
      const workbookUrl = await createClayWorkbook();
      setClayWorkbookUrl(workbookUrl);
      setIsClayModalOpen(true);
    } catch (err) {
      console.error('Error creating Clay workbook:', err);
      setClayError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsClayLoading(false);
    }
  };

  // Show loading state while checking feature access
  if (featureEnabled === null) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show message if feature is not enabled
  if (featureEnabled === false) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Jobangebote nicht verfügbar</CardTitle>
            <CardDescription>
              Diese Funktion ist für Ihren Account nicht freigeschaltet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Die Jobangebote-Funktion ermöglicht es Ihnen, relevante Stellenangebote zu finden und
              potenzielle Kontakte zu identifizieren.
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/customer/dashboard'}>
              Zurück zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Jobangebote</h1>
        <p className="text-muted-foreground">
          Finden Sie relevante Jobangebote und identifizieren Sie potenzielle Kontakte
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Jobsuche
          </TabsTrigger>
          <TabsTrigger value="history">
            <Building className="h-4 w-4 mr-2" />
            Suchverlauf
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <JobSearch
                searchParams={searchParams}
                onParamChange={(name, value) => setSearchParams({ ...searchParams, [name]: value })}
                onSearch={handleSearch}
                isLoading={isLoading}
                error={error}
                retryCount={retryCount}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aktionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <JobSyncButton />
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCreateClayWorkbook}
                    disabled={isClayLoading || jobs.length === 0}
                  >
                    {isClayLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kontakte werden generiert...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Kontaktvorschläge generieren
                      </>
                    )}
                  </Button>
                  
                  {clayWorkbookUrl && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsClayModalOpen(true)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Clay Workbook öffnen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {jobs.length > 0 && (
            <JobResultsTable
              jobs={jobs}
              searchQuery={searchParams.query}
              searchLocation={searchParams.location}
              onJobSelect={handleJobSelect}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Suchverlauf</CardTitle>
              <CardDescription>Ihre letzten Jobsuchen</CardDescription>
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Noch keine Suchanfragen vorhanden
                </p>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{item.search_query}</CardTitle>
                        <CardDescription>
                          {item.search_location ? `${item.search_location} • ` : ''}
                          {new Date(item.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      <ClayWorkbookModal
        isOpen={isClayModalOpen}
        onClose={() => setIsClayModalOpen(false)}
        workbookUrl={clayWorkbookUrl}
        isLoading={isClayLoading}
        error={clayError}
      />
    </div>
  );
};

export default JobParsing;
