
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, Search, AlertCircle, Bookmark, Save, Code, ExternalLink } from 'lucide-react';
import { useJobSearch } from '@/hooks/job-parsing/useJobSearch';
import JobSearch from '@/components/customer/job-parsing/JobSearch';
import JobResultsTable from '@/components/customer/job-parsing/JobResultsTable';
import JobDetailsModal from '@/components/customer/job-parsing/JobDetailsModal';
import AIContactSuggestionModal from '@/components/customer/job-parsing/AIContactSuggestionModal';
import SearchHistoryModal from '@/components/customer/job-parsing/SearchHistoryModal';
import SavedSearchesList from '@/components/customer/job-parsing/SavedSearchesList';
import SavedSearchesTable from '@/components/customer/job-parsing/SavedSearchesTable';
import AccessErrorDisplay from '@/components/customer/job-parsing/AccessErrorDisplay';
import ContactSuggestionsList from '@/components/customer/job-parsing/ContactSuggestionsList';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const JobParsing = () => {
  const {
    isLoading,
    isSaving,
    hasAccess,
    isAccessLoading,
    searchParams,
    jobs,
    selectedJob,
    searchHistory,
    isSearchHistoryOpen,
    aiSuggestion,
    isAiModalOpen,
    isGeneratingAiSuggestion,
    isCreatingClayWorkbook,
    error,
    retryCount,
    handleParamChange,
    handleSearch,
    saveCurrentSearch,
    loadSearchResult,
    deleteSearchRecord,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion,
    createClayWorkbook
  } = useJobSearch();

  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [clayWorkbookUrl, setClayWorkbookUrl] = useState<string | null>(null);

  // Speichere die aktuellen Suchparameter im localStorage für die Edge Function
  useEffect(() => {
    try {
      localStorage.setItem('jobSearchParams', JSON.stringify(searchParams));
    } catch (error) {
      console.error('Error saving search params to localStorage:', error);
    }
  }, [searchParams]);

  // Load suggestions and workbook URL from localStorage on mount
  useEffect(() => {
    try {
      const savedSuggestions = localStorage.getItem('clayContactSuggestions');
      if (savedSuggestions) {
        setContactSuggestions(JSON.parse(savedSuggestions));
      }
      
      const savedWorkbookUrl = localStorage.getItem('clayWorkbookUrl');
      if (savedWorkbookUrl) {
        setClayWorkbookUrl(savedWorkbookUrl);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  const handleCreateWorkbook = async () => {
    try {
      console.log('Calling createClayWorkbook...');
      
      // Stellen Sie sicher, dass wir eine Suchzeichenfolge haben
      if (!searchParams.query) {
        toast({
          title: "Hinweis",
          description: "Bitte geben Sie eine Suchanfrage ein, bevor Sie Kontaktvorschläge generieren",
          variant: "default"
        });
        return;
      }
      
      const workbookUrl = await createClayWorkbook();
      console.log('createClayWorkbook completed successfully, URL:', workbookUrl);
      
      // Set the workbook URL in state
      if (workbookUrl && workbookUrl.startsWith('http')) {
        setClayWorkbookUrl(workbookUrl);
      }
      
      try {
        console.log('Loading updated suggestions from localStorage');
        const updatedSuggestions = localStorage.getItem('clayContactSuggestions');
        if (updatedSuggestions) {
          console.log('Found suggestions in localStorage:', updatedSuggestions.substring(0, 100) + '...');
          setContactSuggestions(JSON.parse(updatedSuggestions));
        } else {
          console.warn('No suggestions found in localStorage after createClayWorkbook');
        }
      } catch (error) {
        console.error('Error loading updated contact suggestions:', error);
        toast({
          title: "Hinweis",
          description: "Kontaktvorschläge wurden generiert, aber konnten nicht angezeigt werden",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error creating Clay workbook:', error);
      toast({
        title: "Fehler",
        description: `Fehler bei der Kontaktvorschlag-Erstellung: ${error.message || 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
    }
  };

  // Open Clay workbook in new tab
  const openClayWorkbook = () => {
    if (clayWorkbookUrl && clayWorkbookUrl.startsWith('http')) {
      window.open(clayWorkbookUrl, '_blank');
    } else {
      toast({
        title: "Fehler",
        description: "Kein gültiger Clay Workbook-Link verfügbar",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('Jobs state updated in JobParsing component:', jobs);
    console.log('Access state:', { hasAccess, isAccessLoading });
  }, [jobs, hasAccess, isAccessLoading]);

  if (isAccessLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jobangebote</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64 flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Verbindung wird hergestellt...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessErrorDisplay loading={false} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BriefcaseBusiness className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Jobangebote</h1>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsSearchHistoryOpen(true)}
            disabled={!Array.isArray(searchHistory) || searchHistory.length === 0}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Suchverlauf
          </Button>
          <Button
            variant="outline"
            onClick={saveCurrentSearch}
            disabled={!Array.isArray(jobs) || jobs.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-current rounded-full"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Suche speichern
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={handleCreateWorkbook}
            disabled={!searchParams.query || isCreatingClayWorkbook}
          >
            {isCreatingClayWorkbook ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-white rounded-full"></div>
                KI lädt Kontakte...
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Kontaktvorschlag
              </>
            )}
          </Button>
          {clayWorkbookUrl && (
            <Button 
              variant="outline" 
              onClick={openClayWorkbook}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Clay öffnen
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <JobSearch
            searchParams={searchParams}
            onParamChange={handleParamChange}
            onSearch={handleSearch}
            isLoading={isLoading}
            error={error}
            retryCount={retryCount}
          />

          {isLoading && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && Array.isArray(jobs) && jobs.length > 0 && (
            <JobResultsTable
              jobs={jobs}
              searchQuery={searchParams.query}
              searchLocation={searchParams.location}
              onJobSelect={setSelectedJob}
            />
          )}
          
          {!isLoading && Array.isArray(jobs) && jobs.length === 0 && searchParams.query && !error && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Keine Ergebnisse gefunden</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Versuchen Sie es mit anderen Suchbegriffen oder weniger Filtern.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {contactSuggestions && contactSuggestions.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-6 mb-3">
                <h2 className="text-xl font-semibold">Kontaktvorschläge</h2>
                {clayWorkbookUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openClayWorkbook}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    In Clay öffnen
                  </Button>
                )}
              </div>
              <ContactSuggestionsList suggestions={contactSuggestions} />
            </>
          )}
        </div>

        <div className="md:col-span-1">
          <SavedSearchesList 
            savedSearches={searchHistory}
            onSelect={loadSearchResult}
            onDelete={deleteSearchRecord}
            maxHeight="600px"
          />
        </div>
      </div>

      <SavedSearchesTable
        savedSearches={searchHistory}
        onSelect={loadSearchResult}
        onDelete={deleteSearchRecord}
      />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <SearchHistoryModal
        isOpen={isSearchHistoryOpen}
        onClose={() => setIsSearchHistoryOpen(false)}
        searchHistory={searchHistory}
        onSelectRecord={loadSearchResult}
      />

      <AIContactSuggestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        suggestion={aiSuggestion}
      />
    </div>
  );
};

export default JobParsing;
