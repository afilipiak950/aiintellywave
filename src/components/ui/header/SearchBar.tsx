
import { useState, useRef, useEffect } from 'react';
import { useSmartSearch } from '@/hooks/use-smart-search';
import { useAISearch } from '@/hooks/use-ai-search';
import SearchInput from '@/components/ui/search/SearchInput';
import AISearchResults from '@/components/ui/search/AISearchResults';
import { toast } from "sonner";

const SearchBar = () => {
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use smart search hook for suggestions
  const { 
    query, 
    setQuery,
    suggestions 
  } = useSmartSearch();
  
  // Use AI search hook for AI-powered responses
  const {
    isSearching,
    aiResponse,
    error: aiError,
    performAISearch,
    resetSearch
  } = useAISearch();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      resetSearch();
    };
  }, [resetSearch]);

  // Handle clicks outside the search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
        resetSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [resetSearch]);

  // Trigger AI search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    if (query.trim() && showResults) {
      searchTimeoutRef.current = setTimeout(() => {
        console.log('Initiating AI search with query:', query);
        performAISearch(query).catch(err => {
          console.error('Failed to perform AI search:', err);
          toast.error('Failed to search. Please try again.');
        });
      }, 800);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, showResults, performAISearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setShowResults(true);
    console.log('Form submitted, performing AI search with query:', query);
    
    resetSearch();
    
    performAISearch(query).catch(err => {
      console.error('Search error:', err);
      toast.error('Search failed. Please try again.');
    });
  };

  const clearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setQuery('');
    setShowResults(false);
    resetSearch();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleInputFocus = () => {
    setShowResults(true);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearch}>
        <SearchInput
          ref={inputRef}
          query={query}
          setQuery={setQuery}
          onFocus={handleInputFocus}
          onClear={clearSearch}
        />
      </form>

      {showResults && (
        <AISearchResults 
          isSearching={isSearching}
          error={aiError}
          aiResponse={aiResponse}
        />
      )}
    </div>
  );
};

export default SearchBar;

