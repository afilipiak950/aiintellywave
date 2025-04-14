
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, Search, AlertCircle } from 'lucide-react';
import { useJobSearch } from '@/hooks/job-parsing/useJobSearch';
import JobSearch from '@/components/customer/job-parsing/JobSearch';
import JobResultsTable from '@/components/customer/job-parsing/JobResultsTable';
import JobDetailsModal from '@/components/customer/job-parsing/JobDetailsModal';
import AIContactSuggestionModal from '@/components/customer/job-parsing/AIContactSuggestionModal';
import SearchHistoryModal from '@/components/customer/job-parsing/SearchHistoryModal';
import AccessErrorDisplay from '@/components/customer/job-parsing/AccessErrorDisplay';

const JobParsing = () => {
  const {
    isLoading,
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
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  } = useJobSearch();

  // Add a debug effect to log when jobs state changes
  useEffect(() => {
    console.log('Jobs state updated in JobParsing component:', jobs);
  }, [jobs]);

  // Show loading state while checking access
  if (isAccessLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jobangebote</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            disabled={searchHistory.length === 0}
          >
            Suchverlauf
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

      <div className="grid grid-cols-1 gap-6">
        <JobSearch
          searchParams={searchParams}
          onParamChange={handleParamChange}
          onSearch={handleSearch}
          isLoading={isLoading}
          error={error}
        />

        {/* Fix the TypeScript errors by properly checking jobs array */}
        {Array.isArray(jobs) && jobs.length > 0 && (
          <JobResultsTable
            jobs={jobs}
            searchQuery={searchParams.query}
            searchLocation={searchParams.location}
            onJobSelect={setSelectedJob}
          />
        )}
        
        {/* Show a message when there are no results but search was performed */}
        {!isLoading && Array.isArray(jobs) && jobs.length === 0 && searchParams.query && (
          <Card className="mt-4">
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
