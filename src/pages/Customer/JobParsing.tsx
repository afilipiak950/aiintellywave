
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, Search, AlertCircle, Bookmark, Save } from 'lucide-react';
import { useJobSearch } from '@/hooks/job-parsing/useJobSearch';
import JobSearch from '@/components/customer/job-parsing/JobSearch';
import JobResultsTable from '@/components/customer/job-parsing/JobResultsTable';
import JobDetailsModal from '@/components/customer/job-parsing/JobDetailsModal';
import AIContactSuggestionModal from '@/components/customer/job-parsing/AIContactSuggestionModal';
import SearchHistoryModal from '@/components/customer/job-parsing/SearchHistoryModal';
import SavedSearchesList from '@/components/customer/job-parsing/SavedSearchesList';
import AccessErrorDisplay from '@/components/customer/job-parsing/AccessErrorDisplay';
import { Skeleton } from '@/components/ui/skeleton';

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
    generateAiSuggestion
  } = useJobSearch();

  // Add a debug effect to log when jobs state changes
  useEffect(() => {
    console.log('Jobs state updated in JobParsing component:', jobs);
    console.log('Access state:', { hasAccess, isAccessLoading });
  }, [jobs, hasAccess, isAccessLoading]);

  // Show loading state while checking access
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

  // Show error state if access check failed
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
            onClick={generateAiSuggestion}
            disabled={!Array.isArray(jobs) || jobs.length === 0 || isGeneratingAiSuggestion}
          >
            {isGeneratingAiSuggestion ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-white rounded-full"></div>
                KI-Analyse läuft...
              </>
            ) : (
              <>KI-Kontaktvorschlag</>
            )}
          </Button>
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

          {/* Loading state for job results */}
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

          {/* Fix the TypeScript errors by properly checking jobs array */}
          {!isLoading && Array.isArray(jobs) && jobs.length > 0 && (
            <JobResultsTable
              jobs={jobs}
              searchQuery={searchParams.query}
              searchLocation={searchParams.location}
              onJobSelect={setSelectedJob}
            />
          )}
          
          {/* Show a message when there are no results but search was performed */}
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
