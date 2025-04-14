
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, Search } from 'lucide-react';
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
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  } = useJobSearch();

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

  if (!hasAccess) {
    return <AccessErrorDisplay />;
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
            disabled={jobs.length === 0 || isGeneratingAiSuggestion}
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
        />

        {jobs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Gefundene Stellenangebote</CardTitle>
              <CardDescription>
                {jobs.length} Jobangebote gefunden für "{searchParams.query}"
                {searchParams.location ? ` in ${searchParams.location}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobResultsTable
                jobs={jobs}
                onSelectJob={setSelectedJob}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <SearchHistoryModal
        isOpen={isSearchHistoryOpen}
        onClose={() => setIsSearchHistoryOpen(false)}
        searchHistory={searchHistory}
        onLoadResult={loadSearchResult}
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
