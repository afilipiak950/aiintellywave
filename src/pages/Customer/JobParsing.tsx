
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, BrainCircuit, Loader2 } from 'lucide-react';
import JobDetailsModal from '@/components/customer/job-parsing/JobDetailsModal';
import AIContactSuggestionModal from '@/components/customer/job-parsing/AIContactSuggestionModal';
import JobSearch from '@/components/customer/job-parsing/JobSearch';
import JobResultsTable from '@/components/customer/job-parsing/JobResultsTable';
import SearchHistoryModal from '@/components/customer/job-parsing/SearchHistoryModal';
import AccessErrorDisplay from '@/components/customer/job-parsing/AccessErrorDisplay';
import { useJobSearch } from '@/hooks/job-parsing/useJobSearch';

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
    return <AccessErrorDisplay loading={true} />;
  }

  if (!hasAccess) {
    return <AccessErrorDisplay loading={false} />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Jobs Dashboard</h1>
          <p className="text-muted-foreground">
            Durchsuchen Sie aktuelle Stellenangebote und finden Sie passende Kontakte.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsSearchHistoryOpen(!isSearchHistoryOpen)}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Suchverlauf
          </Button>
          
          {jobs.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={generateAiSuggestion}
              disabled={isGeneratingAiSuggestion}
              className="flex items-center gap-1"
            >
              {isGeneratingAiSuggestion ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              KI-Kontaktvorschlag
            </Button>
          )}
        </div>
      </div>
      
      <JobSearch 
        searchParams={searchParams}
        onParamChange={handleParamChange}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      
      {jobs.length > 0 && (
        <JobResultsTable 
          jobs={jobs}
          searchQuery={searchParams.query}
          searchLocation={searchParams.location}
          onJobSelect={setSelectedJob}
        />
      )}
      
      <SearchHistoryModal 
        isOpen={isSearchHistoryOpen}
        onClose={() => setIsSearchHistoryOpen(false)}
        searchHistory={searchHistory}
        onSelectRecord={loadSearchResult}
      />
      
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
      
      {isAiModalOpen && aiSuggestion && (
        <AIContactSuggestionModal 
          suggestion={aiSuggestion} 
          onClose={() => setIsAiModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default JobParsing;
