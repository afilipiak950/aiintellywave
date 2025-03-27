
import { useState, useRef, useEffect } from 'react';
import { useSmartSearch } from '@/hooks/use-smart-search';
import { useAISearch } from '@/hooks/use-ai-search';
import SearchInput from '@/components/ui/search/SearchInput';
import AISearchResults from '@/components/ui/search/AISearchResults';
import SmartSuggestions from '@/components/ui/search/SmartSuggestions';

const SearchBar = () => {
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use smart search hook for suggestions
  const { 
    query, 
    setQuery, 
    isLoading: isSuggestionsLoading, 
    error: suggestionsError, 
    suggestions 
  } = useSmartSearch();
  
  // Use AI search hook for AI-powered responses
  const {
    isSearching,
    aiResponse,
    error: aiError,
    performAISearch,
    setAiResponse,
    setError
  } = useAISearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Improved debounced search with cancellation of previous requests
  useEffect(() => {
    // Clear any existing timeout when query changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    if (query.trim() && showResults) {
      // Only set a new timeout if we have a query and showing results
      searchTimeoutRef.current = setTimeout(() => {
        console.log('Initiating AI search with query:', query);
        performAISearch(query);
      }, 1000); // Increased delay to 1000ms to avoid too many requests while typing
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, showResults, performAISearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Clear any existing timeout to prevent duplicate searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setShowResults(true);
    console.log('Form submitted, performing AI search with query:', query);
    // Clear any previous errors and responses before starting new search
    setError('');
    setAiResponse('');
    await performAISearch(query);
  };

  const clearSearch = () => {
    // Clear timeout when search is manually cleared
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setQuery('');
    setShowResults(false);
    setAiResponse('');
    setError('');
    
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
