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
import SavedSearchesTable from '@/components/customer/job-parsing/SavedSearchesTable';
import { useJobSearchState } from '@/hooks/job-parsing/state/useJobSearchState';
import { useSearchHistoryOperations } from '@/hooks/job-parsing/api/useSearchHistoryOperations';
import { useClayWorkbookOperations } from '@/hooks/job-parsing/api/useClayWorkbookOperations';
import { isJobParsingEnabled } from '@/hooks/use-feature-access';
import { Job, JobSearchHistory } from '@/types/job-parsing';
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
  const [savedSearches, setSavedSearches] = useState<JobSearchHistory[]>([]);

  const {
    searchParams,
    setSearchParams,
    jobs,
    setJobs,
    isLoading,
    error,
    retryCount,
    handleSearch,
  } = useJobSearchState();

  const { createClayWorkbook, saveCurrentSearch } = useClayWorkbookOperations(user?.companyId || null, user?.id || null);
  const { 
    loadSearchHistory, 
    saveSearch, 
    deleteSearch,
    isLoading: isHistoryLoading 
  } = useSearchHistoryOperations(user?.companyId || null);

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

  useEffect(() => {
    const fetchSavedSearches = async () => {
      if (user?.id) {
        try {
          const searchHistory = await loadSearchHistory(user.id, user.companyId || null);
          setSavedSearches(searchHistory);
        } catch (err) {
          console.error('Error loading search history:', err);
        }
      }
    };

    fetchSavedSearches();
  }, [user?.id, user?.companyId, loadSearchHistory]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

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

  const handleSaveSearch = async () => {
    if (!searchParams.query || jobs.length === 0) {
      toast({
        title: 'Keine Suche verfügbar',
        description: 'Bitte führen Sie zuerst eine Suche durch',
        variant: 'destructive'
      });
      return;
    }

    try {
      await saveCurrentSearch();
      
      // Refresh saved searches list
      if (user?.id) {
        const searchHistory = await loadSearchHistory(user.id, user.companyId || null);
        setSavedSearches(searchHistory);
      }
      
      toast({
        title: 'Suche gespeichert',
        description: `${jobs.length} Jobangebote wurden gespeichert`,
        variant: 'default'
      });
    } catch (err) {
      console.error('Error saving search:', err);
      toast({
        title: 'Fehler beim Speichern',
        description: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive'
      });
    }
  };

  const handleSelectSavedSearch = (search: JobSearchHistory) => {
    // Load the saved search parameters
    setSearchParams({
      query: search.search_query,
      location: search.search_location || '',
      experience: search.search_experience || 'any',
      industry: search.search_industry || '',
      maxResults: 50
    });
    
    // Load the saved search results
    setJobs(search.search_results || []);
    
    // Switch to search tab
    setActiveTab('search');
    
    toast({
      title: 'Gespeicherte Suche geladen',
      description: `${search.search_results?.length || 0} Jobangebote geladen`,
      variant: 'default'
    });
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      const success = await deleteSearch(id);
      if (success && user?.id) {
        // Refresh list after deletion
        const searchHistory = await loadSearchHistory(user.id, user.companyId || null);
        setSavedSearches(searchHistory);
      }
    } catch (err) {
      console.error('Error deleting saved search:', err);
    }
  };

  if (featureEnabled === null) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            Gespeicherte Suchen
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
                    onClick={handleSaveSearch}
                    disabled={jobs.length === 0}
                  >
                    Suche speichern
                  </Button>

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
          
          {savedSearches.length > 0 && (
            <SavedSearchesTable
              savedSearches={savedSearches}
              onSelect={handleSelectSavedSearch}
              onDelete={handleDeleteSavedSearch}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          {isHistoryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SavedSearchesTable
              savedSearches={savedSearches}
              onSelect={handleSelectSavedSearch}
              onDelete={handleDeleteSavedSearch}
            />
          )}
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
